"""
Consultation Model

Represents a structured consultation flow for pet owners.
Based on the 10-step consultation process from the existing chatbot.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, Uuid, Integer
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ConsultationStatus(str, PyEnum):
    """Consultation status values."""
    IN_PROGRESS = "in_progress"
    PENDING = "pending"
    ASSIGNED = "assigned"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ConsultationStep(str, PyEnum):
    """Consultation flow steps (11-step state machine)."""
    MEMBER_TYPE = "member_type"           # Step 1: 개인회원/기업회원
    GUARDIAN_NAME = "guardian_name"       # Step 2: 보호자 이름
    GUARDIAN_PHONE = "guardian_phone"     # Step 3: 보호자 연락처
    PET_TYPE = "pet_type"                 # Step 4: 반려동물 종류 (강아지/고양이)
    PET_NAME = "pet_name"                 # Step 5: 반려동물 이름
    PET_AGE = "pet_age"                   # Step 6: 반려동물 나이
    CATEGORY = "category"                 # Step 7: 상담 카테고리
    SUBCATEGORY = "subcategory"           # Step 8: 세부 상담 항목
    URGENCY = "urgency"                   # Step 9: 긴급도
    DESCRIPTION = "description"           # Step 10: 상담 내용
    PREFERRED_TIME = "preferred_time"     # Step 11: 희망 상담 시간
    COMPLETED = "completed"               # 상담 완료


class MemberType(str, PyEnum):
    """Member type options."""
    PERSONAL = "personal"           # 개인 회원
    CORPORATE = "corporate"         # 기업/단체 회원


class PetType(str, PyEnum):
    """Pet type options."""
    DOG = "dog"
    CAT = "cat"
    OTHER = "other"                 # 기타 (토끼, 햄스터 등)


class ConsultationCategory(str, PyEnum):
    """Consultation category options - aligned with business categories."""
    VETERINARY = "veterinary"       # 동물병원 (건강/질병/예방접종)
    GROOMING = "grooming"           # 미용실
    NUTRITION = "nutrition"         # 영양/사료 상담
    BEHAVIOR = "behavior"           # 행동 교정
    TRAINING = "training"           # 훈련소
    HOTEL = "hotel"                 # 펫호텔/돌봄
    DAYCARE = "daycare"             # 유치원
    INSURANCE = "insurance"         # 펫보험
    SHOPPING = "shopping"           # 상품 구매 상담
    EMERGENCY = "emergency"         # 응급 상황
    OTHER = "other"                 # 기타 문의


class ConsultationUrgency(str, PyEnum):
    """Consultation urgency level."""
    URGENT = "urgent"               # 긴급 (24시간 내 연락 필요)
    NORMAL = "normal"               # 보통 (2-3일 내)
    FLEXIBLE = "flexible"           # 여유 (1주일 내)


class Consultation(Base):
    """Consultation record with full flow state."""
    __tablename__ = "consultations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )

    # Consultation number (e.g., C20260201-001)
    consultation_number: Mapped[str] = mapped_column(
        String(20), unique=True, index=True
    )

    # User reference (optional - can be anonymous)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )

    # Channel info
    channel: Mapped[str] = mapped_column(String(20), default="line")
    channel_user_id: Mapped[str | None] = mapped_column(
        String(255), index=True, nullable=True
    )

    # Current step in the flow
    current_step: Mapped[ConsultationStep] = mapped_column(
        SAEnum(ConsultationStep), default=ConsultationStep.MEMBER_TYPE
    )

    # Flow data collected through steps
    member_type: Mapped[MemberType | None] = mapped_column(
        SAEnum(MemberType), nullable=True
    )
    guardian_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    guardian_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    pet_type: Mapped[PetType | None] = mapped_column(
        SAEnum(PetType), nullable=True
    )
    pet_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pet_age: Mapped[str | None] = mapped_column(String(50), nullable=True)
    category: Mapped[ConsultationCategory | None] = mapped_column(
        SAEnum(ConsultationCategory), nullable=True
    )
    subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True)
    urgency: Mapped[ConsultationUrgency | None] = mapped_column(
        SAEnum(ConsultationUrgency), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status and assignment
    status: Mapped[ConsultationStatus] = mapped_column(
        SAEnum(ConsultationStatus), default=ConsultationStatus.IN_PROGRESS
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Additional metadata
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class DailyConsultationCounter(Base):
    """Daily counter for consultation number generation."""
    __tablename__ = "daily_consultation_counters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date_str: Mapped[str] = mapped_column(String(8), unique=True, index=True)  # YYYYMMDD
    counter: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
