import numpy as np
import cv2
from typing import List, Tuple

class KalmanKeypointFilter:
    def init_kalman_filter(self, keypoint_id: int):
        """
        Initialise un filtre de Kalman pour un keypoint spécifique.

        Args:
            keypoint_id: Identifiant du keypoint à suivre
        """
        kalman = cv2.KalmanFilter(4, 2)  # État: [x, y, dx, dy], Mesure: [x, y]

        # Matrice de transition
        kalman.transitionMatrix = np.array([
            [1, 0, 1, 0],
            [0, 1, 0, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ], np.float32)

        # Matrice de mesure
        kalman.measurementMatrix = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ], np.float32)

        # Bruit de processus et de mesure
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
        Met à jour le filtre de Kalman avec une nouvelle mesure et renvoie la position filtrée.

        Args:
            keypoint_id: Identifiant du keypoint
            position: Position mesurée (x, y)

        Returns:
            Position filtrée (x, y)
        """
        if keypoint_id not in self.kalman_filters:
            self.init_kalman_filter(keypoint_id)

        kalman = self.kalman_filters[keypoint_id]

        # Convertir la position en format approprié
        measured = np.array([[position[0]], [position[1]]], dtype=np.float32)

        # Mettre à jour le filtre
        kalman.correct(measured)
        prediction = kalman.predict()

        # Extraire les coordonnées x, y filtrées
        filtered_x = prediction[0, 0]
        filtered_y = prediction[1, 0]

        # Enregistrer l'historique
        self.keypoint_history[keypoint_id].append((filtered_x, filtered_y))
        if len(self.keypoint_history[keypoint_id]) > 30:  # Garder un historique limité
            self.keypoint_history[keypoint_id].pop(0)

        return (filtered_x, filtered_y)

    def filter_keypoints(self, keypoints: List[List[float]]) -> List[List[float]]:
        """
        Applique le filtre de Kalman à une liste de keypoints si self.use_kalman est True.
        Sinon, retourne les keypoints bruts.
        """
        if not self.use_kalman:
            return keypoints
        filtered_keypoints = []
        for i, kp in enumerate(keypoints):
            if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:  # Vérifier que les coordonnées sont valides
                filtered_pos = self.update_kalman(i, (kp[0], kp[1]))
                filtered_keypoints.append([filtered_pos[0], filtered_pos[1]])
            else:
                # Si le keypoint n'est pas valide, utiliser la dernière prédiction ou zéro
                if i in self.kalman_filters:
                    prediction = self.kalman_filters[i].predict()
                    filtered_keypoints.append([prediction[0, 0], prediction[1, 0]])
                else:
                    filtered_keypoints.append([0, 0])
        return filtered_keypoints
