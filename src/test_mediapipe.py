import cv2
import mediapipe as mp
import argparse

class Keypoint:
    def __init__(self, x=0.0, y=0.0, z=0.0, visibility=0.0):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility

    def __repr__(self):
        return f"Keypoint(x={self.x}, y={self.y}, z={self.z}, visibility={self.visibility})"

class PoseKeypoints:
    def __init__(self):
        self.left_shoulder = Keypoint()
        self.right_shoulder = Keypoint()
        self.left_elbow = Keypoint()
        self.right_elbow = Keypoint()
        self.left_wrist = Keypoint()
        self.right_wrist = Keypoint()

    def __repr__(self):
        return f"PoseKeypoints({vars(self)})"

def main(video_path):
    # Initialisation de MediaPipe pour la détection de pose
    mp_pose = mp.solutions.pose
    pose_detector = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    mp_drawing = mp.solutions.drawing_utils

    # Chargement de la vidéo
    cap = cv2.VideoCapture(video_path)

    # Tableau pour stocker les keypoints de chaque frame
    keypoints_array = []

    # Traitement de chaque frame de la vidéo
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Conversion de BGR à RGB (MediaPipe utilise RGB)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Détection de la pose
        results = pose_detector.process(frame_rgb)

        # Création d'un nouvel objet PoseKeypoints pour chaque frame
        pose_keypoints = PoseKeypoints()

        # Vérifier si des keypoints ont été détectés
        if results.pose_landmarks:
            # Remplir l'objet pose_keypoints avec les valeurs détectées
            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                h, w, _ = frame.shape  # Taille de l'image pour convertir les coordonnées normalisées
                x, y, z, visibility = int(landmark.x * w), int(landmark.y * h), landmark.z, landmark.visibility

                # Assigner les coordonnées aux keypoints requis
                if idx == 7:  # Left shoulder
                    pose_keypoints.left_shoulder = Keypoint(x, y, z, visibility)
                elif idx == 8:  # Right shoulder
                    pose_keypoints.right_shoulder = Keypoint(x, y, z, visibility)
                elif idx == 9:  # Left elbow
                    pose_keypoints.left_elbow = Keypoint(x, y, z, visibility)
                elif idx == 10:  # Right elbow
                    pose_keypoints.right_elbow = Keypoint(x, y, z, visibility)
                elif idx == 11:  # Left wrist
                    pose_keypoints.left_wrist = Keypoint(x, y, z, visibility)
                elif idx == 12:  # Right wrist
                    pose_keypoints.right_wrist = Keypoint(x, y, z, visibility)

            # Ajouter l'objet pose_keypoints au tableau
            keypoints_array.append(pose_keypoints)

            # Afficher les keypoints (facultatif)
            print(f"Frame {len(keypoints_array) - 1}: {pose_keypoints}")

            # Afficher les keypoints sur l'image
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # Afficher la frame
        cv2.imshow("Pose Detection", frame)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    # Libérer les ressources
    cap.release()
    cv2.destroyAllWindows()

    # Retourner le tableau de keypoints
    return keypoints_array

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyse de poses à partir d'une vidéo.")
    parser.add_argument("video_path", type=str, help="Chemin vers la vidéo à analyser")
    args = parser.parse_args()

    keypoints_data = main(args.video_path)

    # Ici, vous pouvez utiliser keypoints_data pour d'autres analyses
