from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, decode_access_token
from app.db import get_session
from app.models import AuthProvider, PLAN_LIMITS, PlanType

from .controllers import (
    authenticate_user,
    check_user_can_make_call,
    create_user,
    get_user_by_email,
    get_user_by_google_id,
    get_user_by_id,
    update_user,
)
from .schemas import (
    GoogleLoginRequest,
    LoginRequest,
    TokenResponse,
    UsageResponse,
    UserCreate,
    UserResponse,
    UserUpdate,
)

router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> "User":
    from app.models import User

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = await get_user_by_id(session, UUID(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new user account."""
    existing_user = await get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if user_data.auth_provider == AuthProvider.LOCAL and not user_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for local authentication",
        )

    if user_data.auth_provider == AuthProvider.GOOGLE and not user_data.google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID is required for Google authentication",
        )

    user = await create_user(session, user_data)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: UUID,
    user_data: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Update user information."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users",
        )

    user = await update_user(session, current_user, user_data)
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user = Depends(get_current_user),
):
    """Get current authenticated user."""
    return current_user


@router.get("/me/usage", response_model=UsageResponse)
async def get_current_user_usage(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Get current user's usage statistics."""
    can_call, limit, used = await check_user_can_make_call(session, current_user)

    remaining = limit - used if limit != -1 else -1

    return UsageResponse(
        user_id=current_user.id,
        plan=current_user.plan,
        limit=limit,
        used=used,
        remaining=remaining,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    session: AsyncSession = Depends(get_session),
):
    """Login with email and password."""
    user = await authenticate_user(session, login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login/google", response_model=TokenResponse)
async def login_with_google(
    google_data: GoogleLoginRequest,
    session: AsyncSession = Depends(get_session),
):
    """Login or register with Google."""
    # Check if user exists by google_id
    user = await get_user_by_google_id(session, google_data.google_id)

    if not user:
        # Check if email exists
        user = await get_user_by_email(session, google_data.email)
        if user:
            # Link Google account to existing user
            user.google_id = google_data.google_id
            user.auth_provider = AuthProvider.GOOGLE.value
            await session.commit()
            await session.refresh(user)
        else:
            # Create new user
            user_create = UserCreate(
                email=google_data.email,
                name=google_data.name,
                auth_provider=AuthProvider.GOOGLE,
                google_id=google_data.google_id,
            )
            user = await create_user(session, user_create)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
