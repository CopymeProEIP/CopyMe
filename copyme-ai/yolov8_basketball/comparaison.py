import numpy as np
import cv2
import pygame
import math
from typing import List, Dict, Tuple, Optional
from enum import Enum, auto
from pydantic import BaseModel

from motor.motor_asyncio import AsyncIOMotorClient

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
    def __init__(self, model, dataset, use_kalman: bool = False):
        self.model = model
        self.dataset = dataset
        self.kalman_filters = {}
        self.keypoint_history = {}
        self.use_kalman = use_kalman

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

    def display_keypoints_video(self, frames: List[Dict], reference_frames: List[Dict], class_name: str = "Unknown", fps: int = 10, use_kalman: bool = False):
        """
        Affiche une séquence de frames (keypoints + data) comme une vidéo interactive avec pygame.
        Contrôles :
            - Flèche droite/gauche : frame suivante/précédente
            - Espace : pause/play
            - Échap : quitter
        use_kalman : active le filtrage Kalman des keypoints
        """
        self.use_kalman = use_kalman
        # --- Constantes d'affichage ---
        WINDOW_WIDTH = 1200
        WINDOW_HEIGHT = 800
        KEYPOINT_PANEL_WIDTH = 800
        TEXT_PANEL_WIDTH = 400
        BLACK = (0, 0, 0)
        WHITE = (255, 255, 255)
        RED = (255, 0, 0)
        BLUE = (0, 0, 255)
        GREEN = (0, 255, 0)
        YELLOW = (255, 255, 0)
        LIGHT_GRAY = (200, 200, 200)
        DARK_GRAY = (64, 64, 64)

        # Fonctions utilitaires (reprendre celles déjà dans display_keypoints_interface)
        def normalize_keypoints(keypoints, panel_width, panel_height, margin=50):
            if not keypoints:
                return []
            valid_keypoints = [(kp[0], kp[1]) for kp in keypoints if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0]
            if not valid_keypoints:
                return [(0, 0) for _ in keypoints]
            min_x = min(kp[0] for kp in valid_keypoints)
            max_x = max(kp[0] for kp in valid_keypoints)
            min_y = min(kp[1] for kp in valid_keypoints)
            max_y = max(kp[1] for kp in valid_keypoints)
            width_range = max_x - min_x if max_x != min_x else 1
            height_range = max_y - min_y if max_y != min_y else 1
            normalized = []
            for kp in keypoints:
                if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                    norm_x = margin + ((kp[0] - min_x) / width_range) * (panel_width - 2 * margin)
                    norm_y = margin + ((kp[1] - min_y) / height_range) * (panel_height - 2 * margin)
                    normalized.append((norm_x, norm_y))
                else:
                    normalized.append((0, 0))
            return normalized
        def draw_skeleton(surface, keypoints, connections, color, offset_x=0, offset_y=0):
            for start_idx, end_idx in connections:
                if (start_idx < len(keypoints) and end_idx < len(keypoints) and
                    keypoints[start_idx][0] > 0 and keypoints[start_idx][1] > 0 and
                    keypoints[end_idx][0] > 0 and keypoints[end_idx][1] > 0):
                    start_pos = (keypoints[start_idx][0] + offset_x, keypoints[start_idx][1] + offset_y)
                    end_pos = (keypoints[end_idx][0] + offset_x, keypoints[end_idx][1] + offset_y)
                    pygame.draw.line(surface, color, start_pos, end_pos, 2)
        def draw_keypoints(surface, keypoints, color, offset_x=0, offset_y=0, radius=5):
            for i, kp in enumerate(keypoints):
                if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                    pos = (int(kp[0] + offset_x), int(kp[1] + offset_y))
                    pygame.draw.circle(surface, color, pos, radius)
        # ---
        skeleton_connections = [
            (0, 1), (0, 2), (1, 3), (2, 4),
            (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),
            (5, 11), (6, 12), (11, 12),
            (11, 13), (13, 15), (12, 14), (14, 16)
        ]
        pygame.init()
        screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption(f"Vidéo Keypoints - {class_name}")
        font_large = pygame.font.Font(None, 24)
        font_medium = pygame.font.Font(None, 20)
        font_small = pygame.font.Font(None, 16)
        panel_height = WINDOW_HEIGHT - 100
        clock = pygame.time.Clock()
        running = True
        paused = False
        frame_idx = 0
        n_frames = len(frames)
        last_update = time.time()
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                    elif event.key == pygame.K_RIGHT:
                        frame_idx = min(frame_idx + 1, n_frames - 1)
                        paused = True
                    elif event.key == pygame.K_LEFT:
                        frame_idx = max(frame_idx - 1, 0)
                        paused = True
                    elif event.key == pygame.K_SPACE:
                        paused = not paused
            # Avancement automatique
            if not paused and (time.time() - last_update > 1.0 / fps):
                frame_idx += 1
                if frame_idx >= n_frames:
                    frame_idx = 0
                last_update = time.time()
            # Récupérer la frame courante
            user_frame = frames[frame_idx]
            ref_frame = reference_frames[frame_idx] if frame_idx < len(reference_frames) else reference_frames[-1]
            # Conversion keypoints
            def dict_to_list(keypoints_dict):
                keypoint_order = [
                    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
                    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
                    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
                    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
                ]
                keypoints_list = []
                for keypoint in keypoint_order:
                    x_key = f"{keypoint}_x"
                    y_key = f"{keypoint}_y"
                    x = keypoints_dict.get(x_key, 0.0)
                    y = keypoints_dict.get(y_key, 0.0)
                    keypoints_list.append([x, y])
                return keypoints_list
            current_keypoints = dict_to_list(user_frame['keypoints_positions'])
            reference_keypoints = dict_to_list(ref_frame['keypoints_positions'])
            # --- Application du filtre Kalman si demandé ---
            current_keypoints = self.filter_keypoints(current_keypoints)
            reference_keypoints = self.filter_keypoints(reference_keypoints)
            # Normalisation
            current_normalized = normalize_keypoints(current_keypoints, KEYPOINT_PANEL_WIDTH, panel_height)
            reference_normalized = normalize_keypoints(reference_keypoints, KEYPOINT_PANEL_WIDTH, panel_height)
            # Analyse
            comparison_result = self.compare_keypoints(current_keypoints, reference_keypoints)
            improvements = []
            if 'angles' in user_frame and 'angles' in ref_frame:
                # Construction du dict d'angles de référence
                reference_angles = {}
                for angle in ref_frame['angles']:
                    angle_name = str(angle.get('angle_name', ['unknown', 0])[0])
                    angle_value = angle.get('angle', 0)
                    reference_angles[angle_name] = {"ref": angle_value, "tolerance": 5.0}
                improvements = self.compare_angles(user_frame['angles'], reference_angles)
            # Affichage
            screen.fill(WHITE)
            keypoint_rect = pygame.Rect(10, 50, KEYPOINT_PANEL_WIDTH, panel_height)
            pygame.draw.rect(screen, WHITE, keypoint_rect)
            pygame.draw.rect(screen, BLACK, keypoint_rect, 2)
            title = font_large.render(f"Frame {frame_idx+1}/{n_frames} - {class_name}", True, BLACK)
            screen.blit(title, (20, 20))
            if reference_normalized:
                draw_skeleton(screen, reference_normalized, skeleton_connections, RED, 10, 50)
                draw_keypoints(screen, reference_normalized, RED, 10, 50)
            if current_normalized:
                draw_skeleton(screen, current_normalized, skeleton_connections, BLUE, 10, 50)
                draw_keypoints(screen, current_normalized, BLUE, 10, 50)
            # Panel texte à droite
            pygame.draw.rect(screen, LIGHT_GRAY, (KEYPOINT_PANEL_WIDTH + 20, 50, TEXT_PANEL_WIDTH - 30, panel_height))
            pygame.draw.rect(screen, BLACK, (KEYPOINT_PANEL_WIDTH + 20, 50, TEXT_PANEL_WIDTH - 30, panel_height), 2)
            y_txt = 60
            x_txt = KEYPOINT_PANEL_WIDTH + 30
            screen.blit(font_medium.render(f"Score alignement: {comparison_result.get('alignment_score', 0):.1f}%", True, BLACK), (x_txt, y_txt))
            y_txt += 30
            screen.blit(font_medium.render(f"Similarité pose: {comparison_result.get('pose_similarity', 0):.1f}%", True, BLACK), (x_txt, y_txt))
            y_txt += 30
            if improvements:
                screen.blit(font_medium.render("Améliorations:", True, BLACK), (x_txt, y_txt))
                y_txt += 25
                for imp in improvements[:8]:
                    color = RED if imp.priority == PriorityLevel.HIGH else YELLOW if imp.priority == PriorityLevel.MEDIUM else GREEN
                    txt = f"• Angle {imp.angle_index}: {imp.direction.value} {imp.magnitude:.1f}°"
                    screen.blit(font_small.render(txt, True, color), (x_txt+10, y_txt))
                    y_txt += 18
            # Instructions
            screen.blit(font_small.render("→/← : frame suivante/précédente  |  Espace : pause/play  |  ESC : quitter", True, DARK_GRAY), (20, WINDOW_HEIGHT - 25))
            pygame.display.flip()
            clock.tick(60)
        pygame.quit()

