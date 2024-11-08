import argparse
import torch
import numpy as np
import cv2
from ultralytics import YOLO

class ObjectDetection:
    def __init__(self, capture_index, model_path='../../runs/detect/train5/weights/best.pt'):
        self.capture_index = capture_index
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print("Using Device: ", self.device)

        self.model = self.load_model(model_path)

    def load_model(self, model_path):
        model = YOLO(model_path).to(self.device)
        model.fuse()
        return model

    def predict(self, frame):
        results = self.model(frame)
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

        for results in results_list:
            keypoints = results.keypoints.xy.cpu().numpy()

            for kp in keypoints:
                if kp.shape[0] != 17:
                    continue

                for start, end in skeleton:
                    x1, y1 = int(kp[start][0]), int(kp[start][1])
                    x2, y2 = int(kp[end][0]), int(kp[end][1])
                    if x1 != 0 and y1 != 0 and x2 != 0 and y2 != 0:
                        cv2.line(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)
                        if start == 5 and end == 7 and len(kp) > 9:
                            angle = self.calculate_angle(kp[start], kp[7], kp[9])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50),
                                        2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[9][0]), int(kp[9][1])))
                        elif start == 6 and end == 8 and len(kp) > 10:
                            angle = self.calculate_angle(kp[start], kp[8], kp[10])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50),
                                        2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[10][0]), int(kp[10][1])))
                        elif start == 11 and end == 13 and len(kp) > 15:
                            angle = self.calculate_angle(kp[start], kp[13], kp[15])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50),
                                        2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[15][0]), int(kp[15][1])))
                        elif start == 12 and end == 14 and len(kp) > 16:
                            angle = self.calculate_angle(kp[start], kp[14], kp[16])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50),
                                        2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[16][0]), int(kp[16][1])))
                for i in range(len(kp)):
                    x, y = int(kp[i][0]), int(kp[i][1])
                    if x != 0 and y != 0:
                        cv2.circle(frame, (x, y), 4, (147, 20, 255), -1)

        return frame

    def draw_triangle(self, frame, pt1, pt2, pt3, alpha=0.35):
        overlay = frame.copy()
        output = frame.copy()

        triangle_cnt = np.array([pt1, pt2, pt3])
        if pt3[0] >= 1 and pt3[0] >= 1 :
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

    def __call__(self, video_path=None):
        if video_path is None:
            cap = cv2.VideoCapture(self.capture_index)
        else:
            cap = cv2.VideoCapture(video_path)
            assert cap.isOpened(), f"Error: Unable to open video file {video_path}"
        window_name = 'CopyMe'
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 600)

        fps = int(cap.get(cv2.CAP_PROP_FPS))

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            results = self.predict(frame)
            frame = self.pose_detector(frame, results)

            cv2.putText(frame, f'FPS: {int(fps)}', (0, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            cv2.imshow(window_name, frame)

            if cv2.waitKey(5) & 0xFF == 27:
                break

        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Pose Estimation with Keypoint\'s using YOLO')
    parser.add_argument('-v', '--video', type=str, help='Path to video file')
    args = parser.parse_args()

    detector = ObjectDetection(capture_index=0)
    if args.video:
        detector(video_path=args.video)
    else:
        detector()
