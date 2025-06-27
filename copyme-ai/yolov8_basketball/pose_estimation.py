from typing import Any, Dict, List, Tuple
from config.db_models import Direction
import logging
from .yolobase import YOLOBase
import numpy as np

class PoseEstimation(YOLOBase):
    KEYPOINT_NAMES = {
        0: "nose", 1: "left_eye", 2: "right_eye", 3: "left_ear", 4: "right_ear",
        5: "left_shoulder", 6: "right_shoulder",
        7: "left_elbow", 8: "right_elbow",
        9: "left_wrist", 10: "right_wrist",
        11: "left_hip", 12: "right_hip",
        13: "left_knee", 14: "right_knee",
        15: "left_ankle", 16: "right_ankle"
    }

    SKELETON = [
        (5, 6),  # Shoulders
        (5, 11), (6, 12),  # Shoulders to hips
        (11, 12),  # Hips
        (5, 7), (7, 9),  # Left arm
        (6, 8), (8, 10),  # Right arm
        (11, 13), (13, 15),  # Left leg
        (12, 14), (14, 16)  # Right leg
    ]

    ANGLE_DEFS = {
        (5, 7, 9): ("elbow", Direction.LEFT),
        (6, 8, 10): ("elbow", Direction.RIGHT),
        (5, 11, 13): ("hip", Direction.LEFT),
        (6, 12, 14): ("hip", Direction.RIGHT),
        (11, 13, 15): ("knee", Direction.LEFT),
        (12, 14, 16): ("knee", Direction.RIGHT),
        (7, 9, 9): ("wrist", Direction.LEFT),
        (8, 10, 10): ("wrist", Direction.RIGHT),
        (13, 15, 15): ("ankle", Direction.LEFT),
        (14, 16, 16): ("ankle", Direction.RIGHT),
    }

    def __init__(self, model_path: str, verbose: bool = False):
        super().__init__(model_path=model_path, verbose=verbose)

    def pose_detector(self, frame, results_list, class_name, confidence, frame_number) -> Tuple[Any, List, Dict]:
        if self.verbose:
            logging.debug(f"Pose Estimation: {class_name} with confidence {confidence:.2f}")

        angles_with_points = []
        angles_tmp = []
        keypoints_positions = {}
        result_frame = {}

        for results in results_list:
            if not hasattr(results, 'keypoints') or results.keypoints is None:
                continue
            keypoints = results.keypoints.xy.cpu().numpy()
            for kp in keypoints:
                if kp.shape[0] < 17:
                    continue
                for idx, coord in enumerate(kp):
                    keypoint_name = self.KEYPOINT_NAMES.get(idx, f"keypoint_{idx}")
                    keypoints_positions[f"{keypoint_name}_x"] = float(coord[0])
                    keypoints_positions[f"{keypoint_name}_y"] = float(coord[1])

                for (start, mid, end), angle_name in self.ANGLE_DEFS.items():
                    if start >= len(kp) or mid >= len(kp) or end >= len(kp):
                        continue
                    if np.allclose(kp[start], kp[mid]) or np.allclose(kp[mid], kp[end]) or np.allclose(kp[start], kp[end]):
                        continue  # Ignore this angle, points are not distinct
                    if angle_name in ["wrist", "ankle"]:
                        a, b, c = kp[start], kp[mid], kp[end]
                    else:
                        a, b, c = kp[start], kp[mid], kp[end]
                    angle = self._calculate_angle(a, b, c)
                    if angle is not None:
                        angles_with_points.append({
                            "start_point": self.KEYPOINT_NAMES.get(start, f"keypoint_{start}"),
                            "end_point": self.KEYPOINT_NAMES.get(end, f"keypoint_{end}"),
                            "third_point": self.KEYPOINT_NAMES.get(mid, f"keypoint_{mid}"),
                            "angle": angle,
                            "angle_name": angle_name
                        })
                        angles_tmp.append({
                            "start_point": start,
                            "end_point": end,
                            "third_point": mid,
                            "angle": angle,
                            "angle_name": angle_name
                        })

                result_frame = {
                    "class_name": class_name,
                    "frame_number": frame_number,
                    "keypoints_positions": keypoints_positions,
                    "angles": self.convert_numpy_to_python(angles_tmp),
                }
                angles_tmp.clear()
        return frame, angles_with_points, result_frame

    def _calculate_angle(self, a, b, c):
        try:
            from .tools.utils import calculate_angle
            return float(calculate_angle(a, b, c))
        except Exception as e:
            if self.verbose:
                logging.error(f"Error calculating angle: {e}")
            return None
