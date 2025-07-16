from pydantic import BaseModel, Field, ConfigDict
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import List, Dict, Optional, Any, Annotated
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler) -> core_schema.CoreSchema:
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate)
            ])
        ], serialization=core_schema.to_string_ser_schema())

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: Any, handler) -> JsonSchemaValue:
        return {"type": "string", "format": "objectid"}

class ImprovementModel(BaseModel):
    angle_index: int
    target_angle: float
    direction: str
    magnitude: float
    priority: str
    class_name: Optional[str] = None

class PoseQualityModel(BaseModel):
    balance: float
    symmetry: float
    stability: float

class MovementAnalysisModel(BaseModel):
    smoothness: float
    efficiency: float
    consistency: float

class TechnicalPrecisionModel(BaseModel):
    alignment: float
    timing: float
    form: float

class AdvancedMetricsModel(BaseModel):
    pose_quality: PoseQualityModel
    movement_analysis: MovementAnalysisModel
    technical_precision: TechnicalPrecisionModel
    technical_score: float

class FrameAnalysisModel(BaseModel):
    frame_index: int
    phase: str
    filtered_current_keypoints: List[List[float]]
    filtered_reference_keypoints: List[List[float]]
    comparison_result: Dict[str, Any]
    improvements: List[ImprovementModel]
    advanced_metrics: Optional[AdvancedMetricsModel] = None
    pose_quality: Optional[Dict[str, float]] = None
    technical_score: Optional[float] = None
    frame_feedback: Optional[str] = None
    frame_recommendations: Optional[List[str]] = None
    error: Optional[str] = None

class SummaryModel(BaseModel):
    total_frames_analyzed: int
    average_technical_score: float
    average_pose_quality: Dict[str, float]
    total_improvements_suggested: int
    improvement_breakdown: Dict[str, int]

class AnalysisSummaryModel(BaseModel):
    summary: SummaryModel
    performance_rating: str
    recommendations: List[str]

class MetadataModel(BaseModel):
    total_frames: int
    phases_detected: List[str]
    analysis_timestamp: float

class BasketballAnalysisModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "success": True,
                "video_id": "507f1f77bcf86cd799439011",
                "analysis_summary": {
                    "summary": {
                        "total_frames_analyzed": 15,
                        "average_technical_score": 75.5,
                        "average_pose_quality": {
                            "balance": 0.8,
                            "symmetry": 0.7,
                            "stability": 0.9
                        },
                        "total_improvements_suggested": 8,
                        "improvement_breakdown": {
                            "elbow_angle": 3,
                            "knee_angle": 2,
                            "shoulder_angle": 3
                        }
                    },
                    "performance_rating": "Good",
                    "recommendations": [
                        "Focus on elbow alignment during release",
                        "Maintain consistent knee bend",
                        "Improve shoulder positioning"
                    ]
                },
                "global_feedback": "Your shooting form shows good fundamentals with some areas for improvement...",
                "frame_analysis": [
                    {
                        "frame_index": 0,
                        "phase": "preparation",
                        "technical_score": 78.5,
                        "frame_feedback": "Good stance setup",
                        "frame_recommendations": ["Keep feet shoulder-width apart"]
                    }
                ],
                "metadata": {
                    "total_frames": 15,
                    "phases_detected": ["preparation", "shooting", "shot_release"],
                    "analysis_timestamp": 1640995200.0
                }
            }
        }
    )
    
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    success: bool
    video_id: str
    analysis_summary: AnalysisSummaryModel
    global_feedback: str
    frame_analysis: List[FrameAnalysisModel]
    metadata: MetadataModel
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    error: Optional[str] = None

