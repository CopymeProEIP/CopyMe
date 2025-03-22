import csv
import os
import numpy as np
from enum import Enum
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from config.db_models import DatabaseManager


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .yolov8 import YOLOv8
#----------------------------------------------------------
# load csv file that list all model's labels from the model

# check if the file exists and load the labels

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
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0)) # Clip the value to prevent NaN
    return np.degrees(angle) # Convert the angle from radians to degrees


def load_labels(file_path):
    assert os.path.exists(file_path), f"File {file_path} not found"
    labels = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            reader = csv.reader(file)
            labels = [row[0] for row in reader]
    return labels


# check if the file is an image or video
 
def check_fileType(file_path: str):
    if file_path.split('.')[-1] in ['jpg', 'png', 'jpeg', 'bmp', 'webp']:
        return 'image'
    elif file_path.split('.')[-1] in ['mp4', 'avi', 'mov']:
        return 'video'
    else:
        return 'unknown'

#----------------------------------------------------------

class DebugType(Enum):
    DEBUG = 1
    INFO = 2
    WARNING = 3

class Debugger:
    def __init__(self, enabled=True):
        self.enabled = enabled

    def enable(self, enabled=True):
        self.enabled = enabled

    def log(self, type=DebugType.DEBUG, message=""):
        if self.enabled:
            if type == DebugType.DEBUG:
                print(f"[DEBUG]: {message}")
            elif type == DebugType.INFO:
                print(f"[INFO]: {message}")
            elif type == DebugType.WARNING:
                print(f"[WARNING]: {message}")

def get_database(request: Request) -> DatabaseManager:
    return request.app.db

def get_yolomodel(request: Request) -> 'YOLOv8':
    return request.app.yolo