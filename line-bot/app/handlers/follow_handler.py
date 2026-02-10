"""
LINE Bot Follow Handler

Handles follow events when users add the PetAI bot as a friend.
Sends welcome message and registers user in the system.
"""

import httpx
from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    FlexContainer,
    FlexMessage,
    MessagingApi,
    ReplyMessageRequest,
)

from app.config import settings
from app.templates import welcome_message


class FollowHandler:
    """Handles follow events from LINE."""

    def __init__(self):
        configuration = Configuration(
            access_token=settings.LINE_CHANNEL_ACCESS_TOKEN
        )
        self.api_client = ApiClient(configuration)
        self.messaging_api = MessagingApi(self.api_client)

    async def handle_follow(self, event) -> None:
        """Handle follow event when user adds the bot."""
        user_id = event.source.user_id
        reply_token = event.reply_token

        # Try to get user profile
        user_name = None
        try:
            profile = self.messaging_api.get_profile(user_id)
            user_name = profile.display_name
        except Exception as e:
            print(f"Failed to get user profile: {e}")

        # Register user in backend (optional)
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{settings.BACKEND_API_URL}/users/line",
                    json={
                        "line_user_id": user_id,
                        "display_name": user_name,
                    },
                    timeout=10.0,
                )
        except Exception as e:
            print(f"Failed to register LINE user: {e}")

        # Send welcome message
        try:
            flex_data = welcome_message(user_name)
            self.messaging_api.reply_message(
                ReplyMessageRequest(
                    reply_token=reply_token,
                    messages=[
                        FlexMessage(
                            alt_text="PetAI에 오신 것을 환영합니다!",
                            contents=FlexContainer.from_dict(flex_data["contents"]),
                        )
                    ],
                )
            )
        except Exception as e:
            print(f"Failed to send welcome message: {e}")


follow_handler = FollowHandler()
