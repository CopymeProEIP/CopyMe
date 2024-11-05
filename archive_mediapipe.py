import cv2
import mediapipe as mp
import argparse

def main(video_path):
    # Initialisation de MediaPipe pour la détection de pose
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    mp_drawing = mp.solutions.drawing_utils

    # Chargement de la vidéo
    cap = cv2.VideoCapture(video_path)

    # Traitement de chaque frame de la vidéo
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Conversion de BGR à RGB (MediaPipe utilise RGB)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Détection de la pose
        results = pose.process(frame_rgb)

        # Vérifier si des keypoints ont été détectés
        if results.pose_landmarks:
            # Afficher les keypoints sur l'image (facultatif)
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Récupérer les coordonnées des keypoints
            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                h, w, _ = frame.shape  # Taille de l'image pour convertir les coordonnées normalisées
                x, y, z = int(landmark.x * w), int(landmark.y * h), landmark.z
                print(f"Keypoint {idx}: x={x}, y={y}, z={z}")

        # Afficher la frame avec les keypoints (facultatif)
        cv2.imshow("Pose Detection", frame)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    # Libérer les ressources
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyse de poses à partir d'une vidéo.")
    parser.add_argument("video_path", type=str, help="Chemin vers la vidéo à analyser")
    args = parser.parse_args()

    # Appel de la fonction principale avec le chemin de la vidéo passé en paramètre
    main(args.video_path)