if __name__ == "__main__":
    import asyncio
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from config.db_models import DatabaseManager
    from config.setting import get_variables

    async def main():
        print("🎬 Visualisation vidéo des keypoints depuis la base de données")
        db_model = DatabaseManager()
        print("\n🔍 Options pour récupérer les données:")
        print("1. Utiliser un email pour récupérer les dernières données")
        print("2. Utiliser un ID spécifique")
        print("3. Utiliser les données de référence")
        choice = input("Choisissez une option (1/2/3): ").strip()
        user_data = None
        reference_data = None
        if choice == "1":
            email = input("📧 Entrez l'email: ").strip()
            user_data = await db_model.get_latest_by_email(email)
            if not user_data:
                print(f"❌ Aucune donnée trouvée pour l'email {email}")
                return
        elif choice == "2":
            video_id = input("🆔 Entrez l'ID de la vidéo: ").strip()
            user_data = await db_model.get_by_id(video_id)
            if not user_data:
                print(f"❌ Aucune donnée trouvée pour l'ID {video_id}")
                return
        elif choice == "3":
            reference_data = await db_model.get_reference_data()
            if not reference_data:
                print("❌ Aucune donnée de référence trouvée")
                return
            user_data = reference_data
        else:
            print("❌ Option invalide")
            return
        if not reference_data:
            reference_data = await db_model.get_reference_data()
            if not reference_data:
                print("❌ Aucune donnée de référence trouvée")
                return
        user_frames = user_data.get("frames", [])
        reference_frames = reference_data.get("frames", [])
        if not user_frames or not reference_frames:
            print("❌ Données de frames insuffisantes")
            return
        def group_frames_by_class(frames):
            grouped = {}
            for frame in frames:
                class_name = frame.get('class_name', 'unknown')
                if class_name not in grouped:
                    grouped[class_name] = []
                grouped[class_name].append(frame)
            return grouped
        user_frames_grouped = group_frames_by_class(user_frames)
        reference_frames_grouped = group_frames_by_class(reference_frames)
        available_classes = set(user_frames_grouped.keys()) & set(reference_frames_grouped.keys())
        if not available_classes:
            print("❌ Aucune classe commune trouvée entre user et reference")
            return
        print(f"\n📋 Classes disponibles: {list(available_classes)}")
        # --- Suppression de toute sélection de classe ---
        # On fusionne toutes les frames de toutes les classes communes dans une seule séquence
        merged_user_frames = []
        merged_reference_frames = []
        merged_class_names = []
        for class_name in sorted(available_classes):
            user_class_frames = user_frames_grouped[class_name]
            reference_class_frames = reference_frames_grouped[class_name]
            n = min(len(user_class_frames), len(reference_class_frames))
            merged_user_frames.extend(user_class_frames[:n])
            merged_reference_frames.extend(reference_class_frames[:n])
            merged_class_names.extend([class_name]*n)
        # On ajoute le nom de la classe à chaque frame utilisateur pour affichage
        for idx, frame in enumerate(merged_user_frames):
            frame['__class_name'] = merged_class_names[idx]
        # Wrapper pour afficher le nom de la classe courante dans la vidéo
        class MultiClassComparaison(Comparaison):
            def display_keypoints_video(self, frames, reference_frames, fps=10, use_kalman=False):
                # On utilise le nom de classe stocké dans chaque frame
                super().display_keypoints_video(frames, reference_frames, class_name="", fps=fps, use_kalman=use_kalman)
        comp = MultiClassComparaison(model=merged_user_frames, dataset=merged_reference_frames, use_kalman=False)
        # Patch la méthode d'affichage pour afficher le nom de la classe courante
        def patched_display(frames, reference_frames, class_name="", fps=10, use_kalman=False):
            import pygame
            import time
            import cv2
            import numpy as np
            WINDOW_WIDTH = 1200
            WINDOW_HEIGHT = 800
            KEYPOINT_PANEL_WIDTH = 800
            TEXT_PANEL_WIDTH = 400
            WHITE = (255, 255, 255)
            BLACK = (0, 0, 0)
            RED = (255, 0, 0)
            BLUE = (0, 0, 255)
            GREEN = (0, 255, 0)
            YELLOW = (255, 255, 0)
            LIGHT_GRAY = (200, 200, 200)
            DARK_GRAY = (64, 64, 64)
            skeleton_connections = [
                (0, 1), (0, 2), (1, 3), (2, 4),
                (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),
                (5, 11), (6, 12), (11, 12),
                (11, 13), (13, 15), (12, 14), (14, 16)
            ]
            def normalize_keypoints(keypoints, panel_width, panel_height, margin=50):
                if not keypoints:
                    return []
                valid_keypoints = [(kp[0], kp[1]) for kp in keypoints if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0]
                if not valid_keypoints:
                    return [(0, 0) for _ in keypoints]
                min_x = min(kp[0] for kp in valid_keypoints)
                max_x = max(kp[0] for kp in valid_keypoints)
                min_y = min(kp[1] for kp in valid_keypoints)
                max_y = max(kp[1] for kp in valid_keypoints)
                width_range = max_x - min_x if max_x != min_x else 1
                height_range = max_y - min_y if max_y != min_y else 1
                normalized = []
                for kp in keypoints:
                    if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                        norm_x = margin + ((kp[0] - min_x) / width_range) * (panel_width - 2 * margin)
                        norm_y = margin + ((kp[1] - min_y) / height_range) * (panel_height - 2 * margin)
                        normalized.append((norm_x, norm_y))
                    else:
                        normalized.append((0, 0))
                return normalized
            def draw_skeleton(surface, keypoints, connections, color, offset_x=0, offset_y=0):
                for start_idx, end_idx in connections:
                    if (start_idx < len(keypoints) and end_idx < len(keypoints) and
                        keypoints[start_idx][0] > 0 and keypoints[start_idx][1] > 0 and
                        keypoints[end_idx][0] > 0 and keypoints[end_idx][1] > 0):
                        start_pos = (keypoints[start_idx][0] + offset_x, keypoints[start_idx][1] + offset_y)
                        end_pos = (keypoints[end_idx][0] + offset_x, keypoints[end_idx][1] + offset_y)
                        pygame.draw.line(surface, color, start_pos, end_pos, 2)
            def draw_keypoints(surface, keypoints, color, offset_x=0, offset_y=0, radius=5):
                for i, kp in enumerate(keypoints):
                    if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                        pos = (int(kp[0] + offset_x), int(kp[1] + offset_y))
                        pygame.draw.circle(surface, color, pos, radius)
            # --- Ouvrir la vidéo utilisateur ---
            video_path = '../' + user_data.get('url')
            cap = None
            if video_path:
                cap = cv2.VideoCapture(video_path)
                total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

            # --- Fonction de synchronisation frame keypoints <-> frame vidéo ---
            def get_video_frame_idx(user_frame, idx, n_video_frames):
                # 1. Si la frame possède un champ 'frame_index', l'utiliser
                if 'frame_index' in user_frame:
                    return int(user_frame['frame_index'])
                # 2. Si la frame possède un timestamp, faire une correspondance temporelle (optionnel)
                # 3. Sinon, correspondance linéaire
                n_keypoints_frames = n_frames
                if n_keypoints_frames > 1 and n_video_frames > 1:
                    return int(idx * (n_video_frames - 1) / (n_keypoints_frames - 1))
                return idx

            pygame.init()
            screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
            pygame.display.set_caption(f"Vidéo Keypoints - Multi-classes")
            font_large = pygame.font.Font(None, 24)
            font_medium = pygame.font.Font(None, 20)
            font_small = pygame.font.Font(None, 16)
            panel_height = WINDOW_HEIGHT - 100
            clock = pygame.time.Clock()
            running = True
            paused = False
            frame_idx = 0
            n_frames = len(frames)
            last_update = time.time()
            while running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_ESCAPE:
                            running = False
                        elif event.key == pygame.K_RIGHT:
                            frame_idx = min(frame_idx + 1, n_frames - 1)
                            paused = True
                        elif event.key == pygame.K_LEFT:
                            frame_idx = max(frame_idx - 1, 0)
                            paused = True
                        elif event.key == pygame.K_SPACE:
                            paused = not paused
                if not paused and (time.time() - last_update > 1.0 / fps):
                    frame_idx += 1
                    if frame_idx >= n_frames:
                        frame_idx = 0
                    last_update = time.time()
                user_frame = frames[frame_idx]
                ref_frame = reference_frames[frame_idx] if frame_idx < len(reference_frames) else reference_frames[-1]
                # --- Affichage de la frame vidéo utilisateur dans une fenêtre OpenCV ---
                if cap:
                    video_frame_idx = get_video_frame_idx(user_frame, frame_idx, total_video_frames)
                    cap.set(cv2.CAP_PROP_POS_FRAMES, video_frame_idx)
                    ret, frame_bgr = cap.read()
                    if ret:
                        cv2.imshow('Vidéo Utilisateur', frame_bgr)
                        cv2.waitKey(1)
                    else:
                        blank = np.ones((panel_height, KEYPOINT_PANEL_WIDTH, 3), dtype=np.uint8) * 255
                        cv2.imshow('Vidéo Utilisateur', blank)
                        cv2.waitKey(1)
                # --- Affichage principal (analyse) ---
                screen.fill(WHITE)
                keypoint_rect = pygame.Rect(10, 50, KEYPOINT_PANEL_WIDTH, panel_height)
                pygame.draw.rect(screen, WHITE, keypoint_rect)
                pygame.draw.rect(screen, BLACK, keypoint_rect, 2)
                def dict_to_list(keypoints_dict):
                    keypoint_order = [
                        'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
                        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
                        'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
                        'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
                    ]
                    keypoints_list = []
                    for keypoint in keypoint_order:
                        x_key = f"{keypoint}_x"
                        y_key = f"{keypoint}_y"
                        x = keypoints_dict.get(x_key, 0.0)
                        y = keypoints_dict.get(y_key, 0.0)
                        keypoints_list.append([x, y])
                    return keypoints_list
                current_keypoints = dict_to_list(user_frame['keypoints_positions'])
                reference_keypoints = dict_to_list(ref_frame['keypoints_positions'])
                if use_kalman or getattr(comp, 'use_kalman', False):
                    current_keypoints = comp.filter_keypoints(current_keypoints)
                    reference_keypoints = comp.filter_keypoints(reference_keypoints)
                # Normalisation
                current_normalized = normalize_keypoints(current_keypoints, KEYPOINT_PANEL_WIDTH, panel_height)
                reference_normalized = normalize_keypoints(reference_keypoints, KEYPOINT_PANEL_WIDTH, panel_height)
                comparison_result = comp.compare_keypoints(current_keypoints, reference_keypoints)
                improvements = []
                if 'angles' in user_frame and 'angles' in ref_frame:
                    reference_angles = {}
                    for angle in ref_frame['angles']:
                        angle_name = str(angle.get('angle_name', ['unknown', 0])[0])
                        angle_value = angle.get('angle', 0)
                        reference_angles[angle_name] = {"ref": angle_value, "tolerance": 5.0}
                    improvements = comp.compare_angles(user_frame['angles'], reference_angles)
                class_name = user_frame.get('__class_name', 'Unknown')
                title = font_large.render(f"Frame {frame_idx+1}/{n_frames} - Classe: {class_name}", True, BLACK)
                screen.blit(title, (20, 20))
                if reference_normalized:
                    draw_skeleton(screen, reference_normalized, skeleton_connections, RED, 10, 50)
                    draw_keypoints(screen, reference_normalized, RED, 10, 50)
                if current_normalized:
                    draw_skeleton(screen, current_normalized, skeleton_connections, BLUE, 10, 50)
                    draw_keypoints(screen, current_normalized, BLUE, 10, 50)
                pygame.draw.rect(screen, LIGHT_GRAY, (KEYPOINT_PANEL_WIDTH + 20, 50, TEXT_PANEL_WIDTH - 30, panel_height))
                pygame.draw.rect(screen, BLACK, (KEYPOINT_PANEL_WIDTH + 20, 50, TEXT_PANEL_WIDTH - 30, panel_height), 2)
                y_txt = 60
                x_txt = KEYPOINT_PANEL_WIDTH + 30
                screen.blit(font_medium.render(f"Score alignement: {comparison_result.get('alignment_score', 0):.1f}%", True, BLACK), (x_txt, y_txt))
                y_txt += 30
                screen.blit(font_medium.render(f"Similarité pose: {comparison_result.get('pose_similarity', 0):.1f}%", True, BLACK), (x_txt, y_txt))
                y_txt += 30
                if improvements:
                    screen.blit(font_medium.render("Améliorations:", True, BLACK), (x_txt, y_txt))
                    y_txt += 25
                    for imp in improvements[:8]:
                        color = RED if imp.priority == PriorityLevel.HIGH else YELLOW if imp.priority == PriorityLevel.MEDIUM else GREEN
                        txt = f"• Angle {imp.angle_index}: {imp.direction.value} {imp.magnitude:.1f}°"
                        screen.blit(font_small.render(txt, True, color), (x_txt+10, y_txt))
                        y_txt += 18
                screen.blit(font_small.render("→/← : frame suivante/précédente  |  Espace : pause/play  |  ESC : quitter", True, DARK_GRAY), (20, WINDOW_HEIGHT - 25))
                pygame.display.update(screen.get_rect())
                clock.tick(60)
            if cap:
                cap.release()
            cv2.destroyAllWindows()
            pygame.quit()
        comp.display_keypoints_video = patched_display
        # --- Pour activer le kalman, passer use_kalman=True ---
        comp.display_keypoints_video(merged_user_frames, merged_reference_frames, fps=10, use_kalman=False)

    asyncio.run(main())
