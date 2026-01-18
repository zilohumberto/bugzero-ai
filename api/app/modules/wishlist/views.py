from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.modules.wishlist.controllers import create_wishlist_item
from app.modules.wishlist.schemas import WishlistCreate, WishlistResponse

router = APIRouter()


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist(
    payload: WishlistCreate,
    session: AsyncSession = Depends(get_session),
):
    item = await create_wishlist_item(session, payload)
    return WishlistResponse(
        id=item.id,
        email=item.email,
        name=item.name,
        website=item.website,
        action=item.action,
        metadata=item.metadata_json,
        created_at=item.created_at,
        updated_at=item.updated_at,
        is_deleted=item.is_deleted,
    )
