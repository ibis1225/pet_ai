"""
Consultation API Endpoints

Handles consultation flow, management, and retrieval.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.consultation import (
    Consultation,
    ConsultationCategory,
    ConsultationStatus,
    ConsultationStep,
    ConsultationUrgency,
)
from app.schemas.consultation import (
    ConsultationCreateRequest,
    ConsultationListResponse,
    ConsultationResponse,
    ConsultationSearchRequest,
    ConsultationStatsResponse,
    ConsultationStepResponse,
    ConsultationUpdateRequest,
)
from app.services.consultation.flow_service import (
    ConsultationFlowService,
    STEP_PROMPTS,
)

router = APIRouter(prefix="/consultations", tags=["consultations"])


# ===============================
# LINE Bot API Endpoints
# ===============================

@router.post("", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
async def create_consultation(
    data: ConsultationCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new consultation and start the flow."""
    flow_service = ConsultationFlowService(db)
    consultation = await flow_service.create_consultation(
        channel=data.channel,
        channel_user_id=data.channel_user_id,
    )
    await db.commit()
    return consultation


@router.get("/active/{channel_user_id}")
async def check_active_consultation(
    channel_user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Check if user has an active consultation in progress."""
    flow_service = ConsultationFlowService(db)
    consultation = await flow_service.get_consultation_by_channel_user(
        channel_user_id=channel_user_id,
    )

    if consultation and consultation.current_step != ConsultationStep.COMPLETED:
        return {
            "is_active": True,
            "consultation_id": str(consultation.id),
            "consultation_number": consultation.consultation_number,
            "current_step": consultation.current_step.value,
        }

    return {"is_active": False}


@router.post("/step")
async def process_consultation_step(
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Process a consultation step from postback."""
    channel_user_id = data.get("channel_user_id")
    step = data.get("step")
    value = data.get("value")

    if not channel_user_id or not step or not value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields",
        )

    flow_service = ConsultationFlowService(db)
    consultation = await flow_service.get_consultation_by_channel_user(
        channel_user_id=channel_user_id,
    )

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active consultation found",
        )

    # Process the step
    next_step, message = await flow_service.process_step(consultation, value)
    await db.commit()
    await db.refresh(consultation)

    is_completed = next_step == ConsultationStep.COMPLETED

    response = {
        "consultation_id": str(consultation.id),
        "consultation_number": consultation.consultation_number,
        "current_step": consultation.current_step.value,
        "next_step": next_step.value if next_step else None,
        "is_completed": is_completed,
        "message": message,
    }

    if is_completed:
        response["consultation"] = _consultation_detail(consultation)

    return response


@router.post("/input")
async def process_consultation_input(
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Process text input for consultation flow (for text input steps)."""
    channel_user_id = data.get("channel_user_id")
    message = data.get("message", "").strip()

    if not channel_user_id or not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields",
        )

    flow_service = ConsultationFlowService(db)
    consultation = await flow_service.get_consultation_by_channel_user(
        channel_user_id=channel_user_id,
    )

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active consultation found",
        )

    # Process current step with the message
    next_step, response_message = await flow_service.process_step(
        consultation, message
    )
    await db.commit()
    await db.refresh(consultation)

    is_completed = next_step == ConsultationStep.COMPLETED

    response = {
        "consultation_id": str(consultation.id),
        "consultation_number": consultation.consultation_number,
        "current_step": consultation.current_step.value,
        "next_step": next_step.value if next_step else None,
        "is_completed": is_completed,
        "message": response_message,
    }

    # Add flex_message for steps that need selection UI
    if next_step and next_step in [
        ConsultationStep.MEMBER_TYPE,
        ConsultationStep.PET_TYPE,
        ConsultationStep.CATEGORY,
        ConsultationStep.URGENCY,
        ConsultationStep.PREFERRED_TIME,
    ]:
        response["flex_message"] = _get_step_flex_message(next_step)

    if is_completed:
        response["consultation"] = _consultation_detail(consultation)
        response["flex_message"] = _get_completion_flex_message(consultation)

    return response


@router.post("/cancel/{channel_user_id}")
async def cancel_consultation(
    channel_user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Cancel an active consultation."""
    flow_service = ConsultationFlowService(db)
    consultation = await flow_service.get_consultation_by_channel_user(
        channel_user_id=channel_user_id,
    )

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active consultation found",
        )

    await flow_service.cancel_consultation(consultation)
    await db.commit()

    return {"status": "cancelled", "consultation_number": consultation.consultation_number}


