import numpy as np
from typing import List, Dict, Tuple, Optional
import cv2

class KeypointUtils:
    @staticmethod
    def compare_keypoints(current_keypoints: List[List[float]], reference_keypoints: List[List[float]]) -> Dict[str, any]:
        """
        Directly compare two sets of keypoints and identify main differences.

        Args:
            current_keypoints: List of current keypoint positions [x, y]
            reference_keypoints: List of reference keypoint positions [x, y]

        Returns:
            Dictionary containing comparison results:
            - 'distances': euclidean distances between each keypoint pair
            - 'max_deviation': keypoint with greatest deviation
            - 'alignment_score': global alignment score (0-100)
            - 'pose_similarity': pose similarity (0-100)
        """
        results = {
            'distances': {},
            'max_deviation': None,
            'alignment_score': 0,
            'pose_similarity': 0,
            'key_differences': []
        }

        # Check that both lists have the same length
        if len(current_keypoints) != len(reference_keypoints):
            min_length = min(len(current_keypoints), len(reference_keypoints))
            current_keypoints = current_keypoints[:min_length]
            reference_keypoints = reference_keypoints[:min_length]

        # Calculate euclidean distances for each keypoint
        max_distance = 0
        max_keypoint_id = -1
        valid_points = 0
        total_distance = 0

        keypoint_names = {
            0: "Nose", 1: "L eye", 2: "R eye", 3: "L ear", 4: "R ear",
            5: "L shoulder", 6: "R shoulder",
            7: "L elbow", 8: "R elbow",
            9: "L wrist", 10: "R wrist",
            11: "L hip", 12: "R hip",
            13: "L knee", 14: "R knee",
            15: "L ankle", 16: "R ankle"
        }

        for i, (curr, ref) in enumerate(zip(current_keypoints, reference_keypoints)):
            # Check that keypoints are valid
            if len(curr) >= 2 and len(ref) >= 2 and curr[0] > 0 and curr[1] > 0 and ref[0] > 0 and ref[1] > 0:
                # Calculate euclidean distance
                distance = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)

                keypoint_name = keypoint_names.get(i, f"Keypoint {i}")
                results['distances'][keypoint_name] = float(distance)

                if distance > max_distance:
                    max_distance = distance
                    max_keypoint_id = i

                total_distance += distance
                valid_points += 1

                # Identify significant differences (more than 20 pixels)
                if distance > 20:
                    results['key_differences'].append({
                        'keypoint': keypoint_name,
                        'distance': float(distance),
                        'current_pos': [float(curr[0]), float(curr[1])],
                        'reference_pos': [float(ref[0]), float(ref[1])],
                        'direction': KeypointUtils.get_movement_direction(curr, ref)
                    })

        # Find keypoint with greatest deviation
        if max_keypoint_id >= 0:
            results['max_deviation'] = {
                'keypoint': keypoint_names.get(max_keypoint_id, f"Keypoint {max_keypoint_id}"),
                'distance': float(max_distance)
            }

        # Calculate global alignment score (inversely proportional to average distance)
        if valid_points > 0:
            avg_distance = total_distance / valid_points
            # Formula to convert average distance to score (0-100)
            # Average distance of 0 gives 100, decreases with increasing distance
            results['alignment_score'] = max(0, min(100, 100 - (avg_distance * 2)))

            # Calculate pose similarity based on position vector correlation
            results['pose_similarity'] = KeypointUtils.calculate_pose_similarity(current_keypoints, reference_keypoints)

        return results


    @staticmethod
    def get_movement_direction(current_pos: List[float], reference_pos: List[float]) -> Dict[str, str]:
        """
        Determines the movement direction needed to go from current position to reference position.

        Args:
            current_pos: Current position [x, y]
            reference_pos: Reference position [x, y]

        Returns:
            Dictionary with horizontal and vertical directions
        """
        x_diff = reference_pos[0] - current_pos[0]
        y_diff = reference_pos[1] - current_pos[1]

        # Horizontal direction
        if abs(x_diff) < 5:  # 5 pixel tolerance
            horizontal = "aligned"
        else:
            horizontal = "right" if x_diff > 0 else "left"

        # Vertical direction
        if abs(y_diff) < 5:  # 5 pixel tolerance
            vertical = "aligned"
        else:
            vertical = "down" if y_diff > 0 else "up"

        return {
            "horizontal": horizontal,
            "vertical": vertical
        }


    @staticmethod
    def calculate_pose_similarity(current_keypoints: List[List[float]], reference_keypoints: List[List[float]]) -> float:
        """
        Calculate a similarity score between two poses using correlation between their position vectors.

        Args:
            current_keypoints: List of current keypoint positions [x, y]
            reference_keypoints: List of reference keypoint positions [x, y]

        Returns:
            Similarity score (0-100)
        """
        # Extract valid points from both poses
        valid_curr = []
        valid_ref = []

        for curr, ref in zip(current_keypoints, reference_keypoints):
            if (len(curr) >= 2 and len(ref) >= 2 and
                curr[0] > 0 and curr[1] > 0 and ref[0] > 0 and ref[1] > 0):
                valid_curr.extend([curr[0], curr[1]])
                valid_ref.extend([ref[0], ref[1]])

        if len(valid_curr) < 4:  # At least 2 complete points
            return 0

        # Normalize vectors
        curr_mean = np.mean(valid_curr)
        ref_mean = np.mean(valid_ref)
        curr_std = np.std(valid_curr)
        ref_std = np.std(valid_ref)

        if curr_std == 0 or ref_std == 0:
            return 0

        normalized_curr = [(x - curr_mean) / curr_std for x in valid_curr]
        normalized_ref = [(x - ref_mean) / ref_std for x in valid_ref]

        # Calculate correlation
        correlation = np.corrcoef(normalized_curr, normalized_ref)[0, 1]

        # Convert correlation (-1 to 1) to similarity score (0 to 100)
        similarity_score = (correlation + 1) * 50

        return max(0, min(100, similarity_score))


    @staticmethod
    def smooth_trajectory(keypoint_id: int, keypoint_history, window_size: int = 5) -> List[Tuple[float, float]]:
        """
        Smooth a keypoint trajectory using moving average.

        Args:
            keypoint_id: Keypoint identifier
            window_size: Window size for moving average

        Returns:
            List of smoothed positions [(x, y), ...]
        """
        if keypoint_id not in keypoint_history or len(keypoint_history[keypoint_id]) < window_size:
            return keypoint_history.get(keypoint_id, [])

        history = keypoint_history[keypoint_id]
        smoothed = []

        for i in range(len(history) - window_size + 1):
            window = history[i:i+window_size]
            avg_x = sum(point[0] for point in window) / window_size
            avg_y = sum(point[1] for point in window) / window_size
            smoothed.append((avg_x, avg_y))

        return smoothed


    @staticmethod
    def predict_future_position(keypoint_id: int, kalman_filters, steps_ahead: int = 5) -> Optional[Tuple[float, float]]:
        """
        Predict future position of a keypoint using Kalman filter.

        Args:
            keypoint_id: Keypoint identifier
            steps_ahead: Number of steps to predict in the future

        Returns:
            Predicted position (x, y) or None if keypoint is not tracked
        """
        if keypoint_id not in kalman_filters:
            return None

        kalman = kalman_filters[keypoint_id]

        # Copy current filter state to avoid disturbing real tracking
        temp_kalman = cv2.KalmanFilter(4, 2)
        temp_kalman.statePre = kalman.statePre.copy()
        temp_kalman.statePost = kalman.statePost.copy()
        temp_kalman.transitionMatrix = kalman.transitionMatrix.copy()
        temp_kalman.processNoiseCov = kalman.processNoiseCov.copy()

        # Predict several steps ahead
        for _ in range(steps_ahead):
            temp_kalman.predict()

        # Get last prediction
        predicted_x = temp_kalman.statePre[0, 0]
        predicted_y = temp_kalman.statePre[1, 0]

        return (predicted_x, predicted_y)

