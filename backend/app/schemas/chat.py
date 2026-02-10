import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.chat import ChatChannel, MessageRole


class ChatMessageRequest(BaseModel):
    message: str
    session_id: uuid.UUID | None = None
    channel: ChatChannel = ChatChannel.APP


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: MessageRole
    content: str
    action_type: str | None = None
    action_data: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionResponse(BaseModel):
    id: uuid.UUID
    channel: ChatChannel
    is_active: bool
    created_at: datetime
    messages: list[ChatMessageResponse] = []

    model_config = {"from_attributes": True}
