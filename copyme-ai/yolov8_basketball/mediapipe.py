import mediapipe as mp
import cv2

class MediaPipe:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)

    def get_keypoints(self, image):
        results = self.pose.process(image)
        if not hasattr(results, 'pose_landmarks') or results.pose_landmarks is None:
            return None

        landmarks = results.pose_landmarks.landmark
        keypoints = {}

        for idx in [19, 20, 31, 32]:
            if idx < len(landmarks):
                lm = landmarks[idx]
                if hasattr(lm, "visibility") and lm.visibility > 0.5:
                    keypoints[idx] = (lm.x, lm.y, lm.z)

        if not keypoints:
            print("[INFO] Aucun point suffisamment visible")
            return None

        return keypoints
