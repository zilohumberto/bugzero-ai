import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class PlanType(str, Enum):
    FREE = "free"
    STARTER = "starter"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


class AuthProvider(str, Enum):
    LOCAL = "local"
    GOOGLE = "google"


class BuildStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# Plan limits (calls per month)
PLAN_LIMITS = {
    PlanType.FREE: 10,
    PlanType.STARTER: 100,
    PlanType.BUSINESS: 1000,
    PlanType.ENTERPRISE: -1,  # unlimited
}


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[str] = mapped_column(
        String(50),
        default=AuthProvider.LOCAL.value,
    )
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    plan: Mapped[str] = mapped_column(
        String(50),
        default=PlanType.FREE.value,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    builds: Mapped[list["Build"]] = relationship("Build", back_populates="user")
    agent_usages: Mapped[list["AgentUsage"]] = relationship("AgentUsage", back_populates="user")


class Build(Base):
    __tablename__ = "builds"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        index=True,
    )
    website: Mapped[str] = mapped_column(String(500))
    action: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(
        String(50),
        default=BuildStatus.PENDING.value,
    )
    output: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="builds")


class AgentUsage(Base):
    __tablename__ = "agent_usages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        index=True,
    )
    action: Mapped[str] = mapped_column(String(200))
    units_consumed: Mapped[int] = mapped_column(Integer, default=1)
    request_metadata: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    response_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="agent_usages")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(200))
    website: Mapped[str] = mapped_column(String(500))
    action: Mapped[str] = mapped_column(String(200))
    metadata_json: Mapped[dict | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
