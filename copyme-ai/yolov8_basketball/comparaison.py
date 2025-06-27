import numpy as np
import cv2
from typing import List, Dict, Tuple, Optional
from enum import Enum, auto
from pydantic import BaseModel

class Direction(str, Enum):
    INCREASE = "increase"
    DECREASE = "decrease"
    UNKNOWN = "unknown"

class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Improvement(BaseModel):
    angle_index: int  # Index correspondant dans le tableau angles
    target_angle: float  # Angle cible à atteindre
    direction: Direction  # Direction de correction
    magnitude: float  # Amplitude de la correction nécessaire
    priority: PriorityLevel  # Priorité de la correction
    class_name: Optional[str] = None  # Nom de la classe associée

class Comparaison:
    def __init__(self, model, dataset):
        self.model = model
        self.dataset = dataset
        self.kalman_filters = {}
        self.keypoint_history = {}

    def compare(self):
        print(f"Comparing {self.model} with {self.dataset}")

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
        Applique le filtre de Kalman à une liste de keypoints.

        Args:
            keypoints: Liste des positions des keypoints [x, y]

        Returns:
            Liste des positions filtrées des keypoints [x, y]
        """
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

    def compare_keypoints(self, current_keypoints: List[List[float]], reference_keypoints: List[List[float]]) -> Dict[str, any]:
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
                        'direction': self.get_movement_direction(curr, ref)
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
            results['pose_similarity'] = self.calculate_pose_similarity(current_keypoints, reference_keypoints)

        return results

    def get_movement_direction(self, current_pos: List[float], reference_pos: List[float]) -> Dict[str, str]:
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

    def calculate_pose_similarity(self, current_keypoints: List[List[float]], reference_keypoints: List[List[float]]) -> float:
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

    def compare_angles(self, current_angles, reference_angles: Dict[str, Dict[str, float]]) -> List[Improvement]:
        """
        Compare les angles actuels avec les angles de référence et génère des recommandations.

        Args:
            current_angles: Liste d'angles actuels ou dictionnaire {nom_angle: valeur}
            reference_angles: Dictionnaire des angles de référence {nom_angle: {ref: valeur, tolerance: valeur}}

        Returns:
            Liste d'objets Improvement
        """
        improvements = []

        # Gestion des current_angles comme liste d'objets (comme vu dans les logs)
        if isinstance(current_angles, list):
            for idx, angle_data in enumerate(current_angles):
                if not isinstance(angle_data, dict):
                    continue
                
                # Extraire le nom de l'angle et sa valeur
                if 'angle_name' not in angle_data or 'angle' not in angle_data:
                    continue
                    
                angle_name = angle_data['angle_name'][0] if isinstance(angle_data['angle_name'], list) else angle_data['angle_name']
                current_value = angle_data['angle']
                
                if angle_name in reference_angles:
                    ref_data = reference_angles[angle_name]
                    reference = ref_data["ref"]
                    tolerance = ref_data["tolerance"]
                    
                    # Calculer la différence
                    diff = current_value - reference
                    abs_diff = abs(diff)
                    
                    # Si la différence est dans la tolérance, pas besoin d'amélioration
                    if abs_diff <= tolerance:
                        continue
                    
                    # Déterminer la direction de correction
                    direction = Direction.DECREASE if diff > 0 else Direction.INCREASE
                    
                    # Déterminer la priorité
                    priority = PriorityLevel.HIGH if abs_diff > 15 else \
                              (PriorityLevel.MEDIUM if abs_diff > 7 else PriorityLevel.LOW)
                    
                    improvement = Improvement(
                        angle_index=idx,
                        target_angle=reference,
                        direction=direction,
                        magnitude=abs_diff,
                        priority=priority
                    )
                    
                    improvements.append(improvement)
        
        # Gestion des current_angles comme dictionnaire (comportement original)
        elif isinstance(current_angles, dict):
            for idx, (angle_name, current) in enumerate(current_angles.items()):
                if angle_name in reference_angles:
                    ref_data = reference_angles[angle_name]
                    reference = ref_data["ref"]
                    tolerance = ref_data["tolerance"]
                    
                    # Calculer la différence
                    diff = current - reference
                    abs_diff = abs(diff)
                    
                    # Si la différence est dans la tolérance, pas besoin d'amélioration
                    if abs_diff <= tolerance:
                        continue
                    
                    # Déterminer la direction de correction
                    direction = Direction.DECREASE if diff > 0 else Direction.INCREASE
                    
                    # Déterminer la priorité
                    priority = PriorityLevel.HIGH if abs_diff > 15 else \
                              (PriorityLevel.MEDIUM if abs_diff > 7 else PriorityLevel.LOW)
                    
                    improvement = Improvement(
                        angle_index=idx,
                        target_angle=reference,
                        direction=direction,
                        magnitude=abs_diff,
                        priority=priority
                    )
                    
                    improvements.append(improvement)

        # Trier par priorité
        improvements.sort(key=lambda x: (
            0 if x.priority == PriorityLevel.HIGH else
            1 if x.priority == PriorityLevel.MEDIUM else 2
        ))

        return improvements

    def smooth_trajectory(self, keypoint_id: int, window_size: int = 5) -> List[Tuple[float, float]]:
        """
        Lisse la trajectoire d'un keypoint en utilisant une moyenne mobile.

        Args:
            keypoint_id: Identifiant du keypoint
            window_size: Taille de la fenêtre pour la moyenne mobile

        Returns:
            Liste des positions lissées [(x, y), ...]
        """
        if keypoint_id not in self.keypoint_history or len(self.keypoint_history[keypoint_id]) < window_size:
            return self.keypoint_history.get(keypoint_id, [])

        history = self.keypoint_history[keypoint_id]
        smoothed = []

        for i in range(len(history) - window_size + 1):
            window = history[i:i+window_size]
            avg_x = sum(point[0] for point in window) / window_size
            avg_y = sum(point[1] for point in window) / window_size
            smoothed.append((avg_x, avg_y))

        return smoothed

    def predict_future_position(self, keypoint_id: int, steps_ahead: int = 5) -> Optional[Tuple[float, float]]:
        """
        Prédit la position future d'un keypoint en utilisant le filtre de Kalman.

        Args:
            keypoint_id: Identifiant du keypoint
            steps_ahead: Nombre d'étapes à prédire dans le futur

        Returns:
            Position prédite (x, y) ou None si le keypoint n'est pas suivi
        """
        if keypoint_id not in self.kalman_filters:
            return None

        kalman = self.kalman_filters[keypoint_id]

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

