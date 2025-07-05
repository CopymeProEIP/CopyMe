import pygame
import numpy as np
import math
from typing import List, Dict, Tuple
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
import io

class VisualizationEnhancer:
    def __init__(self):
        self.colors = {
            'primary': (52, 152, 219),      # Modern blue
            'secondary': (155, 89, 182),    # Purple
            'success': (46, 204, 113),      # Green
            'warning': (241, 196, 15),      # Yellow
            'danger': (231, 76, 60),        # Red
            'dark': (44, 62, 80),           # Dark gray
            'light': (236, 240, 241),       # Light gray
            'white': (255, 255, 255),
            'black': (0, 0, 0),
            'transparent': (0, 0, 0, 0)
        }

        # Configuration des animations
        self.animation_config = {
            'fade_duration': 0.5,
            'slide_duration': 0.3,
            'bounce_duration': 0.4,
            'pulse_frequency': 2.0
        }

    def create_performance_chart(self, frame_data: List[Dict], chart_type: str = 'line') -> pygame.Surface:
        if not frame_data:
            return self._create_empty_chart()

        # Extract data
        frame_numbers = list(range(len(frame_data)))
        alignment_scores = []
        pose_similarities = []

        for frame in frame_data:
            comparison_result = frame.get('comparison_result', {})
            alignment_scores.append(comparison_result.get('alignment_score', 0))
            pose_similarities.append(comparison_result.get('pose_similarity', 0))

        # Create matplotlib chart
        fig, ax = plt.subplots(figsize=(8, 4), facecolor='white')

        if chart_type == 'line':
            ax.plot(frame_numbers, alignment_scores, 'b-', label='Alignment Score', linewidth=2)
            ax.plot(frame_numbers, pose_similarities, 'r-', label='Pose Similarity', linewidth=2)
            ax.set_ylim(0, 100)
            ax.grid(True, alpha=0.3)

        elif chart_type == 'bar':
            x = np.arange(len(frame_numbers))
            width = 0.35

            ax.bar(x - width/2, alignment_scores, width, label='Alignment Score', color='blue', alpha=0.7)
            ax.bar(x + width/2, pose_similarities, width, label='Pose Similarity', color='red', alpha=0.7)
            ax.set_xticks(x)
            ax.set_xticklabels([f'F{i+1}' for i in frame_numbers])
            ax.set_ylim(0, 100)

        elif chart_type == 'radar':
            # Radar chart for latest metrics
            if len(alignment_scores) >= 3:
                categories = ['Alignment', 'Similarity', 'Stability', 'Balance', 'Symmetry']
                values = [
                    np.mean(alignment_scores[-3:]),
                    np.mean(pose_similarities[-3:]),
                    np.mean(alignment_scores[-3:]) * 0.8,  # Estimation
                    np.mean(pose_similarities[-3:]) * 0.9,  # Estimation
                    np.mean(alignment_scores[-3:]) * 0.85   # Estimation
                ]

                angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
                values += values[:1]  # Close the polygon
                angles += angles[:1]

                ax = plt.subplot(111, projection='polar')
                ax.plot(angles, values, 'o-', linewidth=2, color='blue')
                ax.fill(angles, values, alpha=0.25, color='blue')
                ax.set_xticks(angles[:-1])
                ax.set_xticklabels(categories)
                ax.set_ylim(0, 100)

        ax.set_title('Performance Analysis', fontsize=14, fontweight='bold')
        ax.legend()
        ax.set_ylabel('Score (%)')

        # Convert matplotlib to pygame surface
        canvas = FigureCanvasAgg(fig)
        canvas.draw()

        # Get the image
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        buf.seek(0)

        # Load into pygame
        chart_surface = pygame.image.load(buf)
        plt.close(fig)

        return chart_surface

    def _create_empty_chart(self) -> pygame.Surface:
        surface = pygame.Surface((400, 200))
        surface.fill(self.colors['light'])

        font = pygame.font.Font(None, 24)
        text = font.render("No data available", True, self.colors['dark'])
        text_rect = text.get_rect(center=(200, 100))
        surface.blit(text, text_rect)

        return surface

    def create_heatmap(self, keypoints: List[List[float]],
                      reference_keypoints: List[List[float]],
                      size: Tuple[int, int] = (300, 200)) -> pygame.Surface:
        surface = pygame.Surface(size)
        surface.fill(self.colors['white'])

        if not keypoints or not reference_keypoints:
            return surface

        # Calculate differences
        differences = []
        for i, (curr, ref) in enumerate(zip(keypoints, reference_keypoints)):
            if (len(curr) >= 2 and len(ref) >= 2 and
                curr[0] > 0 and curr[1] > 0 and ref[0] > 0 and ref[1] > 0):

                distance = math.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)
                differences.append((i, distance))

        if not differences:
            return surface

        max_diff = max(diff[1] for diff in differences) if differences else 1
        for kp_idx, diff in differences:
            if max_diff == 0:
                intensity = 0
                radius = 3
            else:
                intensity = min(255, int((diff / max_diff) * 255))
                radius = max(3, int(8 - (diff / max_diff) * 5))
            if kp_idx < len(keypoints) and len(keypoints[kp_idx]) >= 2:
                kp = keypoints[kp_idx]
                if kp[0] > 0 and kp[1] > 0:
                    # Normalize position
                    norm_x = int((kp[0] / 640) * size[0])
                    norm_y = int((kp[1] / 480) * size[1])

                    # Draw point with heat effect
                    self._draw_heat_point(surface, (norm_x, norm_y), (intensity, 255 - intensity, 0), radius)

        return surface

    def _draw_heat_point(self, surface: pygame.Surface, pos: Tuple[int, int],
                        color: Tuple[int, int, int], radius: int):
        x, y = pos

        # Main circle
        pygame.draw.circle(surface, color, (x, y), radius)

        # Glow effect
        for i in range(1, 4):
            alpha = 100 - i * 30
            glow_color = (*color, alpha)
            glow_surface = pygame.Surface((radius * 2 + 6, radius * 2 + 6), pygame.SRCALPHA)
            pygame.draw.circle(glow_surface, glow_color, (radius + 3, radius + 3), radius + i)
            surface.blit(glow_surface, (x - radius - 3, y - radius - 3))

    def create_animated_progress_bar(self, surface: pygame.Surface, rect: Tuple[int, int, int, int],
                                   value: float, max_value: float, color: Tuple[int, int, int],
                                   animation_progress: float = 1.0) -> None:

        x, y, width, height = rect

        # Bar background
        pygame.draw.rect(surface, self.colors['light'], rect)
        pygame.draw.rect(surface, self.colors['dark'], rect, 2)

        # Animated progress bar
        progress_width = int((value / max_value) * width * animation_progress)
        if progress_width > 0:
            progress_rect = (x, y, progress_width, height)
            pygame.draw.rect(surface, color, progress_rect)

            # Shine effect
            shine_rect = (x, y, progress_width, height // 3)
            shine_color = tuple(min(255, c + 50) for c in color)
            pygame.draw.rect(surface, shine_color, shine_rect)

        # Centered text
        font = pygame.font.Font(None, 20)
        text = font.render(f"{value:.1f}%", True, self.colors['white'])
        text_rect = text.get_rect(center=(x + width // 2, y + height // 2))
        surface.blit(text, text_rect)

    def create_pulse_animation(self, surface: pygame.Surface, center: Tuple[int, int],
                             radius: int, color: Tuple[int, int, int],
                             animation_time: float) -> None:

        x, y = center

        # Calculate animated radius
        pulse_factor = 1 + 0.3 * math.sin(animation_time * math.pi * 2)
        animated_radius = int(radius * pulse_factor)

        # Draw circle with transparency
        for i in range(3):
            alpha = 150 - i * 50
            pulse_color = (*color, alpha)
            pulse_surface = pygame.Surface((animated_radius * 2 + 10, animated_radius * 2 + 10), pygame.SRCALPHA)
            pygame.draw.circle(pulse_surface, pulse_color, (animated_radius + 5, animated_radius + 5), animated_radius - i * 2)
            surface.blit(pulse_surface, (x - animated_radius - 5, y - animated_radius - 5))

    def create_slide_animation(self, surface: pygame.Surface, content_surface: pygame.Surface,
                             start_pos: Tuple[int, int], end_pos: Tuple[int, int],
                             animation_progress: float) -> None:

        # Linear interpolation
        current_x = start_pos[0] + (end_pos[0] - start_pos[0]) * animation_progress
        current_y = start_pos[1] + (end_pos[1] - start_pos[1]) * animation_progress

        # Easing effect
        eased_progress = self._ease_out_quad(animation_progress)
        alpha = int(255 * eased_progress)

        # Create surface with transparency
        if alpha < 255:
            temp_surface = pygame.Surface(content_surface.get_size(), pygame.SRCALPHA)
            temp_surface.set_alpha(alpha)
            temp_surface.blit(content_surface, (0, 0))
            surface.blit(temp_surface, (current_x, current_y))
        else:
            surface.blit(content_surface, (current_x, current_y))

    def _ease_out_quad(self, t: float) -> float:
        return t * (2 - t)

    def create_bounce_animation(self, surface: pygame.Surface, content_surface: pygame.Surface,
                              base_pos: Tuple[int, int], animation_progress: float) -> None:

        # Calculate bounce height
        bounce_height = 20 * math.sin(animation_progress * math.pi)
        current_y = base_pos[1] - bounce_height

        # Compression effect
        scale_factor = 1 - 0.1 * math.sin(animation_progress * math.pi)
        scaled_width = int(content_surface.get_width() * scale_factor)
        scaled_height = int(content_surface.get_height() / scale_factor)

        if scaled_width > 0 and scaled_height > 0:
            scaled_surface = pygame.transform.scale(content_surface, (scaled_width, scaled_height))
            x_offset = (content_surface.get_width() - scaled_width) // 2
            surface.blit(scaled_surface, (base_pos[0] + x_offset, current_y))

    def create_text_with_shadow(self, surface: pygame.Surface, text: str,
                              font: pygame.font.Font, color: Tuple[int, int, int],
                              position: Tuple[int, int], shadow_offset: int = 2) -> None:

        x, y = position

        # Shadow
        shadow_text = font.render(text, True, self.colors['black'])
        surface.blit(shadow_text, (x + shadow_offset, y + shadow_offset))

        # Main text
        main_text = font.render(text, True, color)
        surface.blit(main_text, (x, y))

    def create_gradient_background(self, surface: pygame.Surface,
                                 start_color: Tuple[int, int, int],
                                 end_color: Tuple[int, int, int],
                                 direction: str = 'vertical') -> None:

        width, height = surface.get_size()

        if direction == 'vertical':
            for y in range(height):
                ratio = y / height
                color = self._interpolate_color(start_color, end_color, ratio)
                pygame.draw.line(surface, color, (0, y), (width, y))
        elif direction == 'horizontal':
            for x in range(width):
                ratio = x / width
                color = self._interpolate_color(start_color, end_color, ratio)
                pygame.draw.line(surface, color, (x, 0), (x, height))
        elif direction == 'radial':
            center_x, center_y = width // 2, height // 2
            max_distance = math.sqrt(center_x**2 + center_y**2)

            for y in range(height):
                for x in range(width):
                    distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                    ratio = distance / max_distance
                    color = self._interpolate_color(start_color, end_color, ratio)
                    surface.set_at((x, y), color)

    def _interpolate_color(self, color1: Tuple[int, int, int],
                          color2: Tuple[int, int, int], ratio: float) -> Tuple[int, int, int]:
        return tuple(int(c1 + (c2 - c1) * ratio) for c1, c2 in zip(color1, color2))

    def create_loading_spinner(self, surface: pygame.Surface, center: Tuple[int, int],
                             radius: int, color: Tuple[int, int, int],
                             animation_time: float) -> None:

        x, y = center

        # Calculate rotation angle
        angle = animation_time * 2 * math.pi

        # Draw spinner segments
        for i in range(8):
            segment_angle = angle + (i * math.pi / 4)
            start_pos = (x + radius * math.cos(segment_angle),
                        y + radius * math.sin(segment_angle))
            end_pos = (x + (radius - 10) * math.cos(segment_angle),
                      y + (radius - 10) * math.sin(segment_angle))

            # Fade effect based on segment position
            alpha = 255 * (1 - (i / 8))
            segment_color = (*color, int(alpha))

            # Create segment surface
            segment_surface = pygame.Surface((radius * 2, radius * 2), pygame.SRCALPHA)
            pygame.draw.line(segment_surface, segment_color,
                           (radius + start_pos[0] - x, radius + start_pos[1] - y),
                           (radius + end_pos[0] - x, radius + end_pos[1] - y), 3)
            surface.blit(segment_surface, (x - radius, y - radius))

    def create_particle_system(self, surface: pygame.Surface, particles: List[Dict]) -> None:

        for particle in particles:
            pos = particle.get('position', (0, 0))
            color = particle.get('color', self.colors['primary'])
            size = particle.get('size', 2)
            alpha = particle.get('alpha', 255)

            if alpha < 255:
                particle_surface = pygame.Surface((size * 2, size * 2), pygame.SRCALPHA)
                particle_color = (*color, alpha)
                pygame.draw.circle(particle_surface, particle_color, (size, size), size)
                surface.blit(particle_surface, (pos[0] - size, pos[1] - size))
            else:
                pygame.draw.circle(surface, color, pos, size)

    def create_tooltip(self, surface: pygame.Surface, text: str,
                      position: Tuple[int, int], background_color: Tuple[int, int, int] = None) -> None:

        if background_color is None:
            background_color = self.colors['dark']

        font = pygame.font.Font(None, 16)
        text_surface = font.render(text, True, self.colors['white'])
        text_rect = text_surface.get_rect()

        # Add padding
        padding = 8
        tooltip_rect = text_rect.inflate(padding * 2, padding * 2)
        tooltip_rect.topleft = position

        # Draw background
        pygame.draw.rect(surface, background_color, tooltip_rect)
        pygame.draw.rect(surface, self.colors['white'], tooltip_rect, 1)

        # Draw text
        surface.blit(text_surface, (position[0] + padding, position[1] + padding))
