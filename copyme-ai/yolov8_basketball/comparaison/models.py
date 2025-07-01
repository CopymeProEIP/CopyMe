from pydantic import BaseModel
from typing import Optional
from comparaison.enums import Direction, PriorityLevel

class Improvement(BaseModel):
    angle_index: int  # Index correspondant dans le tableau angles
    target_angle: float  # Angle cible à atteindre
    direction: Direction  # Direction de correction
    magnitude: float  # Amplitude de la correction nécessaire
    priority: PriorityLevel  # Priorité de la correction
    class_name: Optional[str] = None  # Nom de la classe associée
