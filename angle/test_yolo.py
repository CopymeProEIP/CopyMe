from ultralytics import YOLO
import math

# Définition de la classe GetKeypoint avec les indices des articulations
class GetKeypoint:
    NOSE = 0
    LEFT_EYE = 1
    RIGHT_EYE = 2
    LEFT_EAR = 3
    RIGHT_EAR = 4
    LEFT_SHOULDER = 5
    RIGHT_SHOULDER = 6
    LEFT_ELBOW = 7
    RIGHT_ELBOW = 8
    LEFT_WRIST = 9
    RIGHT_WRIST = 10
    LEFT_HIP = 11
    RIGHT_HIP = 12
    LEFT_KNEE = 13
    RIGHT_KNEE = 14
    LEFT_ANKLE = 15
    RIGHT_ANKLE = 16


model = YOLO('yolov8m-pose.pt')  # Assure-toi que le modèle YOLOv8 pose est chargé

# Charger l'image
image_path = '../s.jpg'
result = model(image_path)  # Effectuer l'inférence sur l'image

# Accéder aux keypoints du premier utilisateur détecté
keypoints = result[0].keypoints  # On suppose qu'il y a au moins une personne détectée

# Afficher les keypoints pour déboguer la structure des données
print(keypoints)

# Vérifier si les keypoints sont visibles et accéder aux coordonnées des articulations
if len(keypoints) > 0:  # Si au moins un keypoint est détecté
    left_hip = keypoints[0][GetKeypoint.LEFT_HIP] if keypoints[0][GetKeypoint.LEFT_HIP].confidence > 0.5 else None
    left_knee = keypoints[0][GetKeypoint.LEFT_KNEE] if keypoints[0][GetKeypoint.LEFT_KNEE].confidence > 0.5 else None
    left_ankle = keypoints[0][GetKeypoint.LEFT_ANKLE] if keypoints[0][GetKeypoint.LEFT_ANKLE].confidence > 0.5 else None

    # Si les points sont valides (non nuls), affiche leurs coordonnées
    if left_hip:
        print("Coordonnées de la hanche gauche :", (left_hip.x, left_hip.y))
    else:
        print("La hanche gauche n'a pas été détectée ou a une faible confiance.")

    if left_knee:
        print("Coordonnées du genou gauche :", (left_knee.x, left_knee.y))
    else:
        print("Le genou gauche n'a pas été détecté ou a une faible confiance.")

    if left_ankle:
        print("Coordonnées de la cheville gauche :", (left_ankle.x, left_ankle.y))
    else:
        print("La cheville gauche n'a pas été détectée ou a une faible confiance.")
else:
    print("Aucune personne détectée.")
