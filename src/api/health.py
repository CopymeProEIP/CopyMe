from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/", status_code=204, summary="Health check")
async def health():
    return "Health check passed"