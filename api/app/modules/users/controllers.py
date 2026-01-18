from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models import AgentUsage, PlanType, PLAN_LIMITS, User

from .schemas import UserCreate, UserUpdate


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: UUID) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_google_id(session: AsyncSession, google_id: str) -> User | None:
    result = await session.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_data: UserCreate) -> User:
    password_hash = None
    if user_data.password:
        password_hash = get_password_hash(user_data.password)

    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash,
        auth_provider=user_data.auth_provider.value,
        google_id=user_data.google_id,
        plan=PlanType.FREE.value,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def update_user(session: AsyncSession, user: User, user_data: UserUpdate) -> User:
    update_data = user_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            if field == "plan" and isinstance(value, PlanType):
                setattr(user, field, value.value)
            else:
                setattr(user, field, value)

    await session.commit()
    await session.refresh(user)
    return user


async def authenticate_user(session: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(session, email)
    if not user:
        return None
    if not user.password_hash:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def get_user_usage_this_month(session: AsyncSession, user_id: UUID) -> int:
    """Get the number of agent calls this month for a user."""
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    result = await session.execute(
        select(func.coalesce(func.sum(AgentUsage.units_consumed), 0))
        .where(AgentUsage.user_id == user_id)
        .where(AgentUsage.created_at >= start_of_month)
    )
    return result.scalar_one()


async def check_user_can_make_call(session: AsyncSession, user: User) -> tuple[bool, int, int]:
    """Check if user can make an agent call based on their plan limits.

    Returns: (can_make_call, limit, used)
    """
    plan = PlanType(user.plan)
    limit = PLAN_LIMITS.get(plan, 0)

    # Unlimited plan
    if limit == -1:
        return True, -1, 0

    used = await get_user_usage_this_month(session, user.id)
    can_make_call = used < limit

    return can_make_call, limit, used