class BasketballAnalysisDB:
    def __init__(self, database_manager):
        self.db_manager = database_manager
        self.client = database_manager.client
        self.collection = self.client.analysis_results

    async def save_analysis(self, analysis_data: Dict) -> str:
        """Sauvegarder une analyse dans MongoDB"""
        try:
            # Préprocesser les données pour convertir les objets Improvement
            cleaned_data = self._clean_analysis_data(analysis_data)
            # Convertir les données en modèle Pydantic
            analysis_model = BasketballAnalysisModel(**cleaned_data)
            # Convertir en dictionnaire pour MongoDB
            analysis_dict = analysis_model.model_dump(by_alias=True, exclude_unset=True)

            result = await self.collection.insert_one(analysis_dict)

            return str(result.inserted_id)

        except Exception as e:
            raise Exception(f"Erreur lors de la sauvegarde: {e}")

    def _clean_analysis_data(self, data: Dict) -> Dict:
        """Nettoie les données d'analyse en convertissant les objets Improvement en dictionnaires"""
        import copy
        cleaned_data = copy.deepcopy(data)

        # Nettoyer frame_analysis
        if 'frame_analysis' in cleaned_data:
            for frame in cleaned_data['frame_analysis']:
                if 'improvements' in frame and frame['improvements']:
                    cleaned_improvements = []
                    for improvement in frame['improvements']:
                        if hasattr(improvement, 'model_dump'):
                            # Pydantic v2
                            cleaned_improvements.append(improvement.model_dump())
                        elif hasattr(improvement, 'dict'):
                            # Pydantic v1
                            cleaned_improvements.append(improvement.dict())
                        elif isinstance(improvement, dict):
                            # Déjà un dictionnaire
                            cleaned_improvements.append(improvement)
                        else:
                            # Extraction manuelle des attributs
                            improvement_dict = {
                                'angle_index': getattr(improvement, 'angle_index', 0),
                                'target_angle': getattr(improvement, 'target_angle', 0.0),
                                'direction': str(getattr(improvement, 'direction', 'unknown')),
                                'magnitude': getattr(improvement, 'magnitude', 0.0),
                                'priority': str(getattr(improvement, 'priority', 'low')),
                                'class_name': getattr(improvement, 'class_name', None)
                            }
                            cleaned_improvements.append(improvement_dict)
                    frame['improvements'] = cleaned_improvements
        
        return cleaned_data

    async def get_analysis(self, analysis_id: str) -> Optional[BasketballAnalysisModel]:
        """Récupérer une analyse par son ID"""
        try:
            result = await self.collection.find_one({"_id": ObjectId(analysis_id)})
            
            if result:
                return BasketballAnalysisModel(**result)
            return None
            
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération: {e}")

    async def get_analyses_by_video_id(self, video_id: str) -> List[BasketballAnalysisModel]:
        """Récupérer toutes les analyses d'une vidéo"""
        try:
            cursor = self.collection.find({"video_id": video_id})
            results = await cursor.to_list(length=None)
            
            return [BasketballAnalysisModel(**result) for result in results]
            
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération: {e}")

    async def update_analysis(self, analysis_id: str, update_data: Dict) -> bool:
        """Mettre à jour une analyse"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"_id": ObjectId(analysis_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            raise Exception(f"Erreur lors de la mise à jour: {e}")

    async def delete_analysis(self, analysis_id: str) -> bool:
        """Supprimer une analyse"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(analysis_id)})
            return result.deleted_count > 0
            
        except Exception as e:
            raise Exception(f"Erreur lors de la suppression: {e}")

    async def get_user_statistics(self, video_id: str) -> Dict:
        """Obtenir les statistiques d'un utilisateur"""
        try:
            pipeline = [
                {"$match": {"video_id": video_id}},
                {"$group": {
                    "_id": "$video_id",
                    "total_analyses": {"$sum": 1},
                    "avg_technical_score": {"$avg": "$analysis_summary.summary.average_technical_score"},
                    "total_improvements": {"$sum": "$analysis_summary.summary.total_improvements_suggested"},
                    "latest_analysis": {"$max": "$created_at"}
                }}
            ]
            
            result = await self.collection.aggregate(pipeline).to_list(length=1)
            return result[0] if result else {}
            
        except Exception as e:
            raise Exception(f"Erreur lors du calcul des statistiques: {e}")
