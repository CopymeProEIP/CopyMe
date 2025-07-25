import csv
import os
from ultralytics import YOLO
from pymongo import MongoClient
import torch
import cv2
import os
from ultralytics import YOLO
from sys import platform
from ..tools.utils import (
    load_labels,
    check_fileType,
    calculate_angle,
    Logger,
    DebugType
)
import numpy as np
from datetime import date, datetime
import json
from typing import List, Dict, Tuple, Any
import logging
import uuid
from config.db_models import FrameData, AngleData, Direction
from collections import deque

DEBUG = Logger(enabled=True)

#----------------------------------------------------
# check if the class csv file is available

CLASS_CSV = 'config/shoot.csv'

if not os.path.exists(CLASS_CSV):
    DEBUG.log(message=f"Class csv file {CLASS_CSV} not found")
    exit(1)

# VARIABLES
WINDOW_NAME='ShootAnalysis'
DEFAULT_SAVE_PATH='feedback'
DEFAULT_CAPTURE_INDEX="0"
DEFAULT_MODEL_PATH='model/yolov8m.pt'
DEFAULT_KEYPOINT_MODEL_PATH='model/yolov8l-pose.pt'
MIN_CONFIDENCE=0.6

# out = cv2.VideoWriter('output.mp4', cv2.VideoWriter_fourcc('m', 'p', '4', 'v'), 10, (640, 480))
#----------------------------------------------------

