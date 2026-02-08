from flask import Flask, request, abort, render_template, redirect, url_for, session, flash
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
    PostbackEvent, FlexSendMessage, FollowEvent
)
from openai import OpenAI
import pandas as pd
import re
import os
from datetime import datetime
from dotenv import load_dotenv
from urllib.parse import parse_qs
from functools import wraps
import mysql.connector

# ==================== ENV ====================
load_dotenv()

LINE_CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
LINE_CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Admin 계정
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin1234")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not LINE_CHANNEL_ACCESS_TOKEN or not LINE_CHANNEL_SECRET:
    raise ValueError("LINE 환경변수가 없습니다")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY 없음")

if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
    raise ValueError("DB 환경변수가 누락되었습니다")

# ==================== INIT ====================
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

user_states = {}

# ==================== DB ====================
db = mysql.connector.connect(
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    autocommit=True
)
cursor = db.cursor(dictionary=True)
print("✅ MySQL 연결 성공")


def upsert_user(line_user_id: str) -> int:
    """users 테이블에 line_user_id 저장/갱신 후 users.id 반환 (BIGINT)"""
    cursor.execute(
        "INSERT INTO users (line_user_id) VALUES (%s) ON DUPLICATE KEY UPDATE last_seen = NOW()",
        (line_user_id,)
    )
    cursor.execute("SELECT id FROM users WHERE line_user_id = %s", (line_user_id,))
    return int(cursor.fetchone()["id"])  # BIGINT → Python int (자동 처리)


def get_or_create_conversation(user_id: int) -> int:
    cursor.execute(
        "SELECT id FROM conversations WHERE user_id = %s AND status = 'open' ORDER BY started_at DESC LIMIT 1",
        (user_id,)
    )
    row = cursor.fetchone()
    if row:
        return int(row["id"])
    cursor.execute("INSERT INTO conversations (user_id) VALUES (%s)", (user_id,))
    return int(cursor.lastrowid)


def save_message(conversation_id: int, sender: str, content: str, used_gpt: int = 0, matched_pattern: str = None):
    cursor.execute(
        "INSERT INTO messages (conversation_id, sender, content, used_gpt, matched_pattern) VALUES (%s, %s, %s, %s, %s)",
        (conversation_id, sender, content, used_gpt, matched_pattern)
    )


def generate_consultation_number() -> str:
    """접수 번호 생성: C20260201-001"""
    today = datetime.now().strftime("%Y%m%d")
    cursor.execute(
        "SELECT COUNT(*) as cnt FROM consultations WHERE DATE(created_at) = CURDATE()"
    )
    count = cursor.fetchone()["cnt"] + 1
    return f"C{today}-{count:03d}"


