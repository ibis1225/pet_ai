import uuid
from datetime import date, datetime

from pydantic import BaseModel

from app.models.pet import PetGender, PetType


class PetBase(BaseModel):
    name: str
    pet_type: PetType
    breed: str | None = None
    gender: PetGender | None = None
    birth_date: date | None = None
    weight_kg: float | None = None
    is_neutered: bool = False
    microchip_id: str | None = None


class PetCreate(PetBase):
    pass


class PetUpdate(BaseModel):
    name: str | None = None
    breed: str | None = None
    gender: PetGender | None = None
    birth_date: date | None = None
    weight_kg: float | None = None
    is_neutered: bool | None = None
    medical_notes: str | None = None
    profile_image_url: str | None = None


class PetResponse(PetBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    profile_image_url: str | None = None
    medical_notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
