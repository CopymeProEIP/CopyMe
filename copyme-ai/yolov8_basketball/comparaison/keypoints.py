import numpy as np
from typing import List, Dict, Tuple, Optional
import cv2

class KeypointUtils:
    @staticmethod
    def compare_keypoints(current_keypoints: List[List[float]], reference_keypoints: List[List[float]]) -> Dict[str, any]:
        """
        Compare directement deux ensembles de keypoints et identifie les différences principales.

        Args:
            current_keypoints: Liste des positions des keypoints actuels [x, y]
            reference_keypoints: Liste des positions des keypoints de référence [x, y]

        Returns:
            Dictionnaire contenant les résultats de la comparaison:
            - 'distances': distances euclidiennes entre chaque paire de keypoints
            - 'max_deviation': keypoint avec la plus grande déviation
            - 'alignment_score': score global d'alignement (0-100)
            - 'pose_similarity': similarité de la pose (0-100)
        """
        results = {
            'distances': {},
            'max_deviation': None,
            'alignment_score': 0,
            'pose_similarity': 0,
            'key_differences': []
        }

        # Vérifier que les deux listes ont la même longueur
        if len(current_keypoints) != len(reference_keypoints):
            min_length = min(len(current_keypoints), len(reference_keypoints))
            current_keypoints = current_keypoints[:min_length]
            reference_keypoints = reference_keypoints[:min_length]

        # Calculer les distances euclidiennes pour chaque keypoint
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
            # Vérifier que les keypoints sont valides
            if len(curr) >= 2 and len(ref) >= 2 and curr[0] > 0 and curr[1] > 0 and ref[0] > 0 and ref[1] > 0:
                # Calculer la distance euclidienne
                distance = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)

                keypoint_name = keypoint_names.get(i, f"Keypoint {i}")
                results['distances'][keypoint_name] = float(distance)

                if distance > max_distance:
                    max_distance = distance
                    max_keypoint_id = i

                total_distance += distance
                valid_points += 1

                # Identifier les différences significatives (plus de 20 pixels)
                if distance > 20:
                    results['key_differences'].append({
                        'keypoint': keypoint_name,
                        'distance': float(distance),
                        'current_pos': [float(curr[0]), float(curr[1])],
                        'reference_pos': [float(ref[0]), float(ref[1])],
                        'direction': KeypointUtils.get_movement_direction(curr, ref)
                    })

        # Trouver le keypoint avec la plus grande déviation
        if max_keypoint_id >= 0:
            results['max_deviation'] = {
                'keypoint': keypoint_names.get(max_keypoint_id, f"Keypoint {max_keypoint_id}"),
                'distance': float(max_distance)
            }

        # Calculer un score global d'alignement (inversement proportionnel à la distance moyenne)
        if valid_points > 0:
            avg_distance = total_distance / valid_points
            # Formule pour convertir la distance moyenne en score (0-100)
            # Une distance moyenne de 0 donne 100, et diminue avec l'augmentation de la distance
            results['alignment_score'] = max(0, min(100, 100 - (avg_distance * 2)))

            # Calculer la similarité de pose basée sur la corrélation des vecteurs de position
            results['pose_similarity'] = KeypointUtils.calculate_pose_similarity(current_keypoints, reference_keypoints)

        return results


    @staticmethod
    def get_movement_direction(current_pos: List[float], reference_pos: List[float]) -> Dict[str, str]:
        """
        Détermine la direction du mouvement nécessaire pour passer de la position actuelle à la position de référence.

        Args:
            current_pos: Position actuelle [x, y]
            reference_pos: Position de référence [x, y]

        Returns:
            Dictionnaire avec les directions horizontale et verticale
        """
        x_diff = reference_pos[0] - current_pos[0]
        y_diff = reference_pos[1] - current_pos[1]

        # Direction horizontale
        if abs(x_diff) < 5:  # Tolérance de 5 pixels
            horizontal = "aligné"
        else:
            horizontal = "droite" if x_diff > 0 else "gauche"

        # Direction verticale
        if abs(y_diff) < 5:  # Tolérance de 5 pixels
            vertical = "aligné"
        else:
            vertical = "bas" if y_diff > 0 else "haut"

        return {
            "horizontal": horizontal,
            "vertical": vertical
        }


    @staticmethod
    def calculate_pose_similarity(current_keypoints: List[List[float]], reference_keypoints: List[List[float]]) -> float:
        """
        Calcule un score de similarité entre deux poses en utilisant la corrélation entre leurs vecteurs de position.

        Args:
            current_keypoints: Liste des positions des keypoints actuels [x, y]
            reference_keypoints: Liste des positions des keypoints de référence [x, y]

        Returns:
            Score de similarité (0-100)
        """
        # Extraire les points valides des deux poses
        valid_curr = []
        valid_ref = []

        for curr, ref in zip(current_keypoints, reference_keypoints):
            if (len(curr) >= 2 and len(ref) >= 2 and 
                curr[0] > 0 and curr[1] > 0 and ref[0] > 0 and ref[1] > 0):
                valid_curr.extend([curr[0], curr[1]])
                valid_ref.extend([ref[0], ref[1]])

        if len(valid_curr) < 4:  # Au moins 2 points complets
            return 0

        # Normaliser les vecteurs
        curr_mean = np.mean(valid_curr)
        ref_mean = np.mean(valid_ref)
        curr_std = np.std(valid_curr)
        ref_std = np.std(valid_ref)

        if curr_std == 0 or ref_std == 0:
            return 0

        normalized_curr = [(x - curr_mean) / curr_std for x in valid_curr]
        normalized_ref = [(x - ref_mean) / ref_std for x in valid_ref]

        # Calculer la corrélation
        correlation = np.corrcoef(normalized_curr, normalized_ref)[0, 1]

        # Convertir la corrélation (-1 à 1) en score de similarité (0 à 100)
        similarity_score = (correlation + 1) * 50

        return max(0, min(100, similarity_score))


    @staticmethod
    def smooth_trajectory(keypoint_id: int, keypoint_history, window_size: int = 5) -> List[Tuple[float, float]]:
        """
        Lisse la trajectoire d'un keypoint en utilisant une moyenne mobile.

        Args:
            keypoint_id: Identifiant du keypoint
            window_size: Taille de la fenêtre pour la moyenne mobile

        Returns:
            Liste des positions lissées [(x, y), ...]
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
        Prédit la position future d'un keypoint en utilisant le filtre de Kalman.

        Args:
            keypoint_id: Identifiant du keypoint
            steps_ahead: Nombre d'étapes à prédire dans le futur

        Returns:
            Position prédite (x, y) ou None si le keypoint n'est pas suivi
        """
        if keypoint_id not in kalman_filters:
            return None

        kalman = kalman_filters[keypoint_id]

        # Copier l'état actuel du filtre pour ne pas perturber le suivi réel
        temp_kalman = cv2.KalmanFilter(4, 2)
        temp_kalman.statePre = kalman.statePre.copy()
        temp_kalman.statePost = kalman.statePost.copy()
        temp_kalman.transitionMatrix = kalman.transitionMatrix.copy()
        temp_kalman.processNoiseCov = kalman.processNoiseCov.copy()

        # Prédire plusieurs pas en avant
        for _ in range(steps_ahead):
            temp_kalman.predict()

        # Récupérer la dernière prédiction
        predicted_x = temp_kalman.statePre[0, 0]
        predicted_y = temp_kalman.statePre[1, 0]

        return (predicted_x, predicted_y)

