import cv2
import numpy as np

class Preprocessor:
    def __init__(self, target_person_ratio=(0.4, 0.6)):
        self.min_ratio, self.max_ratio = target_person_ratio

    def process_frame(self, frame, bbox, margin_ratio=0.3):
        h, w, _ = frame.shape
        x1, y1, x2, y2 = bbox
        person_height = y2 - y1
        person_width = x2 - x1
        aspect_ratio = w / h

        margin_h = int(person_height * margin_ratio)
        margin_w = int(person_width * margin_ratio)

        max_margin_left = x1
        max_margin_right = w - x2
        max_margin_top = y1
        max_margin_bottom = h - y2

        margin_w = min(margin_w, max_margin_left, max_margin_right)
        margin_h = min(margin_h, max_margin_top, max_margin_bottom)

        new_x1 = x1 - margin_w
        new_y1 = y1 - margin_h
        new_x2 = x2 + margin_w
        new_y2 = y2 + margin_h

        crop_cx = (new_x1 + new_x2) // 2
        crop_cy = (new_y1 + new_y2) // 2
        crop_h = new_y2 - new_y1
        crop_w = int(crop_h * aspect_ratio)
        if crop_w > w:
            crop_w = w
            crop_h = int(crop_w / aspect_ratio)

        crop_x1 = max(0, crop_cx - crop_w // 2)
        crop_y1 = max(0, crop_cy - crop_h // 2)
        crop_x2 = min(w, crop_x1 + crop_w)
        crop_y2 = min(h, crop_y1 + crop_h)

        cropped = frame[crop_y1:crop_y2, crop_x1:crop_x2]
        result = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)
        return result

    @staticmethod
    def get_largest_person_bbox(detections):
        if not detections:
            return None
        return max(detections, key=lambda box: box[3] - box[1])

    def preprocess_video(self, input_path, output_path, detector):
        cap = cv2.VideoCapture(input_path)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            detections = detector.detect(frame)
            bbox = self.get_largest_person_bbox(detections)
            if bbox is not None:
                frame = self.process_frame(frame, bbox)
            out.write(frame)
        cap.release()
        out.release()

    def process_frame_on_the_fly(self, frame, detector):
        detections = detector.detect(frame)
        bbox = self.get_largest_person_bbox(detections)
        if bbox is not None:
            return self.process_frame(frame, bbox)
        return frame
