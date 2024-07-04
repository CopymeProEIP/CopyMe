
from ultralytics import YOLO
import cv2

model_path1 = '../../runs/detect/train5/weights/best.pt'
model_path2 = '../../runs/detect/train4/weights/best.pt'

model1 = YOLO(model_path2).to('cuda')

results1 = model1.predict(source='shoot.mov', show=True, conf=0.3)