def save_consultation(user_id: int, data: dict) -> str:
    """상담 정보 DB 저장 (user_id는 BIGINT)"""
    consultation_number = generate_consultation_number()

    cursor.execute(
        """
        INSERT INTO consultations (
            user_id, consultation_number, member_type,
            guardian_name, guardian_phone,
            pet_type, pet_name, pet_age,
            category, urgency, description, preferred_time
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            user_id, consultation_number, data["member_type"],
            data["guardian_name"], data["guardian_phone"],
            data["pet_type"], data["pet_name"], data.get("pet_age", ""),
            data["category"], data["urgency"], data["description"], data["preferred_time"]
        )
    )
    return consultation_number


# ==================== 관리자 인증 ====================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)

    return decorated_function


# ==================== 패턴 ====================
try:
    pattern_df = pd.read_csv("patterns.csv")
    print("✅ patterns.csv 로드 완료")
except FileNotFoundError:
    print("⚠️ patterns.csv 없음")
    pattern_df = pd.DataFrame(columns=["pattern", "response"])


def get_pattern_response(text: str):
    for _, row in pattern_df.iterrows():
        if re.search(row["pattern"], text, re.IGNORECASE):
            return row["response"], row["pattern"]
    return None, None


# ==================== GPT ====================
def ask_gpt(prompt: str) -> str:
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "너는 친절한 고객 상담 챗봇이야."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        print("❌ GPT 오류:", e)
        return "죄송합니다. 잠시 후 다시 시도해주세요."


# ==================== FLEX MESSAGES ====================
def create_main_menu():
    return FlexSendMessage(
        alt_text="메인 메뉴",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "🤖 Pet AI 상담봇", "weight": "bold", "size": "xl", "align": "center"},
                    {"type": "separator", "margin": "lg"},
                    {"type": "button", "style": "primary",
                     "action": {"type": "postback", "label": "📋 상담 신청", "data": "action=consultation"}},
                    {"type": "button", "style": "primary",
                     "action": {"type": "postback", "label": "💬 일반 문의", "data": "action=inquiry"}},
                    {"type": "button", "style": "primary",
                     "action": {"type": "postback", "label": "📞 연락처 정보", "data": "action=contact"}}
                ]
            }
        }
    )


def create_consultation_type():
    return FlexSendMessage(
        alt_text="회원 유형 선택",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "회원 유형을 선택해주세요", "weight": "bold", "size": "lg", "align": "center"},
                    {"type": "separator", "margin": "lg"},
                    {"type": "button", "style": "primary", "color": "#4A90E2",
                     "action": {"type": "postback", "label": "👤 개인 회원", "data": "action=personal"}},
                    {"type": "button", "style": "primary", "color": "#FF6B6B",
                     "action": {"type": "postback", "label": "🏢 기업/단체 회원", "data": "action=corporate"}}
                ]
            }
        }
    )


def create_pet_type_selection():
    return FlexSendMessage(
        alt_text="반려동물 종류",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "반려동물 종류를 선택해주세요", "weight": "bold", "size": "lg", "align": "center"},
                    {"type": "separator", "margin": "lg"},
                    {"type": "button", "style": "primary", "color": "#F9A826",
                     "action": {"type": "postback", "label": "🐶 강아지", "data": "action=pet_dog"}},
                    {"type": "button", "style": "primary", "color": "#8E44AD",
                     "action": {"type": "postback", "label": "🐱 고양이", "data": "action=pet_cat"}},
                    {"type": "button", "style": "primary", "color": "#95A5A6",
                     "action": {"type": "postback", "label": "🐰 기타 (토끼, 햄스터 등)", "data": "action=pet_other"}}
                ]
            }
        }
    )


def create_category_selection():
    return FlexSendMessage(
        alt_text="상담 카테고리",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "상담 카테고리를 선택해주세요", "weight": "bold", "size": "lg", "align": "center"},
                    {"type": "separator", "margin": "lg"},
                    {"type": "button", "style": "primary", "color": "#E74C3C",
                     "action": {"type": "postback", "label": "🏥 질병/건강", "data": "action=cat_health"}},
                    {"type": "button", "style": "primary", "color": "#F39C12",
                     "action": {"type": "postback", "label": "🍖 영양/사료", "data": "action=cat_nutrition"}},
                    {"type": "button", "style": "primary", "color": "#9B59B6",
                     "action": {"type": "postback", "label": "😺 행동 교정", "data": "action=cat_behavior"}},
                    {"type": "button", "style": "primary", "color": "#3498DB",
                     "action": {"type": "postback", "label": "✂️ 미용/관리", "data": "action=cat_grooming"}},
                    {"type": "button", "style": "primary", "color": "#C0392B",
                     "action": {"type": "postback", "label": "💊 응급 상황", "data": "action=cat_emergency"}},
                    {"type": "button", "style": "primary", "color": "#7F8C8D",
                     "action": {"type": "postback", "label": "🏠 기타 문의", "data": "action=cat_other"}}
                ]
            }
        }
    )


def create_urgency_selection():
    return FlexSendMessage(
        alt_text="긴급도 선택",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "긴급도를 선택해주세요", "weight": "bold", "size": "lg", "align": "center"},
                    {"type": "separator", "margin": "lg"},
                    {"type": "button", "style": "primary", "color": "#E74C3C",
                     "action": {"type": "postback", "label": "🔴 긴급 (24시간 내 연락 필요)", "data": "action=urg_urgent"}},
                    {"type": "button", "style": "primary", "color": "#F39C12",
                     "action": {"type": "postback", "label": "🟡 보통 (2-3일 내)", "data": "action=urg_normal"}},
                    {"type": "button", "style": "primary", "color": "#27AE60",
                     "action": {"type": "postback", "label": "🟢 여유 (1주일 내)", "data": "action=urg_flexible"}}
                ]
            }
        }
    )


def create_time_selection():
    return FlexSendMessage(
        alt_text="선호 시간",
        contents={
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "선호하는 상담 시간대를 선택해주세요", "weight": "bold", "size": "lg", "align": "center"},
                    {"type": "separator", "margin": "lg"},
                    {"type": "button", "style": "primary", "color": "#F39C12",
                     "action": {"type": "postback", "label": "☀️ 오전 (9시-12시)", "data": "action=time_morning"}},
                    {"type": "button", "style": "primary", "color": "#3498DB",
                     "action": {"type": "postback", "label": "🌤️ 오후 (12시-18시)", "data": "action=time_afternoon"}},
                    {"type": "button", "style": "primary", "color": "#9B59B6",
                     "action": {"type": "postback", "label": "🌙 저녁 (18시-21시)", "data": "action=time_evening"}},
                    {"type": "button", "style": "primary", "color": "#95A5A6",
                     "action": {"type": "postback", "label": "⏰ 상관없음", "data": "action=time_anytime"}}
                ]
            }
        }
    )


# ==================== 관리자 라우트 ====================
@app.route("/admin")
def admin_redirect():
    return redirect(url_for('admin_login'))


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            flash('로그인 성공!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('아이디 또는 비밀번호가 올바르지 않습니다.', 'danger')

    return render_template('admin_login.html')


@app.route("/admin/logout")
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('로그아웃되었습니다.', 'info')
    return redirect(url_for('admin_login'))


@app.route("/admin/dashboard")
@login_required
def admin_dashboard():
    # 통계 데이터
    cursor.execute("SELECT COUNT(*) as total FROM consultations")
    total_count = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as today FROM consultations WHERE DATE(created_at) = CURDATE()")
    today_count = cursor.fetchone()['today']

    cursor.execute("SELECT COUNT(*) as urgent FROM consultations WHERE urgency = 'urgent' AND status = 'pending'")
    urgent_count = cursor.fetchone()['urgent']

    cursor.execute("SELECT COUNT(*) as pending FROM consultations WHERE status = 'pending'")
    pending_count = cursor.fetchone()['pending']

    # 최근 상담 5건
    cursor.execute("""
        SELECT id, consultation_number, guardian_name, urgency, status, created_at 
        FROM consultations 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    recent_consultations = cursor.fetchall()

    return render_template('admin_dashboard.html',
                           total_count=total_count,
                           today_count=today_count,
                           urgent_count=urgent_count,
                           pending_count=pending_count,
                           recent_consultations=recent_consultations)


@app.route("/admin/consultations")
@login_required
def admin_consultations():
    # 검색 및 필터링
    search = request.args.get('search', '')
    status_filter = request.args.get('status', '')
    urgency_filter = request.args.get('urgency', '')

    query = "SELECT * FROM consultations WHERE 1=1"
    params = []

    if search:
        query += " AND (consultation_number LIKE %s OR guardian_name LIKE %s OR guardian_phone LIKE %s)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])

    if status_filter:
        query += " AND status = %s"
        params.append(status_filter)

    if urgency_filter:
        query += " AND urgency = %s"
        params.append(urgency_filter)

    query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    consultations = cursor.fetchall()

    return render_template('admin_consultations.html',
                           consultations=consultations,
                           search=search,
                           status_filter=status_filter,
                           urgency_filter=urgency_filter)


@app.route("/admin/consultations/<int:consultation_id>")
@login_required
def admin_consultation_detail(consultation_id):
    cursor.execute("SELECT * FROM consultations WHERE id = %s", (consultation_id,))
    consultation = cursor.fetchone()

    if not consultation:
        flash('상담 내역을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('admin_consultations'))

    return render_template('admin_detail.html', consultation=consultation)


@app.route("/admin/consultations/<int:consultation_id>/update_status", methods=["POST"])
@login_required
def update_status(consultation_id):
    new_status = request.form.get('status')
    cursor.execute("UPDATE consultations SET status = %s WHERE id = %s", (new_status, consultation_id))
    flash('상태가 업데이트되었습니다!', 'success')
    return redirect(url_for('admin_consultation_detail', consultation_id=consultation_id))


# ==================== WEBHOOK ====================
@app.route("/webhook", methods=["POST"])
def webhook():
    signature = request.headers.get("X-Line-Signature")
    body = request.get_data(as_text=True)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)
    return "OK"


# ==================== EVENTS ====================
@handler.add(FollowEvent)
def handle_follow(event):
    line_bot_api.reply_message(
        event.reply_token,
        [
            TextSendMessage(text="안녕하세요 😊\nPet AI 상담봇입니다!\n\n반려동물 건강 상담을 도와드립니다.\n아래 메뉴를 선택해주세요!"),
            create_main_menu()
        ]
    )


@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    line_user_id = event.source.user_id
    text = event.message.text.strip()

    user_id = upsert_user(line_user_id)
    conversation_id = get_or_create_conversation(user_id)
    save_message(conversation_id, "user", text, used_gpt=0, matched_pattern=None)

    state = user_states.get(line_user_id, {"step": "none"})
    step = state.get("step", "none")

    # 메뉴 요청
    if text in ["메뉴", "시작", "처음", "help"]:
        reply_text = "메인 메뉴를 띄워드릴게요 😊"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="system_menu")
        line_bot_api.reply_message(event.reply_token, [TextSendMessage(text=reply_text), create_main_menu()])
        return

    # 상담 플로우
    if step == "waiting_guardian_name":
        state["guardian_name"] = text
        state["step"] = "waiting_guardian_phone"
        user_states[line_user_id] = state
        reply_text = "📞 연락처를 입력해주세요\n\n예시: 010-1234-5678"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))
        return

    elif step == "waiting_guardian_phone":
        state["guardian_phone"] = text
        state["step"] = "waiting_pet_type"
        user_states[line_user_id] = state
        reply_text = "반려동물 종류를 선택해주세요 🐾"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, [TextSendMessage(text=reply_text), create_pet_type_selection()])
        return

    elif step == "waiting_pet_name":
        state["pet_name"] = text
        state["step"] = "waiting_pet_age"
        user_states[line_user_id] = state
        reply_text = "🎂 반려동물의 나이를 입력해주세요\n\n예시: 3살 또는 3"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))
        return

    elif step == "waiting_pet_age":
        state["pet_age"] = text
        state["step"] = "waiting_category"
        user_states[line_user_id] = state
        reply_text = "상담 카테고리를 선택해주세요 📋"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, [TextSendMessage(text=reply_text), create_category_selection()])
        return

    elif step == "waiting_description":
        state["description"] = text
        state["step"] = "waiting_preferred_time"
        user_states[line_user_id] = state
        reply_text = "선호하는 상담 시간대를 선택해주세요 🕐"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, [TextSendMessage(text=reply_text), create_time_selection()])
        return

    # 일반 대화
    pattern_reply, matched_pattern = get_pattern_response(text)
    if pattern_reply:
        reply = pattern_reply
        used_gpt = 0
    else:
        reply = ask_gpt(text)
        used_gpt = 1
        matched_pattern = None

    save_message(conversation_id, "bot", reply, used_gpt=used_gpt, matched_pattern=matched_pattern)
    line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply))


