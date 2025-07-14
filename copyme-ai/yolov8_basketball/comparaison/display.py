import pygame
import cv2
import numpy as np
import logging
from typing import List, Dict, Tuple, Any
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from mistral.mistral import MistralRephraser

# Import enhanced modules
from .visualization_enhancer import VisualizationEnhancer
from .ui_config import UI_CONFIG, ANIMATION_CONFIG, ADVANCED_METRICS_CONFIG

# Configure loggingcl
logger = logging.getLogger(__name__)

# Import enums with fallback for different import contexts
try:
    from .enums import PriorityLevel
except ImportError:
    try:
        from comparaison.enums import PriorityLevel
    except ImportError:
        from enums import PriorityLevel

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

class Display:

    def __init__(self):
        # Initialize visualization enhancer
        self.visualization_enhancer = VisualizationEnhancer()

        # Load configuration from UI config
        self.colors = UI_CONFIG['colors']

        # Initialize display configuration
        self.config = {
            'window_width': UI_CONFIG['window_width'],
            'window_height': UI_CONFIG['window_height'],
            'keypoint_panel_width': UI_CONFIG['keypoint_panel_width'],
            'sidebar_width': UI_CONFIG['sidebar_width'],
            'header_height': UI_CONFIG['header_height'],
            'footer_height': UI_CONFIG['footer_height'],
            'animation_speed': ANIMATION_CONFIG['fade_duration'],
            'fps': UI_CONFIG['fps']
        }

        logger.info("Display initialized with enhanced configuration")

    def draw_rounded_rect(self, surface: pygame.Surface, rect: Tuple[int, int, int, int],
                         color: Tuple[int, int, int], radius: int = 10) -> None:

        x, y, width, height = rect

        # Draw rounded corners
        pygame.draw.circle(surface, color, (x + radius, y + radius), radius)
        pygame.draw.circle(surface, color, (x + width - radius, y + radius), radius)
        pygame.draw.circle(surface, color, (x + radius, y + height - radius), radius)
        pygame.draw.circle(surface, color, (x + width - radius, y + height - radius), radius)

        # Draw central rectangles
        pygame.draw.rect(surface, color, (x + radius, y, width - 2 * radius, height))
        pygame.draw.rect(surface, color, (x, y + radius, width, height - 2 * radius))

    def draw_progress_bar(self, surface: pygame.Surface, rect: Tuple[int, int, int, int],
                         value: float, max_value: float, color: Tuple[int, int, int],
                         bg_color: Tuple[int, int, int]) -> None:

        x, y, width, height = rect

        # Draw background
        self.draw_rounded_rect(surface, rect, bg_color, height // 2)

        # Draw progress bar
        progress_width = int((value / max_value) * width)
        if progress_width > 0:
            progress_rect = (x, y, progress_width, height)
            self.draw_rounded_rect(surface, progress_rect, color, height // 2)

        # Draw centered text
        font = pygame.font.Font(None, 20)
        text = font.render(f"{value:.1f}%", True, self.colors['white'])
        text_rect = text.get_rect(center=(x + width // 2, y + height // 2))
        surface.blit(text, text_rect)

    def draw_metric_card(self, surface: pygame.Surface, title: str, value: Any, unit: str,
                        color: Tuple[int, int, int], position: Tuple[int, int, int, int],
                        size: Tuple[int, int]) -> None:

        x, y, width, height = position

        # Draw card background
        self.draw_rounded_rect(surface, position, self.colors['light'], 15)
        pygame.draw.rect(surface, color, (x, y, width, 4))  # Colored top bar

        # Draw title
        font_title = pygame.font.Font(None, 18)
        title_text = font_title.render(title, True, self.colors['dark'])
        surface.blit(title_text, (x + 15, y + 10))

        # Draw value with type handling
        font_value = pygame.font.Font(None, 32)
        if isinstance(value, (int, float)):
            value_str = f"{value:.1f}"
        elif isinstance(value, dict):
            # Extract first numeric value from dictionary
            numeric_values = [v for v in value.values() if isinstance(v, (int, float))]
            if numeric_values:
                value_str = f"{numeric_values[0]:.1f}"
            else:
                value_str = str(value)
        else:
            value_str = str(value)

        value_text = font_value.render(value_str, True, color)
        value_rect = value_text.get_rect(center=(x + width // 2, y + height // 2 + 5))
        surface.blit(value_text, value_rect)

        # Draw unit
        font_unit = pygame.font.Font(None, 16)
        unit_text = font_unit.render(unit, True, self.colors['dark'])
        unit_rect = unit_text.get_rect(center=(x + width // 2, y + height - 15))
        surface.blit(unit_text, unit_rect)

    def draw_improvement_item(self, surface: pygame.Surface, improvement: Any,
                            position: Tuple[int, int], width: int, font_size: int = 16, bar_height: int = 3) -> None:
        pass

    def draw_keypoint_heatmap(self, surface: pygame.Surface, keypoints: List[List[float]],
                            reference_keypoints: List[List[float]],
                            position: Tuple[int, int, int, int],
                            size: Tuple[int, int]) -> None:

        x, y, width, height = position

        # Draw background
        self.draw_rounded_rect(surface, position, self.colors['light'], 10)

        # Calculate differences
        differences = []
        for i, (curr, ref) in enumerate(zip(keypoints, reference_keypoints)):
            if (len(curr) >= 2 and len(ref) >= 2 and
                curr[0] > 0 and curr[1] > 0 and ref[0] > 0 and ref[1] > 0):
                distance = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)
                differences.append((i, distance))

        if not differences:
            return

        max_diff = max(diff[1] for diff in differences)

        # Draw points with intensity based on difference
        for kp_idx, diff in differences:
            if kp_idx < len(keypoints) and len(keypoints[kp_idx]) >= 2:
                kp = keypoints[kp_idx]
                if kp[0] > 0 and kp[1] > 0:
                    # Normalize position within drawing area
                    norm_x = x + 20 + (kp[0] / 640) * (width - 40)
                    norm_y = y + 20 + (kp[1] / 480) * (height - 40)

                    # Color based on difference
                    intensity = min(255, int((diff / max_diff) * 255))
                    color = (intensity, 255 - intensity, 0)

                    radius = max(3, int(8 - (diff / max_diff) * 5))
                    pygame.draw.circle(surface, color, (int(norm_x), int(norm_y)), radius)

    def draw_advanced_metrics(self, surface: pygame.Surface, advanced_metrics: Dict,
                            position: Tuple[int, int, int, int],
                            size: Tuple[int, int],
                            font_size: int = 18, sub_font_size: int = 16, bar_height: int = 8) -> None:
        if not ADVANCED_METRICS_CONFIG['enable_pose_quality'] or not advanced_metrics:
            return

        x, y, width, height = position
        self.draw_rounded_rect(surface, position, self.colors['light'], 10)

        # Title
        font_title = pygame.font.Font(None, font_size)
        title_text = font_title.render("Advanced Analysis", True, self.colors['dark'])
        surface.blit(title_text, (x + 10, y + 8))

        if 'technical_score' in advanced_metrics:
            score = advanced_metrics['technical_score']
            score_color = (self.colors['success'] if score >= 80 else self.colors['warning'] if score >= 60 else self.colors['danger'])
            font_tech = pygame.font.Font(None, font_size + 4)
            tech_text = font_tech.render(f"Technical: {score:.1f}", True, score_color)
            surface.blit(tech_text, (x + 10, y + 32))

        if 'pose_quality' in advanced_metrics:
            pose_quality = advanced_metrics['pose_quality']
            # On récupère les deux premiers (ex: Balance, Symmetry)
            metrics = list(pose_quality.items())[:2]
            metric_w = (width - 30) // 2
            metric_y = y + 70
            font_metric = pygame.font.Font(None, sub_font_size + 4)
            for i, (metric_name, value) in enumerate(metrics):
                mx = x + 10 + i * (metric_w + 10)
                label = font_metric.render(metric_name.title(), True, self.colors['dark'])
                surface.blit(label, (mx, metric_y))
                val = font_metric.render(f"{value:.2f}", True, self.colors['primary'])
                surface.blit(val, (mx + metric_w - 40, metric_y))
                bar_val = min(1.0, max(0.0, float(value)))
                bar_rect = (mx, metric_y + 28, metric_w - 10, bar_height)
                self.draw_rounded_rect(surface, bar_rect, self.colors['primary'], bar_height // 2)
                fill_rect = (mx, metric_y + 28, int((metric_w - 10) * bar_val), bar_height)
                self.draw_rounded_rect(surface, fill_rect, self.colors['success'], bar_height // 2)

    def draw_performance_chart(self, surface: pygame.Surface, frame_data: List[Dict],
                             position: Tuple[int, int, int, int],
                             size: Tuple[int, int]) -> None:

        if not ADVANCED_METRICS_CONFIG['enable_performance_charts']:
            return

        x, y, width, height = position

        # Draw chart background
        self.draw_rounded_rect(surface, position, self.colors['light'], 10)

        # Draw chart title
        font_title = pygame.font.Font(None, 20)
        title_text = font_title.render("Performance Trend", True, self.colors['dark'])
        surface.blit(title_text, (x + 15, y + 10))

        # Generate chart data
        if len(frame_data) > 1:
            chart_data = []
            for i, frame in enumerate(frame_data):
                # Calculate simple score based on position
                score = 50 + (i % 20)  # Simulation for example
                chart_data.append(score)

            # Draw chart
            if chart_data:
                max_score = max(chart_data)
                min_score = min(chart_data)
                score_range = max_score - min_score if max_score != min_score else 1

                points = []
                for i, score in enumerate(chart_data):
                    point_x = x + 20 + (i / (len(chart_data) - 1)) * (width - 40)
                    point_y = y + height - 20 - ((score - min_score) / score_range) * (height - 60)
                    points.append((point_x, point_y))

                # Draw trend line
                if len(points) > 1:
                    pygame.draw.lines(surface, self.colors['primary'], False, points, 3)

                    # Draw data points
                    for point in points:
                        pygame.draw.circle(surface, self.colors['primary'],
                                         (int(point[0]), int(point[1])), 4)

    def display_keypoints_video(self, frames: List[Dict], reference_frames: List[Dict],
                              video_path: str, calculated_results: List[Dict],
                              class_name: str = "Unknown", fps: int = 10) -> None:

        WINDOW_WIDTH = self.config['window_width']
        WINDOW_HEIGHT = self.config['window_height']
        HEADER_HEIGHT = self.config['header_height']
        FOOTER_HEIGHT = self.config['footer_height']

        # Left side: Video and visualization (half screen)
        LEFT_SIDE_WIDTH = WINDOW_WIDTH // 2 - 20
        LEFT_SIDE_HEIGHT = WINDOW_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - 40

        # Video section (top half of left side)
        VIDEO_HEIGHT = LEFT_SIDE_HEIGHT // 2 - 10
        VIDEO_WIDTH = LEFT_SIDE_WIDTH - 20

        # Visualization section (bottom half of left side)
        VISUALIZATION_HEIGHT = LEFT_SIDE_HEIGHT // 2 - 10
        VISUALIZATION_WIDTH = LEFT_SIDE_WIDTH - 20

        # Right side: Statistics (half screen)
        RIGHT_SIDE_WIDTH = WINDOW_WIDTH // 2 - 20
        RIGHT_SIDE_HEIGHT = WINDOW_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - 40

        # Skeleton connections for visualization
        skeleton_connections = [
            (0, 1), (0, 2), (1, 3), (2, 4),  # Head
            (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),  # Arms
            (5, 11), (6, 12), (11, 12),  # Torso
            (11, 13), (13, 15), (12, 14), (14, 16)  # Legs
        ]

        def normalize_keypoints(keypoints: List[List[float]], panel_width: int,
                              panel_height: int, margin: int = 50) -> List[List[float]]:
            """Normalize keypoints to fit within the display panel."""
            if not keypoints:
                return []

            # Find bounding box
            valid_points = [kp for kp in keypoints if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0]
            if not valid_points:
                return []

            x_coords = [kp[0] for kp in valid_points]
            y_coords = [kp[1] for kp in valid_points]

            min_x, max_x = min(x_coords), max(x_coords)
            min_y, max_y = min(y_coords), max(y_coords)

            # Calculate scale factors
            scale_x = (panel_width - 2 * margin) / (max_x - min_x) if max_x != min_x else 1
            scale_y = (panel_height - 2 * margin) / (max_y - min_y) if max_y != min_y else 1
            scale = min(scale_x, scale_y)

            # Normalize points
            normalized = []
            for kp in keypoints:
                if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                    norm_x = margin + (kp[0] - min_x) * scale
                    norm_y = margin + (kp[1] - min_y) * scale
                    normalized.append([norm_x, norm_y])
                else:
                    normalized.append([0, 0])

            return normalized

        def draw_skeleton(surface: pygame.Surface, keypoints: List[List[float]],
                        connections: List[Tuple[int, int]], color: Tuple[int, int, int],
                        offset_x: int = 0, offset_y: int = 0, thickness: int = 3) -> None:
            """Draw skeleton connections between keypoints."""
            for connection in connections:
                if (connection[0] < len(keypoints) and connection[1] < len(keypoints) and
                    len(keypoints[connection[0]]) >= 2 and len(keypoints[connection[1]]) >= 2 and
                    keypoints[connection[0]][0] > 0 and keypoints[connection[0]][1] > 0 and
                    keypoints[connection[1]][0] > 0 and keypoints[connection[1]][1] > 0):

                    start_pos = (int(keypoints[connection[0]][0] + offset_x),
                               int(keypoints[connection[0]][1] + offset_y))
                    end_pos = (int(keypoints[connection[1]][0] + offset_x),
                             int(keypoints[connection[1]][1] + offset_y))
                    pygame.draw.line(surface, color, start_pos, end_pos, thickness)

        def draw_keypoints(surface: pygame.Surface, keypoints: List[List[float]],
                          color: Tuple[int, int, int], offset_x: int = 0, offset_y: int = 0,
                          radius: int = 6) -> None:
            """Draw keypoints as circles."""
            for kp in keypoints:
                if len(kp) >= 2 and kp[0] > 0 and kp[1] > 0:
                    pos = (int(kp[0] + offset_x), int(kp[1] + offset_y))
                    pygame.draw.circle(surface, color, pos, radius)

        def get_video_frame_idx(user_frame: Dict, idx: int, n_video_frames: int) -> int:
            """Get corresponding video frame index."""
            frame_number = user_frame.get('frame_number', idx)
            return min(frame_number, n_video_frames - 1)

        # Initialize pygame
        pygame.init()
        screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("CopyMe AI - Basketball Analysis")
        clock = pygame.time.Clock()

        # Initialize fonts
        font_large = pygame.font.Font(None, 36)
        font_medium = pygame.font.Font(None, 24)
        font_small = pygame.font.Font(None, 18)

        # Initialize video capture
        cap = None
        total_video_frames = 0
        try:
            cap = cv2.VideoCapture(video_path)
            if cap.isOpened():
                total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                logger.info(f"Video loaded: {total_video_frames} frames")
            else:
                logger.warning("Could not open video file")
        except Exception as e:
            logger.error(f"Error loading video: {e}")

        # Initialize display state
        n_frames = len(frames)
        frame_idx = 0
        paused = False
        playback_speed = 1.0
        last_update = 0
        keys_pressed = {}
        key_repeat_delay = 0.5
        key_repeat_interval = 0.05

        # Main display loop
        mistral = MistralRephraser()
        feedback_cache = {}
        running = True
        while running:
            current_time = pygame.time.get_ticks() / 1000.0

            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                    elif event.key == pygame.K_RIGHT:
                        frame_idx = min(frame_idx + 1, n_frames - 1)
                        paused = True
                        keys_pressed[pygame.K_RIGHT] = current_time
                    elif event.key == pygame.K_LEFT:
                        frame_idx = max(frame_idx - 1, 0)
                        paused = True
                        keys_pressed[pygame.K_LEFT] = current_time
                    elif event.key == pygame.K_SPACE:
                        paused = not paused
                    elif event.key == pygame.K_r:
                        frame_idx = 0
                    elif event.key == pygame.K_f:
                        playback_speed = min(playback_speed * 2, 4.0)
                    elif event.key == pygame.K_s:
                        playback_speed = max(playback_speed / 2, 0.25)
                elif event.type == pygame.KEYUP:
                    if event.key in keys_pressed:
                        del keys_pressed[event.key]

            # Handle key repeat
            keys = pygame.key.get_pressed()
            if keys[pygame.K_RIGHT] and pygame.K_RIGHT in keys_pressed:
                if current_time - keys_pressed[pygame.K_RIGHT] > key_repeat_delay:
                    if (current_time - keys_pressed[pygame.K_RIGHT] - key_repeat_delay) % key_repeat_interval < 0.016:
                        frame_idx = min(frame_idx + 1, n_frames - 1)
                        paused = True
            if keys[pygame.K_LEFT] and pygame.K_LEFT in keys_pressed:
                if current_time - keys_pressed[pygame.K_LEFT] > key_repeat_delay:
                    if (current_time - keys_pressed[pygame.K_LEFT] - key_repeat_delay) % key_repeat_interval < 0.016:
                        frame_idx = max(frame_idx - 1, 0)
                        paused = True

            # Auto-advance frames
            if not paused and (current_time - last_update > 1.0 / (fps * playback_speed)):
                frame_idx += 1
                if frame_idx >= n_frames:
                    frame_idx = 0
                last_update = current_time

            # Get current frame data
            user_frame = frames[frame_idx]
            ref_frame = reference_frames[frame_idx] if frame_idx < len(reference_frames) else reference_frames[-1]

            # Main interface
            screen.fill(self.colors['white'])

            # Draw header
            header_rect = (0, 0, WINDOW_WIDTH, HEADER_HEIGHT)
            self.draw_rounded_rect(screen, header_rect, self.colors['primary'], 0)

            # Draw main title
            title = font_large.render("CopyMe AI - Basketball Analysis", True, self.colors['white'])
            screen.blit(title, (20, 20))

            # Draw frame information
            current_class_name = user_frame.get('class_name', class_name)
            frame_info = font_medium.render(
                f"Frame {frame_idx+1}/{n_frames} | Class: {current_class_name} | Speed: {playback_speed:.1f}x",
                True, self.colors['white']
            )
            screen.blit(frame_info, (20, 50))

            # Display user video in left side (top half)
            video_area = (20, HEADER_HEIGHT + 20, VIDEO_WIDTH, VIDEO_HEIGHT)
            self.draw_rounded_rect(screen, video_area, self.colors['light'], 15)
            pygame.draw.rect(screen, self.colors['dark'], video_area, 2)

            if cap:
                video_frame_idx = get_video_frame_idx(user_frame, frame_idx, total_video_frames)
                cap.set(cv2.CAP_PROP_POS_FRAMES, video_frame_idx)
                ret, frame_bgr = cap.read()
                if ret:
                    # Convert BGR to RGB
                    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

                    frame_resized = cv2.resize(frame_rgb, (VIDEO_WIDTH - 4, VIDEO_HEIGHT - 4))

                    frame_surface = pygame.surfarray.make_surface(frame_resized.swapaxes(0, 1))

                    screen.blit(frame_surface, (22, HEADER_HEIGHT + 22))
                else:
                    blank_text = font_medium.render("Video not available", True, self.colors['dark'])
                    blank_rect = blank_text.get_rect(center=(20 + VIDEO_WIDTH//2, HEADER_HEIGHT + 20 + VIDEO_HEIGHT//2))
                    screen.blit(blank_text, blank_rect)
            else:
                no_video_text = font_medium.render("Video file not found", True, self.colors['dark'])
                no_video_rect = no_video_text.get_rect(center=(20 + VIDEO_WIDTH//2, HEADER_HEIGHT + 20 + VIDEO_HEIGHT//2))
                screen.blit(no_video_text, no_video_rect)

            visualization_title = font_medium.render("Pose Visualization", True, self.colors['dark'])
            screen.blit(visualization_title, (20, HEADER_HEIGHT + VIDEO_HEIGHT + 30))


            visualization_area = (20, HEADER_HEIGHT + VIDEO_HEIGHT + 50, VISUALIZATION_WIDTH,
                                VISUALIZATION_HEIGHT)
            self.draw_rounded_rect(screen, visualization_area, self.colors['light'], 15)
            pygame.draw.rect(screen, self.colors['dark'], visualization_area, 2)

            # Convert keypoints
            def dict_to_list(keypoints_dict: Dict) -> List[List[float]]:
                """Convert keypoints dictionary to list format."""
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

            # Use pre-calculated results if available
            frame_results = calculated_results[frame_idx] if frame_idx < len(calculated_results) else {}
            if 'filtered_current_keypoints' in frame_results:
                current_keypoints = frame_results['filtered_current_keypoints']
            if 'filtered_reference_keypoints' in frame_results:
                reference_keypoints = frame_results['filtered_reference_keypoints']

            # Normalize keypoints for display in visualization section
            current_normalized = normalize_keypoints(current_keypoints, VISUALIZATION_WIDTH - 40,
                                                   VISUALIZATION_HEIGHT - 40)
            reference_normalized = normalize_keypoints(reference_keypoints, VISUALIZATION_WIDTH - 40,
                                                     VISUALIZATION_HEIGHT - 40)

            # Draw skeletons in visualization section
            if reference_normalized:
                draw_skeleton(screen, reference_normalized, skeleton_connections,
                            self.colors['danger'], 40, HEADER_HEIGHT + VIDEO_HEIGHT + 70, 4)
                draw_keypoints(screen, reference_normalized, self.colors['danger'],
                             40, HEADER_HEIGHT + VIDEO_HEIGHT + 70, 8)
            if current_normalized:
                draw_skeleton(screen, current_normalized, skeleton_connections,
                            self.colors['primary'], 40, HEADER_HEIGHT + VIDEO_HEIGHT + 70, 3)
                draw_keypoints(screen, current_normalized, self.colors['primary'],
                             40, HEADER_HEIGHT + VIDEO_HEIGHT + 70, 6)

            # Draw right side statistics panel
            stats_x = LEFT_SIDE_WIDTH + 40
            stats_y = HEADER_HEIGHT + 20
            stats_width = RIGHT_SIDE_WIDTH - 20
            stats_height = RIGHT_SIDE_HEIGHT

            # Draw statistics panel background
            stats_rect = (stats_x, stats_y, stats_width, stats_height)
            self.draw_rounded_rect(screen, stats_rect, self.colors['light'], 15)
            pygame.draw.rect(screen, self.colors['dark'], stats_rect, 2)

            stats_title = font_medium.render("Performance Statistics", True, self.colors['dark'])
            screen.blit(stats_title, (stats_x + 15, stats_y + 15))

            comparison_result = frame_results.get('comparison_result', {})
            improvements = frame_results.get('improvements', [])

            feedback_text = feedback_cache.get(frame_idx)
            if feedback_text is None and improvements:
                try:
                    instruction = (
                        "Generate a brief, direct, and actionable feedback for the user's basketball pose. "
                        "Do not start with phrases like 'Based on feedback', 'According to the analysis', or similar. "
                        "Do not end with generic encouragement unless the user's performance is clearly good or improving. "
                        "Use the real angle names (e.g., 'elbow angle', 'knee angle') and be specific. "
                        "Avoid technical jargon and long explanations. "
                        "For each correction, add a short explanation of why or how this adjustment will help improve the shot. "
                        "If encouragement is deserved, add a short, motivating phrase at the end; otherwise, end the feedback directly."
                    )
                    improvements_dict = [imp.dict() if hasattr(imp, 'dict') else dict(imp) for imp in improvements]
                    feedback_text = mistral.rephrase(improvements_dict, instruction)
                except Exception as e:
                    feedback_text = f"Mistral error: {e}"
                feedback_cache[frame_idx] = feedback_text

            def wrap_text(text, font, max_width):
                words = text.split(' ')
                lines = []
                current_line = ''
                for word in words:
                    test_line = current_line + (' ' if current_line else '') + word
                    if font.size(test_line)[0] <= max_width:
                        current_line = test_line
                    else:
                        if current_line:
                            lines.append(current_line)
                        current_line = word
                if current_line:
                    lines.append(current_line)
                return lines

            y_offset = stats_y + 40
            card_width = (stats_width - 40) // 2
            card_height = 60
            font_metric = pygame.font.Font(None, 32)

            alignment_score = comparison_result.get('alignment_score', 0)
            alignment_color = (self.colors['success'] if alignment_score > 70
                              else self.colors['warning'] if alignment_score > 50
                              else self.colors['danger'])
            self.draw_metric_card(screen, "Alignment", alignment_score, "%",
                                 alignment_color, (stats_x + 15, y_offset, card_width, card_height), card_height)

            pose_similarity = comparison_result.get('pose_similarity', 0)
            similarity_color = (self.colors['success'] if pose_similarity > 70
                               else self.colors['warning'] if pose_similarity > 50
                               else self.colors['danger'])
            self.draw_metric_card(screen, "Similarity", pose_similarity, "%",
                                 similarity_color, (stats_x + 25 + card_width, y_offset, card_width, card_height), card_height)
            y_offset += card_height + 20
            if improvements and y_offset + 40 < stats_y + stats_height - 20:
                improvements_title = font_medium.render("Improvements", True, self.colors['dark'])
                screen.blit(improvements_title, (stats_x + 15, y_offset))
                y_offset += 25

                remaining_height = stats_y + stats_height - y_offset - 20
                max_improvements = min(len(improvements), max(1, remaining_height // 38))
                for i, imp in enumerate(improvements[:max_improvements]):
                    if y_offset + 34 < stats_y + stats_height - 20:
                        angle_label = None
                        if hasattr(imp, 'class_name') and getattr(imp, 'class_name'):
                            angle_label = getattr(imp, 'class_name')
                        elif hasattr(imp, 'angle_name') and getattr(imp, 'angle_name'):
                            angle_label = getattr(imp, 'angle_name')
                        elif isinstance(imp, dict) and 'class_name' in imp and imp['class_name']:
                            angle_label = imp['class_name']
                        elif isinstance(imp, dict) and 'angle_name' in imp and imp['angle_name']:
                            angle_label = imp['angle_name']
                        elif hasattr(imp, 'metric') and getattr(imp, 'metric'):
                            angle_label = getattr(imp, 'metric')
                        elif isinstance(imp, dict) and 'metric' in imp and imp['metric']:
                            angle_label = imp['metric']
                        else:
                            angle_label = 'Unknown angle'
                        angle_label = str(angle_label).replace('_', ' ').title()
                        text = f"{angle_label}: {imp.direction.value[:3]} {imp.magnitude:.1f}°"
                        font = pygame.font.Font(None, 20)
                        text_surface = font.render(text, True, self.colors['dark'])
                        screen.blit(text_surface, (stats_x + 25, y_offset + 3))
                        bar_width = min(80, imp.magnitude * 2)
                        bar_rect = (stats_x + 25, y_offset + 18, bar_width, 6)
                        self.draw_rounded_rect(screen, bar_rect, self.colors['primary'], 1)
                        y_offset += 38

                if feedback_text:
                    font_feedback = pygame.font.Font(None, 18)
                    max_feedback_width = stats_width - 40
                    feedback_lines = []
                    for paragraph in feedback_text.split('\n'):
                        feedback_lines.extend(wrap_text(paragraph, font_feedback, max_feedback_width))
                    for line in feedback_lines:
                        feedback_surface = font_feedback.render(line, True, (60, 60, 60))
                        screen.blit(feedback_surface, (stats_x + 20, y_offset))
                        y_offset += 22

            if 'advanced_metrics' in frame_results and ADVANCED_METRICS_CONFIG['enable_pose_quality']:
                advanced_metrics = frame_results['advanced_metrics']
                if y_offset + 90 < stats_y + stats_height - 20:
                    self.draw_advanced_metrics(screen, advanced_metrics,
                                             (stats_x + 15, y_offset, stats_width - 30, 90),
                                             (stats_width - 30, 90),
                                             font_size=22, sub_font_size=20, bar_height=8)
                    y_offset += 100

            # Draw footer with controls
            footer_rect = (0, WINDOW_HEIGHT - FOOTER_HEIGHT, WINDOW_WIDTH, FOOTER_HEIGHT)
            self.draw_rounded_rect(screen, footer_rect, self.colors['dark'], 0)

            controls_text = font_small.render(
                "→/← : Navigate | Space : Play/Pause | R : Reset | F/S : Speed | ESC : Quit",
                True, self.colors['white']
            )
            screen.blit(controls_text, (20, WINDOW_HEIGHT - FOOTER_HEIGHT + 20))

            # Update display
            pygame.display.flip()
            clock.tick(self.config['fps'])

        # Cleanup
        if cap:
            cap.release()
        pygame.quit()
        logger.info("Display session ended")
