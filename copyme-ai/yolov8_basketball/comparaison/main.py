from motor.motor_asyncio import AsyncIOMotorClient

if __name__ == "__main__":
    import asyncio
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from config.db_models import DatabaseManager
    from config.setting import get_variables

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
            video_id = input("🆔 Entrez l'ID de la vidéo: ").strip()
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
        class MultiClassComparaison(Comparaison):
            def display_keypoints_video(self, frames, reference_frames, fps=10, use_kalman=False):
                # On utilise le nom de classe stocké dans chaque frame
                super().display_keypoints_video(frames, reference_frames, class_name="", fps=fps, use_kalman=use_kalman)
        comp = MultiClassComparaison(model=merged_user_frames, dataset=merged_reference_frames, use_kalman=False)
        # Patch la méthode d'affichage pour afficher le nom de la classe courante
        def patched_display(frames, reference_frames, class_name="", fps=10, use_kalman=False):
            import pygame
            import time
            import cv2
            import numpy as np
            WINDOW_WIDTH = 1200
            WINDOW_HEIGHT = 800
            KEYPOINT_PANEL_WIDTH = 800
            TEXT_PANEL_WIDTH = 400
            WHITE = (255, 255, 255)
            BLACK = (0, 0, 0)
            RED = (255, 0, 0)
            BLUE = (0, 0, 255)
            GREEN = (0, 255, 0)
            YELLOW = (255, 255, 0)
            LIGHT_GRAY = (200, 200, 200)
            DARK_GRAY = (64, 64, 64)
            skeleton_connections = [
                (0, 1), (0, 2), (1, 3), (2, 4),
                (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),
                (5, 11), (6, 12), (11, 12),
                (11, 13), (13, 15), (12, 14), (14, 16)
            ]
            def normalize_keypoints(keypoints, panel_width, panel_height, margin=50):
                if not keypoints:
                    return []
                valid_keypoints = [(kp[0], kp[1]) for kp in keypoints if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0]
                if not valid_keypoints:
                    return [(0, 0) for _ in keypoints]
                min_x = min(kp[0] for kp in valid_keypoints)
                max_x = max(kp[0] for kp in valid_keypoints)
                min_y = min(kp[1] for kp in valid_keypoints)
                max_y = max(kp[1] for kp in valid_keypoints)
                width_range = max_x - min_x if max_x != min_x else 1
                height_range = max_y - min_y if max_y != min_y else 1
                normalized = []
                for kp in keypoints:
                    if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                        norm_x = margin + ((kp[0] - min_x) / width_range) * (panel_width - 2 * margin)
                        norm_y = margin + ((kp[1] - min_y) / height_range) * (panel_height - 2 * margin)
                        normalized.append((norm_x, norm_y))
                    else:
                        normalized.append((0, 0))
                return normalized
            def draw_skeleton(surface, keypoints, connections, color, offset_x=0, offset_y=0):
                for start_idx, end_idx in connections:
                    if (start_idx < len(keypoints) and end_idx < len(keypoints) and
                        keypoints[start_idx][0] > 0 and keypoints[start_idx][1] > 0 and
                        keypoints[end_idx][0] > 0 and keypoints[end_idx][1] > 0):
                        start_pos = (keypoints[start_idx][0] + offset_x, keypoints[start_idx][1] + offset_y)
                        end_pos = (keypoints[end_idx][0] + offset_x, keypoints[end_idx][1] + offset_y)
                        pygame.draw.line(surface, color, start_pos, end_pos, 2)
            def draw_keypoints(surface, keypoints, color, offset_x=0, offset_y=0, radius=5):
                for i, kp in enumerate(keypoints):
                    if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                        pos = (int(kp[0] + offset_x), int(kp[1] + offset_y))
                        pygame.draw.circle(surface, color, pos, radius)
            # --- Ouvrir la vidéo utilisateur ---
            video_path = '../../' + user_data.get('url')
            cap = None
            if video_path:
                cap = cv2.VideoCapture(video_path)
                total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

            # --- Fonction de synchronisation frame keypoints <-> frame vidéo ---
            def get_video_frame_idx(user_frame, idx, n_video_frames):
                # 1. Si la frame possède un champ 'frame_index', l'utiliser
                if 'frame_index' in user_frame:
                    return int(user_frame['frame_index'])
                # 2. Si la frame possède un timestamp, faire une correspondance temporelle (optionnel)
                # 3. Sinon, correspondance linéaire
                n_keypoints_frames = n_frames
                if n_keypoints_frames > 1 and n_video_frames > 1:
                    return int(idx * (n_video_frames - 1) / (n_keypoints_frames - 1))
                return idx

            pygame.init()
            screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
            pygame.display.set_caption(f"Vidéo Keypoints - Multi-classes")
            font_large = pygame.font.Font(None, 24)
            font_medium = pygame.font.Font(None, 20)
            font_small = pygame.font.Font(None, 16)
            panel_height = WINDOW_HEIGHT - 100
            clock = pygame.time.Clock()
            running = True
            paused = False
            frame_idx = 0
            n_frames = len(frames)
            last_update = time.time()
            while running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_ESCAPE:
                            running = False
                        elif event.key == pygame.K_RIGHT:
                            frame_idx = min(frame_idx + 1, n_frames - 1)
                            paused = True
                        elif event.key == pygame.K_LEFT:
                            frame_idx = max(frame_idx - 1, 0)
                            paused = True
                        elif event.key == pygame.K_SPACE:
                            paused = not paused
                if not paused and (time.time() - last_update > 1.0 / fps):
                    frame_idx += 1
                    if frame_idx >= n_frames:
                        frame_idx = 0
                    last_update = time.time()
                user_frame = frames[frame_idx]
                ref_frame = reference_frames[frame_idx] if frame_idx < len(reference_frames) else reference_frames[-1]
                # --- Affichage de la frame vidéo utilisateur dans une fenêtre OpenCV ---
                if cap:
                    video_frame_idx = get_video_frame_idx(user_frame, frame_idx, total_video_frames)
                    cap.set(cv2.CAP_PROP_POS_FRAMES, video_frame_idx)
                    ret, frame_bgr = cap.read()
                    if ret:
                        cv2.imshow('Vidéo Utilisateur', frame_bgr)
                        cv2.waitKey(1)
                    else:
                        blank = np.ones((panel_height, KEYPOINT_PANEL_WIDTH, 3), dtype=np.uint8) * 255
                        cv2.imshow('Vidéo Utilisateur', blank)
                        cv2.waitKey(1)
                # --- Affichage principal (analyse) ---
                screen.fill(WHITE)
                keypoint_rect = pygame.Rect(10, 50, KEYPOINT_PANEL_WIDTH, panel_height)
                pygame.draw.rect(screen, WHITE, keypoint_rect)
                pygame.draw.rect(screen, BLACK, keypoint_rect, 2)
                def dict_to_list(keypoints_dict):
                    keypoint_order = [
                        'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
                        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
                        'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
                        'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
                    ]
                    keypoints_list = []
                    for keypoint in keypoint_order:
                        x_key = f"{keypoint}_x"
                        y_key = f"{keypoint}_y"
                        x = keypoints_dict.get(x_key, 0.0)
                        y = keypoints_dict.get(y_key, 0.0)
                        keypoints_list.append([x, y])
                    return keypoints_list
                current_keypoints = dict_to_list(user_frame['keypoints_positions'])
                reference_keypoints = dict_to_list(ref_frame['keypoints_positions'])
                if use_kalman or getattr(comp, 'use_kalman', False):
                    current_keypoints = comp.filter_keypoints(current_keypoints)
                    reference_keypoints = comp.filter_keypoints(reference_keypoints)
                # Normalisation
                current_normalized = normalize_keypoints(current_keypoints, KEYPOINT_PANEL_WIDTH, panel_height)
                reference_normalized = normalize_keypoints(reference_keypoints, KEYPOINT_PANEL_WIDTH, panel_height)
                comparison_result = comp.compare_keypoints(current_keypoints, reference_keypoints)
                improvements = []
                if 'angles' in user_frame and 'angles' in ref_frame:
                    reference_angles = {}
                    for angle in ref_frame['angles']:
                        angle_name = str(angle.get('angle_name', ['unknown', 0])[0])
                        angle_value = angle.get('angle', 0)
                        reference_angles[angle_name] = {"ref": angle_value, "tolerance": 5.0}
                    improvements = comp.compare_angles(user_frame['angles'], reference_angles)
                class_name = user_frame.get('__class_name', 'Unknown')
                title = font_large.render(f"Frame {frame_idx+1}/{n_frames} - Classe: {class_name}", True, BLACK)
                screen.blit(title, (20, 20))
                if reference_normalized:
                    draw_skeleton(screen, reference_normalized, skeleton_connections, RED, 10, 50)
                    draw_keypoints(screen, reference_normalized, RED, 10, 50)
                if current_normalized:
                    draw_skeleton(screen, current_normalized, skeleton_connections, BLUE, 10, 50)
                    draw_keypoints(screen, current_normalized, BLUE, 10, 50)
                pygame.draw.rect(screen, LIGHT_GRAY, (KEYPOINT_PANEL_WIDTH + 20, 50, TEXT_PANEL_WIDTH - 30, panel_height))
                pygame.draw.rect(screen, BLACK, (KEYPOINT_PANEL_WIDTH + 20, 50, TEXT_PANEL_WIDTH - 30, panel_height), 2)
                y_txt = 60
                x_txt = KEYPOINT_PANEL_WIDTH + 30
                screen.blit(font_medium.render(f"Score alignement: {comparison_result.get('alignment_score', 0):.1f}%", True, BLACK), (x_txt, y_txt))
                y_txt += 30
                screen.blit(font_medium.render(f"Similarité pose: {comparison_result.get('pose_similarity', 0):.1f}%", True, BLACK), (x_txt, y_txt))
                y_txt += 30
                if improvements:
                    screen.blit(font_medium.render("Améliorations:", True, BLACK), (x_txt, y_txt))
                    y_txt += 25
                    for imp in improvements[:8]:
                        color = RED if imp.priority == PriorityLevel.HIGH else YELLOW if imp.priority == PriorityLevel.MEDIUM else GREEN
                        txt = f"• Angle {imp.angle_index}: {imp.direction.value} {imp.magnitude:.1f}°"
                        screen.blit(font_small.render(txt, True, color), (x_txt+10, y_txt))
                        y_txt += 18
                screen.blit(font_small.render("→/← : frame suivante/précédente  |  Espace : pause/play  |  ESC : quitter", True, DARK_GRAY), (20, WINDOW_HEIGHT - 25))
                pygame.display.update(screen.get_rect())
                clock.tick(60)
            if cap:
                cap.release()
            cv2.destroyAllWindows()
            pygame.quit()
        comp.display_keypoints_video = patched_display
        # --- Pour activer le kalman, passer use_kalman=True ---
        comp.display_keypoints_video(merged_user_frames, merged_reference_frames, fps=10, use_kalman=False)

    asyncio.run(main())
