import json
import cv2
import numpy as np
import torch
from ultralytics import YOLO
from sys import platform
from .utils import calculate_angle
import logging

class YOLOv8Base:
    def __init__(self, model_path: str, verbose: bool = False):
        self.model_path = model_path
        self.verbose = verbose
        self.device = self._get_device()
        self.model = None
        self.is_model_loaded = False
        self.version = 1
        self._load_model()

    # -------------------- Initialization Helpers --------------------
    def _get_device(self) -> str:
        """Determine the device to use for computation."""
        if torch.cuda.is_available():
            return 'cuda'
        return 'mps' if platform == 'darwin' else 'cpu'

    def __str__(self):
        data = {
            "device": self.device,
            "verbose": self.verbose,
            "model_path": self.model_path,
            "model_loaded": self.is_model_loaded,
            "version": self.version,
        }
        return json.dumps(data, indent=4)

    # -------------------- Model Loading --------------------
    def _load_model(self):
        """Load the YOLO model."""
        if self.verbose:
          logging.debug(f"Loading model from {self.model_path} on device {self.device}")
        self.model = YOLO(self.model_path, verbose=self.verbose).to(self.device)
        self.CLASS_NAMES_DICT = self.model.model.names
        self.model.fuse()
        self.is_model_loaded = self.model is not None

    # -------------------- Inference --------------------
    def _infer(self, frame) -> YOLO:
        """Run inference on the given frame."""
        if not self.is_model_loaded:
            raise RuntimeError("Model not loaded. Please load the model before inference.")
        return self.model(frame)

    # -------------------- Data Conversion --------------------
    def convert_numpy_to_python(self, data):
        """
        Convert numpy data types to Python native types.
        """
        if isinstance(data, dict):
            return {key: self.convert_numpy_to_python(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self.convert_numpy_to_python(item) for item in data]
        elif isinstance(data, np.ndarray):
            return data.tolist() # convert numpy array to list
        elif isinstance(data, (np.float32, np.float64)):
            return float(data) # convert numpy float to python float
        elif isinstance(data, (np.int32, np.int64)):
            return int(data)  # convert numpy int to python int
        else:
            return data  # return as is

    # -------------------- Drawing Helpers --------------------
    def draw_angle_and_triangle(self, frame, kp, start, end, keypoint_names):
        x1, y1 = int(kp[start][0]), int(kp[start][1])
        x2, y2 = int(kp[end][0]), int(kp[end][1])
        angle = None
        third_point = None

        if x1 != 0 and y1 != 0 and x2 != 0 and y2 != 0:
            if start == 5 and end == 7 and len(kp) > 9:
                third_point = 9
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[9][0]), int(kp[9][1])))
                angle = calculate_angle(kp[start], kp[7], kp[9])
                frame = self.draw_text(frame, f'{keypoint_names[7]}: {angle:.0f}', (x2, y2))
            elif start == 6 and end == 8 and len(kp) > 10:
                third_point = 10
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[10][0]), int(kp[10][1])))
                angle = calculate_angle(kp[start], kp[8], kp[10])
                frame = self.draw_text(frame, f'{keypoint_names[8]}: {angle:.0f}', (x2, y2))
            elif start == 11 and end == 13 and len(kp) > 15:
                third_point = 15
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[15][0]), int(kp[15][1])))
                angle = calculate_angle(kp[start], kp[13], kp[15])
                frame = self.draw_text(frame, f'{keypoint_names[13]}: {angle:.0f}', (x2, y2))
            elif start == 12 and end == 14 and len(kp) > 16:
                third_point = 16
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[16][0]), int(kp[16][1])))
                angle = calculate_angle(kp[start], kp[14], kp[16])
                frame = self.draw_text(frame, f'{keypoint_names[14]}: {angle:.0f}', (x2, y2))

        return angle, frame, third_point

    def draw_triangle(self, frame, pt1, pt2, pt3, alpha=0.5):
        overlay = frame.copy()
        output = frame.copy()

        triangle_cnt = np.array([pt1, pt2, pt3])
        if pt3[0] >= 1 and pt3[1] >= 1:
            cv2.drawContours(overlay, [triangle_cnt], 0, (0, 165, 255), -1)

        cv2.addWeighted(overlay, alpha, output, 1 - alpha, 0, output)
        return output
    def draw_text(self, frame, text, position):
        font = cv2.FONT_HERSHEY_SIMPLEX
        x, y = position
        cv2.putText(frame, text, (x + 10, y), font, 0.4, (50, 205, 50), 1)
        return frame
