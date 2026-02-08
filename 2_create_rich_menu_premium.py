import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

CHANNEL_ACCESS_TOKEN = os.getenv('LINE_CHANNEL_ACCESS_TOKEN')

if not CHANNEL_ACCESS_TOKEN:
    print("❌ LINE_CHANNEL_ACCESS_TOKEN이 .env 파일에 없습니다!")
    exit()

headers = {
    'Authorization': f'Bearer {CHANNEL_ACCESS_TOKEN}',
    'Content-Type': 'application/json'
}

# Rich Menu 데이터 (2x3 레이아웃)
rich_menu_data = {
    "size": {"width": 2500, "height": 1686},
    "selected": True,
    "name": "Pet AI Premium Menu",
    "chatBarText": "메뉴",
    "areas": [
        # 위쪽 줄 (왼쪽부터)
        {
            "bounds": {"x": 0, "y": 0, "width": 833, "height": 843},
            "action": {"type": "postback", "data": "action=event", "displayText": "이벤트"}
        },
        {
            "bounds": {"x": 833, "y": 0, "width": 834, "height": 843},
            "action": {"type": "postback", "data": "action=partner", "displayText": "협력사"}
        },
        {
            "bounds": {"x": 1667, "y": 0, "width": 833, "height": 843},
            "action": {"type": "postback", "data": "action=consultation", "displayText": "상담하기"}
        },
        # 아래쪽 줄 (왼쪽부터)
        {
            "bounds": {"x": 0, "y": 843, "width": 833, "height": 843},
            "action": {"type": "postback", "data": "action=app", "displayText": "App 설치"}
        },
        {
            "bounds": {"x": 833, "y": 843, "width": 834, "height": 843},
            "action": {"type": "uri", "uri": "https://example.com"}  # 홈페이지 URL (수정 필요)
        },
        {
            "bounds": {"x": 1667, "y": 843, "width": 833, "height": 843},
            "action": {"type": "postback", "data": "action=inquiry", "displayText": "문의하기"}
        }
    ]
}

print("=" * 60)
print("📋 Rich Menu 생성 시작...")
print("=" * 60)

response = requests.post('https://api.line.me/v2/bot/richmenu', headers=headers, data=json.dumps(rich_menu_data))

if response.status_code == 200:
    rich_menu_id = response.json()['richMenuId']
    print(f"✅ Rich Menu 생성 완료!")
    print(f"   ID: {rich_menu_id}")

    print("\n🖼️ 이미지 업로드 중...")
    try:
        with open('rich_menu_premium.png', 'rb') as f:
            image_headers = {'Authorization': f'Bearer {CHANNEL_ACCESS_TOKEN}', 'Content-Type': 'image/png'}
            upload_response = requests.post(
                f'https://api-data.line.me/v2/bot/richmenu/{rich_menu_id}/content',
                headers=image_headers,
                data=f
            )

            if upload_response.status_code == 200:
                print("✅ 이미지 업로드 완료!")

                print("\n⚙️ 기본 메뉴로 설정 중...")
                default_response = requests.post(
                    f'https://api.line.me/v2/bot/user/all/richmenu/{rich_menu_id}',
                    headers={'Authorization': f'Bearer {CHANNEL_ACCESS_TOKEN}'}
                )

                if default_response.status_code == 200:
                    print("✅ 기본 Rich Menu 설정 완료!")
                    print("\n" + "=" * 60)
                    print("🎉 6개 버튼 프리미엄 메뉴 완성!")
                    print("=" * 60)
                    print("\n📱 LINE 앱을 열어서 확인해보세요!")
                    print("\n메뉴 구성:")
                    print("  위: 🎁 이벤트 | 🤝 협력사 | 📋 상담하기")
                    print("  아래: 📱 App 설치 | 🌐 홈페이지 | 💬 문의하기")
                    print("\n다음 단계: app.py 수정 후 python app.py 실행")
                else:
                    print(f"❌ 기본 메뉴 설정 실패: {default_response.text}")
            else:
                print(f"❌ 이미지 업로드 실패: {upload_response.text}")
    except FileNotFoundError:
        print("❌ rich_menu_premium.png 파일이 없습니다!")
        print("   먼저 1_image_creator_premium.py를 실행하세요!")
else:
    print(f"❌ Rich Menu 생성 실패: {response.text}")
    print(f"   Status Code: {response.status_code}")