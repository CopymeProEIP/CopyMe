from pydantic import BaseModel
from typing import Optional

try:
    from .enums import Direction, PriorityLevel
except ImportError:
    try:
        from comparaison.enums import Direction, PriorityLevel
    except ImportError:
        from enums import Direction, PriorityLevel

class Improvement(BaseModel):
    angle_index: int
    target_angle: float
    direction: Direction
    magnitude: float
    priority: PriorityLevel
    class_name: Optional[str] = None
