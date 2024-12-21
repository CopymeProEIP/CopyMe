import torch
import numpy as np
import cv2
from time import time
from ultralytics import YOLO
import argparse
import os

class ObjectDetection:
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
        model = YOLO(model_path)
        model.fuse()
        return model

    def predict(self, frame):
        results = self.model(frame)
        return results

    def plot_bboxes_and_save(self, results, frame):
        shoot_detected = False

        for result in results:
            boxes = result.boxes.cpu().numpy()
            for i in range(len(boxes)):
                class_id = int(boxes.cls[i])
                conf = boxes.conf[i]
                xyxy = boxes.xyxy[i]
                label = self.CLASS_NAMES_DICT[class_id]

                if label == 'shoot' or label == 'ball':
                    color = (0, 163, 250)
                    if label == 'shoot':
                        color = (138, 83, 244)
                        shoot_detected = True
                    cv2.rectangle(frame, (int(xyxy[0]), int(xyxy[1])), (int(xyxy[2]), int(xyxy[3])), color, 2)
                    label_text = f"{label} {conf:.2f}"
                    cv2.putText(frame, label_text, (int(xyxy[0]), int(xyxy[1]) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                                color, 2)

        if shoot_detected:
            if not self.shoot_detected:
                self.shoot_detected = True
                self.shoot_frame_count = 0
                self.sequence_count += 1
            if self.shoot_frame_count < 6:
                if self.current_frame_count % self.frame_interval == 0:
                    self.save_shoot_frame(frame)
                    self.shoot_frame_count += 1
        else:
            self.shoot_detected = False

        return frame

    def save_shoot_frame(self, frame):
        save_path = os.path.join(self.save_dir, f"shoot_{self.sequence_count}_frame_{self.shoot_frame_count}.png")
        cv2.imwrite(save_path, frame)

    def __call__(self):
        cap = cv2.VideoCapture(self.capture_index)
        assert cap.isOpened(), f"Error: Unable to open video file {self.capture_index}"

        cv2.namedWindow('YOLOv8 Detection', cv2.WINDOW_NORMAL)
        cv2.resizeWindow('YOLOv8 Detection', 900, 600)

        while True:
            start_time = time()
            ret, frame = cap.read()
            if not ret:
                break

            self.current_frame_count += 1

            results = self.predict(frame)
            frame = self.plot_bboxes_and_save(results, frame)

            end_time = time()
            fps = 1 / np.round(end_time - start_time, 2)
            cv2.putText(frame, f'FPS: {int(fps)}', (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 2)

            cv2.imshow('YOLOv8 Detection', frame)
            if cv2.waitKey(5) & 0xFF == 27:
                break

        cap.release()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Shoot detection using YOLOv8')
    parser.add_argument('-v', '--video', type=str, default='0', help='Path to video file or capture index')
    parser.add_argument('-m', '--model', type=str, default='yolov8m.pt', help='Path to YOLOv8 model')
    parser.add_argument('-s', '--save_dir', type=str, required=True, help='Directory to save frames of "shoot" class')
    parser.add_argument('-f', '--frame_interval', type=int, default=3, help='Interval between frames to save')
    args = parser.parse_args()

    detector = ObjectDetection(capture_index=args.video, save_dir=args.save_dir, model_path=args.model, frame_interval=args.frame_interval)
    detector()
