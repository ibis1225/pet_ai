import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetResponse, PetUpdate

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=list[PetResponse])
async def list_pets(
    owner_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Pet)
    if owner_id:
        query = query.where(Pet.owner_id == owner_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.post("", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
async def create_pet(
    data: PetCreate,
    db: AsyncSession = Depends(get_db),
    # TODO: Add auth dependency - owner_id from token
):
    pet = Pet(**data.model_dump())
    # TODO: Set owner_id from authenticated user
    db.add(pet)
    await db.flush()
    await db.refresh(pet)
    return pet


@router.patch("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: uuid.UUID,
    data: PetUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)

    await db.flush()
    await db.refresh(pet)
    return pet


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(pet_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    await db.delete(pet)
