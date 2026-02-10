import uuid
from datetime import datetime, time, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    Uuid,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BusinessCategory(str, PyEnum):
    GROOMING = "grooming"           # 동물 미용실
    VETERINARY = "veterinary"       # 동물 병원
    PET_SHOP = "pet_shop"           # 상품 판매
    INSURANCE = "insurance"         # 동물 보험사
    HOTEL = "hotel"                 # 동물 호텔
    TRAINING = "training"           # 동물 훈련소
    DAYCARE = "daycare"             # 동물 유치원
    CAFE = "cafe"                   # 애견 카페
    FUNERAL = "funeral"             # 반려동물 장례
    OTHER = "other"


class BusinessStatus(str, PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[BusinessCategory] = mapped_column(
        SAEnum(BusinessCategory), index=True
    )
    status: Mapped[BusinessStatus] = mapped_column(
        SAEnum(BusinessStatus), default=BusinessStatus.PENDING
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Location
    address: Mapped[str] = mapped_column(String(500))
    address_detail: Mapped[str | None] = mapped_column(String(200), nullable=True)
    city: Mapped[str] = mapped_column(String(100), index=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Contact
    phone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    line_official_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Business Hours (JSON for flexibility)
    business_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Media
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_urls: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Rating
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)

    # Features / Tags
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    pet_types_accepted: Mapped[list | None] = mapped_column(JSON, nullable=True)
    services_offered: Mapped[list | None] = mapped_column(JSON, nullable=True)

    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner = relationship("User", back_populates="businesses")
    products = relationship("Product", back_populates="business", lazy="selectin")
    bookings = relationship("Booking", back_populates="business", lazy="selectin")
    reviews = relationship("Review", back_populates="business", lazy="selectin")
