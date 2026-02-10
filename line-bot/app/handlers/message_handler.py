"""
LINE Bot Message Handler

Processes incoming LINE messages, routes them to the AI consultant,
and sends back responses with rich message formats.
Supports consultation flow and pattern matching with AI fallback.
"""

import re
from typing import Any

import httpx
from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    FlexContainer,
    FlexMessage,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
)

from app.config import settings
from app.templates import (
    business_category_message,
    main_menu_message,
    member_type_message,
    product_category_message,
)


# Pattern matching for common queries
PATTERNS = {
    r"^(안녕|하이|헬로|hello|hi)": "greeting",
    r"(상담|문의|도움|help)": "consultation",
    r"(메뉴|시작|menu|start)": "menu",
    r"(업체|병원|미용|훈련|호텔|유치원|찾기)": "find_business",
    r"(상품|쇼핑|구매|사료|간식|장난감)": "shopping",
    r"(예약|확인|booking)": "booking",
    r"(내\s*정보|프로필|반려동물|펫)": "profile",
    r"(취소|cancel)": "cancel",
}


class MessageHandler:
    def __init__(self):
        configuration = Configuration(
            access_token=settings.LINE_CHANNEL_ACCESS_TOKEN
        )
        self.api_client = ApiClient(configuration)
        self.messaging_api = MessagingApi(self.api_client)

    async def handle_text_message(self, event) -> None:
        """Handle incoming text messages from LINE users."""
        user_id = event.source.user_id
        user_message = event.message.text.strip()
        reply_token = event.reply_token

        # Check if user is in a consultation flow
        in_consultation = await self._check_consultation_flow(user_id)

        if in_consultation:
            # Process message as consultation step input
            await self._process_consultation_input(
                reply_token, user_id, user_message
            )
            return

        # Try pattern matching first
        pattern_response = self._match_pattern(user_message)
        if pattern_response:
            await self._handle_pattern_response(
                reply_token, user_id, pattern_response, user_message
            )
            return

        # Fallback to AI chat
        await self._handle_ai_chat(reply_token, user_id, user_message)

    def _match_pattern(self, message: str) -> str | None:
        """Match message against predefined patterns."""
        message_lower = message.lower()
        for pattern, response_type in PATTERNS.items():
            if re.search(pattern, message_lower):
                return response_type
        return None

    async def _handle_pattern_response(
        self,
        reply_token: str,
        user_id: str,
        response_type: str,
        message: str,
    ) -> None:
        """Handle response based on pattern match."""
        if response_type == "greeting":
            await self._reply_text(
                reply_token,
                "안녕하세요! 🐾 PetAI입니다.\n"
                "반려동물에 대해 무엇이든 물어보세요!\n\n"
                "메뉴를 보시려면 '메뉴'라고 입력해주세요."
            )

        elif response_type == "menu":
            await self._reply_flex(reply_token, main_menu_message())

        elif response_type == "consultation":
            await self._start_consultation(reply_token, user_id)

        elif response_type == "find_business":
            await self._reply_flex(reply_token, business_category_message())

        elif response_type == "shopping":
            await self._reply_flex(reply_token, product_category_message())

        elif response_type == "booking":
            await self._reply_text(
                reply_token,
                "예약 내역을 조회합니다. 🗓️\n"
                "현재 예정된 예약이 없습니다.\n\n"
                "업체를 찾아 예약하시겠어요?"
            )

        elif response_type == "profile":
            await self._show_profile(reply_token, user_id)

        elif response_type == "cancel":
            await self._cancel_consultation(reply_token, user_id)

        else:
            await self._handle_ai_chat(reply_token, user_id, message)

    async def _check_consultation_flow(self, user_id: str) -> bool:
        """Check if user has an active consultation flow."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.BACKEND_API_URL}/consultations/active/{user_id}",
                    timeout=10.0,
                )
            if response.status_code == 200:
                data = response.json()
                return data.get("is_active", False)
        except Exception as e:
            print(f"Error checking consultation flow: {e}")
        return False

    async def _process_consultation_input(
        self,
        reply_token: str,
        user_id: str,
        message: str,
    ) -> None:
        """Process text input for consultation flow."""
        # Check for cancel command
        if message.lower() in ["취소", "cancel", "중단", "그만"]:
            await self._cancel_consultation(reply_token, user_id)
            return

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.BACKEND_API_URL}/consultations/input",
                    json={
                        "channel_user_id": user_id,
                        "message": message,
                    },
                    timeout=30.0,
                )

            if response.status_code == 200:
                data = response.json()
                next_step = data.get("next_step")
                message_text = data.get("message", "")
                is_completed = data.get("is_completed", False)
                flex_message = data.get("flex_message")

                if is_completed:
                    # Show completion with flex message
                    if flex_message:
                        await self._reply_flex(reply_token, flex_message)
                    else:
                        await self._reply_text(reply_token, message_text)
                elif flex_message:
                    # Show flex message for step
                    await self._reply_flex(reply_token, flex_message)
                else:
                    # Show text prompt
                    await self._reply_text(reply_token, message_text)
            else:
                await self._reply_text(
                    reply_token,
                    "입력 처리 중 오류가 발생했습니다. 다시 입력해주세요."
                )
        except Exception as e:
            print(f"Error processing consultation input: {e}")
            await self._reply_text(
                reply_token,
                "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            )

    async def _start_consultation(
        self,
        reply_token: str,
        user_id: str,
    ) -> None:
        """Start a new consultation flow."""
        try:
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
        except Exception as e:
            print(f"Error starting consultation: {e}")
            await self._reply_text(
                reply_token,
                "상담 시작 중 오류가 발생했습니다."
            )

    async def _cancel_consultation(
        self,
        reply_token: str,
        user_id: str,
    ) -> None:
        """Cancel active consultation."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.BACKEND_API_URL}/consultations/cancel/{user_id}",
                    timeout=10.0,
                )

            if response.status_code == 200:
                await self._reply_text(
                    reply_token,
                    "상담이 취소되었습니다.\n새로운 상담을 원하시면 '상담'이라고 입력해주세요."
                )
            else:
                await self._reply_text(
                    reply_token,
                    "진행 중인 상담이 없습니다."
                )
        except Exception as e:
            print(f"Error canceling consultation: {e}")

    async def _show_profile(
        self,
        reply_token: str,
        user_id: str,
    ) -> None:
        """Show user's pet profile."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.BACKEND_API_URL}/users/line/{user_id}/pets",
                    timeout=10.0,
                )

            if response.status_code == 200:
                data = response.json()
                pets = data.get("items", [])
                if pets:
                    pet_list = "\n".join([
                        f"🐾 {p['name']} ({p.get('breed', '품종 미등록')})"
                        for p in pets
                    ])
                    await self._reply_text(
                        reply_token,
                        f"등록된 반려동물:\n\n{pet_list}\n\n"
                        "상세 정보는 앱에서 확인하세요!"
                    )
                else:
                    await self._reply_text(
                        reply_token,
                        "등록된 반려동물이 없습니다.\n앱에서 반려동물을 등록해주세요!"
                    )
            else:
                await self._reply_text(
                    reply_token,
                    "프로필 조회 중 오류가 발생했습니다."
                )
        except Exception as e:
            print(f"Error showing profile: {e}")
            await self._reply_text(
                reply_token,
                "프로필 조회 중 오류가 발생했습니다."
            )

    async def _handle_ai_chat(
        self,
        reply_token: str,
        user_id: str,
        message: str,
    ) -> None:
        """Handle AI chat with Claude."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.BACKEND_API_URL}/chat/message",
                    json={
                        "message": message,
                        "channel": "line",
                        "channel_user_id": user_id,
                    },
                    timeout=30.0,
                )

            if response.status_code == 200:
                data = response.json()
                reply_text = data.get(
                    "content",
                    "죄송합니다. 잠시 후 다시 시도해주세요."
                )

                # Check for actions
                action_type = data.get("action_type")
                if action_type and action_type != "none":
                    await self._reply_with_action(reply_token, reply_text, data)
                else:
                    await self._reply_text(reply_token, reply_text)
            else:
                await self._reply_text(
                    reply_token,
                    "죄송합니다. 일시적인 오류가 발생했습니다. 🐾"
                )
        except Exception as e:
            print(f"Error in AI chat: {e}")
            await self._reply_text(
                reply_token,
                "죄송합니다. 일시적인 오류가 발생했습니다. 🐾"
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

    async def _reply_with_action(
        self, reply_token: str, text: str, data: dict
    ) -> None:
        """Send a reply with action buttons based on AI recommendation."""
        action_type = data.get("action_type")
        action_data = data.get("action_data", {})

        action_text = ""
        if action_type == "recommend_business":
            category = action_data.get("category", "")
            action_text = f"\n\n💡 {category} 업체를 찾아볼까요? '업체 찾기'라고 말씀해주세요."
        elif action_type == "recommend_product":
            action_text = "\n\n🛍️ 관련 상품을 추천해드릴까요? '쇼핑'이라고 말씀해주세요."
        elif action_type == "create_booking":
            action_text = "\n\n📅 예약을 도와드릴까요? '예약'이라고 말씀해주세요."

        await self._reply_text(reply_token, text + action_text)


message_handler = MessageHandler()
