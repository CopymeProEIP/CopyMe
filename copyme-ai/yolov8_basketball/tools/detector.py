from yolov8_basketball.yolobase import YOLOBase

class YoloPersonDetector:
    def __init__(self, model_path="model/yolov8m.pt"):
        self.yolo = YOLOBase(model_path=model_path)

    def detect(self, frame):
        results = self.yolo._infer(frame)
        bboxes = []
        for result in results:
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                class_id = int(box.cls[0])
                if class_id == 0:
                    x1, y1, x2, y2 = box.xyxy[0].astype(int)
                    bboxes.append((x1, y1, x2, y2))
        return bboxes
