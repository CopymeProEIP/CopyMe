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
from .basketball_analysis_model import BasketballAnalysisDB, BasketballAnalysisModel

router = APIRouter(prefix="/ai", tags=["ai"])

class ProcessResponse(BaseModel):
    frames: List[FrameData]
    created_at: datetime
    version: int

class ProcessRequest(BaseModel):
    userId: str = Field(..., examples=["680a1e190ceb2230eeb132b6"])
    processedDataId: str = Field(..., examples=["680a1e190ceb2230eeb132b6"])
    allow_training: Optional[bool] = False

def clean(obj):
    if isinstance(obj, float):
        return 0.0 if (math.isnan(obj) or math.isinf(obj)) else obj
    elif isinstance(obj, dict):
        return {k: clean(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean(v) for v in obj]
    elif hasattr(obj, "model_dump"):
        return clean(obj.model_dump())
    return obj


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

    # Sanitize frames correctement pour la base de données - une seule conversion
    frames_data = [sanitize_float_values(sanitize_frame(f)) for f in results]

    # Créer des objets FrameData propres pour la réponse - ne pas appeler sanitize_frame à nouveau
    clean_frames = [create_clean_frame_data(f) for f in frames_data]

    logging.info("Creating new document...")

    try:
        created_at = datetime.combine(date.today(), datetime.min.time())

        # Préparation des frames pour MongoDB
        mongo_ready_frames = []
        for frame in frames_data:
            # Si c'est déjà un dictionnaire, utiliser directement
            if isinstance(frame, dict):
                mongo_ready_frame = frame
            # Sinon, convertir en dictionnaire
            elif hasattr(frame, "model_dump"):
                mongo_ready_frame = frame.model_dump()
            else:
                # Fallback
                mongo_ready_frame = sanitize_frame(frame)

            # S'assurer que tous les objets sont sérialisables
            # Pour les énumérations, on préserve leur valeur numérique
            def serialize_custom(obj):
                if hasattr(obj, "value"):
                    return obj.value
                elif hasattr(obj, "name") and obj.name in ["LEFT", "RIGHT"]:
                    return 1 if obj.name == "LEFT" else 2
                return str(obj)

            # Sérialiser en JSON puis recharger pour garantir la compatibilité
            mongo_ready_frame = json.loads(json.dumps(mongo_ready_frame, default=serialize_custom))
            mongo_ready_frames.append(mongo_ready_frame)

        collection_insert = ProcessedImage(
            url=str(file_path),
            frames=mongo_ready_frames,  # Utiliser les frames préparées pour MongoDB
            userId=userId,
            allow_training=allow_training,
            created_at=created_at,
            version=1,
        )

        # Convertir l'objet Pydantic en dictionnaire pour l'insertion dans MongoDB
        insert_data = collection_insert.model_dump()
        # Utiliser la même fonction de sérialisation personnalisée
        insert_data = json.loads(json.dumps(insert_data, default=serialize_custom))
        await db_model.insert_new_entry(insert_data)

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
    analysis_id: Optional[str] = None
    alignment_score: float
    pose_similarity: float
    key_differences: List[Dict]
    improvements: List[Dict]
    class_scores: Dict[str, int]  # Changé de Dict[str, Dict[str, float]] à Dict[str, int]
    global_feedback: Optional[str] = None
    analysis_summary: Optional[Dict] = None
    metadata: Optional[Dict] = None
    created_at: datetime

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_movement(request: Request, analysis_data: AnalysisRequest = Body(...)) -> AnalysisResponse:
    """
    Analyse un mouvement en comparant des frames capturées avec des références et fournit des recommandations.
    """
    try:
        analyser = BasketballAPIAnalyzer()
        result = await analyser.analyze_basketball_sequence_api(analysis_data.video_id)

        # Vérifier si le backend IA a retourné une erreur
        if isinstance(result, dict) and "error" in result:
            logging.error(f"Erreur backend IA: {result['error']}")
            raise HTTPException(status_code=400, detail=f"AI error: {result['error']}")

        # Initialiser la base de données pour les analyses
        db_model: DatabaseManager = get_database(request)
        analysis_db = BasketballAnalysisDB(db_model)

        # Sauvegarder l'analyse complète dans MongoDB
        analysis_id = None
        try:
            analysis_id = await analysis_db.save_analysis(result)
            logging.info(f"Analysis saved with ID: {analysis_id}")
        except Exception as save_error:
            logging.error(f"Failed to save analysis to database: {save_error}")
            # Continuer même si la sauvegarde échoue

        # Extraire les données pour une meilleure structuration
        analysis_summary = result.get("analysis_summary", {})
        summary_data = analysis_summary.get("summary", {})
        frame_analysis = result.get("frame_analysis", [])        # Extraire les améliorations spécifiques
        improvements = []
        key_differences = []

        for frame in frame_analysis:
            if frame.get("improvements"):
                # Convertir les objets Improvement en dictionnaires
                frame_improvements = frame["improvements"]
                for improvement in frame_improvements:
                    if hasattr(improvement, 'model_dump'):
                        # Si c'est un objet Pydantic, utiliser model_dump()
                        improvements.append(improvement.model_dump())
                    elif hasattr(improvement, 'dict'):
                        # Si c'est un objet Pydantic v1, utiliser dict()
                        improvements.append(improvement.dict())
                    elif isinstance(improvement, dict):
                        # Si c'est déjà un dictionnaire
                        improvements.append(improvement)
                    else:
                        # Sinon, tenter de convertir les attributs en dictionnaire
                        improvement_dict = {
                            'angle_index': getattr(improvement, 'angle_index', 0),
                            'target_angle': getattr(improvement, 'target_angle', 0.0),
                            'direction': str(getattr(improvement, 'direction', 'unknown')),
                            'magnitude': getattr(improvement, 'magnitude', 0.0),
                            'priority': str(getattr(improvement, 'priority', 'low')),
                            'class_name': getattr(improvement, 'class_name', None)
                        }
                        improvements.append(improvement_dict)

            if frame.get("comparison_result"):
                key_differences.append({
                    "frame_index": frame.get("frame_index", 0),
                    "phase": frame.get("phase", "unknown"),
                    "comparison_result": frame["comparison_result"],
                    "technical_score": frame.get("technical_score", 0)
                })

        # Convertir le résultat en format AnalysisResponse
        return AnalysisResponse(
            email=analysis_data.email,
            video_id=analysis_data.video_id or "unknown",
            analysis_id=analysis_id,
            alignment_score=summary_data.get("average_technical_score", 0.0) / 100.0,
            pose_similarity=summary_data.get("average_technical_score", 0.0),
            key_differences=key_differences,
            improvements=improvements,
            class_scores=summary_data.get("improvement_breakdown", {}),
            global_feedback=result.get("global_feedback"),
            analysis_summary=analysis_summary,
            metadata=result.get("metadata"),
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

        # Convertir les objets Direction en valeur numérique
        if isinstance(angle.get("angle_name"), tuple) and len(angle.get("angle_name")) == 2:
            angle_type, direction = angle.get("angle_name")
            # Convertir l'objet Direction en sa valeur entière
            if hasattr(direction, "value"):
                direction = direction.value
            elif hasattr(direction, "name") and direction.name == "LEFT":
                direction = 1  # Valeur associée à Direction.LEFT
            elif hasattr(direction, "name") and direction.name == "RIGHT":
                direction = 2  # Valeur associée à Direction.RIGHT
            angle["angle_name"] = (angle_type, direction)

    # S'assurer que feedback est un dict
    if not isinstance(frame_dict.get("feedback"), dict):
        frame_dict["feedback"] = {}

    # Puis on nettoie récursivement les float "louches" partout
    frame_dict = sanitize_float_values(frame_dict)

    return frame_dict

def create_clean_frame_data(frame_data: Any) -> FrameData:
    """
    Crée un objet FrameData propre à partir d'un dictionnaire nettoyé ou d'un objet FrameData
    """
    try:
        # Si c'est déjà un dictionnaire, on l'utilise directement
        if isinstance(frame_data, dict):
            clean_dict = frame_data
        # Si c'est un objet FrameData, on le convertit en dictionnaire
        elif hasattr(frame_data, "model_dump"):
            clean_dict = frame_data.model_dump()
        else:
            # Fallback - tenter une conversion en dictionnaire
            clean_dict = sanitize_frame(frame_data)
        
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
        # Ajout du champ url_path_frame qui est requis par FrameData
        if 'url_path_frame' not in clean_dict:
            clean_dict['url_path_frame'] = clean_dict.get('url_path_frame', f"frames/frame_{clean_dict.get('frame_number', 0)}.jpg")
            
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
            feedback={},
            url_path_frame="frames/default_frame.jpg"  # Ajouter le champ requis
        )

@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}
