import sys
import os
import asyncio
import logging
from typing import List, Dict, Optional, Tuple, Any
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
PARENT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)

from config.db_models import DatabaseManager
from .comparaison import Comparaison
from .advanced_comparison import AdvancedComparison
from .visualization_enhancer import VisualizationEnhancer
from .ui_config import (
    ADVANCED_METRICS_CONFIG,
    COMPARISON_CONFIG,
    BASKETBALL_CONFIG
)
from mistral.mistral import MistralRephraser

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BasketballAPIAnalyzer:
    """
    API for analyzing basketball data without graphical display.
    Returns results as structured data.
    """

    def __init__(self):
        self.db_manager = DatabaseManager()
        self.advanced_comparison = AdvancedComparison()
        self.visualization_enhancer = VisualizationEnhancer()
        self.mistral = MistralRephraser()

    def extract_first_valid_phase_sequence(self, frames: List[Dict], min_frames_per_phase: int = 3) -> List[Dict]:
        """Extract the first valid phase sequence."""
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
            if len(chunk) >= min_frames_per_phase and current_class != "unknown":
                stable_chunks.append((current_class, chunk))

        logger.info(f"Detected phases: {[class_name for class_name, _ in stable_chunks]}")

        required_phases = BASKETBALL_CONFIG['phases']
        sequence = []
        phases_found = set()

        for class_name, chunk in stable_chunks:
            expected_phase_index = len(phases_found)
            expected_phase = required_phases[expected_phase_index]

            is_valid_phase = False
            if expected_phase == "shot_release":
                is_valid_phase = class_name in ["shot_release", "shot_realese"]
            else:
                is_valid_phase = class_name == expected_phase

            if expected_phase_index < len(required_phases) and is_valid_phase:
                sequence.extend(chunk)
                phases_found.add(expected_phase)
                logger.info(f"Phase added: {expected_phase} ({len(chunk)} frames) - detected as: {class_name}")

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
        """Convert keypoints dictionary to list format."""
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
        """Calculate advanced metrics."""
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

    def generate_feedback(self, calculated_results: List[Dict], user_frames: List[Dict], reference_frames: List[Dict]) -> str:
        """Generate global Mistral feedback based on analysis results."""
        try:
            all_improvements = []
            for i, result in enumerate(calculated_results):
                if i < len(user_frames) and i < len(reference_frames):
                    improvements = result.get('improvements', [])
                    if improvements:
                        # Convert improvements to format expected by Mistral
                        improvements_dict = [imp.model_dump() if hasattr(imp, 'model_dump') else (imp.dict() if hasattr(imp, 'dict') else dict(imp)) for imp in improvements]
                        all_improvements.extend(improvements_dict)

            if not all_improvements:
                return "No specific improvements needed at this time."

            instruction = (
                "Generate a brief, direct, and actionable feedback for the user's basketball pose. "
                "Do not start with phrases like 'Based on feedback', 'According to the analysis', or similar. "
                "Do not end with generic encouragement unless the user's performance is clearly good or improving. "
                "Use the real angle names (e.g., 'elbow angle', 'knee angle') and be specific. "
                "Avoid technical jargon and long explanations. "
                "For each correction, add a short explanation of why or how this adjustment will help improve the shot. "
                "If encouragement is deserved, add a short, motivating phrase at the end; otherwise, end the feedback directly."
            )

            feedback = self.mistral.rephrase(all_improvements, instruction)
            return feedback

        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return "Unable to generate feedback at this time."

    def generate_frame_feedback(self, frame_result: Dict, frame_index: int, phase: str) -> str:
        """Generate feedback for a specific frame."""
        try:
            improvements = frame_result.get('improvements', [])
            if not improvements:
                return "Good form for this phase."

            improvements_dict = [imp.model_dump() if hasattr(imp, 'model_dump') else (imp.dict() if hasattr(imp, 'dict') else dict(imp)) for imp in improvements]

            instruction = (
                f"Generate a brief, specific feedback for frame {frame_index} (phase: {phase}). "
                "Focus on the immediate corrections needed for this specific moment. "
                "Use real angle names (e.g., 'elbow angle', 'knee angle') and be specific. "
                "Keep it concise and actionable. "
                "If no major issues, provide a brief positive reinforcement."
            )

            feedback = self.mistral.rephrase(improvements_dict, instruction)
            return feedback

        except Exception as e:
            logger.error(f"Error generating frame feedback: {e}")
            return "Unable to generate frame feedback."

    def generate_frame_recommendations(self, frame_result: Dict, frame_index: int, phase: str) -> List[str]:
        """Generate recommendations for a specific frame."""
        try:
            improvements = frame_result.get('improvements', [])
            technical_score = frame_result.get('technical_score', 0)

            if not improvements:
                return ["Maintain your current form for this phase"]
            recommendation_data = {
                'frame_index': frame_index,
                'phase': phase,
                'technical_score': technical_score,
                'improvements': [imp.model_dump() if hasattr(imp, 'model_dump') else (imp.dict() if hasattr(imp, 'dict') else dict(imp)) for imp in improvements]
            }

            instruction = (
                f"Generate 2-3 specific, actionable recommendations for frame {frame_index} (phase: {phase}). "
                "Focus =on immediate adjustments needed for this specific moment. "
                "Use specific angle names and be direct. "
                "Return as a simple list, one recommendation per line, without numbering."
            )

            recommendations_text = self.mistral.rephrase(recommendation_data, instruction)
            recommendations = [line.strip() for line in recommendations_text.split('\n') if line.strip()]
            return recommendations[:3]  # Limit to 3 recommendations per frame

        except Exception as e:
            logger.error(f"Error generating frame recommendations: {e}")
            return self._generate_fallback_frame_recommendations(improvements, technical_score)

    def _generate_fallback_frame_recommendations(self, improvements: List, technical_score: float) -> List[str]:
        """Generate fallback recommendations for a frame if Mistral fails."""
        recommendations = []

        if technical_score < 70:
            recommendations.append("Focus on fundamental mechanics for this phase")

        for improvement in improvements:
            if hasattr(improvement, 'class_name') and improvement.class_name:
                angle_name = improvement.class_name.lower()
                if 'elbow' in angle_name:
                    recommendations.append("Adjust your elbow angle for better alignment")
                elif 'knee' in angle_name:
                    recommendations.append("Maintain proper knee bend for stability")
                elif 'shoulder' in angle_name:
                    recommendations.append("Check your shoulder positioning")

        if not recommendations:
            recommendations.append("Continue with your current form")

        return recommendations[:3]

    def create_analysis_summary(self, advanced_results: List[Dict], calculated_results: List[Dict]) -> Dict:
        """Create analysis summary."""
        try:
            if not advanced_results:
                return {"error": "No advanced results available"}

            # Calculate averages
            technical_scores = [result.get('technical_score', 0) for result in advanced_results if result.get('technical_score') is not None]
            avg_technical_score = sum(technical_scores) / len(technical_scores) if technical_scores else 0

            # Analyze pose quality metrics
            pose_quality_metrics = {}
            for result in advanced_results:
                if 'pose_quality' in result:
                    for metric, value in result['pose_quality'].items():
                        if metric not in pose_quality_metrics:
                            pose_quality_metrics[metric] = []
                        pose_quality_metrics[metric].append(value)

            avg_pose_quality = {}
            for metric, values in pose_quality_metrics.items():
                avg_pose_quality[metric] = sum(values) / len(values)

            # Count improvements
            total_improvements = 0
            improvement_types = {}
            for result in calculated_results:
                improvements = result.get('improvements', [])
                total_improvements += len(improvements)
                for improvement in improvements:
                    if hasattr(improvement, 'class_name'):
                        improvement_type = improvement.class_name
                        improvement_types[improvement_type] = improvement_types.get(improvement_type, 0) + 1

            return {
                "summary": {
                    "total_frames_analyzed": len(advanced_results),
                    "average_technical_score": round(avg_technical_score, 2),
                    "average_pose_quality": avg_pose_quality,
                    "total_improvements_suggested": total_improvements,
                    "improvement_breakdown": improvement_types
                },
                "performance_rating": self._get_performance_rating(avg_technical_score),
                "recommendations": self._generate_recommendations(avg_technical_score, improvement_types, advanced_results)
            }

        except Exception as e:
            logger.error(f"Error creating analysis summary: {e}")
            return {"error": f"Failed to create summary: {str(e)}"}

    def _get_performance_rating(self, technical_score: float) -> str:
        """Determine performance level based on technical score."""
        if technical_score >= 90:
            return "Excellent"
        elif technical_score >= 80:
            return "Very Good"
        elif technical_score >= 70:
            return "Good"
        elif technical_score >= 60:
            return "Fair"
        else:
            return "Needs Improvement"

    def _generate_recommendations(self, technical_score: float, improvement_types: Dict, advanced_results: List[Dict]) -> List[str]:
        """Generate personalized recommendations with Mistral based on analysis."""
        try:
            recommendation_data = {
                'technical_score': technical_score,
                'improvement_types': improvement_types,
                'total_improvements': sum(improvement_types.values()),
                'performance_level': self._get_performance_rating(technical_score),
                'pose_quality_summary': self._get_pose_quality_summary(advanced_results)
            }

            instruction = (
                "Generate 3-5 specific, actionable basketball recommendations based on the analysis data. "
                "Focus on the most important improvements needed. "
                "Be encouraging but realistic. "
                "Use specific angle names (knee angle, elbow angle, etc.) and be direct. "
                "Avoid generic advice. "
                "Return as a simple list of recommendations, one per line, without numbering or bullet points."
            )

            recommendations_text = self.mistral.rephrase(recommendation_data, instruction)

            recommendations = [line.strip() for line in recommendations_text.split('\n') if line.strip()]
            return recommendations[:5]

        except Exception as e:
            logger.error(f"Error generating recommendations with Mistral: {e}")
            return self._generate_fallback_recommendations(technical_score, improvement_types)

    def _get_pose_quality_summary(self, advanced_results: List[Dict]) -> Dict:
        """Extract pose quality summary for recommendations."""
        try:
            pose_metrics = {}
            for result in advanced_results:
                if 'pose_quality' in result:
                    for metric, value in result['pose_quality'].items():
                        if metric not in pose_metrics:
                            pose_metrics[metric] = []
                        pose_metrics[metric].append(value)

            # Calculate averages
            summary = {}
            for metric, values in pose_metrics.items():
                summary[metric] = sum(values) / len(values)

            return summary
        except Exception as e:
            logger.error(f"Error getting pose quality summary: {e}")
            return {}

    def _generate_fallback_recommendations(self, technical_score: float, improvement_types: Dict) -> List[str]:
        """Generate fallback recommendations if Mistral fails."""
        recommendations = []

        if technical_score < 70:
            recommendations.append("Focus on fundamental shooting mechanics")

        if improvement_types.get('Knee Angle', 0) > 2:
            recommendations.append("Work on maintaining proper knee bend throughout the shot")

        if improvement_types.get('Elbow Angle', 0) > 2:
            recommendations.append("Practice keeping your elbow at the correct angle during release")

        if improvement_types.get('Shoulder Angle', 0) > 2:
            recommendations.append("Improve shoulder alignment and positioning")

        if not recommendations:
            recommendations.append("Continue practicing to maintain your good form")

        return recommendations

    async def analyze_basketball_sequence_api(self, video_id: str) -> Dict:
        """
        Analyze a basketball sequence and return results as a dictionary.

        Args:
            video_id (str): ID of the video to analyze

        Returns:
            Dict: Complete analysis results
        """
        try:
            logger.info("=== CopyMe AI - Basketball Analysis API ===")
            logger.info(f"Analyzing video ID: {video_id}")

            # Load user data
            user_data = await self.db_manager.get_by_id(video_id)
            if not user_data:
                return {"error": f"No data found for video ID: {video_id}"}

            # Load reference data
            reference_data = await self.db_manager.get_reference_data()
            if not reference_data:
                return {"error": "No reference data found in database"}

            # Extract frame data
            user_frames = user_data.get("frames", [])
            reference_frames = reference_data.get("frames", [])

            if not user_frames or not reference_frames:
                return {"error": "Insufficient frame data for analysis"}

            user_valid_sequence = self.extract_first_valid_phase_sequence(user_frames, min_frames_per_phase=3)
            reference_valid_sequence = self.extract_first_valid_phase_sequence(reference_frames, min_frames_per_phase=3)

            if not user_valid_sequence or not reference_valid_sequence:
                return {"error": "Unable to find complete and ordered phase sequences"}

            # Synchronize frame sequences
            n_frames = min(len(user_valid_sequence), len(reference_valid_sequence))
            merged_user_frames = user_valid_sequence[:n_frames]
            merged_reference_frames = reference_valid_sequence[:n_frames]

            logger.info(f"Processing {n_frames} frames...")

            # Initialize comparison engine
            comparison_engine = Comparaison(
                model=merged_user_frames,
                dataset=merged_reference_frames,
                use_kalman=COMPARISON_CONFIG.get('kalman_filtering', False)
            )

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
                        'frame_index': i,
                        'phase': user_frame.get('class_name', 'unknown'),
                        'filtered_current_keypoints': filtered_current,
                        'filtered_reference_keypoints': filtered_reference,
                        'comparison_result': comparison_result,
                        'improvements': improvements
                    })

                except Exception as e:
                    logger.error(f"Error processing frame {i}: {e}")
                    calculated_results.append({
                        'frame_index': i,
                        'phase': 'error',
                        'error': str(e)
                    })

            advanced_results = self.calculate_advanced_metrics(merged_user_frames, merged_reference_frames)
            for i, advanced_result in enumerate(advanced_results):
                if i < len(calculated_results):
                    frame_result = calculated_results[i]
                    phase = frame_result.get('phase', 'unknown')

                    # Update with advanced metrics
                    frame_result.update({
                        'advanced_metrics': advanced_result,
                        'pose_quality': advanced_result.get('pose_quality', {}),
                        'technical_score': advanced_result.get('technical_score', 0)
                    })

                    frame_feedback = self.generate_frame_feedback(frame_result, i, phase)
                    frame_recommendations = self.generate_frame_recommendations(frame_result, i, phase)

                    frame_result.update({
                        'frame_feedback': frame_feedback,
                        'frame_recommendations': frame_recommendations
                    })

            # Generate global feedback
            feedback = self.generate_feedback(calculated_results, merged_user_frames, merged_reference_frames)

            # Create analysis summary
            summary = self.create_analysis_summary(advanced_results, calculated_results)

            # Prepare final results
            results = {
                "success": True,
                "video_id": video_id,
                "analysis_summary": summary,
                "global_feedback": feedback,
                "frame_analysis": calculated_results,
                "metadata": {
                    "total_frames": n_frames,
                    "phases_detected": [frame.get('class_name', 'unknown') for frame in merged_user_frames],
                    "analysis_timestamp": asyncio.get_event_loop().time()
                }
            }

            logger.info("Analysis completed successfully!")
            return results

        except Exception as e:
            logger.error(f"Error during basketball analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_id": video_id
            }

    async def get_analysis_results(self, video_id: str) -> Dict:
        """
        Simplified method to get analysis results.

        Args:
            video_id (str): Video ID

        Returns:
            Dict: Analysis results
        """
        return await self.analyze_basketball_sequence_api(video_id)

    def save_results_to_file(self, results: Dict, filename: str = None) -> str:
        """
        Save results to a JSON file.

        Args:
            results (Dict): Analysis results
            filename (str): Filename (optional)

        Returns:
            str: Path of saved file
        """
        try:
            if filename is None:
                video_id = results.get('video_id', 'unknown')
                filename = f"basketball_analysis_{video_id}.json"

            # Ensure file has .json extension
            if not filename.endswith('.json'):
                filename += '.json'

            filepath = os.path.join(os.getcwd(), filename)

            # Convert results to JSON-serializable format
            serializable_results = self._make_json_serializable(results)

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(serializable_results, f, indent=2, ensure_ascii=False)

            logger.info(f"Results saved to: {filepath}")
            return filepath

        except Exception as e:
            logger.error(f"Error saving results to file: {e}")
            raise

    def _make_json_serializable(self, obj):
        """
        Convert objects to JSON-serializable format.

        Args:
            obj: Object to convert

        Returns:
            JSON-serializable object
        """
        if isinstance(obj, dict):
            return {key: self._make_json_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_json_serializable(item) for item in obj]
        elif hasattr(obj, 'model_dump'):  # Pydantic v2
            return obj.model_dump()
        elif hasattr(obj, 'dict'):  # Pydantic v1
            return obj.dict()
        elif hasattr(obj, '__dict__'):
            return self._make_json_serializable(obj.__dict__)
        else:
            return obj
