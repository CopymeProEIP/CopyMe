#!/usr/bin/env python
# -*- coding: UTF8 -*-

import cv2
from ultralytics import YOLO

model = YOLO('yolov8n.pt')

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Erreur: Impossible d'ouvrir la webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Erreur: Impossible de lire la vidéo.")
        break

    results = model(frame)

    for result in results[0].boxes.data.cpu().numpy():
        x1, y1, x2, y2, conf, cls = result
        label = f'{model.names[int(cls)]}: {conf:.2f}'
        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
        cv2.putText(frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imshow('YOLOv8 Object Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
