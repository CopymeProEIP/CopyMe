from fastapi import APIRouter

router = APIRouter(prefix="/home", tags=["home"])

@router.get("/")
def home():
    return {"status": "success", "message": "Welcome to Copyme API."}