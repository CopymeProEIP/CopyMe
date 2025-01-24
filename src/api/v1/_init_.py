from fastapi import APIRouter
from api.v1.login import router as login_router
from api.v1.model import router as ai_router
from api.v1.home import router as home_router

router = APIRouter(prefix="/v1")
router.include_router(home_router)
router.include_router(login_router)
router.include_router(ai_router)