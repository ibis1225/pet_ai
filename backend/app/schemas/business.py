import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.business import BusinessCategory, BusinessStatus


class BusinessBase(BaseModel):
    name: str
    category: BusinessCategory
    description: str | None = None
    address: str
    address_detail: str | None = None
    city: str
    district: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str
    email: str | None = None
    website: str | None = None


class BusinessCreate(BusinessBase):
    line_official_id: str | None = None
    business_hours: dict | None = None
    pet_types_accepted: list[str] | None = None
    services_offered: list[str] | None = None
    tags: list[str] | None = None


class BusinessUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    address: str | None = None
    phone: str | None = None
    business_hours: dict | None = None
    services_offered: list[str] | None = None
    tags: list[str] | None = None
    is_active: bool | None = None


class BusinessResponse(BusinessBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    status: BusinessStatus
    business_hours: dict | None = None
    logo_url: str | None = None
    image_urls: list[str] | None = None
    average_rating: float
    total_reviews: int
    tags: list[str] | None = None
    pet_types_accepted: list[str] | None = None
    services_offered: list[str] | None = None
    is_featured: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BusinessListResponse(BaseModel):
    items: list[BusinessResponse]
    total: int
    page: int
    page_size: int
