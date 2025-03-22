from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# Modèle pour stocker les angles détectés
class AngleData(BaseModel):
    joint: str
    angle: float

# Modèle pour représenter une frame (image analysée)
class FrameData(BaseModel):
    class_name: str
    
    angles: List[AngleData]
    feedback: Optional[str] = None

# Modèle principal représentant une image traitée
class ProcessedImage(BaseModel):
    url: str
    frames: List[FrameData]
    email: EmailStr
    allow_training: bool
    created_at: datetime = datetime.utcnow()
    version: int

class DatabaseManager:
    def __init__(self, client: AsyncIOMotorClient):
        self.client = client
        self.db = self.client["CopyMe"]
        self.collection = self.db["processed_image"]

    def insert_new_entry(self, capture_index: str, version: int, results: dict):
        self.collection.insert_one({
            "url": capture_index,
            "frames": results,
            "created_at": datetime.combine(date.today(), datetime.min.time()),
            "version": version,
        })

    def count_documents(self, capture_index: str) -> int:
        return self.collection.count_documents({"url": capture_index})

    def close_connection(self):
        self.client.close()