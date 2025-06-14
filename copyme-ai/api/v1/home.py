from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/home", tags=["home"])

@router.get("/")
def home():
    return jsonable_encoder({"status": "ok", "message": "Welcome to the home page"})