import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.business import Business, BusinessCategory
from app.schemas.business import (
    BusinessCreate,
    BusinessListResponse,
    BusinessResponse,
    BusinessUpdate,
)

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.get("", response_model=BusinessListResponse)
async def list_businesses(
    category: BusinessCategory | None = None,
    city: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Business).where(Business.is_active.is_(True))

    if category:
        query = query.where(Business.category == category)
    if city:
        query = query.where(Business.city == city)
    if search:
        query = query.where(Business.name.ilike(f"%{search}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    businesses = result.scalars().all()

    return BusinessListResponse(
        items=businesses,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Business).where(Business.id == business_id)
    )
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business


@router.post("", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
async def create_business(
    data: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    # TODO: Add auth dependency - owner_id from token
):
    business = Business(**data.model_dump())
    # TODO: Set owner_id from authenticated user
    db.add(business)
    await db.flush()
    await db.refresh(business)
    return business


@router.patch("/{business_id}", response_model=BusinessResponse)
async def update_business(
    business_id: uuid.UUID,
    data: BusinessUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == business_id)
    )
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(business, field, value)

    await db.flush()
    await db.refresh(business)
    return business
