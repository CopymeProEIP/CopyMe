# Color palette for the interface
UI_CONFIG = {
    'fps': 60,
    'window_width': 1200,
    'window_height': 800,
    'keypoint_panel_width': 800,
    'sidebar_width': 400,
    'header_height': 80,
    'footer_height': 60,
    'colors': {
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
}

# Animation configuration
ANIMATION_CONFIG = {
    'fade_duration': 0.5,
    'smooth_transitions': True,
    'enable_animations': True,
    'animation_speed': 1.0
}

# Comparison configuration
COMPARISON_CONFIG = {
    'kalman_filtering': False,
    'enable_angle_comparison': True,
    'enable_keypoint_comparison': True,

    # Body part weights for comparison
    'body_part_weights': {
        'shooting_arm': 0.3,    # Shooting arm very important
        'support_arm': 0.2,     # Support arm
        'legs': 0.25,           # Legs for stability
        'core': 0.15,           # Core for balance
        'head': 0.1             # Head less critical
    },

    # Tolerances for comparisons
    'tolerances': {
        'keypoint_distance': 20,        # Keypoint distance in pixels
        'angle_difference': 15,         # Angle difference in degrees
        'symmetry_height_diff': 50,     # Height difference for symmetry
        'balance_variance': 10000       # Maximum variance for balance
    },

    # Keypoint groups for analysis
    'keypoint_groups': {
        'shooting_arm': [5, 7, 9],      # Shoulder, elbow, wrist of shooting arm
        'support_arm': [6, 8, 10],      # Shoulder, elbow, wrist of support arm
        'legs': [11, 12, 13, 14, 15, 16], # Hips, knees, ankles
        'core': [5, 6, 11, 12],         # Shoulders and hips
        'head': [0, 1, 2, 3, 4]         # Head and eyes
    }
}

# Control configuration
CONTROLS_CONFIG = {
    'key_repeat_delay': 0.5,
    'key_repeat_interval': 0.05,
    'mouse_sensitivity': 1.0,
    'enable_touch_controls': False
}

# Advanced metrics configuration
ADVANCED_METRICS_CONFIG = {
    'enable_pose_quality': True,
    'enable_performance_charts': True,
    'enable_movement_analysis': True,
    'enable_technical_scoring': True,
    'enable_recommendations': True,

    # Pose quality thresholds
    'pose_quality_thresholds': {
        'balance': 0.7,
        'symmetry': 0.8,
        'stability': 0.6,
        'alignment': 0.75
    },

    # Technical score weights
    'technical_score_weights': {
        'pose_quality': 0.4,
        'movement_analysis': 0.3,
        'technical_precision': 0.3
    },

    # Font settings
    'font_settings': {
        'title_font_size': 24,
        'body_font_size': 18,
        'small_font_size': 14,
        'default_font': None  # Use pygame default font
    }
}

# Theme configuration
THEME_CONFIG = {
    'current_theme': 'modern',
    'available_themes': ['modern', 'classic', 'dark', 'light'],
    'theme_colors': {
        'modern': {
            'primary': (52, 152, 219),
            'secondary': (155, 89, 182),
            'background': (236, 240, 241),
            'text': (44, 62, 80)
        },
        'classic': {
            'primary': (0, 0, 0),
            'secondary': (128, 128, 128),
            'background': (255, 255, 255),
            'text': (0, 0, 0)
        }
    }
}

# Basketball-specific configuration
BASKETBALL_CONFIG = {
    'phases': ['shot_position', 'shot_release', 'shot_followthrough'],
    'min_frames_per_phase': 3,
    'enable_phase_detection': True,
    'enable_shot_analysis': True,

    # Shot analysis parameters
    'shot_analysis': {
        'release_angle_range': (45, 75),    # Optimal release angle range
        'follow_through_duration': 0.5,     # Minimum follow-through duration
        'balance_threshold': 0.8,           # Balance threshold for good shot
        'symmetry_threshold': 0.7           # Symmetry threshold for good shot
    }
}

# Quality metrics configuration
QUALITY_METRICS_CONFIG = {
    'enable_balance_analysis': True,
    'enable_symmetry_analysis': True,
    'enable_stability_analysis': True,
    'enable_alignment_analysis': True,

    # Analysis parameters
    'balance_analysis': {
        'center_of_mass_calculation': True,
        'weight_distribution_analysis': True,
        'posture_stability_check': True
    },

    'symmetry_analysis': {
        'left_right_comparison': True,
        'bilateral_symmetry_check': True,
        'asymmetry_threshold': 0.2
    }
}

# Real-time charts configuration
REALTIME_CHARTS_CONFIG = {
    'enable_performance_tracking': True,
    'chart_update_frequency': 30,  # FPS
    'chart_history_length': 100,   # Number of data points to keep
    'chart_types': ['line', 'bar', 'radar', 'heatmap']
}

# Performance metrics configuration
PERFORMANCE_METRICS_CONFIG = {
    'enable_fps_monitoring': True,
    'enable_memory_usage_tracking': True,
    'enable_processing_time_analysis': True,
    'performance_thresholds': {
        'min_fps': 30,
        'max_memory_usage': 512,  # MB
        'max_processing_time': 100  # ms
    }
}

# Visual improvements configuration
VISUAL_IMPROVEMENTS_CONFIG = {
    'enable_smooth_animations': True,
    'enable_particle_effects': False,
    'enable_glow_effects': True,
    'enable_shadow_effects': True,
    'enable_gradient_backgrounds': True
}

# Advanced keyboard shortcuts configuration
ADVANCED_SHORTCUTS_CONFIG = {
    'enable_custom_shortcuts': True,
    'shortcuts': {
        'toggle_fullscreen': 'F11',
        'screenshot': 'F12',
        'toggle_debug_mode': 'F1',
        'reset_view': 'R',
        'export_data': 'Ctrl+E'
    }
}

# Export metrics configuration
EXPORT_METRICS_CONFIG = {
    'enable_data_export': True,
    'export_formats': ['json', 'csv', 'pdf'],
    'export_include_charts': True,
    'export_include_recommendations': True,
    'export_include_raw_data': False
}

# Accessibility improvements configuration
ACCESSIBILITY_CONFIG = {
    'enable_high_contrast_mode': False,
    'enable_large_text_mode': False,
    'enable_screen_reader_support': False,
    'enable_keyboard_navigation': True,
    'enable_voice_commands': False
}

# Validation metrics configuration
VALIDATION_METRICS_CONFIG = {
    'enable_data_validation': True,
    'enable_result_validation': True,
    'validation_thresholds': {
        'min_keypoints_detected': 15,
        'max_keypoint_confidence': 0.3,
        'min_angle_accuracy': 0.8
    }
}

# User experience improvements configuration
UX_IMPROVEMENTS_CONFIG = {
    'enable_tooltips': True,
    'enable_context_help': True,
    'enable_progress_indicators': True,
    'enable_error_messages': True,
    'enable_success_feedback': True
}

# Security metrics configuration
SECURITY_CONFIG = {
    'enable_input_validation': True,
    'enable_output_sanitization': True,
    'enable_secure_data_handling': True,
    'enable_privacy_protection': True
}

# Performance improvements configuration
PERFORMANCE_IMPROVEMENTS_CONFIG = {
    'enable_caching': True,
    'enable_lazy_loading': True,
    'enable_background_processing': True,
    'enable_memory_optimization': True
}

# Data quality metrics configuration
DATA_QUALITY_CONFIG = {
    'enable_data_cleaning': True,
    'enable_outlier_detection': True,
    'enable_missing_data_handling': True,
    'enable_data_consistency_check': True
}

# Analysis improvements configuration
ANALYSIS_IMPROVEMENTS_CONFIG = {
    'enable_machine_learning': False,
    'enable_pattern_recognition': True,
    'enable_trend_analysis': True,
    'enable_predictive_analysis': False
}

# Advanced comparison metrics configuration
ADVANCED_COMPARISON_CONFIG = {
    'enable_multi_frame_analysis': True,
    'enable_temporal_analysis': True,
    'enable_spatial_analysis': True,
    'enable_kinematic_analysis': True
}

# Visualization improvements configuration
VISUALIZATION_IMPROVEMENTS_CONFIG = {
    'enable_3d_visualization': False,
    'enable_interactive_charts': True,
    'enable_custom_themes': True,
    'enable_animation_controls': True
}

# Personalization metrics configuration
PERSONALIZATION_CONFIG = {
    'enable_user_preferences': True,
    'enable_custom_metrics': True,
    'enable_personalized_recommendations': True,
    'enable_learning_from_feedback': True
}

# Collaboration improvements configuration
COLLABORATION_CONFIG = {
    'enable_data_sharing': False,
    'enable_team_analysis': False,
    'enable_comparison_sharing': False,
    'enable_feedback_system': True
}

# Maintenance metrics configuration
MAINTENANCE_CONFIG = {
    'enable_auto_updates': False,
    'enable_error_logging': True,
    'enable_performance_monitoring': True,
    'enable_system_health_checks': True
}

# Compatibility improvements configuration
COMPATIBILITY_CONFIG = {
    'enable_cross_platform_support': True,
    'enable_backward_compatibility': True,
    'enable_forward_compatibility': True,
    'enable_standard_compliance': True
}

# Development metrics configuration
DEVELOPMENT_CONFIG = {
    'enable_debug_mode': False,
    'enable_development_tools': False,
    'enable_testing_framework': True,
    'enable_code_quality_checks': True
}

# Deployment improvements configuration
DEPLOYMENT_CONFIG = {
    'enable_auto_deployment': False,
    'enable_environment_management': True,
    'enable_configuration_management': True,
    'enable_monitoring_integration': False
}

# Global quality metrics configuration
GLOBAL_QUALITY_CONFIG = {
    'enable_quality_assurance': True,
    'enable_continuous_improvement': True,
    'enable_quality_metrics_tracking': True,
    'enable_quality_reports': True
}
