import cv2
import mediapipe as mp
import argparse

class Keypoint:
    def __init__(self, x=0.0, y=0.0, z=0.0):
        self.x = x
        self.y = y
        self.z = z

    def __repr__(self):
        return f"Keypoint(x={self.x}, y={self.y}, z={self.z})"

class PoseKeypoints:
    def __init__(self):
        self.nose = Keypoint()
        self.left_eye_outer = Keypoint()
        self.left_eye_inner = Keypoint()
        self.right_eye_inner = Keypoint()
        self.right_eye_outer = Keypoint()
        self.left_ear = Keypoint()
        self.right_ear = Keypoint()
        self.left_shoulder = Keypoint()
        self.right_shoulder = Keypoint()
        self.left_elbow = Keypoint()
        self.right_elbow = Keypoint()
        self.left_wrist = Keypoint()
        self.right_wrist = Keypoint()
        self.left_palm = Keypoint()
        self.right_palm = Keypoint()
        self.left_index_tip = Keypoint()
        self.right_index_tip = Keypoint()
        self.left_hip = Keypoint()
        self.right_hip = Keypoint()
        self.left_knee = Keypoint()
        self.right_knee = Keypoint()
        self.left_ankle = Keypoint()
        self.right_ankle = Keypoint()
        self.left_heel = Keypoint()
        self.right_heel = Keypoint()
        self.left_foot_index = Keypoint()
        self.right_foot_index = Keypoint()
        self.left_hip_close = Keypoint()
        self.right_hip_close = Keypoint()
        self.spine_chest = Keypoint()
        self.spine_upper = Keypoint()
        self.chin = Keypoint()

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

        # Création d'un objet PoseKeypoints
        pose_keypoints = PoseKeypoints()

        # Vérifier si des keypoints ont été détectés
        if results.pose_landmarks:
            # Remplir l'objet pose_keypoints avec les valeurs détectées
            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                h, w, _ = frame.shape  # Taille de l'image pour convertir les coordonnées normalisées
                x, y, z = int(landmark.x * w), int(landmark.y * h), landmark.z

                # Assigner les coordonnées aux keypoints
                if idx == 0: pose_keypoints.nose = Keypoint(x, y, z)
                elif idx == 1: pose_keypoints.left_eye_outer = Keypoint(x, y, z)
                elif idx == 2: pose_keypoints.left_eye_inner = Keypoint(x, y, z)
                elif idx == 3: pose_keypoints.right_eye_inner = Keypoint(x, y, z)
                elif idx == 4: pose_keypoints.right_eye_outer = Keypoint(x, y, z)
                elif idx == 5: pose_keypoints.left_ear = Keypoint(x, y, z)
                elif idx == 6: pose_keypoints.right_ear = Keypoint(x, y, z)
                elif idx == 7: pose_keypoints.left_shoulder = Keypoint(x, y, z)
                elif idx == 8: pose_keypoints.right_shoulder = Keypoint(x, y, z)
                elif idx == 9: pose_keypoints.left_elbow = Keypoint(x, y, z)
                elif idx == 10: pose_keypoints.right_elbow = Keypoint(x, y, z)
                elif idx == 11: pose_keypoints.left_wrist = Keypoint(x, y, z)
                elif idx == 12: pose_keypoints.right_wrist = Keypoint(x, y, z)
                elif idx == 13: pose_keypoints.left_palm = Keypoint(x, y, z)
                elif idx == 14: pose_keypoints.right_palm = Keypoint(x, y, z)
                elif idx == 15: pose_keypoints.left_index_tip = Keypoint(x, y, z)
                elif idx == 16: pose_keypoints.right_index_tip = Keypoint(x, y, z)
                elif idx == 17: pose_keypoints.left_hip = Keypoint(x, y, z)
                elif idx == 18: pose_keypoints.right_hip = Keypoint(x, y, z)
                elif idx == 19: pose_keypoints.left_knee = Keypoint(x, y, z)
                elif idx == 20: pose_keypoints.right_knee = Keypoint(x, y, z)
                elif idx == 21: pose_keypoints.left_ankle = Keypoint(x, y, z)
                elif idx == 22: pose_keypoints.right_ankle = Keypoint(x, y, z)
                elif idx == 23: pose_keypoints.left_heel = Keypoint(x, y, z)
                elif idx == 24: pose_keypoints.right_heel = Keypoint(x, y, z)
                elif idx == 25: pose_keypoints.left_foot_index = Keypoint(x, y, z)
                elif idx == 26: pose_keypoints.right_foot_index = Keypoint(x, y, z)
                elif idx == 27: pose_keypoints.left_hip_close = Keypoint(x, y, z)
                elif idx == 28: pose_keypoints.right_hip_close = Keypoint(x, y, z)
                elif idx == 29: pose_keypoints.spine_chest = Keypoint(x, y, z)
                elif idx == 30: pose_keypoints.spine_upper = Keypoint(x, y, z)
                elif idx == 31: pose_keypoints.chin = Keypoint(x, y, z)

            # Ajouter l'objet pose_keypoints au tableau
            keypoints_array.append(pose_keypoints)

            # Afficher les keypoints (facultatif)
            # print(f"Frame {len(keypoints_array) - 1}: {pose_keypoints}")

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
    print(keypoints_data)
