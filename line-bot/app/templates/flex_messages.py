"""
LINE Flex Message Templates

Provides rich interactive message templates for the PetAI chatbot.
Merged with consultation flow from the existing LINE chatbot.
"""

from typing import Any


def create_bubble(
    header_text: str | None = None,
    body_contents: list[dict] | None = None,
    footer_contents: list[dict] | None = None,
    header_color: str = "#4A90D9",
) -> dict:
    """Create a basic bubble container."""
    bubble: dict[str, Any] = {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": body_contents or [],
            "spacing": "md",
            "paddingAll": "xl",
        },
    }

    if header_text:
        bubble["header"] = {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": header_text,
                    "weight": "bold",
                    "size": "lg",
                    "color": "#FFFFFF",
                }
            ],
            "backgroundColor": header_color,
            "paddingAll": "lg",
        }

    if footer_contents:
        bubble["footer"] = {
            "type": "box",
            "layout": "vertical",
            "contents": footer_contents,
            "spacing": "sm",
        }

    return bubble


def create_button(
    label: str,
    action_type: str = "postback",
    data: str = "",
    display_text: str | None = None,
    uri: str | None = None,
    color: str = "#4A90D9",
    style: str = "primary",
) -> dict:
    """Create a button component."""
    action: dict[str, Any] = {"type": action_type, "label": label}

    if action_type == "postback":
        action["data"] = data
        if display_text:
            action["displayText"] = display_text
    elif action_type == "uri":
        action["uri"] = uri
    elif action_type == "message":
        action["text"] = data

    return {
        "type": "button",
        "action": action,
        "style": style,
        "color": color if style == "primary" else None,
        "height": "sm",
    }


# ===============================
# Consultation Flow Templates
# ===============================

def member_type_message() -> dict:
    """Step 1: Member type selection (personal/corporate)."""
    return {
        "type": "flex",
        "altText": "회원 유형 선택",
        "contents": create_bubble(
            header_text="🐾 PetAI 상담",
            body_contents=[
                {
                    "type": "text",
                    "text": "상담 신청을 시작합니다!",
                    "wrap": True,
                    "size": "md",
                },
                {
                    "type": "text",
                    "text": "회원 유형을 선택해주세요.",
                    "wrap": True,
                    "size": "sm",
                    "color": "#666666",
                    "margin": "md",
                },
            ],
            footer_contents=[
                create_button(
                    "👤 개인 회원",
                    action_type="postback",
                    data="action=consultation&step=member_type&value=personal",
                    display_text="개인 회원",
                    color="#4A90E2",
                ),
                create_button(
                    "🏢 기업/단체 회원",
                    action_type="postback",
                    data="action=consultation&step=member_type&value=corporate",
                    display_text="기업/단체 회원",
                    color="#FF6B6B",
                ),
            ],
        ),
    }


def pet_type_message() -> dict:
    """Step 4: Pet type selection (dog/cat/other)."""
    return {
        "type": "flex",
        "altText": "반려동물 종류 선택",
        "contents": create_bubble(
            header_text="🐾 반려동물 종류",
            body_contents=[
                {
                    "type": "text",
                    "text": "반려동물 종류를 선택해주세요.",
                    "wrap": True,
                    "size": "md",
                },
            ],
            footer_contents=[
                create_button(
                    "🐶 강아지",
                    action_type="postback",
                    data="action=consultation&step=pet_type&value=dog",
                    display_text="강아지",
                    color="#F9A826",
                ),
                create_button(
                    "🐱 고양이",
                    action_type="postback",
                    data="action=consultation&step=pet_type&value=cat",
                    display_text="고양이",
                    color="#8E44AD",
                ),
                create_button(
                    "🐰 기타 (토끼, 햄스터 등)",
                    action_type="postback",
                    data="action=consultation&step=pet_type&value=other",
                    display_text="기타",
                    color="#95A5A6",
                ),
            ],
        ),
    }


