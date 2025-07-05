import numpy as np
import logging
from typing import List, Dict, Tuple, Optional, Any
from enum import Enum
import cv2
from scipy.spatial.distance import cosine
from scipy.stats import pearsonr
import math

# Configure logging
logger = logging.getLogger(__name__)


class RecommendationType(Enum):
    """Enumeration for recommendation types."""
    BALANCE = "balance"
    SYMMETRY = "symmetry"
    STABILITY = "stability"
    ALIGNMENT = "alignment"
    TECHNIQUE = "technique"


class RecommendationPriority(Enum):
    """Enumeration for recommendation priorities."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AdvancedComparison:

    def __init__(self):
        # Define keypoint indices for different body parts
        self.keypoint_indices = {
            'head': [0, 1, 2, 3, 4],  # nose, eyes, ears
            'torso': [5, 6, 11, 12],  # shoulders, hips
            'left_arm': [5, 7, 9],    # left shoulder, elbow, wrist
            'right_arm': [6, 8, 10],  # right shoulder, elbow, wrist
            'left_leg': [11, 13, 15], # left hip, knee, ankle
            'right_leg': [12, 14, 16] # right hip, knee, ankle
        }

        # Quality thresholds
        self.quality_thresholds = {
            'balance': 0.7,
            'symmetry': 0.8,
            'stability': 0.6
        }

        logger.info("Advanced comparison engine initialized")

    def compare_poses_advanced(self, current_keypoints: List[List[float]],
                             reference_keypoints: List[List[float]]) -> Dict[str, Any]:

        try:
            # Validate input data
            if not self._validate_keypoints(current_keypoints, reference_keypoints):
                logger.warning("Invalid keypoints provided for advanced comparison")
                return self._get_default_result()

            # Calculate pose quality metrics
            pose_quality = self._calculate_pose_quality(current_keypoints)

            # Calculate movement analysis
            movement_analysis = self._analyze_movement(current_keypoints, reference_keypoints)

            # Calculate technical precision
            technical_precision = self._calculate_technical_precision(current_keypoints, reference_keypoints)

            # Generate recommendations
            recommendations = self._generate_recommendations(pose_quality, movement_analysis, technical_precision)

            # Calculate overall technical score
            technical_score = self._calculate_technical_score(pose_quality, movement_analysis, technical_precision)

            return {
                'pose_quality': pose_quality,
                'movement_analysis': movement_analysis,
                'technical_precision': technical_precision,
                'recommendations': recommendations,
                'technical_score': technical_score
            }

        except Exception as e:
            logger.error(f"Error in advanced pose comparison: {e}")
            return self._get_default_result()

    def _validate_keypoints(self, current_keypoints: List[List[float]],
                           reference_keypoints: List[List[float]]) -> bool:

        if not current_keypoints or not reference_keypoints:
            return False

        if len(current_keypoints) != 17 or len(reference_keypoints) != 17:
            return False

        # Check for valid coordinates
        for kp in current_keypoints + reference_keypoints:
            if len(kp) < 2 or not isinstance(kp[0], (int, float)) or not isinstance(kp[1], (int, float)):
                return False

        return True

    def _calculate_pose_quality(self, keypoints: List[List[float]]) -> Dict[str, float]:

        try:
            # Calculate balance (center of mass distribution)
            balance_score = self._calculate_balance(keypoints)

            # Calculate symmetry (left-right body symmetry)
            symmetry_score = self._calculate_symmetry(keypoints)

            # Calculate stability (joint angle consistency)
            stability_score = self._calculate_stability(keypoints)

            return {
                'balance': balance_score,
                'symmetry': symmetry_score,
                'stability': stability_score
            }

        except Exception as e:
            logger.error(f"Error calculating pose quality: {e}")
            return {'balance': 0.0, 'symmetry': 0.0, 'stability': 0.0}

    def _calculate_balance(self, keypoints: List[List[float]]) -> float:

        try:
            # Get torso keypoints (shoulders and hips)
            torso_points = [keypoints[i] for i in self.keypoint_indices['torso']
                          if i < len(keypoints) and len(keypoints[i]) >= 2]

            if len(torso_points) < 4:
                return 0.5

            # Calculate center of mass
            center_x = sum(point[0] for point in torso_points) / len(torso_points)
            center_y = sum(point[1] for point in torso_points) / len(torso_points)

            # Calculate balance based on vertical alignment
            # Ideal balance: center should be vertically aligned
            vertical_deviation = abs(center_x - 320) / 320  # Assuming 640px width
            balance_score = max(0, 1 - vertical_deviation)

            return min(1.0, max(0.0, balance_score))

        except Exception as e:
            logger.error(f"Error calculating balance: {e}")
            return 0.5

    def _calculate_symmetry(self, keypoints: List[List[float]]) -> float:

        try:
            # Compare left and right arm positions
            left_arm_score = self._calculate_limb_symmetry(keypoints, 'left_arm', 'right_arm')

            # Compare left and right leg positions
            left_leg_score = self._calculate_limb_symmetry(keypoints, 'left_leg', 'right_leg')

            # Average symmetry scores
            symmetry_score = (left_arm_score + left_leg_score) / 2

            return min(1.0, max(0.0, symmetry_score))

        except Exception as e:
            logger.error(f"Error calculating symmetry: {e}")
            return 0.5

    def _calculate_limb_symmetry(self, keypoints: List[List[float]],
                                left_limb: str, right_limb: str) -> float:

        try:
            left_points = [keypoints[i] for i in self.keypoint_indices[left_limb]
                          if i < len(keypoints) and len(keypoints[i]) >= 2]
            right_points = [keypoints[i] for i in self.keypoint_indices[right_limb]
                           if i < len(keypoints) and len(keypoints[i]) >= 2]

            if len(left_points) != len(right_points) or len(left_points) == 0:
                return 0.5

            # Calculate average distance between corresponding points
            total_distance = 0
            for left_point, right_point in zip(left_points, right_points):
                distance = np.sqrt((left_point[0] - right_point[0])**2 +
                                 (left_point[1] - right_point[1])**2)
                total_distance += distance

            avg_distance = total_distance / len(left_points)

            # Normalize distance (assume 100px is maximum expected difference)
            symmetry_score = max(0, 1 - (avg_distance / 100))

            return min(1.0, max(0.0, symmetry_score))

        except Exception as e:
            logger.error(f"Error calculating limb symmetry: {e}")
            return 0.5

    def _calculate_stability(self, keypoints: List[List[float]]) -> float:

        try:
            # Calculate angles for major joints
            angles = []

            # Shoulder angle
            if (len(keypoints) > 8 and len(keypoints[5]) >= 2 and
                len(keypoints[7]) >= 2 and len(keypoints[9]) >= 2):
                shoulder_angle = self._calculate_angle(keypoints[5], keypoints[7], keypoints[9])
                angles.append(shoulder_angle)

            # Hip angle
            if (len(keypoints) > 15 and len(keypoints[11]) >= 2 and
                len(keypoints[13]) >= 2 and len(keypoints[15]) >= 2):
                hip_angle = self._calculate_angle(keypoints[11], keypoints[13], keypoints[15])
                angles.append(hip_angle)

            if not angles:
                return 0.5

            # Calculate stability based on angle consistency
            # Ideal angles for basketball shooting
            ideal_angles = {
                'shoulder': 90,  # degrees
                'hip': 120       # degrees
            }

            stability_scores = []
            for i, angle in enumerate(angles):
                if i == 0:  # Shoulder angle
                    ideal = ideal_angles['shoulder']
                else:  # Hip angle
                    ideal = ideal_angles['hip']

                deviation = abs(angle - ideal) / 180  # Normalize to 0-1
                stability_score = max(0, 1 - deviation)
                stability_scores.append(stability_score)

            return sum(stability_scores) / len(stability_scores)

        except Exception as e:
            logger.error(f"Error calculating stability: {e}")
            return 0.5

    def _calculate_angle(self, point1: List[float], point2: List[float],
                        point3: List[float]) -> float:

        try:
            # Calculate vectors
            vector1 = [point1[0] - point2[0], point1[1] - point2[1]]
            vector2 = [point3[0] - point2[0], point3[1] - point2[1]]

            # Calculate dot product
            dot_product = vector1[0] * vector2[0] + vector1[1] * vector2[1]

            # Calculate magnitudes
            mag1 = np.sqrt(vector1[0]**2 + vector1[1]**2)
            mag2 = np.sqrt(vector2[0]**2 + vector2[1]**2)

            if mag1 == 0 or mag2 == 0:
                return 0

            # Calculate angle
            cos_angle = dot_product / (mag1 * mag2)
            cos_angle = max(-1, min(1, cos_angle))  # Clamp to [-1, 1]
            angle = np.arccos(cos_angle)

            return np.degrees(angle)

        except Exception as e:
            logger.error(f"Error calculating angle: {e}")
            return 0

    def _analyze_movement(self, current_keypoints: List[List[float]],
                         reference_keypoints: List[List[float]]) -> Dict[str, float]:

        try:
            # Calculate movement smoothness
            smoothness = self._calculate_movement_smoothness(current_keypoints, reference_keypoints)

            # Calculate movement efficiency
            efficiency = self._calculate_movement_efficiency(current_keypoints, reference_keypoints)

            # Calculate movement consistency
            consistency = self._calculate_movement_consistency(current_keypoints, reference_keypoints)

            return {
                'smoothness': smoothness,
                'efficiency': efficiency,
                'consistency': consistency
            }

        except Exception as e:
            logger.error(f"Error analyzing movement: {e}")
            return {'smoothness': 0.5, 'efficiency': 0.5, 'consistency': 0.5}

    def _calculate_movement_smoothness(self, current_keypoints: List[List[float]],
                                     reference_keypoints: List[List[float]]) -> float:

        try:
            # Calculate average distance between current and reference
            total_distance = 0
            valid_points = 0

            for curr, ref in zip(current_keypoints, reference_keypoints):
                if len(curr) >= 2 and len(ref) >= 2:
                    distance = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)
                    total_distance += distance
                    valid_points += 1

            if valid_points == 0:
                return 0.5

            avg_distance = total_distance / valid_points

            # Normalize distance (assume 50px is good smoothness threshold)
            smoothness = max(0, 1 - (avg_distance / 50))

            return min(1.0, max(0.0, smoothness))

        except Exception as e:
            logger.error(f"Error calculating movement smoothness: {e}")
            return 0.5

    def _calculate_movement_efficiency(self, current_keypoints: List[List[float]],
                                     reference_keypoints: List[List[float]]) -> float:

        try:
            # Calculate total movement energy
            total_energy = 0
            valid_points = 0

            for curr, ref in zip(current_keypoints, reference_keypoints):
                if len(curr) >= 2 and len(ref) >= 2:
                    # Simple energy calculation based on distance
                    distance = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)
                    energy = distance ** 2  # Square distance as energy
                    total_energy += energy
                    valid_points += 1

            if valid_points == 0:
                return 0.5

            avg_energy = total_energy / valid_points

            # Normalize energy (assume 1000 is good efficiency threshold)
            efficiency = max(0, 1 - (avg_energy / 1000))

            return min(1.0, max(0.0, efficiency))

        except Exception as e:
            logger.error(f"Error calculating movement efficiency: {e}")
            return 0.5

    def _calculate_movement_consistency(self, current_keypoints: List[List[float]],
                                      reference_keypoints: List[List[float]]) -> float:

        try:
            # Calculate consistency for different body parts
            consistency_scores = []

            for limb_group in ['left_arm', 'right_arm', 'left_leg', 'right_leg']:
                limb_score = self._calculate_limb_consistency(
                    current_keypoints, reference_keypoints, limb_group
                )
                consistency_scores.append(limb_score)

            if not consistency_scores:
                return 0.5

            return sum(consistency_scores) / len(consistency_scores)

        except Exception as e:
            logger.error(f"Error calculating movement consistency: {e}")
            return 0.5

    def _calculate_limb_consistency(self, current_keypoints: List[List[float]],
                                  reference_keypoints: List[List[float]],
                                  limb_group: str) -> float:

        try:
            limb_indices = self.keypoint_indices[limb_group]
            distances = []

            for idx in limb_indices:
                if (idx < len(current_keypoints) and idx < len(reference_keypoints) and
                    len(current_keypoints[idx]) >= 2 and len(reference_keypoints[idx]) >= 2):

                    curr = current_keypoints[idx]
                    ref = reference_keypoints[idx]
                    distance = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)
                    distances.append(distance)

            if not distances:
                return 0.5

            # Calculate consistency based on standard deviation
            mean_distance = np.mean(distances)
            std_distance = np.std(distances)

            if mean_distance == 0:
                return 1.0

            # Lower coefficient of variation indicates higher consistency
            cv = std_distance / mean_distance
            consistency = max(0, 1 - cv)

            return min(1.0, max(0.0, consistency))

        except Exception as e:
            logger.error(f"Error calculating limb consistency: {e}")
            return 0.5

    def _calculate_technical_precision(self, current_keypoints: List[List[float]],
                                     reference_keypoints: List[List[float]]) -> Dict[str, float]:

        try:
            # Calculate alignment precision
            alignment = self._calculate_alignment_precision(current_keypoints, reference_keypoints)

            # Calculate timing precision
            timing = self._calculate_timing_precision(current_keypoints, reference_keypoints)

            # Calculate form precision
            form = self._calculate_form_precision(current_keypoints, reference_keypoints)

            return {
                'alignment': alignment,
                'timing': timing,
                'form': form
            }

        except Exception as e:
            logger.error(f"Error calculating technical precision: {e}")
            return {'alignment': 0.5, 'timing': 0.5, 'form': 0.5}

    def _calculate_alignment_precision(self, current_keypoints: List[List[float]],
                                     reference_keypoints: List[List[float]]) -> float:

        try:
            # Calculate average alignment error
            total_error = 0
            valid_points = 0

            for curr, ref in zip(current_keypoints, reference_keypoints):
                if len(curr) >= 2 and len(ref) >= 2:
                    error = np.sqrt((curr[0] - ref[0])**2 + (curr[1] - ref[1])**2)
                    total_error += error
                    valid_points += 1

            if valid_points == 0:
                return 0.5

            avg_error = total_error / valid_points

            # Normalize error (assume 30px is good alignment threshold)
            precision = max(0, 1 - (avg_error / 30))

            return min(1.0, max(0.0, precision))

        except Exception as e:
            logger.error(f"Error calculating alignment precision: {e}")
            return 0.5

    def _calculate_timing_precision(self, current_keypoints: List[List[float]],
                                  reference_keypoints: List[List[float]]) -> float:

        # This would require temporal data across multiple frames
        # For now, return a default score
        return 0.7

    def _calculate_form_precision(self, current_keypoints: List[List[float]],
                                reference_keypoints: List[List[float]]) -> float:

        try:
            # Calculate form score based on key anatomical relationships
            form_scores = []

            # Check shoulder alignment
            if (len(current_keypoints) > 6 and len(reference_keypoints) > 6):
                shoulder_score = self._calculate_shoulder_form(current_keypoints, reference_keypoints)
                form_scores.append(shoulder_score)

            # Check hip alignment
            if (len(current_keypoints) > 12 and len(reference_keypoints) > 12):
                hip_score = self._calculate_hip_form(current_keypoints, reference_keypoints)
                form_scores.append(hip_score)

            if not form_scores:
                return 0.5

            return sum(form_scores) / len(form_scores)

        except Exception as e:
            logger.error(f"Error calculating form precision: {e}")
            return 0.5

    def _calculate_shoulder_form(self, current_keypoints: List[List[float]],
                               reference_keypoints: List[List[float]]) -> float:

        try:
            # Compare shoulder positions
            left_shoulder_curr = current_keypoints[5]
            right_shoulder_curr = current_keypoints[6]
            left_shoulder_ref = reference_keypoints[5]
            right_shoulder_ref = reference_keypoints[6]

            if (len(left_shoulder_curr) >= 2 and len(right_shoulder_curr) >= 2 and
                len(left_shoulder_ref) >= 2 and len(right_shoulder_ref) >= 2):

                # Calculate shoulder width ratio
                curr_width = abs(left_shoulder_curr[0] - right_shoulder_curr[0])
                ref_width = abs(left_shoulder_ref[0] - right_shoulder_ref[0])

                if ref_width > 0:
                    width_ratio = curr_width / ref_width
                    width_score = max(0, 1 - abs(width_ratio - 1))
                else:
                    width_score = 0.5

                return width_score

            return 0.5

        except Exception as e:
            logger.error(f"Error calculating shoulder form: {e}")
            return 0.5

    def _calculate_hip_form(self, current_keypoints: List[List[float]],
                          reference_keypoints: List[List[float]]) -> float:

        try:
            # Compare hip positions
            left_hip_curr = current_keypoints[11]
            right_hip_curr = current_keypoints[12]
            left_hip_ref = reference_keypoints[11]
            right_hip_ref = reference_keypoints[12]

            if (len(left_hip_curr) >= 2 and len(right_hip_curr) >= 2 and
                len(left_hip_ref) >= 2 and len(right_hip_ref) >= 2):

                # Calculate hip width ratio
                curr_width = abs(left_hip_curr[0] - right_hip_curr[0])
                ref_width = abs(left_hip_ref[0] - right_hip_ref[0])

                if ref_width > 0:
                    width_ratio = curr_width / ref_width
                    width_score = max(0, 1 - abs(width_ratio - 1))
                else:
                    width_score = 0.5

                return width_score

            return 0.5

        except Exception as e:
            logger.error(f"Error calculating hip form: {e}")
            return 0.5

    def _generate_recommendations(self, pose_quality: Dict[str, float],
                                movement_analysis: Dict[str, float],
                                technical_precision: Dict[str, float]) -> List[Dict[str, Any]]:

        recommendations = []

        try:
            # Generate pose quality recommendations
            for metric, score in pose_quality.items():
                if score < self.quality_thresholds.get(metric, 0.7):
                    # Map metric names to enum values (all lowercase)
                    metric_mapping = {
                        'balance': RecommendationType.BALANCE,
                        'symmetry': RecommendationType.SYMMETRY,
                        'stability': RecommendationType.STABILITY,
                        'alignment': RecommendationType.ALIGNMENT
                    }
                    rec_type = metric_mapping.get(metric, RecommendationType.TECHNIQUE)
                    recommendation = self._create_recommendation(
                        metric, score, rec_type
                    )
                    recommendations.append(recommendation)

            # Generate movement recommendations
            for metric, score in movement_analysis.items():
                if score < 0.6:  # Movement threshold
                    recommendation = self._create_recommendation(
                        metric, score, RecommendationType.TECHNIQUE
                    )
                    recommendations.append(recommendation)

            # Generate technical precision recommendations
            for metric, score in technical_precision.items():
                if score < 0.7:  # Technical threshold
                    recommendation = self._create_recommendation(
                        metric, score, RecommendationType.TECHNIQUE
                    )
                    recommendations.append(recommendation)

            # Sort recommendations by priority
            recommendations.sort(key=lambda x: x['priority'].value, reverse=True)

            return recommendations[:5]  # Return top 5 recommendations

        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []

    def _create_recommendation(self, metric: str, score: float,
                             rec_type: RecommendationType) -> Dict[str, Any]:

        # Determine priority based on score
        if score < 0.4:
            priority = RecommendationPriority.HIGH
        elif score < 0.6:
            priority = RecommendationPriority.MEDIUM
        else:
            priority = RecommendationPriority.LOW

        # Generate message based on metric and type
        messages = {
            'balance': "Improve body balance by centering your weight",
            'symmetry': "Maintain better left-right body symmetry",
            'stability': "Increase pose stability and reduce movement",
            'smoothness': "Make movements smoother and more fluid",
            'efficiency': "Improve movement efficiency and reduce wasted motion",
            'consistency': "Maintain consistent form throughout the movement",
            'alignment': "Better align your body with the reference position",
            'timing': "Improve timing and rhythm of your movements",
            'form': "Maintain proper form and technique"
        }

        message = messages.get(metric, f"Improve {metric} for better performance")

        return {
            'type': rec_type.value,
            'metric': metric,
            'score': score,
            'priority': priority,
            'message': message
        }

    def _calculate_technical_score(self, pose_quality: Dict[str, float],
                                 movement_analysis: Dict[str, float],
                                 technical_precision: Dict[str, float]) -> float:

        try:
            # Weight different components
            weights = {
                'pose_quality': 0.4,
                'movement_analysis': 0.3,
                'technical_precision': 0.3
            }

            # Calculate component scores
            pose_score = sum(pose_quality.values()) / len(pose_quality) if pose_quality else 0.5
            movement_score = sum(movement_analysis.values()) / len(movement_analysis) if movement_analysis else 0.5
            precision_score = sum(technical_precision.values()) / len(technical_precision) if technical_precision else 0.5

            # Calculate weighted average
            total_score = (
                pose_score * weights['pose_quality'] +
                movement_score * weights['movement_analysis'] +
                precision_score * weights['technical_precision']
            )

            # Convert to percentage
            return total_score * 100

        except Exception as e:
            logger.error(f"Error calculating technical score: {e}")
            return 50.0

    def _get_default_result(self) -> Dict[str, Any]:

        return {
            'pose_quality': {'balance': 0.5, 'symmetry': 0.5, 'stability': 0.5},
            'movement_analysis': {'smoothness': 0.5, 'efficiency': 0.5, 'consistency': 0.5},
            'technical_precision': {'alignment': 0.5, 'timing': 0.5, 'form': 0.5},
            'recommendations': [],
            'technical_score': 50.0
        }
