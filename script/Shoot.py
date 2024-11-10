import json

class ShotPhase:
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
