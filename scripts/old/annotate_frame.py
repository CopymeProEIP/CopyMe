import argparse
import cv2
import numpy as np
import torch
from ultralytics import YOLO

class FrameAnnotator:
    def __init__(self, model_path='yolov8m-pose.pt'):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print("Using Device: ", self.device)

        self.model = self.load_model(model_path)

    def load_model(self, model_path):
        model = YOLO(model_path).to(self.device)
        model.fuse()
        return model

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
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50), 2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[9][0]), int(kp[9][1])))
                        elif start == 6 and end == 8 and len(kp) > 10:
                            angle = self.calculate_angle(kp[start], kp[8], kp[10])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50), 2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[10][0]), int(kp[10][1])))
                        elif start == 11 and end == 13 and len(kp) > 15:
                            angle = self.calculate_angle(kp[start], kp[13], kp[15])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50), 2)
                            frame = self.draw_triangle(frame, (x1, y1), (x2, y2), (int(kp[15][0]), int(kp[15][1])))
                        elif start == 12 and end == 14 and len(kp) > 16:
                            angle = self.calculate_angle(kp[start], kp[14], kp[16])
                            cv2.putText(frame, f'{angle:.0f}', (x2, y2), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 205, 50), 2)
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

    def annotate_frame(self, amateur_frame_path, reference_frame_path, output_frame_path):
        amateur_frame = cv2.imread(amateur_frame_path)
        reference_frame = cv2.imread(reference_frame_path)

        results_amateur = self.model(amateur_frame)
        results_reference = self.model(reference_frame)

        player = self.pose_detector(amateur_frame, results_amateur)
        pro = self.pose_detector(reference_frame, results_reference)
        height, width = player.shape[:2]
        pro_resized = cv2.resize(pro, (width, height))

        combined_frame = cv2.hconcat([player, pro_resized])
        cv2.imwrite(output_frame_path, combined_frame)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Annotate frames with keypoints and angles')
    parser.add_argument('--amateur_frame', type=str, required=True, help='Path to amateur frame')
    parser.add_argument('--reference_frame', type=str, required=True, help='Path to reference frame')
    parser.add_argument('--output_frame', type=str, required=True, help='Path to save annotated frame')
    parser.add_argument('--model', type=str, default='yolov8m-pose.pt', help='Path to YOLOv8 model')
    args = parser.parse_args()

    annotator = FrameAnnotator(model_path=args.model)
    annotator.annotate_frame(args.amateur_frame, args.reference_frame, args.output_frame)
