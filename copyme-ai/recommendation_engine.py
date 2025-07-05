#!/usr/bin/env python3
from typing import List, Dict, Tuple, Any, Hashable

reference_data = {
    "shot_position": {
        "gender": "men",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    "shot_realese": {
        "gender": "men",
        "phase": "shot_realese",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    "shot_followthrough": {
        "gender": "men",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    }
}

def check_alignment(angle_name: str, measured_angle: float, reference_entry: Dict) -> Tuple[bool, float]:

    angle_ref = reference_entry["angles"].get(angle_name)

    if angle_ref is None or angle_ref["ref"] is None or angle_ref["tolerance"] is None:
        return False, None

    min_angle = angle_ref["ref"] - angle_ref["tolerance"]
    max_angle = angle_ref["ref"] + angle_ref["tolerance"]

    is_correct = min_angle <= measured_angle <= max_angle

    error = measured_angle - angle_ref["ref"]

    return is_correct, error

def generate_feedback(angle_name: str, error: float):

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

def analyze_phase(measured_angles: Dict[Hashable, float], phase_name: str) -> Dict:
    messages = {}
    for angle_name, measured_angle in measured_angles.items():
        is_correct, error = check_alignment(angle_name, measured_angle, reference_data[phase_name])
        if is_correct:
            messages[f'{angle_name}'] = f"L'angle '{angle_name}' est correct ({measured_angle}°). Bon mouvement !"
        else:
            if error is not None:
                feedback = generate_feedback(angle_name, error)
                messages[f'{angle_name}'] = feedback
            else:
                messages[f'{angle_name}'] = f"L'angle '{angle_name}' n'est pas défini dans les données de référence."
    return messages

if __name__ == "__main__":
    measured_angles = {
        "hip": 170,
        "knee": 100,
        "ankle": 95,
        "elbow": 85,
    }
    result_messages = analyze_phase(measured_angles, "shot_position")
    print(result_messages)
