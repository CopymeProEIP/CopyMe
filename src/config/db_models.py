from __future__ import annotations
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Tuple, Hashable, Any
from enum import Enum
from uuid import UUID, uuid4
import logging

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from yolov8_basketball.yolov8 import FrameData, AngleData

class Direction(Enum):
    UNKNOWN = 0
    LEFT = 1
    RIGHT = 2
    UP = 3
    DOWN = 4

# Template to store detected angles
class AngleData(BaseModel):
    start_point: int
    end_point: int
    third_point: int
    angle: float
    angle_name: Tuple[str, Direction]

# Model to represent a frame (analyzed image)
class FrameData(BaseModel):
    class_name: str
    url_path_frame: str
    keypoints_positions: List[List[float]]  # List of keypoint positions [x, y]
    angles: List[AngleData]
    feedback: Optional[Dict] = None

# Main model representative a image
class ProcessedImage(BaseModel):
    uuid: UUID = uuid4()
    url: str
    frames: List["FrameData"]
    email: EmailStr
    allow_training: Optional[bool] = False
    created_at: datetime = datetime.utcnow()
    version: int

ProcessedImage.model_rebuild()

class DatabaseManager:
    def __init__(self, client: AsyncIOMotorClient):
        self.client = client
        self.db = self.client["CopyMe"]
        self.collection = self.db["processed_image"]
        self.analysis_collection = self.db["analysis_results"]

    async def insert_new_entry(self, image_model: ProcessedImage):
        await self.collection.insert_one(image_model)

    async def count_documents(self, capture_index: str) -> int:
        return await self.collection.count_documents({"url": capture_index})

    async def get_by_id(self, id_str: str) -> Dict:
        """Récupère un document par son ID"""
        from bson.objectid import ObjectId
        try:
            return await self.collection.find_one({"_id": ObjectId(id_str)})
        except Exception as e:
            logging.error(f"Error retrieving document by ID: {e}")
            return None

    async def get_latest_by_email(self, email: str) -> Dict:
        """Récupère le document le plus récent pour un email donné"""
        try:
            return await self.collection.find_one(
                {"email": email},
                sort=[("created_at", -1)]
            )
        except Exception as e:
            logging.error(f"Error retrieving latest document by email: {e}")
            return None

    async def get_reference_data(self) -> Dict:
        """Récupère les données de référence (le document le plus récent marqué comme référence)"""
        try:
            return await self.collection.find_one(
                {"is_reference": True},
                sort=[("created_at", -1)]
            ) or await self.collection.find_one(sort=[("created_at", -1)])
        except Exception as e:
            logging.error(f"Error retrieving reference data: {e}")
            return None

    async def insert_analysis_result(self, analysis_data: Dict) -> Dict:
        """Enregistre les résultats d'une analyse"""
        try:
            result = await self.analysis_collection.insert_one(analysis_data)
            return {"id": str(result.inserted_id)}
        except Exception as e:
            logging.error(f"Error inserting analysis result: {e}")
            return None

    async def close_connection(self):
        await self.client.close()
