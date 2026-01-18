from sqlalchemy.ext.asyncio import AsyncSession

from app.models import WishlistItem
from app.modules.wishlist.schemas import WishlistCreate


async def create_wishlist_item(
    session: AsyncSession,
    payload: WishlistCreate,
) -> WishlistItem:
    item = WishlistItem(
        email=payload.email,
        name=payload.name,
        website=payload.website,
        action=payload.action,
        metadata_json=payload.metadata,
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item