@router.get("/user/{channel_user_id}")
async def get_user_consultations(
    channel_user_id: str,
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get consultation history for a user."""
    result = await db.execute(
        select(Consultation)
        .where(Consultation.channel_user_id == channel_user_id)
        .order_by(Consultation.created_at.desc())
        .limit(limit)
    )
    consultations = result.scalars().all()

    return {
        "items": [
            {
                "consultation_number": c.consultation_number,
                "status": c.status.value,
                "category": c.category.value if c.category else None,
                "created_at": c.created_at.isoformat(),
            }
            for c in consultations
        ],
        "total": len(consultations),
    }


# ===============================
# Admin API Endpoints
# ===============================

@router.get("", response_model=ConsultationListResponse)
async def list_consultations(
    status_filter: ConsultationStatus | None = Query(default=None, alias="status"),
    category: ConsultationCategory | None = None,
    urgency: ConsultationUrgency | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List consultations with filters (for admin)."""
    query = select(Consultation)

    # Apply filters
    if status_filter:
        query = query.where(Consultation.status == status_filter)
    if category:
        query = query.where(Consultation.category == category)
    if urgency:
        query = query.where(Consultation.urgency == urgency)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Consultation.guardian_name.ilike(search_term),
                Consultation.guardian_phone.ilike(search_term),
                Consultation.description.ilike(search_term),
                Consultation.consultation_number.ilike(search_term),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Consultation.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    consultations = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return ConsultationListResponse(
        items=[ConsultationResponse.model_validate(c) for c in consultations],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/stats", response_model=ConsultationStatsResponse)
async def get_consultation_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get consultation statistics for dashboard."""
    flow_service = ConsultationFlowService(db)
    stats = await flow_service.get_stats()
    return ConsultationStatsResponse(**stats)


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific consultation by ID."""
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found",
        )

    return consultation


@router.patch("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: uuid.UUID,
    data: ConsultationUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update consultation status or assignment (admin)."""
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found",
        )

    if data.status is not None:
        consultation.status = data.status
        if data.status == ConsultationStatus.COMPLETED:
            consultation.completed_at = datetime.now(timezone.utc)

    if data.assigned_to is not None:
        consultation.assigned_to = data.assigned_to
        if consultation.status == ConsultationStatus.PENDING:
            consultation.status = ConsultationStatus.ASSIGNED

    if data.admin_notes is not None:
        consultation.admin_notes = data.admin_notes

    await db.commit()
    await db.refresh(consultation)

    return consultation


# ===============================
# Helper Functions
# ===============================

def _consultation_detail(consultation: Consultation) -> dict:
    """Return full consultation details for completion message."""
    return {
        "consultation_number": consultation.consultation_number,
        "guardian_name": consultation.guardian_name or "",
        "guardian_phone": consultation.guardian_phone or "",
        "pet_name": consultation.pet_name or "",
        "pet_type": consultation.pet_type.value if consultation.pet_type else "",
        "pet_age": consultation.pet_age or "",
        "category": consultation.category.value if consultation.category else "",
        "urgency": consultation.urgency.value if consultation.urgency else "",
        "description": consultation.description or "",
        "preferred_time": consultation.preferred_time or "",
    }


def _get_step_flex_message(step: ConsultationStep) -> dict | None:
    """Get flex message template for a step (imported from LINE bot templates)."""
    # These would match the templates defined in line-bot/app/templates/flex_messages.py
    # Returning the structure here for API response
    step_templates = {
        ConsultationStep.MEMBER_TYPE: {
            "type": "flex",
            "altText": "회원 유형 선택",
            "template": "member_type",
        },
        ConsultationStep.PET_TYPE: {
            "type": "flex",
            "altText": "반려동물 종류 선택",
            "template": "pet_type",
        },
        ConsultationStep.CATEGORY: {
            "type": "flex",
            "altText": "상담 분야 선택",
            "template": "category",
        },
        ConsultationStep.URGENCY: {
            "type": "flex",
            "altText": "긴급도 선택",
            "template": "urgency",
        },
        ConsultationStep.PREFERRED_TIME: {
            "type": "flex",
            "altText": "희망 상담 시간",
            "template": "preferred_time",
        },
    }
    return step_templates.get(step)


def _get_completion_flex_message(consultation: Consultation) -> dict:
    """Get consultation completion flex message."""
    return {
        "type": "flex",
        "altText": f"상담 신청 완료 - {consultation.consultation_number}",
        "template": "consultation_complete",
        "data": {
            "consultation_number": consultation.consultation_number,
            "guardian_name": consultation.guardian_name,
            "pet_name": consultation.pet_name,
            "category": consultation.category.value if consultation.category else None,
            "urgency": consultation.urgency.value if consultation.urgency else None,
        },
    }
