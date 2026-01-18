from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models import AuthProvider, PlanType


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str | None = None
    auth_provider: AuthProvider = AuthProvider.LOCAL
    google_id: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    plan: PlanType | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    auth_provider: str
    plan: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    google_id: str
    email: EmailStr
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UsageResponse(BaseModel):
    user_id: UUID
    plan: str
    limit: int
    used: int
    remaining: int
