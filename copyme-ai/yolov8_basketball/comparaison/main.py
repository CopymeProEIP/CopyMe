import sys
import os
# --- Ajout du dossier racine au PYTHONPATH pour garantir les imports absolus ---
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
# --- Ajout du dossier parent pour permettre l'import du package comparaison ---
PARENT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from config.db_models import DatabaseManager
from display import Display

if __name__ == "__main__":
    async def main():
        print("🎬 Visualisation vidéo des keypoints depuis la base de données")
        db_model = DatabaseManager()
        print("\n🔍 Options pour récupérer les données:")
        print("1. Utiliser un email pour récupérer les dernières données")
        print("2. Utiliser un ID spécifique")
        print("3. Utiliser les données de référence")
        choice = input("Choisissez une option (1/2/3): ").strip()
        user_data = None
        reference_data = None
        if choice == "1":
            email = input("📧 Entrez l'email: ").strip()
            user_data = await db_model.get_latest_by_email(email)
            if not user_data:
                print(f"❌ Aucune donnée trouvée pour l'email {email}")
                return
        elif choice == "2":
            # video_id = input("🆔 Entrez l'ID de la vidéo: ").strip()
            video_id = "685d70063c2a10a5fd8a07ea"
            user_data = await db_model.get_by_id(video_id)
            if not user_data:
                print(f"❌ Aucune donnée trouvée pour l'ID {video_id}")
                return
        elif choice == "3":
            reference_data = await db_model.get_reference_data()
            if not reference_data:
                print("❌ Aucune donnée de référence trouvée")
                return
            user_data = reference_data
        else:
            print("❌ Option invalide")
            return
        if not reference_data:
            reference_data = await db_model.get_reference_data()
            if not reference_data:
                print("❌ Aucune donnée de référence trouvée")
                return
        user_frames = user_data.get("frames", [])
        reference_frames = reference_data.get("frames", [])
        if not user_frames or not reference_frames:
            print("❌ Données de frames insuffisantes")
            return
        def group_frames_by_class(frames):
            grouped = {}
            for frame in frames:
                class_name = frame.get('class_name', 'unknown')
                if class_name not in grouped:
                    grouped[class_name] = []
                grouped[class_name].append(frame)
            return grouped
        user_frames_grouped = group_frames_by_class(user_frames)
        reference_frames_grouped = group_frames_by_class(reference_frames)
        available_classes = set(user_frames_grouped.keys()) & set(reference_frames_grouped.keys())
        if not available_classes:
            print("❌ Aucune classe commune trouvée entre user et reference")
            return
        print(f"\n📋 Classes disponibles: {list(available_classes)}")
        # --- Suppression de toute sélection de classe ---
        # On fusionne toutes les frames de toutes les classes communes dans une seule séquence
        merged_user_frames = []
        merged_reference_frames = []
        merged_class_names = []
        for class_name in sorted(available_classes):
            user_class_frames = user_frames_grouped[class_name]
            reference_class_frames = reference_frames_grouped[class_name]
            n = min(len(user_class_frames), len(reference_class_frames))
            merged_user_frames.extend(user_class_frames[:n])
            merged_reference_frames.extend(reference_class_frames[:n])
            merged_class_names.extend([class_name]*n)
        # On ajoute le nom de la classe à chaque frame utilisateur pour affichage
        for idx, frame in enumerate(merged_user_frames):
            frame['__class_name'] = merged_class_names[idx]
        # Wrapper pour afficher le nom de la classe courante dans la vidéo
        comp = Display()
        comp.display_keypoints_video(merged_user_frames, merged_reference_frames, video_path='../../' + user_data.get('url'), fps=30, use_kalman=False)

    asyncio.run(main())
