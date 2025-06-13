from collections import deque
import csv
from typing import Any, Dict, Tuple, List
import uuid
import cv2
import numpy as np
from ultralytics import YOLO
from .utils import check_fileType, load_phases, FileType
import logging
import os
from enum import Enum
from filterpy.kalman import KalmanFilter
import hashlib
from config.db_models import FrameData
from .yolov8_base import YOLOv8Base
from .pose_estimation import PoseEstimation
import supervision as sv

WINDOW_NAME = 'ShootAnalysis'
DEFAULT_SAVE_PATH = 'feedback'
DEFAULT_CAPTURE_INDEX = "0"
DEFAULT_MODEL_PATH = 'model/yolov8m.pt'
DEFAULT_KEYPOINT_MODEL_PATH = 'model/yolov8l-pose.pt'
CONFIDENCE_THRESHOLD = 0.35

class PhaseDetection(YOLOv8Base):
    def __init__(self, input: str = DEFAULT_CAPTURE_INDEX,
                 model_path: str = DEFAULT_MODEL_PATH,
                 save_dir: str = DEFAULT_SAVE_PATH,
                 display: bool = False,
                 metadata: bool = False,
                 kalman_filter: bool = False,
                 temporal_smoothing: bool = True,
                 conf_threshold: float = CONFIDENCE_THRESHOLD,
                 keypoint_model_path: str = DEFAULT_KEYPOINT_MODEL_PATH,
                 verbose: bool = False):
        super().__init__(model_path=model_path, verbose=verbose)
        self.keypoint_model = PoseEstimation(model_path=keypoint_model_path, verbose=verbose)
        self.save_dir = save_dir
        self.metadata = metadata
        self.kalman_filter_enabled = kalman_filter
        self.temporal_smoothing_enabled = temporal_smoothing
        self.conf_threshold = conf_threshold
        self.input = input
        self.display = display
        self.frame_count = 0
        self.saved_frames_data = {}
        self.sync = False
        self.saved_classes = set()
        self.history = deque(maxlen=5)
        self.phases = load_phases('config/shoot.csv')
        self.kalman_filter = self._initialize_kalman_filter()
        self.last_frame_hash = None
        self.best_frames = {}
        self.all_frames = {}
        self._setup_workdir()

    # -------------------- Initialization Helpers --------------------
    def _initialize_kalman_filter(self) -> KalmanFilter:
        kf = KalmanFilter(dim_x=2, dim_z=1)
        kf.x = np.array([0., 0.])
        kf.F = np.array([[1., 1.], [0., 1.]])
        kf.H = np.array([[1., 0.]])
        kf.P *= 1000.
        kf.R = 5
        kf.Q = 0.1
        return kf

    def _setup_workdir(self):
        if self.verbose:
          logging.debug(f"Setting up workdir: {self.save_dir}")
        os.makedirs(self.save_dir, exist_ok=True)
        for phase in self.phases:
            os.makedirs(os.path.join(self.save_dir, phase), exist_ok=True)
        if self.metadata:
          self._create_metadata_file()

    def _create_metadata_file(self):
        metadata_file = os.path.join(self.save_dir, 'metadata.csv')
        with open(metadata_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['frame_number', 'phase', 'confidence', 'timestamp'])

    # -------------------- Frame Processing --------------------
    def _calculate_frame_hash(self, frame: Any) -> str:
        return hashlib.md5(frame.tobytes()).hexdigest()

    def _save_best_frame(self, frame: Any, result_frame: Dict, current_phase: str, confidence: float, timestamp: float):
        """Update the best frame for a phase if it has the highest confidence."""
        if current_phase not in self.best_frames or confidence > self.best_frames[current_phase]['confidence']:
            self.best_frames[current_phase] = {
                'frame_number': self.frame_count,
                'timestamp': timestamp,
                'frame': frame,
                'results': result_frame,
                'confidence': confidence
            }
        if self.verbose:
          logging.debug(f"Updated best frame for phase '{current_phase}' with confidence {confidence:.2f}")

    def _save_all_best_frames(self) -> List[Dict]:
        all_frames_metadata = []
        for class_name, res in self.all_frames.items():
            phase_dir = os.path.join(self.save_dir, class_name)
            filename_save = f"{class_name}_{uuid.uuid4()}.jpg"
            frame_path = os.path.join(phase_dir, filename_save)
            cv2.imwrite(frame_path, res['frame'])  # Save the frame
            logging.debug(f"Saved frame for class '{class_name}' to {frame_path}")
            res['results']['url_path_frame'] = frame_path
            all_frames_metadata.append(res['results'])

        return all_frames_metadata

    def _apply_temporal_smoothing(self, class_id: int) -> int:
        self.history.append(class_id)
        smoothed_class_id = int(sum(self.history) / len(self.history))
        if self.verbose:
          logging.debug(f"Smoothed class ID: {smoothed_class_id}")
        return smoothed_class_id

    def _apply_kalman_filter(self, class_id: int) -> int:
        self.kalman_filter.predict()
        self.kalman_filter.update(class_id)
        smoothed_class_id = int(self.kalman_filter.x[0])
        if self.verbose:
          logging.debug(f"Kalman-filtered class ID: {smoothed_class_id}")
        return smoothed_class_id

    def _is_frame_redundant(self, frame_hash: str) -> bool:
        return frame_hash == self.last_frame_hash

    def _get_highest_confidence_detection(self, detections: sv.Detections) -> Tuple[int, float]:
        """Return the class ID and confidence of the detection with the highest confidence."""
        if self.verbose:
          logging.debug("Processing detections for highest confidence.")
        max_conf_index = np.argmax(detections.confidence)
        class_id = int(detections.class_id[max_conf_index])
        confidence = float(detections.confidence[max_conf_index])
        return class_id, confidence

    def plot_frame(self, boxes, frame, timestamp: float) -> Any:
        for box in boxes:
            class_id = int(box.cls)
            confidence = float(box.conf)
            current_phase = self.CLASS_NAMES_DICT[class_id]
            keypoints = self.keypoint_model._infer(frame)
            frame, _, result_frame = self.keypoint_model.pose_detector(frame, keypoints, current_phase, confidence)
            self.all_frames[current_phase] = {
              'frame_number': self.frame_count,
              'timestamp': timestamp,
              'frame': frame,
              'results': result_frame,
              'confidence': confidence
            }
        return frame

    def plot_result(self, results, frame, timestamp: float) -> Any:
        """Process inference results and update the best frame for each phase."""
        frame_hash = self._calculate_frame_hash(frame)
        if self._is_frame_redundant(frame_hash):
            return frame
        for result in results:
            self.plot_frame(result.boxes.cpu().numpy(), frame, timestamp)
            detections = sv.Detections.from_ultralytics(result).with_nms(threshold=self.conf_threshold)
            if not detections:
                continue
            class_id, confidence = self._get_highest_confidence_detection(detections)
            if self.kalman_filter_enabled:
                class_id = self._apply_kalman_filter(detections.class_id[0])
            if self.temporal_smoothing_enabled:
                class_id = self._apply_temporal_smoothing(detections.class_id[0])
            if confidence <= self.conf_threshold:
                continue
            current_phase = self.CLASS_NAMES_DICT[class_id]
            keypoints = self.keypoint_model._infer(frame)
            frame, _, result_frame = self.keypoint_model.pose_detector(frame, keypoints, current_phase, confidence)
            self._save_best_frame(frame, result_frame, current_phase, confidence, timestamp)

        self.last_frame_hash = frame_hash
        self.frame_count += 1
        return frame

    # -------------------- Capture Methods --------------------
    def __capture_image(self) -> List[FrameData]:
        results_database: List[FrameData] = []
        frame = cv2.imread(self.input)
        results = self._infer(frame)
        self.plot_result(results, frame, timestamp=0)
        results_database.extend(FrameData.model_validate(metadata) for metadata in self._save_all_best_frames())
        return results_database

    def __capture_video(self) -> List[FrameData]:
        results_database: List[FrameData] = []
        cap = cv2.VideoCapture(self.input)
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            results = self._infer(frame)
            timestamp = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
            self.plot_result(results, frame, timestamp)
            if self.display:
                cv2.imshow(WINDOW_NAME, frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        cap.release()
        cv2.destroyAllWindows()
        results_database.extend(FrameData.model_validate(metadata) for metadata in self._save_all_best_frames())
        return results_database

    def run(self, filename: str = None) -> List[FrameData]:
        self.input = filename if filename else self.input
        file_type = check_fileType(self.input)
        if file_type == FileType.IMAGE:
            return self.__capture_image()
        elif file_type == FileType.VIDEO:
            return self.__capture_video()
        else:
            return self.__capture_video()
