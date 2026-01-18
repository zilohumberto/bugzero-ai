from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class AgentRequest(BaseModel):
    website: str
    metadata: dict[str, Any] | None = None


class AgentResponse(BaseModel):
    success: bool
    action: str
    result: dict[str, Any] | None = None
    error: str | None = None


class AgentUsageResponse(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    units_consumed: int
    response_status: int | None
    created_at: datetime

    class Config:
        from_attributes = True
