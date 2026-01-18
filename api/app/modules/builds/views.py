from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.modules.users.views import get_current_user

from .controllers import (
    complete_build,
    create_build,
    get_build_by_id,
    get_builds_by_user,
    start_build,
    update_build,
)
from .schemas import BuildCreate, BuildListResponse, BuildResponse, BuildUpdate

router = APIRouter()


@router.post("/", response_model=BuildResponse, status_code=status.HTTP_201_CREATED)
async def create_new_build(
    build_data: BuildCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Create a new build for the current user."""
    valid_actions = ["analyze-performance", "generate-test-cases", "write-playwright-tests"]

    if build_data.action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Must be one of: {', '.join(valid_actions)}",
        )

    build = await create_build(session, current_user.id, build_data)
    return build


@router.get("/", response_model=BuildListResponse)
async def list_builds(
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """List all builds for the current user."""
    builds, total = await get_builds_by_user(
        session,
        current_user.id,
        limit=min(limit, 100),
        offset=offset,
    )
    return BuildListResponse(
        builds=builds,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{build_id}", response_model=BuildResponse)
async def get_build(
    build_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get a specific build by ID."""
    build = await get_build_by_id(session, build_id)

    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build not found",
        )

    if build.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return build


@router.patch("/{build_id}", response_model=BuildResponse)
async def update_build_endpoint(
    build_id: UUID,
    build_data: BuildUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Update a build."""
    build = await get_build_by_id(session, build_id)

    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build not found",
        )

    if build.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    updated_build = await update_build(session, build, build_data)
    return updated_build


@router.post("/{build_id}/start", response_model=BuildResponse)
async def start_build_endpoint(
    build_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Start a build (trigger the agent)."""
    build = await get_build_by_id(session, build_id)

    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build not found",
        )

    if build.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    if build.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Build cannot be started. Current status: {build.status}",
        )

    # Mark build as running
    started_build = await start_build(session, build)

    # TODO: Trigger agent service in background
    # For now, we just mark it as running
    # In production, this would queue a background job

    return started_build
