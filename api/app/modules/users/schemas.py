from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.models import AuthProvider, PlanType

MAX_BCRYPT_PASSWORD_BYTES = 72


def _enforce_bcrypt_password_limit(value: str) -> str:
    if len(value.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError("Password must be at most 72 bytes when encoded as UTF-8")
    return value


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str | None = None
    auth_provider: AuthProvider = AuthProvider.LOCAL
    google_id: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return _enforce_bcrypt_password_limit(value)


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

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        return _enforce_bcrypt_password_limit(value)


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