def category_message() -> dict:
    """Step 7: Consultation category selection (6 categories)."""
    return {
        "type": "flex",
        "altText": "상담 카테고리 선택",
        "contents": create_bubble(
            header_text="📋 상담 카테고리",
            body_contents=[
                {
                    "type": "text",
                    "text": "상담 카테고리를 선택해주세요.",
                    "wrap": True,
                    "size": "md",
                },
            ],
            footer_contents=[
                create_button(
                    "🏥 질병/건강",
                    action_type="postback",
                    data="action=consultation&step=category&value=health",
                    display_text="질병/건강",
                    color="#E74C3C",
                ),
                create_button(
                    "🍖 영양/사료",
                    action_type="postback",
                    data="action=consultation&step=category&value=nutrition",
                    display_text="영양/사료",
                    color="#F39C12",
                ),
                create_button(
                    "😺 행동 교정",
                    action_type="postback",
                    data="action=consultation&step=category&value=behavior",
                    display_text="행동 교정",
                    color="#9B59B6",
                ),
                create_button(
                    "✂️ 미용/관리",
                    action_type="postback",
                    data="action=consultation&step=category&value=grooming",
                    display_text="미용/관리",
                    color="#3498DB",
                ),
                create_button(
                    "💊 응급 상황",
                    action_type="postback",
                    data="action=consultation&step=category&value=emergency",
                    display_text="응급 상황",
                    color="#C0392B",
                ),
                create_button(
                    "🏠 기타 문의",
                    action_type="postback",
                    data="action=consultation&step=category&value=other",
                    display_text="기타 문의",
                    color="#7F8C8D",
                ),
            ],
        ),
    }


def urgency_message() -> dict:
    """Step 8: Urgency level selection (urgent/normal/flexible)."""
    return {
        "type": "flex",
        "altText": "긴급도 선택",
        "contents": create_bubble(
            header_text="⏰ 긴급도 선택",
            body_contents=[
                {
                    "type": "text",
                    "text": "긴급도를 선택해주세요.",
                    "wrap": True,
                    "size": "md",
                },
            ],
            footer_contents=[
                create_button(
                    "🔴 긴급 (24시간 내 연락 필요)",
                    action_type="postback",
                    data="action=consultation&step=urgency&value=urgent",
                    display_text="긴급",
                    color="#E74C3C",
                ),
                create_button(
                    "🟡 보통 (2-3일 내)",
                    action_type="postback",
                    data="action=consultation&step=urgency&value=normal",
                    display_text="보통",
                    color="#F39C12",
                ),
                create_button(
                    "🟢 여유 (1주일 내)",
                    action_type="postback",
                    data="action=consultation&step=urgency&value=flexible",
                    display_text="여유",
                    color="#27AE60",
                ),
            ],
        ),
    }


def preferred_time_message() -> dict:
    """Step 10: Preferred consultation time selection."""
    return {
        "type": "flex",
        "altText": "선호 상담 시간",
        "contents": create_bubble(
            header_text="🕐 선호 상담 시간",
            body_contents=[
                {
                    "type": "text",
                    "text": "선호하는 상담 시간대를 선택해주세요.",
                    "wrap": True,
                    "size": "md",
                },
            ],
            footer_contents=[
                create_button(
                    "☀️ 오전 (9시-12시)",
                    action_type="postback",
                    data="action=consultation&step=preferred_time&value=morning",
                    display_text="오전 (9-12시)",
                    color="#F39C12",
                ),
                create_button(
                    "🌤️ 오후 (12시-18시)",
                    action_type="postback",
                    data="action=consultation&step=preferred_time&value=afternoon",
                    display_text="오후 (12-18시)",
                    color="#3498DB",
                ),
                create_button(
                    "🌙 저녁 (18시-21시)",
                    action_type="postback",
                    data="action=consultation&step=preferred_time&value=evening",
                    display_text="저녁 (18-21시)",
                    color="#9B59B6",
                ),
                create_button(
                    "⏰ 상관없음",
                    action_type="postback",
                    data="action=consultation&step=preferred_time&value=anytime",
                    display_text="상관없음",
                    color="#95A5A6",
                ),
            ],
        ),
    }


