from fastapi import FastAPI, File,  UploadFile, Form, HTTPException, Request, Depends, APIRouter, Body
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Annotated, List, Dict
from yolov8_basketball.tools.utils import get_database, get_yolomodel, save_uploaded_file
from recommendation_engine import analyze_phase
import logging
from config.setting import get_variables
from yolov8_basketball.phase_detection import PhaseDetection
from config.db_models import ProcessedImage, DatabaseManager, FrameData
from datetime import datetime, date
from uuid import uuid4
import json
from yolov8_basketball.comparaison.enums import Direction, PriorityLevel
from yolov8_basketball.comparaison.models import Improvement
from yolov8_basketball.comparaison.keypoints import KeypointUtils
from yolov8_basketball.comparaison.angles import AngleUtils
from yolov8_basketball.comparaison.display import Display
from yolov8_basketball.comparaison.kalman import KalmanKeypointFilter
from yolov8_basketball.comparaison.comparaison import Comparaison
from yolov8_basketball.comparaison import BasketballAPIAnalyzer
from typing import Any, Dict
import math

router = APIRouter(prefix="/ai", tags=["ai"])

class ProcessResponse(BaseModel):
    frames: List[FrameData]
    created_at: datetime
    version: int

class ProcessRequest(BaseModel):
    userId: str = Field(..., examples=["680a1e190ceb2230eeb132b6"])
    processedDataId: str = Field(..., examples=["680a1e190ceb2230eeb132b6"])
    allow_training: Optional[bool] = False

@router.post("/process", response_model=ProcessResponse)
async def process(
    request: Request,
    files: UploadFile = File(...),
    userId: str = Form(...),
    allow_training: Optional[bool] = Form(False),
    processedDataId: Optional[str] = Form(None)
) -> ProcessResponse:
    """
    Traite une vidéo ou une image pour l'analyse de mouvements de basket.
    Met à jour un document existant si processedDataId est fourni, sinon en crée un nouveau.
    """
    
    # Initialiser les settings ici au lieu du niveau module
    settings = get_variables()
    
    yolo_basket: PhaseDetection = get_yolomodel(request)
    db_model: DatabaseManager = get_database(request)

    file_path = save_uploaded_file(files, settings.UPLOAD_DIR, True)
    results: List[FrameData] = yolo_basket.run(str(file_path))
    logging.info("YOLO processing completed.")

    # Sanitize frames correctement pour la base de données
    frames_data = [sanitize_float_values(sanitize_frame(f)) for f in results]

    # Créer des objets FrameData propres pour la réponse
    clean_frames = [create_clean_frame_data(sanitize_frame(f)) for f in results]

    try:
        existing_doc = await db_model.get_by_id(processedDataId) if processedDataId else None

        if existing_doc:
            logging.info(f"Updating document ID {processedDataId}...")

            update_data = {
                "url": str(file_path),
                "frames": frames_data,
                "updated_at": datetime.now()
            }

            await db_model.update_entry(processedDataId, update_data)

            return ProcessResponse(
                frames=clean_frames,
                created_at=existing_doc.get("created_at", datetime.now()),
                version=existing_doc.get("version", 1) + 1
            )
        else:
            logging.info("Creating new document...")

            created_at = datetime.combine(date.today(), datetime.min.time())
            collection_insert = ProcessedImage(
                url=str(file_path),
                frames=frames_data,
                userId=userId,
                allow_training=allow_training,
                created_at=created_at,
                version=1,
            )

            await db_model.insert_new_entry(json.loads(collection_insert.model_dump_json()))

            return ProcessResponse(
                frames=clean_frames,
                created_at=created_at,
                version=1
            )

    except Exception as e:
        logging.error(f"Database operation error: {str(e)}")
        return ProcessResponse(
            frames=clean_frames,
            created_at=datetime.combine(date.today(), datetime.min.time()),
            version=1
        )


class AnalysisRequest(BaseModel):
    email: EmailStr = Field(..., examples=["email@exemple.com"])
    video_id: Optional[str] = None
    reference_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    email: EmailStr
    video_id: str
    alignment_score: float
    pose_similarity: float
    key_differences: List[Dict]
    improvements: List[Dict]
    class_scores: Dict[str, Dict[str, float]]
    created_at: datetime

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_movement(request: Request, analysis_data: AnalysisRequest = Body(...)) -> AnalysisResponse:
    """
    Analyse un mouvement en comparant des frames capturées avec des références et fournit des recommandations.
    """
    try:
        analyser = BasketballAPIAnalyzer()
        result = await analyser.analyze_basketball_sequence_api(analysis_data.video_id)

        # Convertir le résultat en format AnalysisResponse
        return AnalysisResponse(
            email=analysis_data.email,
            video_id=analysis_data.video_id or "unknown",
            alignment_score=result.get("analysis_summary", {}).get("summary", {}).get("average_technical_score", 0.0) / 100.0,
            pose_similarity=result.get("analysis_summary", {}).get("summary", {}).get("average_technical_score", 0.0),
            key_differences=result.get("frame_analysis", []),
            improvements=result.get("frame_analysis", []),
            class_scores={},
            created_at=datetime.now()
        )
    except Exception as e:
        logging.error(f"Error during movement analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def sanitize_float_values(data: Any) -> Any:
    if isinstance(data, dict):
        return {k: sanitize_float_values(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_float_values(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return 0.0
        return data
    else:
        return data

def sanitize_frame(frame: FrameData) -> Dict:
    frame_dict = frame.model_dump()

    # Nettoyer les angles
    for angle in frame_dict.get("angles", []):
        if angle.get("angle") is None or math.isnan(angle.get("angle")) or math.isinf(angle.get("angle")):
            angle["angle"] = 0.0

    # S'assurer que feedback est un dict
    if not isinstance(frame_dict.get("feedback"), dict):
        frame_dict["feedback"] = {}

    # Puis on nettoie récursivement les float "louches" partout
    frame_dict = sanitize_float_values(frame_dict)

    return frame_dict

def create_clean_frame_data(frame_dict: Dict) -> FrameData:
    """
    Crée un objet FrameData propre à partir d'un dictionnaire nettoyé
    """
    try:
        # Nettoyer d'abord le dictionnaire
        clean_dict = sanitize_float_values(frame_dict)
        
        # S'assurer que les champs requis existent
        if 'frame_number' not in clean_dict:
            clean_dict['frame_number'] = 0
        if 'timestamp' not in clean_dict:
            clean_dict['timestamp'] = 0.0
        if 'keypoints_positions' not in clean_dict:
            clean_dict['keypoints_positions'] = {}
        if 'angles' not in clean_dict:
            clean_dict['angles'] = []
        if 'class_name' not in clean_dict:
            clean_dict['class_name'] = 'unknown'
        if 'feedback' not in clean_dict:
            clean_dict['feedback'] = {}
            
        return FrameData(**clean_dict)
    except Exception as e:
        logging.warning(f"Erreur lors de la création d'un FrameData propre: {e}")
        # Retourner un objet minimal en cas d'erreur
        return FrameData(
            frame_number=0,
            timestamp=0.0,
            keypoints_positions={},
            angles=[],
            class_name='unknown',
            feedback={}
        )

@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}
