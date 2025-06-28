from typing import List, Dict
from .models import Improvement
from .enums import Direction, PriorityLevel

class AngleUtils:
    @staticmethod
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

