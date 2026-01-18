from fastapi import APIRouter

from app.modules.wishlist.urls import router as wishlist_router
from app.modules.users.urls import router as users_router
from app.modules.builds.urls import router as builds_router
from app.modules.agent.urls import router as agent_router

api_router = APIRouter()

# v0 endpoints
api_router.include_router(wishlist_router, prefix="/v0/wishlist", tags=["wishlist"])

# v0 endpoints
api_router.include_router(users_router, prefix="/v0/users", tags=["users"])
api_router.include_router(builds_router, prefix="/v0/builds", tags=["builds"])
api_router.include_router(agent_router, prefix="/v0/agent", tags=["agent"])
