import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import AuthProvider, UserRole


class UserBase(BaseModel):
    email: str | None = None
    phone: str | None = None
    full_name: str
    nickname: str | None = None


class UserCreate(UserBase):
    password: str | None = None
    auth_provider: AuthProvider = AuthProvider.LOCAL
    line_user_id: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    nickname: str | None = None
    phone: str | None = None
    profile_image_url: str | None = None


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    auth_provider: AuthProvider
    profile_image_url: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str
