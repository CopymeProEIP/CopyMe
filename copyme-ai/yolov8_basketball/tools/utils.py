from __future__ import annotations
import csv
import os
import numpy as np
from enum import Enum
from fastapi import UploadFile, Request
from config.db_models import DatabaseManager
from pathlib import Path
import shutil
import uuid

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from..phase_detection import PhaseDetection
#----------------------------------------------------------

def calculate_angle(a, b, c):
    # Calculate the angle between vectors ba and bc using the dot product formula
    # Formula: cos(theta) = (ba . bc) / (|ba| * |bc|)
    # where:
    # ba = a - b
    # bc = c - b
    # .  denotes the dot product
    # |v| denotes the magnitude of vector v
    # theta is the angle between vectors ba and bc
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    angle_deg = np.degrees(angle)
    return round(angle_deg, 1) if angle_deg is not None else None


def load_phases(file_path):
    assert os.path.exists(file_path), f"File {file_path} not found"
    labels = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            reader = csv.reader(file)
            labels = [row[0] for row in reader]
    return labels

class FileType(Enum):
    IMAGE = 'image'
    VIDEO = 'video'
    UNKNOWN = 'unknown'

def check_fileType(file_path: str):
    if file_path.split('.')[-1] in ['jpg', 'png', 'jpeg', 'bmp', 'webp']:
        return FileType.IMAGE
    elif file_path.split('.')[-1] in ['mp4', 'avi', 'mov']:
        return FileType.VIDEO
    else:
        return FileType.UNKNOWN

#----------------------------------------------------------

def get_database(request: Request) -> DatabaseManager:
    return request.app.db

def get_yolomodel(request: Request) -> PhaseDetection:
    return request.app.yolo

def save_uploaded_file(upload_file: UploadFile, destination: str, add_uuid: bool = False) -> Path:
    destination_folder_path = Path(destination)
    destination_folder_path.mkdir(parents=True, exist_ok=True)

    filename = upload_file.filename
    if add_uuid:
        file_stem = Path(filename).stem
        file_ext = Path(filename).suffix
        filename = f"{file_stem}_{uuid.uuid4().hex}{file_ext}"

    destination_path = destination_folder_path / filename

    with destination_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return destination_path

def merge_extremity_keypoints(yolo_kp: dict, mediapipe_kp: dict) -> dict:
    merged = yolo_kp.copy()
    for idx in [9, 10, 15, 16]:
        if idx in mediapipe_kp and mediapipe_kp[idx] is not None:
            merged[idx] = mediapipe_kp[idx]
    return merged
