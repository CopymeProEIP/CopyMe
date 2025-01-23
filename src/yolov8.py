import csv

import os
from utils import load_labels, check_fileType
from ultralytics import YOLO
from pymongo import MongoClient
import torch
import cv2
import os
from ultralytics import YOLO
from sys import platform
from utils import (
    load_labels,
    check_fileType,
    calculate_angle,
    Debugger,
    DebugType
)
import numpy as np
from datetime import date, datetime

DEBUG = Debugger(enabled=True)

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


#----------------------------------------------------
# YOLOv8 class to train, validate and infer the model

class YOLOv8:

    # Class mode
    MODES = ['debug', 'show']

    def __init__(self, capture_index=DEFAULT_CAPTURE_INDEX, save_path=DEFAULT_SAVE_PATH, load_labels_flag=True, mode=MODES[0]):
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
        self.last_saved_class = None
        self.saved_frames_data = {}
        self.saved_classes = set()
        self.sync = False
        self.model = None  # Initialize model
        self.keypoint_model = None

        self.result = []
        self.version = 1

        self.db = None
        self.collection = None

        if load_labels_flag:
            self.shoot_classes = load_labels(CLASS_CSV)
        else:
            self.shoot_classes = []

        DEBUG.log(message=f"Using YOLOv8 on {self.device}")
        DEBUG.log(message=f"Input: {self.capture_index}")
        DEBUG.log(message=f"Avalaible classes: {self.shoot_classes}")

        MONGODB_URI = "mongodb+srv://copyme:dgg5kQCAVmGoJ4qD@cluster0.iea0zmj.mongodb.net/CopyMe?retryWrites=true&w=majority&appName=Cluster0"
        self.connect_to_bdd(MONGODB_URI)


    def convert_numpy_to_python(self, data):
        """
        Convertit les types numpy en types Python natifs dans une structure de données.
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
        DEBUG.log(message=f"Using model: {model_path}")
        self.model = YOLO(model_path).to(self.device)
        self.CLASS_NAMES_DICT = self.model.model.names
        self.model.fuse()  # Fuse layers for faster inference
        self.is_model_loaded = self.model is not None

    def load_keypoint_model(self, model_path=DEFAULT_KEYPOINT_MODEL_PATH):
        self.keypoint_model = YOLO(model_path).to(self.device)
        self.keypoint_model.fuse()  # Fuse layers for faster inference
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


    def pose_detector(self, frame, results_list, class_name, confidence):
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

        angles_with_points = []
        angles_tmp = []
        keypoints_positions = {}

        for results in results_list:
            # Extract keypoints coordinates
            if not hasattr(results, 'keypoints') or results.keypoints is None:
                continue

            keypoints = results.keypoints.xy.cpu().numpy()  # Assuming keypoints are in this format

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

                        # Append angle and linked points
                        angles_with_points.append({
                            "start_point": start_name,
                            "end_point": end_name,
                            "third_point": third_point,
                            "angle": angle
                        })
                        angles_tmp.append({
                            "start_point": start,
                            "end_point": end,
                            "third_point": third_point,
                            "angle": angle
                        })

                self.result.append({
                    "class_name": class_name,
                    "keypoints_positions": self.convert_numpy_to_python(kp),
                    "angles": self.convert_numpy_to_python(angles_tmp),
                })
                angles_tmp.clear()
                angles_tmp = []


        return frame, angles_with_points


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

    def plot_result(self, results: list, frame):
        highest_confidence = 0
        best_frame = None
        best_class_name = None
        best_angles = None

        # loop over the results
        for result in results:
            # extract the boxes from cpu in numpy format for easy access and manipulation
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                # get the coordinates left top and right bottom of the box
                r = box.xyxy[0].astype(int)
                class_id = int(box.cls[0])  # Get class ID
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
                elif class_name not in self.shoot_classes:
                    DEBUG.log(message=f"{class_name}, not in shoot classes, skipping.")
                    continue
                if self.sync == False:
                    DEBUG.log(message=f"{class_name}, conf: {confidence} above threshold, processing.")
                keypoints = self.infer(frame, mode=['pose'])
                frame, angles = self.pose_detector(frame, keypoints, class_name, confidence)

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
            self.save_frame(best_frame, self.save_path, best_class_name, best_angles, sync=self.sync)
        return frame



    def save_frame(self, frame, output_path, class_name, angles, sync=False):
        if class_name in self.shoot_classes:
            if class_name not in self.saved_classes or class_name in self.saved_classes and sync == True:
                # Ensure angles are present before saving the frame
                if not angles:
                    DEBUG.log(message=f"No angles detected for class {class_name}, skipping save.")
                    return
                class_folder = os.path.join(output_path, class_name)
                if not os.path.exists(class_folder):
                    os.makedirs(class_folder)
                frame_path = f"{class_folder}/{class_name}.jpg"
                cv2.imwrite(frame_path, frame)
                if sync == False:
                    self.saved_classes.add(class_name)
                angle_file_path = os.path.join(class_folder, 'angles.txt')
                with open(angle_file_path, 'w') as file:
                    file.write(f'Class: {class_name}\n')
                    for i, angle in enumerate(angles, 1):  # Fix here
                        file.write(f'Angle {i}: {angle:.0f}\n')  # Assuming angles are simple float values
                if len(self.saved_classes) == len(self.shoot_classes):
                    self.saved_classes.clear()
                DEBUG.log(message=f"saved class {self.saved_classes}")
            else:
                DEBUG.log(message=f"{class_name} already saved in the current cycle")
        else:
            DEBUG.log(message=f"{class_name} not found in the class csv file")
        if self.sync == True:
            self.sync = False
        return frame


    def save_angle_in_bdd(self):
        self.collection.update_one(
            {"url": self.capture_index, "version": self.version},
            {
                "$push": {
                    "frames": {
                        "data": self.result,
                    }
                },
            }
        )
        self.result.clear()
        self.result = []
        return


    # function that capture the image or video and process it
    def capture(self):
        # check if is an image or video
        file_type = check_fileType(self.capture_index)
        if file_type == 'image':
            DEBUG.log(message=f"Processing image {self.capture_index}")
            frame = cv2.imread(self.capture_index)
            results = self.infer(frame, mode=['object'])
            self.plot_result(results, frame)
            self.save_angle_in_bdd()
        elif file_type == 'video':
            DEBUG.log(message=f"Processing video {self.capture_index}")
            cap = cv2.VideoCapture(self.capture_index)
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.infer(frame, mode=['object'])
                    self.plot_result(results, frame)
                    self.save_angle_in_bdd()
                    if self.mode == 'show':
                        cv2.imshow(WINDOW_NAME, frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    break
        else:
            DEBUG.log(message=f"Processing camera index {self.capture_index}")
            cap = cv2.VideoCapture(self.capture_index)
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.infer(frame, mode=['object'])
                    self.plot_result(results, frame)
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

#------------------------------------------------

# ressources
# https://docs.ultralytics.com

# example of usage

# if __name__ == '__main__':
#    yolo = YOLOv8(capture_index='./test/a.jpg')
#    yolo.load_model('best.pt')
#    yolo.load_keypoint_model()
#    yolo.capture()