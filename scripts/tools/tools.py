import csv
import os

#----------------------------------------------------------
# load csv file that list all model's labels from the model

# check if the file exists

def load_labels(file_path):
    assert os.path.exists(file_path), f"File {file_path} not found"
    print(f"Loading labels from {file_path}")
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            reader = csv.reader(file)
            labels = list(reader)
    return labels

class CLASSES:
    def __init__(self, phase_name, keypoints, timestamp):
        self.phase_name = phase_name
        self.keypoints = keypoints
        self.timestamp = timestamp

    def to_dict(self):
        return {
            'phase_name': self.phase_name,
            'keypoints': self.keypoints,
            'timestamp': self.timestamp
        }

#----------------------------------------------------------
