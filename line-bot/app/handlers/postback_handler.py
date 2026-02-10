"""
LINE Bot Postback Handler

Handles postback events from Rich Menu and Flex Message buttons.
Manages consultation flow and navigation between services.
"""

from urllib.parse import parse_qs

import httpx
from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    FlexMessage,
    FlexContainer,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
)

from app.config import settings
from app.templates import (
    business_category_message,
    category_message,
    consultation_complete_message,
    main_menu_message,
    member_type_message,
    pet_type_message,
    preferred_time_message,
    product_category_message,
    text_input_prompt,
    urgency_message,
)


class PostbackHandler:
    """Handles postback events from LINE."""

    def __init__(self):
        configuration = Configuration(
            access_token=settings.LINE_CHANNEL_ACCESS_TOKEN
        )
        self.api_client = ApiClient(configuration)
        self.messaging_api = MessagingApi(self.api_client)

    async def handle_postback(self, event) -> None:
        """Handle postback event from LINE."""
        user_id = event.source.user_id
        reply_token = event.reply_token
        data = event.postback.data

        # Parse postback data
        params = parse_qs(data)
        action = params.get("action", [""])[0]

        try:
            if action == "start":
                await self._reply_flex(reply_token, main_menu_message())

            elif action == "consultation":
                # Check if this is a step update or a new consultation start
                step = params.get("step", [None])[0]
                if step:
                    await self._handle_consultation_step(reply_token, user_id, params)
                else:
                    await self._start_consultation(reply_token, user_id)

            elif action == "start_consultation":
                await self._start_consultation(reply_token, user_id)

            elif action == "inquiry":
                await self._reply_text(
                    reply_token,
                    "궁금한 내용을 입력해주세요 😊\n반려동물에 대해 무엇이든 물어보세요!"
                )

            elif action == "contact":
                await self._reply_text(
                    reply_token,
                    "📞 연락처 정보\n\n"
                    "━━━━━━━━━━━━━━━━━━━\n"
                    "📱 전화: 02-1234-5678\n"
                    "✉️ 이메일: contact@petai.app\n"
                    "🕐 운영: 평일 9:00-18:00\n"
                    "━━━━━━━━━━━━━━━━━━━"
                )

            elif action == "event":
                await self._reply_text(
                    reply_token,
                    "🎁 현재 진행 중인 이벤트\n\n"
                    "━━━━━━━━━━━━━━━━━━━\n"
                    "1️⃣ 신규 회원 가입 이벤트\n"
                    "2️⃣ 친구 추천 이벤트\n"
                    "3️⃣ 월간 행운의 룰렛\n"
                    "━━━━━━━━━━━━━━━━━━━"
                )

            elif action == "partner":
                await self._reply_text(
                    reply_token,
                    "🤝 협력사 안내\n\n"
                    "━━━━━━━━━━━━━━━━━━━\n"
                    "🏥 ABC 동물병원\n"
                    "🏪 XYZ 펫샵\n"
                    "🎓 123 애견훈련소\n"
                    "━━━━━━━━━━━━━━━━━━━"
                )

            elif action == "app":
                await self._reply_text(
                    reply_token,
                    "📱 Pet AI App 설치 안내\n\n"
                    "━━━━━━━━━━━━━━━━━━━\n"
                    "🍎 iOS: App Store\n"
                    "🤖 Android: Play Store\n"
                    "━━━━━━━━━━━━━━━━━━━\n\n"
                    "(현재 개발 중)"
                )

            elif action == "find_business":
                category = params.get("category", [None])[0]
                if category:
                    await self._find_business(reply_token, user_id, category)
                else:
                    await self._reply_flex(reply_token, business_category_message())

            elif action == "shopping":
                category = params.get("category", [None])[0]
                if category:
                    await self._show_products(reply_token, user_id, category)
                else:
                    await self._reply_flex(reply_token, product_category_message())

            elif action == "ai_chat":
                await self._reply_text(
                    reply_token,
                    "AI 상담 모드입니다. 🐾\n반려동물에 대해 무엇이든 물어보세요!"
                )

            elif action == "check_consultation":
                await self._check_consultation(reply_token, user_id)

            else:
                await self._reply_text(
                    reply_token,
                    "알 수 없는 요청입니다. 다시 시도해주세요."
                )

        except Exception as e:
            print(f"Postback handler error: {e}")
            await self._reply_text(
                reply_token,
                "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            )

    async def _start_consultation(self, reply_token: str, user_id: str) -> None:
        """Start a new consultation flow."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.BACKEND_API_URL}/consultations",
                json={
                    "channel": "line",
                    "channel_user_id": user_id,
                },
                timeout=30.0,
            )

        if response.status_code in (200, 201):
            await self._reply_flex(reply_token, member_type_message())
        else:
            await self._reply_text(
                reply_token,
                "상담 시작 중 오류가 발생했습니다. 다시 시도해주세요."
            )

    async def _handle_consultation_step(
        self,
        reply_token: str,
        user_id: str,
        params: dict,
    ) -> None:
        """Handle consultation flow step."""
        step = params.get("step", [""])[0]
        value = params.get("value", [""])[0]

        # Send step data to backend
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.BACKEND_API_URL}/consultations/step",
                json={
                    "channel_user_id": user_id,
                    "step": step,
                    "value": value,
                },
                timeout=30.0,
            )

        if response.status_code != 200:
            await self._reply_text(
                reply_token,
                "처리 중 오류가 발생했습니다. 다시 시도해주세요."
            )
            return

        data = response.json()
        next_step = data.get("next_step")
        is_completed = data.get("is_completed", False)

        if is_completed:
            # Show completion message with full details
            consultation = data.get("consultation", {})
            await self._reply_flex(
                reply_token,
                consultation_complete_message(
                    consultation_number=consultation.get("consultation_number", ""),
                    guardian_name=consultation.get("guardian_name", ""),
                    guardian_phone=consultation.get("guardian_phone", ""),
                    pet_name=consultation.get("pet_name", ""),
                    pet_type=consultation.get("pet_type", ""),
                    pet_age=consultation.get("pet_age", ""),
                    category=consultation.get("category", ""),
                    urgency=consultation.get("urgency", ""),
                    description=consultation.get("description", ""),
                    preferred_time=consultation.get("preferred_time", ""),
                ),
            )
        else:
            # Show next step flex message
            await self._show_step_message(reply_token, next_step, data.get("message", ""))

    async def _show_step_message(
        self,
        reply_token: str,
        step: str,
        message: str,
    ) -> None:
        """Show the appropriate flex message for a consultation step."""
        step_messages = {
            "member_type": member_type_message,
            "pet_type": pet_type_message,
            "category": category_message,
            "urgency": urgency_message,
            "preferred_time": preferred_time_message,
        }

        # For steps with flex selection
        if step in step_messages:
            await self._reply_flex(reply_token, step_messages[step]())
        else:
            # For text input steps
            examples = {
                "guardian_name": "홍길동",
                "guardian_phone": "010-1234-5678",
                "pet_name": "콩이",
                "pet_age": "3살 또는 3개월",
                "description": "최근 식욕이 없고 기운이 없어요...",
            }
            example = examples.get(step)
            await self._reply_flex(
                reply_token,
                text_input_prompt(message, example)
            )

    async def _find_business(
        self,
        reply_token: str,
        user_id: str,
        category: str,
    ) -> None:
        """Find businesses by category."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.BACKEND_API_URL}/businesses",
                params={"category": category, "limit": 5},
                timeout=30.0,
            )

        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            if items:
                # TODO: Create business carousel flex message
                business_list = "\n".join([
                    f"• {b['name']} ({b.get('address', '주소 미등록')})"
                    for b in items[:5]
                ])
                await self._reply_text(
                    reply_token,
                    f"🏪 {category} 업체 목록:\n\n{business_list}\n\n상세 정보는 앱에서 확인하세요!"
                )
            else:
                await self._reply_text(
                    reply_token,
                    f"해당 카테고리의 업체가 아직 등록되지 않았습니다."
                )
        else:
            await self._reply_text(
                reply_token,
                "업체 검색 중 오류가 발생했습니다."
            )

    async def _show_products(
        self,
        reply_token: str,
        user_id: str,
        category: str,
    ) -> None:
        """Show products by category."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.BACKEND_API_URL}/products",
                params={"category": category, "limit": 5},
                timeout=30.0,
            )

        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            if items:
                # TODO: Create product carousel flex message
                product_list = "\n".join([
                    f"• {p['name']} - {p.get('price', 0):,}원"
                    for p in items[:5]
                ])
                await self._reply_text(
                    reply_token,
                    f"🛍️ {category} 상품 목록:\n\n{product_list}\n\n구매는 앱에서 가능합니다!"
                )
            else:
                await self._reply_text(
                    reply_token,
                    f"해당 카테고리의 상품이 아직 등록되지 않았습니다."
                )
        else:
            await self._reply_text(
                reply_token,
                "상품 검색 중 오류가 발생했습니다."
            )

    async def _check_consultation(
        self,
        reply_token: str,
        user_id: str,
    ) -> None:
        """Check user's consultation history."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.BACKEND_API_URL}/consultations/user/{user_id}",
                timeout=30.0,
            )

        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            if items:
                consultation_list = "\n".join([
                    f"• {c['consultation_number']} - {c['status']}"
                    for c in items[:5]
                ])
                await self._reply_text(
                    reply_token,
                    f"📋 상담 내역:\n\n{consultation_list}"
                )
            else:
                await self._reply_text(
                    reply_token,
                    "상담 내역이 없습니다.\n\n새로운 상담을 시작하시겠어요?"
                )
        else:
            await self._reply_text(
                reply_token,
                "상담 내역 조회 중 오류가 발생했습니다."
            )

    async def _reply_text(self, reply_token: str, text: str) -> None:
        """Send a simple text reply."""
        self.messaging_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[TextMessage(text=text)],
            )
        )

    async def _reply_flex(self, reply_token: str, flex_data: dict) -> None:
        """Send a flex message reply."""
        self.messaging_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[
                    FlexMessage(
                        alt_text=flex_data.get("altText", "메시지"),
                        contents=FlexContainer.from_dict(flex_data["contents"]),
                    )
                ],
            )
        )


postback_handler = PostbackHandler()
