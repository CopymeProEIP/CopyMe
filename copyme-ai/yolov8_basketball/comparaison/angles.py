from typing import List, Dict

try:
    from .models import Improvement
    from .enums import Direction, PriorityLevel
except ImportError:
    try:
        from comparaison.models import Improvement
        from comparaison.enums import Direction, PriorityLevel
    except ImportError:
        from models import Improvement
        from enums import Direction, PriorityLevel

class AngleUtils:
    @staticmethod
    def compare_angles(current_angles, reference_angles: Dict[str, Dict[str, float]]) -> List[Improvement]:

        improvements = []

        if isinstance(current_angles, list):
            for idx, angle_data in enumerate(current_angles):
                if not isinstance(angle_data, dict):
                    continue

                if 'angle_name' not in angle_data or 'angle' not in angle_data:
                    continue

                angle_name = angle_data['angle_name'][0] if isinstance(angle_data['angle_name'], list) else angle_data['angle_name']
                current_value = angle_data['angle']

                if angle_name in reference_angles:
                    ref_data = reference_angles[angle_name]
                    reference = ref_data["ref"]
                    tolerance = ref_data["tolerance"]

                    diff = current_value - reference
                    abs_diff = abs(diff)

                    # If difference is within tolerance, no improvement needed
                    if abs_diff <= tolerance:
                        continue

                    # Determine correction direction
                    direction = Direction.DECREASE if diff > 0 else Direction.INCREASE

                    # Determine priority
                    priority = PriorityLevel.HIGH if abs_diff > 15 else \
                              (PriorityLevel.MEDIUM if abs_diff > 7 else PriorityLevel.LOW)

                    improvement = Improvement(
                        angle_index=idx,
                        target_angle=reference,
                        direction=direction,
                        magnitude=abs_diff,
                        priority=priority
                    )

                    improvements.append(improvement)

        # Handle current_angles as dictionary (original behavior)
        elif isinstance(current_angles, dict):
            for idx, (angle_name, current) in enumerate(current_angles.items()):
                if angle_name in reference_angles:
                    ref_data = reference_angles[angle_name]
                    reference = ref_data["ref"]
                    tolerance = ref_data["tolerance"]

                    # Calculate difference
                    diff = current - reference
                    abs_diff = abs(diff)

                    # If difference is within tolerance, no improvement needed
                    if abs_diff <= tolerance:
                        continue

                    # Determine correction direction
                    direction = Direction.DECREASE if diff > 0 else Direction.INCREASE

                    # Determine priority
                    priority = PriorityLevel.HIGH if abs_diff > 15 else \
                              (PriorityLevel.MEDIUM if abs_diff > 7 else PriorityLevel.LOW)

                    improvement = Improvement(
                        angle_index=idx,
                        target_angle=reference,
                        direction=direction,
                        magnitude=abs_diff,
                        priority=priority
                    )

                    improvements.append(improvement)

        # Sort by priority
        improvements.sort(key=lambda x: (
            0 if x.priority == PriorityLevel.HIGH else
            1 if x.priority == PriorityLevel.MEDIUM else 2
        ))

        return improvements

