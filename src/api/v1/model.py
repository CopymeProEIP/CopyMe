from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, Depends, APIRouter, Body
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Annotated, List, Dict
from yolov8_basketball.utils import get_database, get_yolomodel
from yolov8_basketball.yolov8 import YOLOv8, FrameData, AngleData
from recommendation_engine import analyze_phase
import logging

router = APIRouter(prefix="/ai", tags=["ai"])

class DemoRequest(BaseModel):
    email: EmailStr = Field(..., examples=["email@exemple.com"])
    allow_training: Optional[bool] = False

@router.post("/demo")
def demo(request: Request,
    form_data: DemoRequest = Depends(),
    files: UploadFile = File(...),
    ):

    yolo_basket: YOLOv8 = get_yolomodel(request)
    logging.debug(f"YOLOv8 object : {yolo_basket}")

    results: List[FrameData] = yolo_basket.capture()  # Assuming YOLO saves the processed image
    logging.info("YOLO processing completed.")

    logging

    return {"status": "success", "message": "Image processed successfully."}

@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}