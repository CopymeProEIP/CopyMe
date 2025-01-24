from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/", status_code=204, summary="Health check")
def health():
    return jsonable_encoder({"status": "ok", "message": "API is running"})