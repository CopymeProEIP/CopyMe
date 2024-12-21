import numpy as np
import cv2
from time import time
import torch
from ultralytics import YOLO
import argparse
import os

class BasketballAnalysis:
    def __init__(self, capture_index, save_dir, model_path, frame_interval=5):
        self.capture_index = capture_index
        self.save_dir = save_dir
        os.makedirs(self.save_dir, exist_ok=True)

        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print("Using Device: ", self.device)

        self.model = self.load_model(model_path)
        self.CLASS_NAMES_DICT = self.model.model.names
        self.shoot_detected = False
        self.shoot_frame_count = 0
        self.sequence_count = 0
        self.frame_interval = frame_interval
        self.current_frame_count = 0

    def load_model(self, model_path):
        model = YOLO(model_path).to(self.device)
        model.fuse()
        return model

    def predict(self, frame):
        results = self.model(frame)
        return results

    def detect_pose(self, results, frame):
        shoot_detected = False
        conf_threshold = 0.75

        for result in results:
            boxes = result.boxes.cpu().numpy()
            for i in range(len(boxes)):
                class_id = int(boxes.cls[i])
                conf = boxes.conf[i]
                xyxy = boxes.xyxy[i]
                label = self.CLASS_NAMES_DICT[class_id]

                color = (0, 163, 250)
                if label == 'shoot':
                    color = (138, 83, 244)
                cv2.rectangle(frame, (int(xyxy[0]), int(xyxy[1])), (int(xyxy[2]), int(xyxy[3])), color, 2)
                label = f"{self.CLASS_NAMES_DICT[class_id]}"
                cv2.putText(frame, label, (int(xyxy[0]), int(xyxy[1]) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                if self.CLASS_NAMES_DICT[class_id] == 'shoot' and conf > conf_threshold:
                    shoot_detected = True
        if shoot_detected:
            self.shoot_frame_count += 1
            if self.shoot_frame_count % self.frame_interval == 0:
                self.save_shoot_frame(frame)
                self.sequence_count += 1
        else:
            self.shoot_frame_count = 0

    def save_shoot_frame(self, frame):
        save_path = os.path.join(self.save_dir, f"shoot{self.shoot_frame_count:0d}.jpg")
        cv2.imwrite(save_path, frame)

    def __call__(self):
        cap = cv2.VideoCapture(self.capture_index)
        assert cap.isOpened(), f"Error: Unable to open video file {self.capture_index}"
        win_name = 'Basketball Analysis'
        cv2.namedWindow(win_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(win_name, 900, 600)
        fps = cap.get(cv2.CAP_PROP_FPS)

        while cap.isOpened():
            success, frame = cap.read()
            if success:
                self.current_frame_count += 1

                results = self.predict(frame)
                self.detect_pose(results, frame)
                cv2.putText(frame, f'FPS: {int(fps)}', (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 2)

                cv2.imshow(win_name, frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            else:
                break
        cap.release()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Shoot detection using YOLOv8')
    parser.add_argument('-v', '--video', type=str, default='0', help='Path to video file or capture index')
    parser.add_argument('-m', '--model', type=str, default='../models/copyme.pt', help='Path to YOLOv8 model')
    parser.add_argument('-s', '--save_dir', type=str, default='../', help='Directory to save frames of "shoot" class')
    args = parser.parse_args()

    detector = BasketballAnalysis(capture_index=args.video, save_dir=args.save_dir, model_path=args.model)
    detector()