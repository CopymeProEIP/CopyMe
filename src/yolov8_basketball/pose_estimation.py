from typing import Any, Dict, List, Tuple
from ultralytics import YOLO
from config.db_models import Direction
import logging
from .yolov8_base import YOLOv8Base

class PoseEstimation(YOLOv8Base):
    def __init__(self,model_path: str , verbose: bool = False):
        # Initialize parent class
        super().__init__(model_path=model_path, verbose=verbose)

    def pose_detector(self, frame, results_list, class_name, confidence) -> Tuple[Any, List, Dict]:
        logging.debug(f"Pose Estimation: {class_name} with confidence {confidence:.2f}")
        skeleton = [
            (5, 6),  # Shoulders connection
            (5, 11), (6, 12),  # Shoulders to hips
            (11, 12),  # Hips connection
            (5, 7), (7, 9),  # Left arm
            (6, 8), (8, 10),  # Right arm
            (11, 13), (13, 15),  # Left leg
            (12, 14), (14, 16)  # Right leg
        ]

        # Optional: Name the keypoints for clarity
        keypoint_names = {
            0: "Nose", 1: "L eye", 2: "R eye", 3: "L ear", 4: "R ear",
            5: "L shoulder", 6: "R shoulder",
            7: "L elbow", 8: "R elbow",
            9: "L wrist", 10: "R wrist",
            11: "L hip", 12: "R hip",
            13: "L knee", 14: "R knee",
            15: "L ankle", 16: "R ankle"
        }

        angle_names = {
            (5, 7, 9): ("elbow", Direction.LEFT),
            (6, 8, 10): ("elbow", Direction.RIGHT),
            (5, 11, 13): ("hip", Direction.LEFT),
            (6, 12, 14): ("hip", Direction.RIGHT),
            (11, 13, 15): ("knee", Direction.LEFT),
            (12, 14, 16): ("knee", Direction.RIGHT),
        }
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
                    keypoint_name = keypoint_names.get(idx, f"Keypoint {idx}")
                    keypoints_positions[keypoint_name] = coord.tolist()

                # Calculate angles for each pair in the skeleton
                for start, end in skeleton:
                    if start >= len(kp) or end >= len(kp):
                        continue
                    angle, frame, third_point = self.draw_angle_and_triangle(frame, kp, start, end, keypoint_names)
                    if angle is not None:
                        # Get the keypoint names
                        start_name = keypoint_names.get(start, f"Keypoint {start}")
                        end_name = keypoint_names.get(end, f"Keypoint {end}")
                        angle_name = angle_names.get((start, end, third_point), ("Unknown angle", Direction.UNKNOWN))
                        # Append angle and linked points
                        angles_with_points.append({
                            "start_point": start_name,
                            "end_point": end_name,
                            "third_point": third_point,
                            "angle": angle,
                            "angle_name": angle_name
                        })
                        angles_tmp.append({
                            "start_point": start,
                            "end_point": end,
                            "third_point": third_point,
                            "angle": angle,
                            "angle_name": angle_name
                        })

                result_frame = {
                    "class_name": class_name,
                    "keypoints_positions": self.convert_numpy_to_python(kp),
                    "angles": self.convert_numpy_to_python(angles_tmp),
                }

                angles_tmp.clear()
                angles_tmp = []
        return frame, angles_with_points, result_frame
