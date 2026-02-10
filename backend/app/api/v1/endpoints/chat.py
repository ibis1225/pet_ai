import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.chat import ChatMessage, ChatSession, MessageRole
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, ChatSessionResponse
from app.services.chat.ai_consultant import pet_consultant

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    data: ChatMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    # Get or create session
    if data.session_id:
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == data.session_id)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    else:
        session = ChatSession(channel=data.channel)
        db.add(session)
        await db.flush()

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role=MessageRole.USER,
        content=data.message,
    )
    db.add(user_msg)
    await db.flush()

    # Get conversation history for context
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    history = history_result.scalars().all()
    conversation_history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in history
        if msg.role != MessageRole.SYSTEM
    ]

    # Get AI response
    ai_result = await pet_consultant.consult(
        user_message=data.message,
        conversation_history=conversation_history[:-1],  # Exclude current message
    )

    # Save AI response
    ai_msg = ChatMessage(
        session_id=session.id,
        role=MessageRole.ASSISTANT,
        content=ai_result["response"],
        action_type=ai_result.get("action_type"),
        action_data=ai_result.get("action_data"),
    )
    db.add(ai_msg)
    await db.flush()
    await db.refresh(ai_msg)

    return ai_msg


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session(session_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    messages_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = messages_result.scalars().all()

    return ChatSessionResponse(
        id=session.id,
        channel=session.channel,
        is_active=session.is_active,
        created_at=session.created_at,
        messages=messages,
    )
