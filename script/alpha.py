import cv2
import numpy as np
import torch
from ultralytics import YOLO
from pathlib import Path
from typing import List, Tuple
from Shoot import ShotPhase

class BasketballAnalysis:
    def __init__(self, capture_index: int, save_dir: str, model_path: str, frame_interval: int = 5):
        self.capture_index = capture_index
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)

        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print("Using Device: ", self.device)

        self.model = self.load_model(model_path)
        self.CLASS_NAMES_DICT = self.model.model.names
        self.shoot_detected = False
        self.shoot_frame_count = 0
        self.sequence_count = 0
        self.frame_interval = frame_interval
        self.current_frame_count = 0

    def load_model(self, model_path: str) -> YOLO:
        """Load the YOLO model from the given path."""
        model = YOLO(model_path)
        model.fuse()
        return model

    def predict(self, frame: np.ndarray) -> List:
        """Predict the objects in the given frame."""
        results = self.model(frame)
        return results

    def plot_bboxes_and_save(self, results: List, frame: np.ndarray) -> None:
        """Plot bounding boxes on the frame and save the frame if a shoot is detected."""
        shoot_detected = False

        for result in results:
            boxes = result.boxes.cpu().numpy()
            for i in range(len(boxes)):
                class_id = int(boxes.cls[i])
                conf = boxes.conf[i]
                xyxy = boxes.xyxy[i]

                # Draw bounding box
                cv2.rectangle(frame, (int(xyxy[0]), int(xyxy[1])), (int(xyxy[2]), int(xyxy[3])), (0, 255, 0), 2)
                label = f"{self.CLASS_NAMES_DICT[class_id]}: {conf:.2f}"
                cv2.putText(frame, label, (int(xyxy[0]), int(xyxy[1]) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                if self.CLASS_NAMES_DICT[class_id] == 'shoot':
                    shoot_detected = True

        if shoot_detected:
            self.shoot_frame_count += 1
            if self.shoot_frame_count % self.frame_interval == 0:
                save_path = self.save_dir / f"frame_{self.sequence_count}.jpg"
                cv2.imwrite(str(save_path), frame)
                self.sequence_count += 1
        else:
            self.shoot_frame_count = 0

    def calculate_angle(self, a: Tuple[int, int], b: Tuple[int, int], c: Tuple[int, int]) -> float:
        """Calculate the angle between three points."""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.degrees(np.arccos(cosine_angle))
        return angle

    def detect_phase(self, keypoints: np.ndarray, previous_phase: str, timestamp: float) -> str:
        """Detect the current phase of the movement based on keypoints."""
        try:
            shoulder = keypoints[5]
            elbow = keypoints[7]
            wrist = keypoints[9]
            hip = keypoints[11]
            knee = keypoints[13]
            ankle = keypoints[15]

            elbow_angle = self.calculate_angle(shoulder, elbow, wrist)
            knee_angle = self.calculate_angle(hip, knee, ankle)

            if knee_angle < 90 and previous_phase == 'Preparation':
                return 'Jump', timestamp
            elif elbow_angle > 160 and previous_phase == 'Jump':
                return 'Release', timestamp
            elif elbow_angle < 160 and previous_phase == 'Release':
                return 'Follow-Through', timestamp
            else:
                return previous_phase
        except IndexError:
            return previous_phase

    def provide_feedback(self, frame: np.ndarray, previous_phase: str) -> Tuple[str, str]:
        """Provide feedback on the current phase of the movement."""
        keypoints = self.predict(frame)
        current_phase = self.detect_phase(keypoints, previous_phase)
        feedback = f"Current Phase: {current_phase}"
        return feedback, current_phase
    
    def save_phase(self, phase, keypoints, timestamp, phases_list):
        shot_phase = ShotPhase(phase, keypoints, timestamp)
        phases_list.append(shot_phase.to_dict())

def main(video_path: str) -> None:
    """Main function to run the basketball analysis."""
    phases_list = []
    cap = cv2.VideoCapture(video_path)
    previous_phase = 'Preparation'

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # timestamp = cap.get(cv2.CAP_PROP_POS_MSEC)
        feedback, current_phase = BasketballAnalysis.provide_feedback(frame, previous_phase)
        
        cv2.putText(frame, feedback, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.imshow('Basketball Analysis', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    video_path = 'basketball_video.mp4'
    main(video_path)