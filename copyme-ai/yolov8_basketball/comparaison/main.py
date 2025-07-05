import sys
import os
import asyncio
import logging
from typing import List, Dict, Optional, Tuple

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
PARENT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)

from config.db_models import DatabaseManager
from display import Display
from comparaison import Comparaison

from advanced_comparison import AdvancedComparison
from visualization_enhancer import VisualizationEnhancer
from ui_config import (
    ADVANCED_METRICS_CONFIG,
    COMPARISON_CONFIG,
    UI_CONFIG,
    ANIMATION_CONFIG,
    BASKETBALL_CONFIG
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BasketballAnalyzer:
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.advanced_comparison = AdvancedComparison()
        self.visualization_enhancer = VisualizationEnhancer()
        self.display = Display()

    def extract_first_valid_phase_sequence(self, frames: List[Dict], min_frames_per_phase: int = 3) -> List[Dict]:
        if not frames:
            logger.warning("No frames provided for phase sequence extraction")
            return []

        # Group frames by stable phase
        stable_chunks = []
        i = 0
        total_frames = len(frames)

        while i < total_frames:
            current_class = frames[i].get("class_name", "unknown")
            chunk = []

            # Collect consecutive frames of the same phase
            while i < total_frames and frames[i].get("class_name", "unknown") == current_class:
                chunk.append(frames[i])
                i += 1

            # Only include chunks with sufficient frames and valid phase names
            if len(chunk) >= min_frames_per_phase and current_class != "unknown":
                stable_chunks.append((current_class, chunk))

        logger.info(f"Detected phases: {[class_name for class_name, _ in stable_chunks]}")

        # Find the first valid sequence of required phases
        required_phases = BASKETBALL_CONFIG['phases']
        sequence = []
        phases_found = set()

        for class_name, chunk in stable_chunks:
            # Check if this phase is the next expected one
            expected_phase_index = len(phases_found)
            expected_phase = required_phases[expected_phase_index]

            # Handle both variants for shot_release (backward compatibility)
            is_valid_phase = False
            if expected_phase == "shot_release":
                is_valid_phase = class_name in ["shot_release", "shot_realese"]
            else:
                is_valid_phase = class_name == expected_phase

            if expected_phase_index < len(required_phases) and is_valid_phase:
                sequence.extend(chunk)
                phases_found.add(expected_phase)
                logger.info(f"Phase added: {expected_phase} ({len(chunk)} frames) - detected as: {class_name}")

            # Stop if we found all required phases
            if len(phases_found) == len(required_phases):
                break

        if len(phases_found) == len(required_phases):
            logger.info(f"Complete sequence found with {len(sequence)} total frames")
            return sequence
        else:
            missing_phases = set(required_phases) - phases_found
            logger.warning(f"Missing phases: {missing_phases}")
            return []

    def dict_to_list(self, keypoints_dict: Dict) -> List[List[float]]:
        keypoint_order = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]

        return [
            [keypoints_dict.get(f"{kp}_x", 0.0), keypoints_dict.get(f"{kp}_y", 0.0)]
            for kp in keypoint_order
        ]

    def calculate_advanced_metrics(self, user_frames: List[Dict], reference_frames: List[Dict]) -> List[Dict]:
        if not ADVANCED_METRICS_CONFIG['enable_pose_quality']:
            logger.info("Advanced metrics calculation disabled in configuration")
            return []

        logger.info("Calculating advanced pose analysis metrics...")
        advanced_results = []

        for i, (user_frame, ref_frame) in enumerate(zip(user_frames, reference_frames)):
            try:
                current_keypoints = self.dict_to_list(user_frame['keypoints_positions'])
                reference_keypoints = self.dict_to_list(ref_frame['keypoints_positions'])

                # Calculate advanced pose comparison
                advanced_result = self.advanced_comparison.compare_poses_advanced(
                    current_keypoints,
                    reference_keypoints
                )

                advanced_results.append(advanced_result)

                # Progress logging
                if (i + 1) % 10 == 0 or i == len(user_frames) - 1:
                    logger.info(f"     {i + 1}/{len(user_frames)} advanced metrics calculated")

            except Exception as e:
                logger.error(f"Error calculating advanced metrics for frame {i}: {e}")
                advanced_results.append({})

        return advanced_results

    def create_enhanced_visualizations(self, frame_data: List[Dict],
                                     calculated_results: List[Dict],
                                     advanced_results: List[Dict]) -> Optional[Dict]:
        if not ADVANCED_METRICS_CONFIG['enable_performance_charts']:
            logger.info("Enhanced visualizations disabled in configuration")
            return None

        logger.info("Creating enhanced visualizations...")

        try:
            # Create performance chart
            performance_chart = self.visualization_enhancer.create_performance_chart(
                frame_data,
                chart_type='line'
            )

            # Create heatmap if data is available
            heatmap = None
            if calculated_results and len(calculated_results) > 0:
                first_result = calculated_results[0]
                if ('filtered_current_keypoints' in first_result and
                    'filtered_reference_keypoints' in first_result):
                    heatmap = self.visualization_enhancer.create_heatmap(
                        first_result['filtered_current_keypoints'],
                        first_result['filtered_reference_keypoints']
                    )

            return {
                'performance_chart': performance_chart,
                'heatmap': heatmap
            }

        except Exception as e:
            logger.error(f"Error creating enhanced visualizations: {e}")
            return None

    async def analyze_basketball_sequence(self, video_id: str) -> bool:
        try:
            logger.info("=== CopyMe AI - Basketball Analysis with Advanced Features ===")
            logger.info(f"Advanced metrics enabled: {ADVANCED_METRICS_CONFIG['enable_pose_quality']}")
            logger.info(f"Performance charts enabled: {ADVANCED_METRICS_CONFIG['enable_performance_charts']}")
            logger.info(f"UI FPS: {UI_CONFIG['fps']}")
            logger.info("=" * 60)

            # Load user data
            user_data = await self.db_manager.get_by_id(video_id)
            if not user_data:
                logger.error(f"No data found for video ID: {video_id}")
                return False

            # Load reference data
            reference_data = await self.db_manager.get_reference_data()
            if not reference_data:
                logger.error("No reference data found in database")
                return False

            # Extract frame data
            user_frames = user_data.get("frames", [])
            reference_frames = reference_data.get("frames", [])

            if not user_frames or not reference_frames:
                logger.error("Insufficient frame data for analysis")
                return False

            # Extract valid phase sequences
            user_valid_sequence = self.extract_first_valid_phase_sequence(user_frames, min_frames_per_phase=3)
            reference_valid_sequence = self.extract_first_valid_phase_sequence(reference_frames, min_frames_per_phase=3)

            if not user_valid_sequence or not reference_valid_sequence:
                logger.error("Unable to find complete and ordered phase sequences")
                return False

            # Synchronize frame sequences
            n_frames = min(len(user_valid_sequence), len(reference_valid_sequence))
            merged_user_frames = user_valid_sequence[:n_frames]
            merged_reference_frames = reference_valid_sequence[:n_frames]

            logger.info(f"Processing {n_frames} frames with enhanced analysis...")

            # Initialize comparison engine
            comparison_engine = Comparaison(
                model=merged_user_frames,
                dataset=merged_reference_frames,
                use_kalman=COMPARISON_CONFIG.get('kalman_filtering', False)
            )

            # Calculate basic comparison results
            calculated_results = []
            for i in range(n_frames):
                try:
                    user_frame = merged_user_frames[i]
                    ref_frame = merged_reference_frames[i]

                    current_keypoints = self.dict_to_list(user_frame['keypoints_positions'])
                    reference_keypoints = self.dict_to_list(ref_frame['keypoints_positions'])

                    # Apply Kalman filtering if enabled
                    filtered_current = (comparison_engine.filter_keypoints(current_keypoints)
                                      if comparison_engine.use_kalman else current_keypoints)
                    filtered_reference = (comparison_engine.filter_keypoints(reference_keypoints)
                                        if comparison_engine.use_kalman else reference_keypoints)

                    # Perform keypoint comparison
                    comparison_result = comparison_engine.compare_keypoints(filtered_current, filtered_reference)

                    # Calculate angle improvements
                    improvements = []
                    if 'angles' in user_frame and 'angles' in ref_frame:
                        reference_angles = {
                            str(angle.get('angle_name', ['unknown', 0])[0]): {
                                "ref": angle.get('angle', 0), "tolerance": 5.0
                            } for angle in ref_frame['angles']
                        }
                        improvements = comparison_engine.compare_angles(user_frame['angles'], reference_angles)

                    calculated_results.append({
                        'filtered_current_keypoints': filtered_current,
                        'filtered_reference_keypoints': filtered_reference,
                        'comparison_result': comparison_result,
                        'improvements': improvements
                    })

                    # Progress logging
                    if (i + 1) % 10 == 0 or i == n_frames - 1:
                        logger.info(f"     {i + 1}/{n_frames} basic comparison results calculated")

                except Exception as e:
                    logger.error(f"Error processing frame {i}: {e}")
                    calculated_results.append({})

            # Calculate advanced metrics
            advanced_results = self.calculate_advanced_metrics(merged_user_frames, merged_reference_frames)

            # Merge advanced results with basic results
            for i, advanced_result in enumerate(advanced_results):
                if i < len(calculated_results):
                    calculated_results[i].update({
                        'advanced_metrics': advanced_result,
                        'pose_quality': advanced_result.get('pose_quality', {}),
                        'technical_score': advanced_result.get('technical_score', 0),
                        'recommendations': advanced_result.get('recommendations', [])
                    })

            # Create enhanced visualizations
            enhanced_visualizations = self.create_enhanced_visualizations(
                merged_user_frames,
                calculated_results,
                advanced_results
            )

            logger.info("All calculations completed! Launching enhanced visualization...")

            # Configure display
            self.display.config.update({
                'fps': UI_CONFIG['fps'],
                'animation_speed': ANIMATION_CONFIG['fade_duration']
            })

            # Launch visualization
            self.display.display_keypoints_video(
                frames=merged_user_frames,
                reference_frames=merged_reference_frames,
                video_path='../../' + user_data.get('url'),
                calculated_results=calculated_results,
                fps=UI_CONFIG['fps']
            )

            # Display final statistics
            if advanced_results:
                self._display_analysis_summary(advanced_results)

            return True

        except Exception as e:
            logger.error(f"Error during basketball analysis: {e}")
            return False

    def _display_analysis_summary(self, advanced_results: List[Dict]) -> None:
        logger.info("\n=== Advanced Analysis Summary ===")

        try:
            avg_technical_score = sum(result.get('technical_score', 0) for result in advanced_results) / len(advanced_results)
            total_recommendations = sum(len(result.get('recommendations', [])) for result in advanced_results)

            logger.info(f"Average Technical Score: {avg_technical_score:.1f}%")
            logger.info(f"Total Recommendations: {total_recommendations}")

            # Display top recommendations
            if total_recommendations > 0:
                logger.info("\nTop Recommendations:")
                all_recommendations = []
                for result in advanced_results:
                    all_recommendations.extend(result.get('recommendations', []))

                # Group by recommendation type
                recommendation_counts = {}
                for rec in all_recommendations:
                    rec_type = rec.get('type', 'unknown')
                    recommendation_counts[rec_type] = recommendation_counts.get(rec_type, 0) + 1

                for rec_type, count in sorted(recommendation_counts.items(), key=lambda x: x[1], reverse=True)[:3]:
                    logger.info(f"  - {rec_type}: {count} suggestions")

        except Exception as e:
            logger.error(f"Error displaying analysis summary: {e}")


async def main():
    try:
        # Initialize analyzer
        analyzer = BasketballAnalyzer()

        # Default video ID for testing
        video_id = "685d70063c2a10a5fd8a07ea"

        # Perform analysis
        success = await analyzer.analyze_basketball_sequence(video_id)

        if success:
            logger.info("Basketball analysis completed successfully!")
        else:
            logger.error("Basketball analysis failed!")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Analysis interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
