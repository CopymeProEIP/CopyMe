from fastapi import FastAPI, File,  UploadFile, Form, HTTPException, Request, Depends, APIRouter, Body
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Annotated, List, Dict
from yolov8_basketball.utils import get_database, get_yolomodel, save_uploaded_file
from yolov8_basketball.yolov8 import YOLOv8
from recommendation_engine import analyze_phase
import logging
from config.setting import get_variables
from config.db_models import ProcessedImage, DatabaseManager, FrameData
from datetime import datetime, date
from uuid import uuid4
import json

settings = get_variables()

router = APIRouter(prefix="/ai", tags=["ai"])

class ProcessedDemoResponse(BaseModel):
    email: EmailStr
    frames: List[FrameData]
    created_at: datetime
    version: int

class DemoRequest(BaseModel):
    email: EmailStr = Field(..., examples=["email@exemple.com"])
    allow_training: Optional[bool] = False

@router.post("/demo", response_model=ProcessedDemoResponse)
async def demo(request: Request,
    form_data: DemoRequest = Depends(),
    files: UploadFile = File(...),
    ) -> ProcessedDemoResponse:

    yolo_basket: YOLOv8 = get_yolomodel(request)
    logging.debug(f"YOLOv8 object :\n{yolo_basket}")

    db_model: DatabaseManager = get_database(request)

    file_path = save_uploaded_file(files, settings.UPLOAD_DIR, True)

    results: List[FrameData] = yolo_basket.capture(str(file_path))  # Assuming YOLO saves the processed image
    logging.info("YOLO processing completed.")

    result = "["
    for i, res in enumerate(results):
        result += res.model_dump_json(indent=4)
        if i < len(results) - 1:
            result += ","
    result += "]"
    logging.debug(f"result dump : \n{result}")

    collection_insert = ProcessedImage(
        url=str(file_path),
        frames=results,
        email=form_data.email,
        created_at=datetime.combine(date.today(), datetime.min.time()),
        version=1,
    )

    #logging.debug(f"collection : {collection_insert.model_dump_json()}")

    response_model = ProcessedDemoResponse(
        frames=collection_insert.frames,
        email=collection_insert.email,
        created_at=collection_insert.created_at,
        version=collection_insert.version
    )

    await db_model.insert_new_entry(json.loads(collection_insert.model_dump_json()))
    logging.debug("Finished to update the database.")

    return response_model

@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}