def consultation_complete_message(
    consultation_number: str,
    guardian_name: str,
    guardian_phone: str,
    pet_name: str,
    pet_type: str,
    pet_age: str,
    category: str,
    urgency: str,
    description: str,
    preferred_time: str,
) -> dict:
    """Consultation completion confirmation message with full details."""
    category_display = {
        "health": "질병/건강",
        "nutrition": "영양/사료",
        "behavior": "행동 교정",
        "grooming": "미용/관리",
        "emergency": "응급 상황",
        "other": "기타 문의",
    }
    urgency_display = {
        "urgent": "🔴 긴급",
        "normal": "🟡 보통",
        "flexible": "🟢 여유",
    }
    pet_type_display = {
        "dog": "강아지",
        "cat": "고양이",
        "other": "기타",
    }
    time_display = {
        "morning": "오전 (9-12시)",
        "afternoon": "오후 (12-18시)",
        "evening": "저녁 (18-21시)",
        "anytime": "상관없음",
    }

    def info_row(label: str, value: str) -> dict:
        return {
            "type": "box",
            "layout": "horizontal",
            "contents": [
                {"type": "text", "text": label, "size": "sm", "color": "#666666", "flex": 3},
                {"type": "text", "text": value, "size": "sm", "flex": 5, "wrap": True},
            ],
        }

    # Truncate description for display
    desc_short = description[:50] + "..." if len(description) > 50 else description

    return {
        "type": "flex",
        "altText": f"상담 신청 완료 - {consultation_number}",
        "contents": create_bubble(
            header_text="✅ 상담 신청 완료",
            header_color="#28A745",
            body_contents=[
                {
                    "type": "text",
                    "text": f"📋 접수 번호: {consultation_number}",
                    "weight": "bold",
                    "size": "lg",
                },
                {"type": "separator", "margin": "lg"},
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "lg",
                    "spacing": "sm",
                    "contents": [
                        info_row("👤 보호자", guardian_name),
                        info_row("📞 연락처", guardian_phone or "-"),
                        info_row("🐾 반려동물", f"{pet_name} ({pet_type_display.get(pet_type, pet_type)}, {pet_age or '나이 미입력'})"),
                        info_row("📋 카테고리", category_display.get(category, category)),
                        info_row("긴급도", urgency_display.get(urgency, urgency)),
                        info_row("🕐 선호 시간", time_display.get(preferred_time, preferred_time)),
                        info_row("💬 문의 내용", desc_short),
                    ],
                },
                {"type": "separator", "margin": "lg"},
                {
                    "type": "text",
                    "text": "빠른 시일 내에 연락드리겠습니다.\n감사합니다! 접수번호로 상담 진행 상황을 확인하실 수 있습니다.",
                    "size": "sm",
                    "color": "#666666",
                    "margin": "lg",
                    "wrap": True,
                },
            ],
            footer_contents=[
                create_button(
                    "상담 내역 조회",
                    action_type="postback",
                    data="action=check_consultation",
                    display_text="상담 내역 조회",
                ),
            ],
        ),
    }


# ===============================
# Main Menu Templates
# ===============================

