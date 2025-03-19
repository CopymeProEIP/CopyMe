from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, Depends, APIRouter
from typing import Optional

router = APIRouter(prefix="/ai", tags=["ai"])

reference_data = [
    {
        "gender": "men",
        "phase": "shot_position",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    {
        "gender": "men",
        "phase": "shot_realese",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    {
        "gender": "men",
        "phase": "shot_followthrough",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    }
]

@router.post("/demo")
def demo(request: Request,
    file: UploadFile = File(...),
    email: str = Form(...),
    allow_training: Optional[bool] = Form(False)):

    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    return {"status": "success", "message": "Image processed successfully."}


@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}