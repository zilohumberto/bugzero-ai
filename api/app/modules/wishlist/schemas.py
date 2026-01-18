from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class WishlistCreate(BaseModel):
    email: str
    name: str
    website: str
    action: str
    metadata: dict[str, Any] | None = None


class WishlistResponse(BaseModel):
    id: UUID
    email: str
    name: str
    website: str
    action: str
    metadata: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
