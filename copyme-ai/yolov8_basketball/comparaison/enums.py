from enum import Enum

class Direction(str, Enum):
    INCREASE = "increase"
    DECREASE = "decrease"
    UNKNOWN = "unknown"

class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
