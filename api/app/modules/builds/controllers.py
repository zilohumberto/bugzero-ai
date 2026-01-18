from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Build, BuildStatus

from .schemas import BuildCreate, BuildUpdate


async def create_build(
    session: AsyncSession,
    user_id: UUID,
    build_data: BuildCreate,
) -> Build:
    """Create a new build."""
    build = Build(
        user_id=user_id,
        website=build_data.website,
        action=build_data.action,
        status=BuildStatus.PENDING.value,
        metadata_json=build_data.metadata,
    )
    session.add(build)
    await session.commit()
    await session.refresh(build)
    return build


async def get_build_by_id(
    session: AsyncSession,
    build_id: UUID,
) -> Build | None:
    """Get a build by ID."""
    result = await session.execute(select(Build).where(Build.id == build_id))
    return result.scalar_one_or_none()


async def get_builds_by_user(
    session: AsyncSession,
    user_id: UUID,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Build], int]:
    """Get all builds for a user with pagination."""
    # Get total count
    count_result = await session.execute(
        select(func.count(Build.id)).where(Build.user_id == user_id)
    )
    total = count_result.scalar_one()

    # Get builds
    result = await session.execute(
        select(Build)
        .where(Build.user_id == user_id)
        .order_by(Build.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    builds = list(result.scalars().all())

    return builds, total


async def update_build(
    session: AsyncSession,
    build: Build,
    build_data: BuildUpdate,
) -> Build:
    """Update a build."""
    update_data = build_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            if field == "status":
                if isinstance(value, BuildStatus):
                    setattr(build, field, value.value)
                else:
                    setattr(build, field, value)
            else:
                setattr(build, field, value)

    await session.commit()
    await session.refresh(build)
    return build


async def start_build(session: AsyncSession, build: Build) -> Build:
    """Mark a build as running."""
    build.status = BuildStatus.RUNNING.value
    build.started_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(build)
    return build


async def complete_build(
    session: AsyncSession,
    build: Build,
    output: str | None = None,
    error_message: str | None = None,
    success: bool = True,
) -> Build:
    """Mark a build as completed or failed."""
    build.status = BuildStatus.COMPLETED.value if success else BuildStatus.FAILED.value
    build.completed_at = datetime.now(timezone.utc)
    build.output = output
    build.error_message = error_message
    await session.commit()
    await session.refresh(build)
    return build
