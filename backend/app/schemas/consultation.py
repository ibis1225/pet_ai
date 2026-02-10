"""
Consultation Pydantic Schemas

Request/Response models for consultation API endpoints.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.consultation import (
    ConsultationCategory,
    ConsultationStatus,
    ConsultationStep,
    ConsultationUrgency,
    MemberType,
    PetType,
)


# --- Request Schemas ---

class ConsultationCreateRequest(BaseModel):
    """Request to create a new consultation."""
    channel: str = Field(default="line", description="Channel (line, app, web)")
    channel_user_id: str | None = Field(default=None, description="User ID from channel")


class ConsultationStepRequest(BaseModel):
    """Request to update consultation step data."""
    consultation_id: uuid.UUID
    step: ConsultationStep
    value: str


class ConsultationUpdateRequest(BaseModel):
    """Request to update consultation (admin)."""
    status: ConsultationStatus | None = None
    assigned_to: uuid.UUID | None = None
    admin_notes: str | None = None


class ConsultationSearchRequest(BaseModel):
    """Request to search consultations."""
    status: ConsultationStatus | None = None
    category: ConsultationCategory | None = None
    urgency: ConsultationUrgency | None = None
    search_query: str | None = None  # Search in guardian_name, phone, description
    date_from: datetime | None = None
    date_to: datetime | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


# --- Response Schemas ---

class ConsultationResponse(BaseModel):
    """Consultation response model."""
    id: uuid.UUID
    consultation_number: str
    channel: str
    channel_user_id: str | None
    current_step: ConsultationStep
    member_type: MemberType | None
    guardian_name: str | None
    guardian_phone: str | None
    pet_type: PetType | None
    pet_name: str | None
    pet_age: str | None
    category: ConsultationCategory | None
    urgency: ConsultationUrgency | None
    description: str | None
    preferred_time: str | None
    status: ConsultationStatus
    assigned_to: uuid.UUID | None
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class ConsultationListResponse(BaseModel):
    """Paginated list of consultations."""
    items: list[ConsultationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ConsultationStepResponse(BaseModel):
    """Response after updating consultation step."""
    consultation_id: uuid.UUID
    consultation_number: str
    current_step: ConsultationStep
    next_step: ConsultationStep | None
    is_completed: bool
    message: str


class ConsultationStatsResponse(BaseModel):
    """Consultation statistics for dashboard."""
    total_consultations: int
    in_progress: int
    pending: int
    assigned: int
    completed: int
    cancelled: int
    today_count: int
    by_category: dict[str, int]
    by_urgency: dict[str, int]
