from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.modules.users.views import get_current_user

from .schemas import AgentRequest, AgentResponse, AgentUsageResponse
from .service import AgentService, AgentServiceError, UsageLimitExceededError

router = APIRouter()


@router.post("/{action}", response_model=AgentResponse)
async def call_agent(
    action: str,
    request: AgentRequest,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Call an agent action.

    Available actions:
    - analyze-performance: Analyze website performance
    - generate-test-cases: Generate test cases for the website
    - write-playwright-tests: Generate Playwright tests
    """
    valid_actions = ["analyze-performance", "generate-test-cases", "write-playwright-tests"]

    if action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Must be one of: {', '.join(valid_actions)}",
        )

    agent_service = AgentService(session)

    try:
        result = await agent_service.call_agent(
            user=current_user,
            action=action,
            website=request.website,
            metadata=request.metadata,
        )
        return AgentResponse(
            success=True,
            action=action,
            result=result,
        )
    except UsageLimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": e.message,
                "limit": e.limit,
                "used": e.used,
            },
        )
    except AgentServiceError as e:
        return AgentResponse(
            success=False,
            action=action,
            error=e.message,
        )


@router.get("/usage/history", response_model=list[AgentUsageResponse])
async def get_usage_history(
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get agent usage history for the current user."""
    agent_service = AgentService(session)
    usages = await agent_service.get_user_usage_history(
        user_id=current_user.id,
        limit=min(limit, 100),  # Cap at 100
        offset=offset,
    )
    return usages