@handler.add(PostbackEvent)
def handle_postback(event):
    line_user_id = event.source.user_id
    user_id = upsert_user(line_user_id)
    conversation_id = get_or_create_conversation(user_id)

    params = {k: v[0] for k, v in parse_qs(event.postback.data).items()}
    action = params.get("action")

    save_message(conversation_id, "user", f"[POSTBACK]{action}", used_gpt=0, matched_pattern="postback")

    state = user_states.get(line_user_id, {"step": "none"})

    # 기존 핸들러
    if action == "consultation":
        reply_text = "상담 신청을 시작합니다! 😊"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="postback")
        line_bot_api.reply_message(event.reply_token, [TextSendMessage(text=reply_text), create_consultation_type()])

    elif action == "personal":
        user_states[line_user_id] = {"step": "waiting_guardian_name", "member_type": "personal"}
        reply_text = "👤 개인 회원 상담 신청\n\n보호자님의 성함을 입력해주세요"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    elif action == "corporate":
        user_states[line_user_id] = {"step": "waiting_guardian_name", "member_type": "corporate"}
        reply_text = "🏢 기업/단체 회원 상담 신청\n\n담당자님의 성함을 입력해주세요"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    elif action == "inquiry":
        reply_text = "궁금한 내용을 입력해주세요 😊"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="postback")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    elif action == "contact":
        reply_text = "📞 연락처 정보\n\n━━━━━━━━━━━━━━━━━━━\n📱 전화: 02-1234-5678\n✉️ 이메일: contact@example.com\n🕐 운영: 평일 9:00-18:00\n━━━━━━━━━━━━━━━━━━━"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="postback")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    # 신규 핸들러 (6개 메뉴)
    elif action == "event":
        reply_text = "🎁 현재 진행 중인 이벤트\n\n━━━━━━━━━━━━━━━━━━━\n1️⃣ 신규 회원 가입 이벤트\n2️⃣ 친구 추천 이벤트\n3️⃣ 월간 행운의 룰렛\n━━━━━━━━━━━━━━━━━━━"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="event")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    elif action == "partner":
        reply_text = "🤝 협력사 안내\n\n━━━━━━━━━━━━━━━━━━━\n🏥 ABC 동물병원\n🏪 XYZ 펫샵\n🎓 123 애견훈련소\n━━━━━━━━━━━━━━━━━━━"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="partner")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    elif action == "app":
        reply_text = "📱 Pet AI App 설치 안내\n\n━━━━━━━━━━━━━━━━━━━\n🍎 iOS: App Store\n🤖 Android: Play Store\n━━━━━━━━━━━━━━━━━━━\n\n(현재 개발 중)"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="app")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    # 반려동물 종류
    elif action.startswith("pet_"):
        pet_types = {"pet_dog": "dog", "pet_cat": "cat", "pet_other": "other"}
        pet_names = {"dog": "강아지", "cat": "고양이", "other": "기타"}
        state["pet_type"] = pet_types[action]
        state["step"] = "waiting_pet_name"
        user_states[line_user_id] = state
        reply_text = f"🐾 {pet_names[state['pet_type']]}를 선택하셨습니다!\n\n반려동물의 이름을 입력해주세요"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    # 카테고리
    elif action.startswith("cat_"):
        categories = {
            "cat_health": "health", "cat_nutrition": "nutrition", "cat_behavior": "behavior",
            "cat_grooming": "grooming", "cat_emergency": "emergency", "cat_other": "other"
        }
        cat_names = {
            "health": "질병/건강", "nutrition": "영양/사료", "behavior": "행동 교정",
            "grooming": "미용/관리", "emergency": "응급 상황", "other": "기타 문의"
        }
        state["category"] = categories[action]
        state["step"] = "waiting_urgency"
        user_states[line_user_id] = state
        reply_text = f"📋 {cat_names[state['category']]}를 선택하셨습니다!\n\n긴급도를 선택해주세요"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, [TextSendMessage(text=reply_text), create_urgency_selection()])

    # 긴급도
    elif action.startswith("urg_"):
        urgencies = {"urg_urgent": "urgent", "urg_normal": "normal", "urg_flexible": "flexible"}
        urg_names = {"urgent": "긴급", "normal": "보통", "flexible": "여유"}
        state["urgency"] = urgencies[action]
        state["step"] = "waiting_description"
        user_states[line_user_id] = state
        reply_text = f"🔔 {urg_names[state['urgency']]}로 설정되었습니다!\n\n상세한 문의 내용을 입력해주세요\n\n예시:\n• 증상이 언제부터 시작되었나요?\n• 어떤 증상이 있나요?\n• 기타 특이사항"
        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_flow")
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))

    # 선호 시간
    elif action.startswith("time_"):
        times = {"time_morning": "morning", "time_afternoon": "afternoon", "time_evening": "evening",
                 "time_anytime": "anytime"}
        time_names = {"morning": "오전 (9-12시)", "afternoon": "오후 (12-18시)", "evening": "저녁 (18-21시)", "anytime": "상관없음"}
        state["preferred_time"] = times[action]

        # 상담 정보 DB 저장
        consultation_number = save_consultation(user_id, state)

        # 완료 메시지
        pet_types_kr = {"dog": "강아지", "cat": "고양이", "other": "기타"}
        cat_names_kr = {
            "health": "질병/건강", "nutrition": "영양/사료", "behavior": "행동 교정",
            "grooming": "미용/관리", "emergency": "응급 상황", "other": "기타"
        }
        urg_emoji = {"urgent": "🔴", "normal": "🟡", "flexible": "🟢"}
        urg_names_kr = {"urgent": "긴급", "normal": "보통", "flexible": "여유"}

        reply_text = (
            f"✅ 상담 신청이 완료되었습니다!\n\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"📋 접수 번호: {consultation_number}\n"
            f"━━━━━━━━━━━━━━━━━━━\n\n"
            f"👤 보호자: {state['guardian_name']}\n"
            f"📞 연락처: {state['guardian_phone']}\n\n"
            f"🐾 반려동물: {state['pet_name']} ({pet_types_kr[state['pet_type']]}, {state.get('pet_age', '나이 미입력')})\n"
            f"📋 카테고리: {cat_names_kr[state['category']]}\n"
            f"{urg_emoji[state['urgency']]} 긴급도: {urg_names_kr[state['urgency']]}\n"
            f"💬 문의 내용:\n{state['description']}\n\n"
            f"🕐 선호 시간: {time_names[state['preferred_time']]}\n\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"빠른 시일 내에 연락드리겠습니다.\n"
            f"감사합니다! 😊\n\n"
            f"접수번호로 상담 진행 상황을 확인하실 수 있습니다."
        )

        save_message(conversation_id, "bot", reply_text, used_gpt=0, matched_pattern="consult_complete")
        user_states[line_user_id] = {"step": "none"}
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))


# ==================== RUN ====================
@app.route("/")
def home():
    return "Pet AI 상담봇 실행 중 🚀<br><a href='/admin'>관리자 페이지</a>"


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Pet AI 상담봇 + 관리자 사이트 시작")
    print("=" * 60)
    print("✅ MySQL 연결")
    print("✅ OpenAI GPT 연동")
    print("✅ 상세 상담 플로우 적용")
    print("✅ 접수 번호 자동 발급")
    print("✅ 관리자 사이트: http://localhost:5000/admin")
    print(f"✅ 관리자 계정: {ADMIN_USERNAME} / {ADMIN_PASSWORD}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=True)