import math
import sys
import os
import argparse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from archive_mediapipe import main

ref_hip_angle_men = 158.89
tolerance_hip_men = 6.16

ref_knee_angle_men = 86
tolerance_knee_men = 15

ref_ankle_angle_men = 108.39
tolerance_ankle_men = 10.58

gender = 'male'

def calculate_angle(pointA, pointB, pointC):
    AB = (pointA[0] - pointB[0], pointA[1] - pointB[1], pointA[2] - pointB[2])
    BC = (pointC[0] - pointB[0], pointC[1] - pointB[1], pointC[2] - pointB[2])
    
    dot_product = AB[0] * BC[0] + AB[1] * BC[1] + AB[2] * BC[2]
    
    norm_AB = math.sqrt(AB[0]**2 + AB[1]**2 + AB[2]**2)
    norm_BC = math.sqrt(BC[0]**2 + BC[1]**2 + BC[2]**2)
    
    cos_theta = dot_product / (norm_AB * norm_BC)
    cos_theta = max(-1.0, min(1.0, cos_theta))
    angle = math.degrees(math.acos(cos_theta))
    
    return angle

left_hip = (1, 2, 3)
left_knee = (4, 5, 6)
left_ankle = (7, 8, 9)

angle_knee = calculate_angle(left_hip, left_knee, left_ankle)
print("Angle de flexion du genou gauche :", angle_knee)


def check_alignement(calculate_angle, reference_angle, tolerance):

    min_angle = reference_angle - tolerance
    max_angle = reference_angle + tolerance

    if calculate_angle >= min_angle and calculate_angle <= max_angle:
        return True
    else:
        return False



result = check_alignement(153, ref_hip_angle_men, tolerance_hip_men)
result1 = check_alignement(120, ref_hip_angle_men, tolerance_hip_men)
result2 = check_alignement(170, ref_hip_angle_men, tolerance_hip_men)

print(result)
print(result1)
print(result2)

def main_video(video_path):
    # Extraire les keypoints de la vidéo
    keypoints_data = main(video_path)  # Appel à la fonction 'main' de archive_mediapipe

    for frame_index, pose_keypoints in enumerate(keypoints_data):
        print(keypoints_data)
        # Calculer l'angle de flexion pour chaque frame
        # Exemples de points de l'hip, knee et ankle pour le côté gauche
        left_hip = (pose_keypoints.left_hip.x, pose_keypoints.left_hip.y, pose_keypoints.left_hip.z)
        left_knee = (pose_keypoints.left_knee.x, pose_keypoints.left_knee.y, pose_keypoints.left_knee.z)
        left_ankle = (pose_keypoints.left_ankle.x, pose_keypoints.left_ankle.y, pose_keypoints.left_ankle.z)

        # Calcul de l'angle du genou gauche
        angle_knee = calculate_angle(left_hip, left_knee, left_ankle)
        print(f"Frame {frame_index + 1}: Angle de flexion du genou gauche = {angle_knee}°")

        # Vérification de l'alignement du genou
        result_knee = check_alignement(angle_knee, ref_knee_angle_men, tolerance_knee_men)
        print(f"Alignement du genou gauche (tolérance): {'OK' if result_knee else 'Non OK'}")

        # Calcul de l'angle de la hanche gauche
        left_hip_angle = calculate_angle(left_knee, left_hip, left_ankle)
        print(f"Frame {frame_index + 1}: Angle de flexion de la hanche gauche = {left_hip_angle}°")

        # Vérification de l'alignement de la hanche
        result_hip = check_alignement(left_hip_angle, ref_hip_angle_men, tolerance_hip_men)
        print(f"Alignement de la hanche gauche (tolérance): {'OK' if result_hip else 'Non OK'}")

        # Calcul de l'angle de la cheville gauche
        left_ankle_angle = calculate_angle(left_knee, left_ankle, left_hip)
        print(f"Frame {frame_index + 1}: Angle de flexion de la cheville gauche = {left_ankle_angle}°")

        # Vérification de l'alignement de la cheville
        result_ankle = check_alignement(left_ankle_angle, ref_ankle_angle_men, tolerance_ankle_men)
        print(f"Alignement de la cheville gauche (tolérance): {'OK' if result_ankle else 'Non OK'}")

if __name__ == "__main__":
    # Parser pour accepter le chemin du fichier vidéo en argument
    parser = argparse.ArgumentParser(description="Analyse de la vidéo de tir au basket.")
    parser.add_argument("video_path", type=str, help="Chemin vers la vidéo à analyser")
    args = parser.parse_args()

    # Appel de la fonction principale avec le chemin vidéo passé en argument
    main_video(args.video_path)
