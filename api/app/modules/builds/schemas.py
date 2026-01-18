from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.models import BuildStatus


class BuildCreate(BaseModel):
    website: str
    action: str
    metadata: dict[str, Any] | None = None


class BuildUpdate(BaseModel):
    status: BuildStatus | None = None
    output: str | None = None
    error_message: str | None = None


class BuildResponse(BaseModel):
    id: UUID
    user_id: UUID
    website: str
    action: str
    status: str
    output: str | None
    error_message: str | None
    metadata: dict[str, Any] | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BuildListResponse(BaseModel):
    builds: list[BuildResponse]
    total: int
    limit: int
    offset: int