reference_data = {
    "shot_position": {
        "gender": "men",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    "shot_realese": {
        "gender": "men",
        "phase": "shot_realese",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    "shot_followthrough": {
        "gender": "men",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    }
}

#----------------------------------------------------
# YOLOv8 class to train, validate and infer the model

class YOLOv8:

    # Class mode
    MODES = ['debug', 'show']

    def __init__(self, capture_index: str = DEFAULT_CAPTURE_INDEX,
                save_path: str = DEFAULT_SAVE_PATH,
                load_labels_flag: bool = True,
                mode: str = MODES[0],
                verbose: bool = False):
        # check the device if cuda is available use it otherwise use cpu
        # check the platform and use mps to improve performance on mac
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.device = 'mps' if platform == 'darwin' else self.device
        self.capture_index = capture_index
        self.mode = mode
        self.CLASS_NAMES_DICT = None
        self.is_model_loaded = False
        self.is_keypoint_model_loaded = False
        self.save_path = save_path
        self.set_workdir(save_path)
        self.history = deque(maxlen=5)
        self.last_saved_class = None
        self.saved_frames_data = {}
        self.saved_classes = set()
        self.sync = False
        self.model = None  # Initialize model
        self.keypoint_model = None
        DEBUG.enable(enabled=mode == 'debug')

        self.verbose = verbose

        self.version = 1

        self.db = None
        self.collection = None
        self.sub_foldername_feedback: str = str(uuid.uuid4())

        if load_labels_flag:
            self.phases = load_labels(CLASS_CSV)
        else:
            self.phases = []

        DEBUG.log(message=f"Using YOLOv8 on {self.device}")
        DEBUG.log(message=f"Input: {self.capture_index}")
        DEBUG.log(message=f"Avalaible classes: {self.phases}")

        #MONGODB_URI = "mongodb+srv://copyme:dgg5kQCAVmGoJ4qD@cluster0.iea0zmj.mongodb.net/CopyMe?retryWrites=true&w=majority&appName=Cluster0"
        #self.connect_to_bdd(MONGODB_URI)

    def non_maximum_suppression(boxes, scores, threshold=MIN_CONFIDENCE):
      indices = cv2.dnn.NMSBoxes(boxes, scores, score_threshold=threshold, nms_threshold=0.4)
      return indices

    def set_workdir(self, save_dir: str):
        os.makedirs(save_dir, exist_ok=True)
        phases = ["shot_position", "shot_realese", "shot_followthrough"]
        for phase in phases:
          phase_dir = os.path.join(save_dir, phase)
          os.makedirs(phase_dir, exist_ok=True)
        # Save the metadata file
        metadata_file = os.path.join(save_dir, 'metadata.csv')
        with open(metadata_file, mode='w', newline='') as file:
          writer = csv.writer(file)
          writer.writerow(['frame_number', 'phase', 'confidence', 'timestamp'])

    def save_metadata(self, frame_number: int, current_phase: str, confidence: float, timestamp: float):
        metadata_file = os.path.join(self.save_path, 'metadata.csv')
        with open(metadata_file, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([frame_number, current_phase, confidence, timestamp])

    def temporal_smoothing(self, class_id: int) -> str:
        if len(self.history) == self.history.maxlen:
            self.history.append(class_id)
            avg_class_id = int(sum(self.history) / len(self.history))
            current_phase = self.phases[avg_class_id]
        return current_phase

    def __str__(self):
        data = {
            "device": self.device,
            "capture_index": self.capture_index,
            "mode": self.mode,
            "model_loaded": self.is_model_loaded,
            "keypoint_model_loaded": self.is_keypoint_model_loaded,
            "available_classes": self.phases,
            "version": self.version,
            "saved_frames_count": len(self.saved_frames_data),
        }
        return json.dumps(data, indent=4)

    def convert_numpy_to_python(self, data):
        """
        Convert numpy arrays and other numpy types to Python types.
        """
        if isinstance(data, dict):
            return {key: self.convert_numpy_to_python(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self.convert_numpy_to_python(item) for item in data]
        elif isinstance(data, np.ndarray):
            return data.tolist()  # Convertit un tableau numpy en liste Python
        elif isinstance(data, (np.float32, np.float64)):
            return float(data)  # Convertit un float numpy en float Python
        elif isinstance(data, (np.int32, np.int64)):
            return int(data)  # Convertit un int numpy en int Python
        else:
            return data  # Retourne les autres types inchangés

    def connect_to_bdd(self, uri):
        """Connect to the MongoDB 'CopyMe' database."""
        try:
            client = MongoClient(uri)
            self.db = client["CopyMe"]
            self.collection = self.db["processed_image"]

            existing_count = self.collection.count_documents({"url": self.capture_index})
            if existing_count > 0:
                self.version = existing_count + 1

            self.collection.insert_one({
                "url": self.capture_index,
                "frames": [],
                "created_at": datetime.combine(date.today(), datetime.min.time()),
                "version": self.version,
            })

            DEBUG.log(message=f"Connected to MongoDB: {self.db}")
            return self.db
        except Exception as e:
            DEBUG.log(type=DebugType.WARNING, message=f"Failed to connect to MongoDB: {e}")
            return None

    def get_latest_angle_collection(self):
        latest_data = self.collection.find_one(sort=[("_id", -1)])
        return latest_data

    def get_results(self):
        return self.result

    # load given model with YOLO
    def load_model(self, model_path=DEFAULT_MODEL_PATH):
        if self.mode == 'debug':
            DEBUG.log(message=f"Loading model: {model_path}")
        self.model = YOLO(model_path, verbose=self.verbose).to(self.device)
        self.CLASS_NAMES_DICT = self.model.model.names
        self.model.fuse()
        self.is_model_loaded = self.model is not None

    def load_keypoint_model(self, model_path=DEFAULT_KEYPOINT_MODEL_PATH):
        self.keypoint_model = YOLO(model_path, self.verbose).to(self.device)
        self.keypoint_model.fuse()
        self.is_keypoint_model_loaded = self.keypoint_model is not None

    # function that infer given image of video or camera and return the results
    def infer(self, frame, mode=['pose', 'object']):
        results = []
        if 'object' in mode:
            assert self.is_model_loaded, "Model not loaded"
            results = self.model(frame)
        if 'pose' in mode:
            assert self.is_keypoint_model_loaded, "Keypoint model not loaded"
            results = self.keypoint_model(frame)
        return results


    def pose_detector(self, frame, results_list, class_name, confidence) -> Tuple[Any, List, Dict]:
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
                if kp.shape[0] < 17:  # Ensure we have all 17 keypoints
                    continue
                # Store positions of all keypoints
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


    def draw_text(self, frame, text, position):
        font = cv2.FONT_HERSHEY_SIMPLEX
        x, y = position
        cv2.putText(frame, text, (x + 10, y), font, 0.4, (50, 205, 50), 1)
        return frame

    def draw_triangle(self, frame, pt1, pt2, pt3, alpha=0.5):
        overlay = frame.copy()
        output = frame.copy()

        triangle_cnt = np.array([pt1, pt2, pt3])
        if pt3[0] >= 1 and pt3[1] >= 1:
            cv2.drawContours(overlay, [triangle_cnt], 0, (0, 165, 255), -1)

        cv2.addWeighted(overlay, alpha, output, 1 - alpha, 0, output)
        return output

    def plot_result(self, results: list, frame) -> Tuple[Any, Dict]:
        highest_confidence = 0
        best_frame = None
        best_class_name = None
        best_angles = None
        result_frame = {}

        # loop over the results
        for result in results:
            # extract the boxes from cpu in numpy format for easy access and manipulation
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                # get the coordinates left top and right bottom of the box
                r = box.xyxy[0].astype(int)
                class_id = int(box.cls[0])  # Get class ID
                self.history.append(class_id)
                class_name = self.CLASS_NAMES_DICT[class_id] # Get class name

                # read existing file to check is the confidence is above the last saved class
                confidence_saved = 0

                # here i want to arround the confidence to 2 numbers after the point
                confidence = round(float(box.conf), 2)

                if confidence < MIN_CONFIDENCE:
                    DEBUG.log(message=f"{class_name}, conf: {confidence} below threshold, skipping.")
                    continue
                elif class_name in self.saved_classes:
                    if class_name in self.saved_frames_data:
                        saved_conf = self.saved_frames_data[class_name]
                        confidence_saved = float(saved_conf)
                        if confidence > confidence_saved:
                            DEBUG.log(message=f"{class_name}, conf: {confidence} above saved confidence, replacing.")
                            self.sync = True
                        else:
                            DEBUG.log(message=f"{class_name}, conf: {confidence} below saved confidence, skipping.")
                            continue
                elif class_name not in self.phases:
                    DEBUG.log(message=f"{class_name}, not in shoot classes, skipping.")
                    continue
                if self.sync == False:
                    DEBUG.log(message=f"{class_name}, conf: {confidence} above threshold, processing.")
                keypoints = self.infer(frame, mode=['pose'])
                frame, angles, result_frame = self.pose_detector(frame, keypoints, class_name, confidence)

                only_angles = [angle["angle"] for angle in angles]

                # Update the best frame if the current one has higher confidence
                if confidence > highest_confidence:
                    highest_confidence = confidence
                    best_frame = frame
                    best_class_name = class_name
                    best_angles = only_angles

        # Save the best frame
        if best_frame is not None and best_class_name is not None:
            self.saved_frames_data[best_class_name] = f"{highest_confidence}"
            frame, frame_path = self.save_frame(best_frame, self.save_path, best_class_name, best_angles, sync=self.sync)
            if result_frame != {} or result_frame!= None:
                result_frame["url_path_frame"] = frame_path
        return frame, result_frame

    def save_frame(self, frame, output_path: str, class_name: str, angles: List, sync=False) -> Tuple[Any, str]:
        filename_save: str = None

        if class_name in self.phases:
            if class_name not in self.saved_classes or class_name in self.saved_classes and sync == True:
                # Ensure angles are present before saving the frame
                if not angles:
                    DEBUG.log(message=f"No angles detected for class {class_name}, skipping save.")
                    return
                class_folder = os.path.join(output_path, self.sub_foldername_feedback, class_name)
                if not os.path.exists(class_folder):
                    os.makedirs(class_folder)
                filename_save = class_name + "_" + str(uuid.uuid4())
                frame_path = f"{class_folder}/{filename_save}.jpg"
                cv2.imwrite(frame_path, frame)
                if sync == False:
                    self.saved_classes.add(class_name)
                angle_file_path = os.path.join(class_folder, 'angles.txt')
                with open(angle_file_path, 'w') as file:
                    file.write(f'Class: {class_name}\n')
                    for i, angle in enumerate(angles, 1):  # Fix here
                        file.write(f'Angle {i}: {angle:.0f}\n')  # Assuming angles are simple float values
                if len(self.saved_classes) == len(self.phases):
                    self.saved_classes.clear()
                DEBUG.log(message=f"saved class {self.saved_classes}")
            else:
                DEBUG.log(message=f"{class_name} already saved in the current cycle")
        else:
            DEBUG.log(message=f"{class_name} not found in the class csv file")
        if self.sync == True:
            self.sync = False
        return frame, frame_path

    def save_angle_in_bdd(self):
        DEBUG.log(message=f"result : {self.result}")
        #self.collection.update_one(
        #    {"url": self.capture_index, "version": self.version},
        #    {
        #        "$push": {
        #            "frames": {
        #                "data": self.result,
        #            }
        #        },
        #    }
        #)
        self.result.clear()
        self.result = []
        return

    def __check_alignment(self, angle_name: str, measured_angle: float, reference_entry: Dict) -> Tuple[bool, float]:

        angle_ref = reference_entry["angles"].get(angle_name)

        if angle_ref is None or angle_ref["ref"] is None or angle_ref["tolerance"] is None:
            return False, None

        min_angle = angle_ref["ref"] - angle_ref["tolerance"]
        max_angle = angle_ref["ref"] + angle_ref["tolerance"]

        is_correct = min_angle <= measured_angle <= max_angle

        error = measured_angle - angle_ref["ref"]

        return is_correct, error

    def __generate_feedback(self, angle_name: str, error: float):

        if angle_name == "hip":
            action = "réduire l'extension" if error > 0 else "augmenter l'extension"
            return f"Veuillez {action} de la hanche de {abs(error):.1f}° pour améliorer votre stabilité pendant le tir."

        elif angle_name == "knee":
            action = "augmenter la flexion" if error < 0 else "réduire la flexion"
            return f"Veuillez {action} au niveau du genou de {abs(error):.1f}° pour adopter une meilleure position de tir."

        elif angle_name == "ankle":
            action = "augmenter la flexion plantaire" if error < 0 else "réduire la flexion plantaire"
            return f"Veuillez {action} de la cheville de {abs(error):.1f}° pour ajuster votre équilibre pendant le tir."

        elif angle_name == "elbow":
            action = "augmenter la flexion" if error < 0 else "réduire la flexion"
            return f"Veuillez {action} au niveau du coude de {abs(error):.1f}° pour un meilleur alignement lors de la poussée du ballon."

        else:
            return f"L'angle '{angle_name}' présente un écart de {abs(error):.1f}°, mais aucun conseil spécifique n'est disponible."

    def __feedback_key_tuple_to_str(self, key: Tuple[str, Direction]) -> str:
        return f"{key[0]}|{key[1].name}"

    def __feedback_key_str_to_tuple(self, key: str) -> Tuple[str, Direction]:
        part1, part2 = key.split("|")
        return part1, Direction[part2]

    def analyze_phase(self, measured_angles: List[AngleData], phase_name: str) -> Dict:
        messages = {}
        for angle_data in measured_angles:
            angle_name = angle_data.angle_name[0]
            feedback_key = self.__feedback_key_tuple_to_str(angle_data.angle_name)
            is_correct, error = self.__check_alignment(angle_name, angle_data.angle, reference_data[phase_name])
            if is_correct:
                messages[f'{feedback_key}'] = f"L'angle '{angle_name}' est correct ({angle_data.angle}°). Bon mouvement !"
            else:
                if error is not None:
                    feedback = self.__generate_feedback(angle_name, error)
                    messages[f'{feedback_key}'] = feedback
                else:
                    messages[f'{feedback_key}'] = f"L'angle '{angle_name}' n'est pas défini dans les données de référence."
        return messages

    def __reset_ressources(self):
        self.sub_foldername_feedback = str(uuid.uuid4())

    def __capture_image(self) -> List[FrameData]:
        results_database: List[FrameData] = []

        DEBUG.log(message=f"Processing image {self.capture_index}")
        frame = cv2.imread(self.capture_index)
        results = self.infer(frame, mode=['object'])
        frame, result_frame = self.plot_result(results, frame)
        results_database.append(FrameData.model_validate(result_frame))

        if len(results_database) > 0:
            feedback = self.analyze_phase(results_database[0].angles, results_database[0].class_name)
            results_database[0].feedback = feedback
            logging.debug(f"advice for the users: {results_database[0].feedback}")

        return results_database

    def __capture_video(self) -> List[FrameData]:
        results_database: List[FrameData] = []

        DEBUG.log(message=f"Processing video {self.capture_index}")
        cap = cv2.VideoCapture(self.capture_index)
        while cap.isOpened():
            success, frame = cap.read()
            if success:
                results = self.infer(frame, mode=['object'])
                frame, result_frame = self.plot_result(results, frame)
                if result_frame != {}:
                    results_database.append(FrameData.model_validate(result_frame))

                    if len(results_database) > 0:
                        feedback = self.analyze_phase(results_database[-1].angles, results_database[-1].class_name)
                        results_database[-1].feedback = feedback
                    if self.mode == 'show':
                        cv2.imshow(WINDOW_NAME, frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
            else:
                break

        return results_database

    # function that capture the image or video and process it
    def capture(self, filename: str = None) -> List[FrameData]:
        self.capture_index = filename if filename else self.capture_index
        # check i # Liste des positions des keypoints [x, y]f is an image or video
        results_database: List[FrameData] = []
        file_type = check_fileType(self.capture_index)

        if file_type == 'image':
            return self.__capture_image()

        elif file_type == 'video':
            return self.__capture_video()
        else:
            DEBUG.log(message=f"Processing camera index {self.capture_index}")
            cap = cv2.VideoCapture(self.capture_index)
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.infer(frame, mode=['object'])
                    frame, result_frame = self.plot_result(results, frame)
                    if self.mode == 'show':
                        cv2.imshow(WINDOW_NAME, frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    break
        DEBUG.log(message=f"Best data saved {self.saved_frames_data}")
        if file_type == 'video' and file_type != 'image':
            cap.release()
            cv2.destroyAllWindows()

        self.__reset_ressources()

        return results_database

#------------------------------------------------

# ressources
# https://docs.ultralytics.com

# example of usage

# if __name__ == '__main__':
#    yolo = YOLOv8(capture_index='./test/a.jpg')
#    yolo.load_model('best.pt')
#    yolo.load_keypoint_model()
#    yolo.capture()
