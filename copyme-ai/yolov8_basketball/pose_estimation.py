from typing import Any, Dict, List, Tuple
from config.db_models import Direction
import logging
from .yolobase import YOLOBase
import numpy as np
from .mediapipe import MediaPipe
from .tools.utils import calculate_angle
from .tools.keypoint import Keypoint

class PoseEstimation(YOLOBase):
    KEYPOINT_NAMES = {
        Keypoint.NOSE.value: "nose", Keypoint.LEFT_EYE.value: "left_eye", Keypoint.RIGHT_EYE.value: "right_eye", Keypoint.LEFT_EAR.value: "left_ear", Keypoint.RIGHT_EAR.value: "right_ear",
        Keypoint.LEFT_SHOULDER.value: "left_shoulder", Keypoint.RIGHT_SHOULDER.value: "right_shoulder",
        Keypoint.LEFT_ELBOW.value: "left_elbow", Keypoint.RIGHT_ELBOW.value: "right_elbow",
        Keypoint.LEFT_WRIST.value: "left_wrist", Keypoint.RIGHT_WRIST.value: "right_wrist",
        Keypoint.LEFT_HIP.value: "left_hip", Keypoint.RIGHT_HIP.value: "right_hip",
        Keypoint.LEFT_KNEE.value: "left_knee", Keypoint.RIGHT_KNEE.value: "right_knee",
        Keypoint.LEFT_ANKLE.value: "left_ankle", Keypoint.RIGHT_ANKLE.value: "right_ankle"
    }

    ANGLE_DEFS = {
        (Keypoint.LEFT_SHOULDER.value, Keypoint.LEFT_ELBOW.value, Keypoint.LEFT_WRIST.value): ("elbow", Direction.LEFT),
        (Keypoint.RIGHT_SHOULDER.value, Keypoint.RIGHT_ELBOW.value, Keypoint.RIGHT_WRIST.value): ("elbow", Direction.RIGHT),
        (Keypoint.LEFT_SHOULDER.value, Keypoint.LEFT_HIP.value, Keypoint.LEFT_KNEE.value): ("hip", Direction.LEFT),
        (Keypoint.RIGHT_SHOULDER.value, Keypoint.RIGHT_HIP.value, Keypoint.RIGHT_KNEE.value): ("hip", Direction.RIGHT),
        (Keypoint.LEFT_HIP.value, Keypoint.LEFT_KNEE.value, Keypoint.LEFT_ANKLE.value): ("knee", Direction.LEFT),
        (Keypoint.RIGHT_HIP.value, Keypoint.RIGHT_KNEE.value, Keypoint.RIGHT_ANKLE.value): ("knee", Direction.RIGHT),
        (Keypoint.LEFT_ELBOW.value, Keypoint.LEFT_WRIST.value, Keypoint.LEFT_WRIST.value): ("wrist", Direction.LEFT),
        (Keypoint.RIGHT_ELBOW.value, Keypoint.RIGHT_WRIST.value, Keypoint.RIGHT_WRIST.value): ("wrist", Direction.RIGHT),
        (Keypoint.LEFT_KNEE.value, Keypoint.LEFT_ANKLE.value, Keypoint.LEFT_ANKLE.value): ("ankle", Direction.LEFT),
        (Keypoint.RIGHT_KNEE.value, Keypoint.RIGHT_ANKLE.value, Keypoint.RIGHT_ANKLE.value): ("ankle", Direction.RIGHT),
    }

    def __init__(self, model_path: str, verbose: bool = False):
        super().__init__(model_path=model_path, verbose=verbose)
        self.mediapipe = MediaPipe()

    def pose_detector(self, frame, results_list, class_name, confidence, frame_number) -> Tuple[Any, List, Dict]:
        if self.verbose:
            logging.debug(f"Pose Estimation: {class_name} with confidence {confidence:.2f}")

        angles_list = []
        keypoints_positions = {}
        mediapipe_kps = self.mediapipe.get_keypoints(frame)

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

                for (start, mid, end), (angle_type, direction) in self.ANGLE_DEFS.items():
                    if start >= len(kp) or mid >= len(kp) or end >= len(kp):
                        continue

                    if angle_type in ["wrist", "ankle"]:
                        yolo_valid = not (np.allclose(kp[start], 0) or np.allclose(kp[mid], 0))

                        if yolo_valid and mediapipe_kps is not None:
                            a, b = kp[start], kp[mid]

                            if angle_type == "wrist":
                                if direction == Direction.LEFT:
                                    mp_index = Keypoint.LEFT_INDEX.value
                                else:
                                    mp_index = Keypoint.RIGHT_INDEX.value
                            else:
                                if direction == Direction.LEFT:
                                    mp_index = Keypoint.LEFT_FOOT_INDEX.value
                                else:
                                    mp_index = Keypoint.RIGHT_FOOT_INDEX.value

                            if mp_index in mediapipe_kps:
                                c = np.array([mediapipe_kps[mp_index][0], mediapipe_kps[mp_index][1]])
                            else:
                                continue
                        else:
                            continue
                    else:
                        a, b, c = kp[start], kp[mid], kp[end]

                    angle = calculate_angle(a, b, c)
                    if angle is not None:
                        angles_list.append({
                            "start_point": start,
                            "end_point": end,
                            "third_point": mid if angle_type not in ["wrist", "ankle"] else mp_index,
                            "angle": angle,
                            "angle_name": (angle_type, direction)
                        })

        result_frame = {
            "class_name": class_name,
            "frame_number": frame_number,
            "keypoints_positions": keypoints_positions,
            "angles": self.convert_numpy_to_python(angles_list),
        }

        return frame, angles_list, result_frame
