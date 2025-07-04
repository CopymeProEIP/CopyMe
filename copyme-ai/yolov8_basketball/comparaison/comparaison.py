from comparaison.enums import Direction, PriorityLevel
from comparaison.models import Improvement
from comparaison.kalman import KalmanKeypointFilter
from comparaison.keypoints import KeypointUtils
from comparaison.angles import AngleUtils
from typing import List, Dict, Tuple, Optional

class Comparaison:
    def __init__(self, model, dataset, use_kalman: bool = False):
        self.model = model
        self.dataset = dataset
        self.kalman_filter = KalmanKeypointFilter()
        self.use_kalman = use_kalman

    def compare(self):
        print(f"Comparing {self.model} with {self.dataset}")

    def filter_keypoints(self, keypoints: List[List[float]]) -> List[List[float]]:
        if self.use_kalman:
            return self.kalman_filter.filter_keypoints(keypoints)
        else:
            return keypoints  # Retourne les keypoints sans filtrage

    def compare_keypoints(self, current_keypoints: List[List[float]], reference_keypoints: List[List[float]]):
        return KeypointUtils.compare_keypoints(current_keypoints, reference_keypoints)

    def compare_angles(self, current_angles, reference_angles: Dict[str, Dict[str, float]]):
        return AngleUtils.compare_angles(current_angles, reference_angles)

    # Ajoute ici d'autres méthodes si besoin (ex: display, etc.)
