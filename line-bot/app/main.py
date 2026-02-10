"""
PetAI LINE Bot Service

Webhook server for LINE Messaging API integration.
Receives events from LINE and routes them to appropriate handlers.
Supports text messages, postback events, and follow events.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from linebot.v3 import WebhookParser
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.webhooks import (
    FollowEvent,
    MessageEvent,
    PostbackEvent,
    TextMessageContent,
)

from app.config import settings
from app.handlers.follow_handler import follow_handler
from app.handlers.message_handler import message_handler
from app.handlers.postback_handler import postback_handler

parser = WebhookParser(settings.LINE_CHANNEL_SECRET)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("PetAI LINE Bot starting...")
    yield
    # Shutdown
    print("PetAI LINE Bot shutting down...")


app = FastAPI(
    title="PetAI LINE Bot",
    version="0.1.0",
    lifespan=lifespan,
)


@app.post("/webhook")
async def webhook(request: Request):
    """LINE Webhook endpoint. Receives and processes LINE events."""
    signature = request.headers.get("X-Line-Signature", "")
    body = (await request.body()).decode("utf-8")

    try:
        events = parser.parse(body, signature)
    except InvalidSignatureError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    for event in events:
        try:
            if isinstance(event, MessageEvent):
                if isinstance(event.message, TextMessageContent):
                    await message_handler.handle_text_message(event)

            elif isinstance(event, PostbackEvent):
                await postback_handler.handle_postback(event)

            elif isinstance(event, FollowEvent):
                await follow_handler.handle_follow(event)

        except Exception as e:
            print(f"Error handling event: {e}")
            # Continue processing other events

    return {"status": "ok"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "petai-line-bot"}
