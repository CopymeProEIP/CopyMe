import csv
import os
from utils import load_labels, check_fileType

#----------------------------------------------------
# YOLOv8 class to train, validate and infer the model
from ultralytics import YOLO
import torch
import cv2
import os
from sys import platform
import numpy as np

class_csv = 'shoot.csv'
window_name='ShootAnalysis'
default_save_path = 'feedback'
default_capture_index = "0"
default_model_path = 'yolov8m.pt'
default_keypoint_model_path = 'yolov8l-pose.pt'
default_data = 'data.yaml'

# out = cv2.VideoWriter('output.mp4', cv2.VideoWriter_fourcc('m', 'p', '4', 'v'), 10, (640, 480))

class YOLOv8:
    def __init__(self, capture_index=default_capture_index, save_path=default_save_path, load_labels_flag=True):
        # check the device if cuda is available use it otherwise use cpu
        # check the platform and use mps to improve performance on mac
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.device = 'mps' if platform == 'darwin' else self.device
        self.capture_index = capture_index
        self.CLASS_NAMES_DICT = None
        self.is_model_loaded = False
        self.is_keypoint_model_loaded = False
        self.save_path = save_path
        self.last_saved_class = None
        self.saved_classes = set()
        self.model = None  # Initialize model
        self.keypoint_model = None  # Initialize keypoint_model

        print(f"Using YOLOv8 on {self.device}")
        print(f"Capture index: {self.capture_index}")
        if load_labels_flag:
            self.shoot_classes = load_labels(class_csv)
        else:
            self.shoot_classes = []
        print(f"Classes available: {self.shoot_classes}")
        print(f"Frame saved to: {self.save_path}")

    # load given model with YOLO
    def load_model(self, model_path=default_model_path):
        self.model = YOLO(model_path).to(self.device)
        self.CLASS_NAMES_DICT = self.model.model.names
        self.model.fuse()  # Fuse layers for faster inference
        self.is_model_loaded = self.model is not None

    def load_keypoint_model(self, model_path=default_keypoint_model_path):
        self.keypoint_model = YOLO(model_path).to(self.device)
        self.keypoint_model.fuse()  # Fuse layers for faster inference
        print(f"Keypoint model loaded from {model_path}")
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
    
    def pose_detector(self, frame, results_list):
        skeleton = [
            (5, 6),  # Shoulders connection
            (5, 11), (6, 12),  # Shoulders to hips
            (11, 12),  # Hips connection
            (5, 7), (7, 9),  # Left arm
            (6, 8), (8, 10),  # Right arm
            (11, 13), (13, 15),  # Left leg
            (12, 14), (14, 16)  # Right leg
        ]

        keypoint_names = {
            7: "L elbow", 8: "R elbow",
            13: "L knee", 14: "R knee"
        }

        angles = []

        for results in results_list:
            keypoints = results.keypoints.xy.cpu().numpy()
            for kp in keypoints:
                if kp.shape[0] != 17:
                    continue
                for start, end in skeleton:
                    angle, frame = self.draw_angle_and_triangle(frame, kp, start, end, keypoint_names)
                    if angle is not None:
                        angles.append((keypoint_names.get(end, f'Keypoint {end}'), angle))

        return frame, angles

    def draw_angle_and_triangle(self, frame, kp, start, end, keypoint_names):
        x1, y1 = int(kp[start][0]), int(kp[start][1])
        x2, y2 = int(kp[end][0]), int(kp[end][1])
        angle = None
        if x1 != 0 and y1 != 0 and x2 != 0 and y2 != 0:
            if start == 5 and end == 7 and len(kp) > 9:
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[9][0]), int(kp[9][1])))
                angle = self.calculate_angle(kp[start], kp[7], kp[9])
                frame = self.draw_text(frame, f'{keypoint_names[7]}: {angle:.0f}', (x2, y2))
            elif start == 6 and end == 8 and len(kp) > 10:
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[10][0]), int(kp[10][1])))
                angle = self.calculate_angle(kp[start], kp[8], kp[10])
                frame = self.draw_text(frame, f'{keypoint_names[8]}: {angle:.0f}', (x2, y2))
            elif start == 11 and end == 13 and len(kp) > 15:
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[15][0]), int(kp[15][1])))
                angle = self.calculate_angle(kp[start], kp[13], kp[15])
                frame = self.draw_text(frame, f'{keypoint_names[13]}: {angle:.0f}', (x2, y2))
            elif start == 12 and end == 14 and len(kp) > 16:
                frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[16][0]), int(kp[16][1])))
                angle = self.calculate_angle(kp[start], kp[14], kp[16])
                frame = self.draw_text(frame, f'{keypoint_names[14]}: {angle:.0f}', (x2, y2))
        return angle, frame

    def draw_text(self, frame, text, position):
        font = cv2.FONT_HERSHEY_SIMPLEX
        x, y = position
        cv2.putText(frame, text, (x + 10, y), font, 0.4, (50, 205, 50), 1)
        return frame

    def draw_triangle(self, frame, pt1, pt2, pt3, alpha=0.2):
        overlay = frame.copy()
        output = frame.copy()

        triangle_cnt = np.array([pt1, pt2, pt3])
        if pt3[0] >= 1 and pt3[1] >= 1:
            cv2.drawContours(overlay, [triangle_cnt], 0, (0, 165, 255), -1)

        cv2.addWeighted(overlay, alpha, output, 1 - alpha, 0, output)
        return output

    def calculate_angle(self, joint1, joint2, joint3):
        v1 = np.array(joint1) - np.array(joint2)
        v2 = np.array(joint3) - np.array(joint2)
        cos_theta = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        angle_rad = np.arccos(np.clip(cos_theta, -1.0, 1.0))
        angle_deg = np.degrees(angle_rad)
        return angle_deg

    def plot_result(self, results: list, frame):
        # loop over the results
        for result in results:
            # extract the boxes from cpu in numpy format for easy access and manipulation
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                # get the coordinates left top and right bottom of the box
                r = box.xyxy[0].astype(int)
                class_id = int(box.cls[0])  # Get class ID
                class_name = self.CLASS_NAMES_DICT[class_id] # Get class name
                print(f"Class: {class_name}, Box: {r}")

                # save the frame with the class name and get keypoints
                keypoints = self.infer(frame, mode=['pose'])
                frame, angles = self.pose_detector(frame, keypoints)
                self.save_frame(frame, self.save_path, class_name, angles)
        return frame
    
    # function that save the frame with the class name
    def save_frame(self, frame, output_path, class_name, angles):
        if class_name in self.shoot_classes:
            if class_name not in self.saved_classes or len(self.saved_classes) == len(self.shoot_classes):
                class_folder = os.path.join(output_path, class_name)
                if not os.path.exists(class_folder):
                    os.makedirs(class_folder)
                print(f"Saving frame with class {class_name}")
                img_id = len(os.listdir(class_folder)) + 1
                frame_path = f"{class_folder}/{class_name}_{img_id}.jpg"
                cv2.imwrite(frame_path, frame)
                self.saved_classes.add(class_name)
                
                # Save the angles in a text file
                angle_file_path = os.path.join(class_folder, 'angles.txt')
                with open(angle_file_path, 'w') as file:
                    file.write(f'Class: {class_name}\n')
                    for i, (keypoint_name, angle) in enumerate(angles, 1):
                        file.write(f'{keypoint_name}: {angle:.0f}\n')
                
                if len(self.saved_classes) == len(self.shoot_classes):
                    self.saved_classes.clear()
            else:
                print(f"Class {class_name} already saved in the current cycle")
        else:
            print(f"Class {class_name} not found in the class csv file")


    # function that capture the image or video and process it
    def capture(self):
        # check if is an image or video
        if check_fileType(self.capture_index) == 'image':
            print(f"Processing image {self.capture_index}")
            frame = cv2.imread(self.capture_index)
            results = self.infer(frame, mode=['object'])
            self.plot_result(results, frame)
        elif check_fileType(self.capture_index) == 'video':
            print(f"Processing video {self.capture_index}")
            cap = cv2.VideoCapture(self.capture_index)
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.infer(frame, mode=['object'])
                    self.plot_result(results, frame)
                    cv2.imshow(window_name, frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    break
            cap.release()
            cv2.destroyAllWindows()
        else:
            print(f"Processing camera index {self.capture_index}")
            cap = cv2.VideoCapture(self.capture_index)
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.infer(frame, mode=['object'])
                    self.plot_result(results, frame)
                    cv2.imshow(window_name, frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    break
            cap.release()
            cv2.destroyAllWindows()

if __name__ == '__main__':
    yolo = YOLOv8(capture_index='./test/a.jpg')
    yolo.load_model('best.pt')
    yolo.load_keypoint_model()
    yolo.capture()
#------------------------------------------------
