import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProductCategory(str, PyEnum):
    FOOD = "food"               # 사료
    TREATS = "treats"           # 간식
    CLOTHING = "clothing"       # 옷
    ACCESSORIES = "accessories" # 악세서리
    TOYS = "toys"               # 장난감
    HEALTH = "health"           # 건강용품
    GROOMING = "grooming"       # 미용용품
    HOUSING = "housing"         # 하우스/캐리어
    OTHER = "other"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("businesses.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[ProductCategory] = mapped_column(
        SAEnum(ProductCategory), index=True
    )

    price: Mapped[float] = mapped_column(Float)
    sale_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="KRW")

    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    sku: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)

    image_urls: Mapped[list | None] = mapped_column(JSON, nullable=True)
    attributes: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    pet_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    target_breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_age_group: Mapped[str | None] = mapped_column(String(50), nullable=True)

    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)
    total_sold: Mapped[int] = mapped_column(Integer, default=0)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    business = relationship("Business", back_populates="products")
