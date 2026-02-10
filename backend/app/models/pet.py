import uuid
from datetime import date, datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PetType(str, PyEnum):
    DOG = "dog"
    CAT = "cat"


class PetGender(str, PyEnum):
    MALE = "male"
    FEMALE = "female"


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(100))
    pet_type: Mapped[PetType] = mapped_column(SAEnum(PetType))
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gender: Mapped[PetGender | None] = mapped_column(
        SAEnum(PetGender), nullable=True
    )
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    profile_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_neutered: Mapped[bool] = mapped_column(default=False)
    microchip_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner = relationship("User", back_populates="pets")
