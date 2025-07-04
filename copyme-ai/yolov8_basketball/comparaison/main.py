import sys
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
# Ajout des chemins pour les imports
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
PARENT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)
from config.db_models import DatabaseManager
from display import Display
from comparaison import Comparaison

def extract_first_valid_phase_sequence(frames, min_frames_per_phase=3):
    """
    Détecte la première séquence ordonnée contenant les phases :
    shot_position → shot_release → shot_followthrough
    en s'assurant que chaque phase a au moins N frames consécutifs.
    """
    stable_chunks = []
    i = 0
    total = len(frames)

    while i < total:
        current_class = frames[i].get("class_name", "unknown")
        chunk = []
        while i < total and frames[i].get("class_name", "unknown") == current_class:
            chunk.append(frames[i])
            i += 1
        if len(chunk) >= min_frames_per_phase and current_class != "unknown":
            stable_chunks.append((current_class, chunk))

    # Maintenant, on cherche les trois phases dans le bon ordre
    print(f"Phases détectées : {[class_name for class_name, _ in stable_chunks]}")
    sequence = []
    phases_found = set()
    for class_name, chunk in stable_chunks:
        if class_name not in phases_found and (
            class_name == "shot_position" and len(sequence) == 0 or
            class_name == "shot_release" and len(sequence) == 1 or
            class_name == "shot_followthrough" and len(sequence) == 2
        ):
            sequence.extend(chunk)
            phases_found.add(class_name)
        if len(phases_found) == 3:
            break
    return sequence if len(phases_found) == 3 else []

def dict_to_list(keypoints_dict):
    keypoint_order = [
        'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
        'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
        'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ]
    return [[keypoints_dict.get(f"{kp}_x", 0.0), keypoints_dict.get(f"{kp}_y", 0.0)] for kp in keypoint_order]

async def main():
    print("Visualisation vidéo des keypoints depuis la base de données")
    db_model = DatabaseManager()

    video_id = "685d70063c2a10a5fd8a07ea"
    user_data = await db_model.get_by_id(video_id)
    if not user_data:
        print(f"Aucune donnée trouvée pour l'ID {video_id}")
        return

    reference_data = await db_model.get_reference_data()
    if not reference_data:
        print("Aucune donnée de référence trouvée")
        return

    user_frames = user_data.get("frames", [])
    reference_frames = reference_data.get("frames", [])

    if not user_frames or not reference_frames:
        print("Données de frames insuffisantes")
        return

    user_valid_sequence = extract_first_valid_phase_sequence(user_frames, min_frames_per_phase=3)
    reference_valid_sequence = extract_first_valid_phase_sequence(reference_frames, min_frames_per_phase=3)


    if not user_valid_sequence or not reference_valid_sequence:
        print("Impossible de trouver une séquence complète et ordonnée dans les frames")
        return

    n = min(len(user_valid_sequence), len(reference_valid_sequence))
    merged_user_frames = user_valid_sequence[:n]
    merged_reference_frames = reference_valid_sequence[:n]

    print("Pré-calcul de tous les résultats de comparaison...")
    comparaison_engine = Comparaison(
        model=merged_user_frames,
        dataset=merged_reference_frames,
        use_kalman=False
    )

    calculated_results = []
    for i in range(n):
        user_frame = merged_user_frames[i]
        ref_frame = merged_reference_frames[i]

        current_keypoints = dict_to_list(user_frame['keypoints_positions'])
        reference_keypoints = dict_to_list(ref_frame['keypoints_positions'])

        filtered_current = comparaison_engine.filter_keypoints(current_keypoints) if comparaison_engine.use_kalman else current_keypoints
        filtered_reference = comparaison_engine.filter_keypoints(reference_keypoints) if comparaison_engine.use_kalman else reference_keypoints

        comparison_result = comparaison_engine.compare_keypoints(filtered_current, filtered_reference)

        improvements = []
        if 'angles' in user_frame and 'angles' in ref_frame:
            reference_angles = {
                str(angle.get('angle_name', ['unknown', 0])[0]): {
                    "ref": angle.get('angle', 0), "tolerance": 5.0
                } for angle in ref_frame['angles']
            }
            improvements = comparaison_engine.compare_angles(user_frame['angles'], reference_angles)

        calculated_results.append({
            'filtered_current_keypoints': filtered_current,
            'filtered_reference_keypoints': filtered_reference,
            'comparison_result': comparison_result,
            'improvements': improvements
        })

        if (i + 1) % 10 == 0 or i == n - 1:
            print(f"     {i + 1}/{n} frames calculées")

    print("Tous les calculs terminés ! Lancement de la visualisation...")

    display = Display()
    display.display_keypoints_video(
        frames=merged_user_frames,
        reference_frames=merged_reference_frames,
        video_path='../../' + user_data.get('url'),
        calculated_results=calculated_results,
        fps=30
    )

if __name__ == "__main__":
    asyncio.run(main())
