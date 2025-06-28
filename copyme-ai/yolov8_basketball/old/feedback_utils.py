from typing import List, Dict, Tuple
from config.db_models import AngleData, Direction

reference_data = {
    # ...existing reference data...
}

class FeedbackHandler:
    def __check_alignment(self, angle_name: str, measured_angle: float, reference_entry: Dict) -> Tuple[bool, float]:
        angle_ref = reference_entry["angles"].get(angle_name)

        if angle_ref is None or angle_ref["ref"] is None or angle_ref["tolerance"] is None:
            return False, None

        min_angle = angle_ref["ref"] - angle_ref["tolerance"]
        max_angle = angle_ref["ref"] + angle_ref["tolerance"]

        is_correct = min_angle <= measured_angle <= max_angle
        error = measured_angle - angle_ref["ref"]

        return is_correct, error

    def __generate_feedback(self, angle_name: str, error: float) -> str:
        if angle_name == "hip":
            action = "réduire l'extension" if error > 0 else "augmenter l'extension"
            return f"Veuillez {action} de la hanche de {abs(error):.1f}° pour améliorer votre stabilité pendant le tir."
        elif angle_name == "knee":
            action = "augmenter la flexion" if error < 0 else "réduire la flexion"
            return f"Veuillez {action} au niveau du genou de {abs(error):.1f}° pour adopter une meilleure position de tir."
        elif angle_name == "ankle":
            action = "augmenter la flexion plantaire" if error < 0 else "réduire la flexion plantaire"
            return f"Veuillez {action} de la cheville de {abs(error):.1f}° pour ajuster votre équilibre pendant le tir."
        elif angle_name == "elbow":
            action = "augmenter la flexion" if error < 0 else "réduire la flexion"
            return f"Veuillez {action} au niveau du coude de {abs(error):.1f}° pour un meilleur alignement lors de la poussée du ballon."
        else:
            return f"L'angle '{angle_name}' présente un écart de {abs(error):.1f}°, mais aucun conseil spécifique n'est disponible."

    def analyze_phase(self, measured_angles: List[AngleData], phase_name: str) -> Dict:
        messages = {}
        for angle_data in measured_angles:
            angle_name = angle_data.angle_name[0]
            is_correct, error = self.__check_alignment(angle_name, angle_data.angle, reference_data[phase_name])
            if is_correct:
                messages[angle_name] = f"L'angle '{angle_name}' est correct ({angle_data.angle}°). Bon mouvement !"
            else:
                if error is not None:
                    feedback = self.__generate_feedback(angle_name, error)
                    messages[angle_name] = feedback
                else:
                    messages[angle_name] = f"L'angle '{angle_name}' n'est pas défini dans les données de référence."
        return messages
