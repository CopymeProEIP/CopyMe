import numpy as np
import cv2
from typing import List, Tuple

class KalmanKeypointFilter:
    def __init__(self):
        self.kalman_filters = {}
        self.keypoint_history = {}
        self.use_kalman = True

    def init_kalman_filter(self, keypoint_id: int):
        """
        Initialize a Kalman filter for a specific keypoint.

        Args:
            keypoint_id: Identifier of the keypoint to track
        """
        kalman = cv2.KalmanFilter(4, 2)  # State: [x, y, dx, dy], Measurement: [x, y]

        # Transition matrix
        kalman.transitionMatrix = np.array([
            [1, 0, 1, 0],
            [0, 1, 0, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ], np.float32)

        # Measurement matrix
        kalman.measurementMatrix = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ], np.float32)

        # Process and measurement noise
        kalman.processNoiseCov = np.array([
            [1e-4, 0, 0, 0],
            [0, 1e-4, 0, 0],
            [0, 0, 1e-3, 0],
            [0, 0, 0, 1e-3]
        ], np.float32) * 0.01

        kalman.measurementNoiseCov = np.array([
            [1, 0],
            [0, 1]
        ], np.float32) * 0.01

        self.kalman_filters[keypoint_id] = kalman
        self.keypoint_history[keypoint_id] = []

    def update_kalman(self, keypoint_id: int, position: Tuple[float, float]) -> Tuple[float, float]:
        """
        Update the Kalman filter with a new measurement and return the filtered position.

        Args:
            keypoint_id: Keypoint identifier
            position: Measured position (x, y)

        Returns:
            Filtered position (x, y)
        """
        if keypoint_id not in self.kalman_filters:
            self.init_kalman_filter(keypoint_id)

        kalman = self.kalman_filters[keypoint_id]

        # Convert position to appropriate format
        measured = np.array([[position[0]], [position[1]]], dtype=np.float32)

        # Update filter
        kalman.correct(measured)
        prediction = kalman.predict()

        # Extract filtered x, y coordinates
        filtered_x = prediction[0, 0]
        filtered_y = prediction[1, 0]

        # Record history
        self.keypoint_history[keypoint_id].append((filtered_x, filtered_y))
        if len(self.keypoint_history[keypoint_id]) > 30:  # Keep limited history
            self.keypoint_history[keypoint_id].pop(0)

        return (filtered_x, filtered_y)

    def filter_keypoints(self, keypoints: List[List[float]]) -> List[List[float]]:
        """
        Apply Kalman filter to a list of keypoints if self.use_kalman is True.
        Otherwise, return raw keypoints.
        """
        if not self.use_kalman:
            return keypoints
        filtered_keypoints = []
        for i, kp in enumerate(keypoints):
            if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:  # Check that coordinates are valid
                filtered_pos = self.update_kalman(i, (kp[0], kp[1]))
                filtered_keypoints.append([filtered_pos[0], filtered_pos[1]])
            else:
                # If keypoint is not valid, use last prediction or zero
                if i in self.kalman_filters:
                    prediction = self.kalman_filters[i].predict()
                    filtered_keypoints.append([prediction[0, 0], prediction[1, 0]])
                else:
                    filtered_keypoints.append([0, 0])
        return filtered_keypoints
