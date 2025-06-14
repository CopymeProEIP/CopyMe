from typing import Any, Dict, List, Tuple
from ultralytics import YOLO
from config.db_models import Direction
import logging
from .yolov8_base import YOLOv8Base

class PoseEstimation(YOLOv8Base):
    def __init__(self,model_path: str , verbose: bool = False):
        super().__init__(model_path=model_path, verbose=verbose)

    def pose_detector(self, frame, results_list, class_name, confidence, frame_number) -> Tuple[Any, List, Dict]:
        if self.verbose:
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
            0: "nose", 1: "left_eye", 2: "right_eye", 3: "left_ear", 4: "right_ear",
            5: "left_shoulder", 6: "right_shoulder",
            7: "left_elbow", 8: "right_elbow",
            9: "left_wrist", 10: "right_wrist",
            11: "left_hip", 12: "right_hip",
            13: "left_knee", 14: "right_knee",
            15: "left_ankle", 16: "right_ankle"
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
                    keypoint_name = keypoint_names.get(idx, f"keypoint_{idx}")
                    keypoints_positions[f"{keypoint_name}_x"] = float(coord[0])
                    keypoints_positions[f"{keypoint_name}_y"] = float(coord[1])

                # Calculate angles
                for start, end in skeleton:
                    if start >= len(kp) or end >= len(kp):
                        continue
                    angle, frame, third_point = self.draw_angle_and_triangle(frame, kp, start, end, keypoint_names)
                    if angle is not None:
                        start_name = keypoint_names.get(start, f"keypoint_{start}")
                        end_name = keypoint_names.get(end, f"keypoint_{end}")
                        angle_name = angle_names.get((start, end, third_point), ("Unknown angle", Direction.UNKNOWN))
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
                    "frame_number": frame_number,
                    "keypoints_positions": keypoints_positions,
                    "angles": self.convert_numpy_to_python(angles_tmp),
                }

                angles_tmp.clear()
                angles_tmp = []
        return frame, angles_with_points, result_frame
