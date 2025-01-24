from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/demo")
def demo():
    return {"status": "success", "message": "Image processed successfully."}


@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}