def main_menu_message() -> dict:
    """Main menu Flex Message."""
    return {
        "type": "flex",
        "altText": "Pet AI 상담봇 메뉴",
        "contents": create_bubble(
            header_text="🤖 Pet AI 상담봇",
            body_contents=[
                {
                    "type": "text",
                    "text": "원하시는 서비스를 선택해주세요.",
                    "wrap": True,
                    "size": "md",
                },
            ],
            footer_contents=[
                create_button(
                    "📋 상담 신청",
                    action_type="postback",
                    data="action=consultation",
                    display_text="상담 신청",
                ),
                create_button(
                    "💬 일반 문의",
                    action_type="postback",
                    data="action=inquiry",
                    display_text="일반 문의",
                    color="#28A745",
                ),
                create_button(
                    "📞 연락처 정보",
                    action_type="postback",
                    data="action=contact",
                    display_text="연락처 정보",
                    color="#FFC107",
                ),
            ],
        ),
    }


def welcome_message(user_name: str | None = None) -> dict:
    """Welcome message for new users (follow event)."""
    greeting = f"{user_name}님, " if user_name else ""
    return {
        "type": "flex",
        "altText": "Pet AI에 오신 것을 환영합니다!",
        "contents": create_bubble(
            header_text="🎉 환영합니다!",
            header_color="#28A745",
            body_contents=[
                {
                    "type": "text",
                    "text": f"안녕하세요 {greeting}😊\nPet AI 상담봇입니다!",
                    "weight": "bold",
                    "size": "lg",
                    "wrap": True,
                },
                {
                    "type": "text",
                    "text": "반려동물 건강 상담을 도와드립니다.\n아래 메뉴를 선택해주세요!",
                    "size": "sm",
                    "color": "#666666",
                    "margin": "lg",
                    "wrap": True,
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "xl",
                    "spacing": "sm",
                    "contents": [
                        {"type": "text", "text": "✨ 주요 기능", "weight": "bold", "size": "md"},
                        {"type": "text", "text": "• AI 반려동물 상담", "size": "sm", "color": "#666666"},
                        {"type": "text", "text": "• 상담 신청 및 접수", "size": "sm", "color": "#666666"},
                        {"type": "text", "text": "• 업체 찾기 (병원/미용실 등)", "size": "sm", "color": "#666666"},
                        {"type": "text", "text": "• 반려동물 용품 쇼핑", "size": "sm", "color": "#666666"},
                    ],
                },
            ],
            footer_contents=[
                create_button(
                    "시작하기",
                    action_type="postback",
                    data="action=start",
                    display_text="시작하기",
                ),
            ],
        ),
    }


# ===============================
# Business & Product Templates
# ===============================

def business_category_message() -> dict:
    """Business category selection."""
    return {
        "type": "flex",
        "altText": "업체 카테고리 선택",
        "contents": {
            "type": "carousel",
            "contents": [
                create_bubble(
                    header_text="🏪 업체 찾기 (1/2)",
                    body_contents=[
                        {
                            "type": "text",
                            "text": "찾고 싶은 업체 종류를 선택하세요.",
                            "wrap": True,
                            "size": "sm",
                            "color": "#666666",
                        },
                    ],
                    footer_contents=[
                        create_button(
                            "🏥 동물병원",
                            action_type="postback",
                            data="action=find_business&category=veterinary",
                            display_text="동물병원 찾기",
                        ),
                        create_button(
                            "✂️ 미용실",
                            action_type="postback",
                            data="action=find_business&category=grooming",
                            display_text="미용실 찾기",
                            color="#FF6B6B",
                        ),
                        create_button(
                            "🏨 펫호텔",
                            action_type="postback",
                            data="action=find_business&category=hotel",
                            display_text="펫호텔 찾기",
                            color="#FFC107",
                        ),
                        create_button(
                            "🎓 훈련소",
                            action_type="postback",
                            data="action=find_business&category=training",
                            display_text="훈련소 찾기",
                            color="#28A745",
                        ),
                    ],
                ),
                create_bubble(
                    header_text="🏪 업체 찾기 (2/2)",
                    body_contents=[
                        {
                            "type": "text",
                            "text": "찾고 싶은 업체 종류를 선택하세요.",
                            "wrap": True,
                            "size": "sm",
                            "color": "#666666",
                        },
                    ],
                    footer_contents=[
                        create_button(
                            "🎒 유치원",
                            action_type="postback",
                            data="action=find_business&category=daycare",
                            display_text="유치원 찾기",
                        ),
                        create_button(
                            "☕ 펫카페",
                            action_type="postback",
                            data="action=find_business&category=cafe",
                            display_text="펫카페 찾기",
                            color="#6F4E37",
                        ),
                        create_button(
                            "📄 펫보험",
                            action_type="postback",
                            data="action=find_business&category=insurance",
                            display_text="펫보험 찾기",
                            color="#17A2B8",
                        ),
                        create_button(
                            "🛍️ 펫샵",
                            action_type="postback",
                            data="action=find_business&category=pet_shop",
                            display_text="펫샵 찾기",
                            color="#6C757D",
                        ),
                    ],
                ),
            ],
        },
    }


