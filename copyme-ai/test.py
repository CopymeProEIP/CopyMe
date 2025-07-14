from yolov8_basketball.tools.preprocess import Preprocessor
from yolov8_basketball.tools.detector import YoloPersonDetector

preproc = Preprocessor(target_person_ratio=(0.4, 0.6))
detector = YoloPersonDetector("model/yolo11m.pt")

input_path = "../assets/sample_video.mp4"
output_path = "toto.mp4"

preproc.preprocess_video(input_path, output_path, detector)
