reference_data = [
    {
        "gender": "men",
        "phase": "shot_position",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    {
        "gender": "men",
        "phase": "shot_realese",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    {
        "gender": "men",
        "phase": "shot_followthrough",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    }
]

def check_alignment(angle_name, measured_angle, reference_entry):

    angle_ref = reference_entry["angles"].get(angle_name)

    if angle_ref is None or angle_ref["ref"] is None or angle_ref["tolerance"] is None:
        return False, None

    min_angle = angle_ref["ref"] - angle_ref["tolerance"]
    max_angle = angle_ref["ref"] + angle_ref["tolerance"]

    is_correct = min_angle <= measured_angle <= max_angle

    error = measured_angle - angle_ref["ref"]

    return is_correct, error

def generate_feedback(angle_name, error):

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

def analyze_phase(measured_angles, phase_data):
    messages = []
    for angle_name, measured_angle in measured_angles.items():
        is_correct, error = check_alignment(angle_name, measured_angle, phase_data)
        if is_correct:
            messages.append(f"L'angle '{angle_name}' est correct ({measured_angle}°). Bon mouvement !")
        else:
            if error is not None:
                feedback = generate_feedback(angle_name, error)
                messages.append(feedback)
            else:
                messages.append(f"L'angle '{angle_name}' n'est pas défini dans les données de référence.")
    return messages

if __name__ == "__main__":
    measured_angles = {
        "hip": 170,
        "knee": 100,
        "ankle": 95,
        "elbow": 85,
    }
    phase_data = reference_data[0]
    result_messages = analyze_phase(measured_angles, phase_data)
    for message in result_messages:
        print(message)