def product_category_message() -> dict:
    """Product category selection."""
    return {
        "type": "flex",
        "altText": "상품 카테고리 선택",
        "contents": {
            "type": "carousel",
            "contents": [
                create_bubble(
                    header_text="🛍️ 쇼핑 (1/2)",
                    body_contents=[
                        {
                            "type": "text",
                            "text": "구매하고 싶은 상품을 선택하세요.",
                            "wrap": True,
                            "size": "sm",
                            "color": "#666666",
                        },
                    ],
                    footer_contents=[
                        create_button(
                            "🍖 사료",
                            action_type="postback",
                            data="action=shopping&category=food",
                            display_text="사료 보기",
                        ),
                        create_button(
                            "🦴 간식",
                            action_type="postback",
                            data="action=shopping&category=treats",
                            display_text="간식 보기",
                            color="#FFC107",
                        ),
                        create_button(
                            "👕 옷",
                            action_type="postback",
                            data="action=shopping&category=clothing",
                            display_text="옷 보기",
                            color="#FF6B6B",
                        ),
                        create_button(
                            "🎀 악세서리",
                            action_type="postback",
                            data="action=shopping&category=accessories",
                            display_text="악세서리 보기",
                            color="#9B59B6",
                        ),
                    ],
                ),
                create_bubble(
                    header_text="🛍️ 쇼핑 (2/2)",
                    body_contents=[
                        {
                            "type": "text",
                            "text": "구매하고 싶은 상품을 선택하세요.",
                            "wrap": True,
                            "size": "sm",
                            "color": "#666666",
                        },
                    ],
                    footer_contents=[
                        create_button(
                            "🎾 장난감",
                            action_type="postback",
                            data="action=shopping&category=toys",
                            display_text="장난감 보기",
                        ),
                        create_button(
                            "💊 건강용품",
                            action_type="postback",
                            data="action=shopping&category=health",
                            display_text="건강용품 보기",
                            color="#28A745",
                        ),
                        create_button(
                            "🏠 하우스",
                            action_type="postback",
                            data="action=shopping&category=housing",
                            display_text="하우스 보기",
                            color="#6C757D",
                        ),
                        create_button(
                            "🧴 미용용품",
                            action_type="postback",
                            data="action=shopping&category=grooming",
                            display_text="미용용품 보기",
                            color="#17A2B8",
                        ),
                    ],
                ),
            ],
        },
    }


def text_input_prompt(prompt_text: str, example: str | None = None) -> dict:
    """Simple text prompt message for text input steps."""
    contents = [
        {
            "type": "text",
            "text": prompt_text,
            "wrap": True,
            "size": "md",
        },
    ]

    if example:
        contents.append({
            "type": "text",
            "text": f"예: {example}",
            "size": "sm",
            "color": "#888888",
            "margin": "md",
        })

    return {
        "type": "flex",
        "altText": prompt_text,
        "contents": create_bubble(
            header_text="📝 입력해주세요",
            body_contents=contents,
        ),
    }
