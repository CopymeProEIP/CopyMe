from fastapi import FastAPI, File,  UploadFile, Form, HTTPException, Request, Depends, APIRouter, Body
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Annotated, List, Dict
from yolov8_basketball.utils import get_database, get_yolomodel, save_uploaded_file
from recommendation_engine import analyze_phase
import logging
from config.setting import get_variables
from yolov8_basketball.phase_detection import PhaseDetection
from config.db_models import ProcessedImage, DatabaseManager, FrameData
from datetime import datetime, date
from uuid import uuid4
import json
from yolov8_basketball.comparaison import Comparaison, Improvement, Direction, PriorityLevel

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

    yolo_basket: PhaseDetection = get_yolomodel(request)
    logging.debug(f"YOLOv8 object :\n{yolo_basket}")

    db_model: DatabaseManager = get_database(request)

    file_path = save_uploaded_file(files, settings.UPLOAD_DIR, True)

    results: List[FrameData] = yolo_basket.run(str(file_path))
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

    logging.debug(f"collection : {collection_insert.model_dump_json()}")

    response_model = ProcessedDemoResponse(
        frames=collection_insert.frames,
        email=collection_insert.email,
        created_at=collection_insert.created_at,
        version=collection_insert.version
    )
    logging.debug(f"Saving to database")

    try:
        # Tenter d'insérer dans la base de données
        await db_model.insert_new_entry(json.loads(collection_insert.model_dump_json()))
        logging.debug("Finished to update the database.")
    except Exception as e:
        # Capturer l'erreur et la journaliser
        logging.error(f"Database connection error: {str(e)}")
        logging.warning("Continuing without database persistence. Data will not be saved.")
        # On pourrait lever une exception HTTP ici, mais nous choisissons de continuer
        # pour permettre au client d'obtenir quand même les résultats du traitement

    return response_model

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
    created_at: datetime

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_movement(request: Request, analysis_data: AnalysisRequest = Body(...)) -> AnalysisResponse:
    """
    Analyse un mouvement en comparant des frames capturées avec des références et fournit des recommandations.
    """
    db_model: DatabaseManager = get_database(request)

    # Récupérer les données de l'utilisateur
    user_video_id = analysis_data.video_id
    if not user_video_id:
        # Si aucun ID n'est fourni, récupérer le dernier enregistrement pour cet email
        user_data = await db_model.get_latest_by_email(analysis_data.email)
        if not user_data:
            raise HTTPException(status_code=404, detail="Aucune donnée trouvée pour cet email")
        user_video_id = user_data.get("_id", "")
    else:
        # Récupérer les données spécifiques à l'ID fourni
        user_data = await db_model.get_by_id(user_video_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="Vidéo non trouvée")

    # Récupérer les données de référence
    reference_id = analysis_data.reference_id
    if not reference_id:
        # Utiliser une référence par défaut ou la plus récente
        reference_data = await db_model.get_reference_data()
        if not reference_data:
            raise HTTPException(status_code=404, detail="Aucune référence disponible")
    else:
        reference_data = await db_model.get_by_id(reference_id)
        if not reference_data:
            raise HTTPException(status_code=404, detail="Référence non trouvée")

    # Extraire les frames pour l'analyse
    user_frames = user_data.get("frames", [])
    reference_frames = reference_data.get("frames", [])

    if not user_frames or not reference_frames:
        raise HTTPException(status_code=400, detail="Données de frames insuffisantes pour l'analyse")

    # Initialiser le comparateur
    comparator = Comparaison(model=user_frames, dataset=reference_frames)

    # Préparer les données pour la comparaison
    current_keypoints = []
    reference_keypoints = []

    # Sélectionner la frame la plus pertinente pour l'analyse (par exemple, le moment du tir)
    # Pour simplifier, nous utilisons la première frame ici

    current_keypoints = user_frames[0]['keypoints_positions']
    reference_keypoints = reference_frames[0]['keypoints_positions']

    # Comparer les keypoints
    comparison_result = comparator.compare_keypoints(current_keypoints, reference_keypoints)

    # Comparer les angles (si disponibles)
    current_angles = {}
    reference_angles = {}

    logging.debug(f"Current angles: {user_frames[0]}")
    
    # Accès correct aux angles dans le dictionnaire
    if 'angles' in user_frames[0]:
        current_angles = user_frames[0]['angles']
    
    # Préparer les angles de référence avec des tolérances
    if 'angles' in reference_frames[0]:
        for angle in reference_frames[0]['angles']:
            # Extraire l'information d'angle
            angle_name = str(angle.get('angle_name', ['unknown', 0])[0])
            angle_value = angle.get('angle', 0)
            
            reference_angles[angle_name] = {
                "ref": angle_value,
                "tolerance": 5.0  # Tolérance de 5 degrés par défaut
            }
    
    improvements = comparator.compare_angles(current_angles, reference_angles)

    # Convertir les améliorations en dictionnaires pour la réponse
    improvement_list = []
    for imp in improvements:
        improvement_list.append({
            "angle_index": imp.angle_index,
            "target_angle": imp.target_angle,
            "direction": imp.direction,
            "magnitude": imp.magnitude,
            "priority": imp.priority
        })

    # Construire la réponse
    response = AnalysisResponse(
        email=analysis_data.email,
        video_id=user_video_id,
        alignment_score=comparison_result.get('alignment_score', 0),
        pose_similarity=comparison_result.get('pose_similarity', 0),
        key_differences=comparison_result.get('key_differences', []),
        improvements=improvement_list,
        created_at=datetime.now()
    )

    # Enregistrer les résultats d'analyse dans la base de données
    analysis_record = {
        "email": analysis_data.email,
        "video_id": user_video_id,
        "reference_id": reference_id,
        "comparison_result": comparison_result,
        "improvements": improvement_list,
        "created_at": datetime.now()
    }

    await db_model.insert_analysis_result(analysis_record)

    return response

@router.get("/image")
def serve_image_with_param():
    return {"status": "success", "message": "Image processed successfully."}

@router.get("/latest-angle-collection")
def latest_angle_collection():
    return {"status": "success", "message": "Latest angle collection."}
