import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, String, Text, Uuid
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, PyEnum):
    CUSTOMER = "customer"
    BUSINESS_OWNER = "business_owner"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class AuthProvider(str, PyEnum):
    LOCAL = "local"
    LINE = "line"
    GOOGLE = "google"
    APPLE = "apple"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    phone: Mapped[str | None] = mapped_column(
        String(20), unique=True, index=True, nullable=True
    )
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(100))
    nickname: Mapped[str | None] = mapped_column(String(50), nullable=True)
    profile_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole), default=UserRole.CUSTOMER
    )
    auth_provider: Mapped[AuthProvider] = mapped_column(
        SAEnum(AuthProvider), default=AuthProvider.LOCAL
    )
    line_user_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    pets = relationship("Pet", back_populates="owner", lazy="selectin")
    businesses = relationship("Business", back_populates="owner", lazy="selectin")
