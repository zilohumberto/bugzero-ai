"""Agent Service - Tracks and proxies calls to the agent service."""

import httpx
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import AgentUsage, User

from app.modules.users.controllers import check_user_can_make_call


class AgentServiceError(Exception):
    """Custom exception for agent service errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class UsageLimitExceededError(AgentServiceError):
    """Raised when user exceeds their usage limit."""

    def __init__(self, limit: int, used: int):
        self.limit = limit
        self.used = used
        super().__init__(
            f"Usage limit exceeded. Limit: {limit}, Used: {used}",
            status_code=429,
        )


class AgentService:
    """Service class to handle agent API calls with usage tracking."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.base_url = settings.agent_service_url

    async def _record_usage(
        self,
        user_id: UUID,
        action: str,
        units: int = 1,
        metadata: dict[str, Any] | None = None,
        response_status: int | None = None,
    ) -> AgentUsage:
        """Record an agent usage entry."""
        usage = AgentUsage(
            user_id=user_id,
            action=action,
            units_consumed=units,
            request_metadata=metadata,
            response_status=response_status,
        )
        self.session.add(usage)
        await self.session.commit()
        await self.session.refresh(usage)
        return usage

    async def _check_limits(self, user: User) -> tuple[int, int]:
        """Check if user can make a call. Returns (limit, used)."""
        can_call, limit, used = await check_user_can_make_call(self.session, user)

        if not can_call:
            raise UsageLimitExceededError(limit=limit, used=used)

        return limit, used

    async def call_agent(
        self,
        user: User,
        action: str,
        website: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make a call to the agent service.

        1. Check user's usage limits
        2. Make the call to the agent service
        3. Record the usage
        4. Return the response
        """
        # Check limits first
        await self._check_limits(user)

        # Prepare request data
        request_data = {
            "website": website,
            "metadata": metadata or {},
        }

        response_status = None
        result = None
        error = None

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/v0/agent/{action}",
                    json=request_data,
                )
                response_status = response.status_code

                if response.is_success:
                    result = response.json()
                else:
                    error = response.text

        except httpx.TimeoutException:
            response_status = 504
            error = "Agent service timeout"
        except httpx.RequestError as e:
            response_status = 503
            error = f"Agent service unavailable: {str(e)}"

        # Record usage (always record, even on failure)
        await self._record_usage(
            user_id=user.id,
            action=action,
            units=1,
            metadata={"website": website, **(metadata or {})},
            response_status=response_status,
        )

        if error:
            raise AgentServiceError(error, status_code=response_status or 500)

        return result

    async def get_user_usage_history(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> list[AgentUsage]:
        """Get usage history for a user."""
        from sqlalchemy import select

        result = await self.session.execute(
            select(AgentUsage)
            .where(AgentUsage.user_id == user_id)
            .order_by(AgentUsage.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
