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
    from yolov8_basketball.old.yolov8 import FrameData, AngleData

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
    frame_number: int
    keypoints_positions: Dict[str, float]  # List of keypoint positions [x, y]
    angles: List[AngleData]
    feedback: Optional[Dict] = None

class FrameDataResponse(BaseModel):
    class_name: str
    url_path_frame: str
    keypoints_positions: Dict[str, float]
    angles: List[AngleData]

# Main model representative a image
class ProcessedImage(BaseModel):
    uuid: UUID = uuid4()
    url: str
    frames: List["FrameData"]
    userId: str
    allow_training: Optional[bool] = False
    created_at: datetime = datetime.utcnow()
    version: int

ProcessedImage.model_rebuild()

def frame_to_dict(frame: Any) -> dict:
    """
    Convertit un objet frame en dictionnaire, en gérant correctement 
    les valeurs d'angle qui peuvent être des enum ou des strings.
    """
    # Si c'est déjà un dict avec angle_name string, on ne touche pas
    if isinstance(frame, dict) and frame.get("angles"):
        for angle in frame["angles"]:
            name, direction = angle.get("angle_name", ("", ""))
            # Si direction est déjà un str, rien à faire
            if isinstance(direction, str):
                continue
            if hasattr(direction, "name"):
                angle["angle_name"] = (name, direction.name)
            else:
                angle["angle_name"] = (name, str(direction))
        return frame
    # Si c'est un objet FrameData
    if hasattr(frame, "model_dump"):
        try:
            frame_dict = frame.model_dump()
            for angle in frame_dict.get("angles", []):
                name, direction = angle.get("angle_name", ("", ""))
                if hasattr(direction, "name"):
                    angle["angle_name"] = (name, direction.name)
                else:
                    angle["angle_name"] = (name, str(direction))
            return frame_dict
        except Exception as e:
            logging.error(f"Error converting frame to dict with model_dump: {e}")
            # Fallback si model_dump échoue
            if hasattr(frame, "__dict__"):
                return frame.__dict__
    
    # Fallback en dernier recours
    if hasattr(frame, "__dict__"):
        return frame.__dict__
    return frame

def is_frames_list_dicts(frames_list):
    """
    Vérifie si une liste de frames est déjà une liste de dictionnaires
    """
    if not frames_list or not isinstance(frames_list, list):
        return False
    
    # Vérifier si au moins 80% des éléments sont des dictionnaires
    dict_count = sum(1 for f in frames_list if isinstance(f, dict))
    return dict_count >= len(frames_list) * 0.8  # 80% de seuil pour être robuste


class DatabaseManager:
    def __init__(self, client: AsyncIOMotorClient = None):
        if client is None:
            from config.setting import get_variables
            settings = get_variables()
            mongo_url = settings.MONGO_URI
            self.client = AsyncIOMotorClient(mongo_url)
            self.collection = self.client["CopyMe"]["processed_data"]
            self.analysis_collection = self.client["CopyMe"]["analysis_results"]
        else:
            self.client = client
            self.collection = self.client["processed_data"]
            self.analysis_collection = self.client["analysis_results"]

    async def insert_new_entry(self, image_data: Dict):
        """
        Insère une nouvelle entrée dans la collection
        
        Args:
            image_data: Un dictionnaire contenant les données à insérer
        """
        # Si c'est un objet ProcessedImage, le convertir en dictionnaire
        if hasattr(image_data, 'model_dump'):
            image_dict = image_data.model_dump()
        else:
            # Vérifier que c'est bien un dictionnaire
            if not isinstance(image_data, dict):
                logging.error(f"Expected dict or Pydantic model, got {type(image_data)}")
                # Tentative de conversion en dict si possible
                try:
                    image_dict = dict(image_data)
                except:
                    logging.error(f"Failed to convert {type(image_data)} to dict")
                    raise TypeError(f"image_data must be a dict or Pydantic model, got {type(image_data)}")
            else:
                image_dict = image_data
            
        # Ne pas convertir à nouveau les frames si elles sont déjà des dictionnaires
        if "frames" in image_dict and image_dict["frames"] and not is_frames_list_dicts(image_dict["frames"]):
            image_dict["frames"] = [frame_to_dict(f) for f in image_dict.get("frames", [])]
            logging.debug("Frames converties en dictionnaires")
        else:
            logging.debug("Frames déjà en format dictionnaire, pas de conversion nécessaire")
            
        await self.collection.insert_one(image_dict)

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

    async def update_entry(self, id_str: str, update_data: Dict) -> bool:
        from bson.objectid import ObjectId
        try:
            # Ne pas convertir à nouveau les frames si elles sont déjà des dictionnaires
            if "frames" in update_data and update_data["frames"] and not is_frames_list_dicts(update_data["frames"]):
                update_data["frames"] = [frame_to_dict(f) for f in update_data["frames"]]
                logging.debug("Frames converties en dictionnaires pour update")
            else:
                logging.debug("Frames déjà en format dictionnaire pour update, pas de conversion nécessaire")
                
            result = await self.collection.update_one(
                {"_id": ObjectId(id_str)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error updating document: {e}")
            return False

    async def close_connection(self):
        await self.client.close()
