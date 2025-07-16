/** @format */

// Interface pour les métriques de qualité de pose
export interface PoseQuality {
  balance: number;
  symmetry: number;
  stability: number;
}

// Interface pour la synthèse de l'analyse
export interface AnalysisSummary {
  summary: {
    total_frames_analyzed: number;
    average_technical_score: number;
    average_pose_quality: PoseQuality;
    total_improvements_suggested: number;
    improvement_breakdown: Record<string, number>; // ex: {"elbow_angle": 3, "knee_angle": 2}
  };
  performance_rating: string;
  recommendations: string[];
}

// Interface pour les métadonnées
export interface AnalysisMetadata {
  total_frames: number;
  phases_detected: string[];
  analysis_timestamp: number;
}

// Interface pour une analyse de frame
export interface FrameAnalysis {
  frame_index: number;
  phase: string;
  technical_score?: number;
  frame_feedback?: string;
  frame_recommendations?: string[];
  filtered_current_keypoints?: number[][];
  filtered_reference_keypoints?: number[][];
  comparison_result?: Record<string, any>;
  improvements?: Improvement[];
  pose_quality?: Record<string, number>;
  error?: string;
}

// Interface pour les données d'analyse
export interface AnalysisData {
  _id: string;
  success: boolean;
  video_id: string;
  analysis_summary: AnalysisSummary;
  global_feedback: string;
  frame_analysis: FrameAnalysis[];
  metadata: AnalysisMetadata;
  created_at: Date;
  updated_at: Date;
  error?: string;
}

export interface Improvement {
  angle_index: number; // Index correspondant dans le tableau angles
  target_angle: number; // Angle cible à atteindre
  direction: 'increase' | 'decrease'; // Direction de correction
  magnitude: number; // Amplitude de la correction nécessaire
  priority: 'high' | 'medium' | 'low'; // Priorité de la correction
  class_name?: string; // Nom de la classe d'amélioration
}

// Interface complète pour les données de processus
export interface ProcessedData {
  id?: string;
  _id: string;
  url?: string; // URL de la vidéo ou image
  exercise_id: {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    instructions: string;
    imageUrl: string;
    videoUrl: string;
    targetMuscles: string[];
    equipment: string[];
  };
  userId?: string;
  role?: 'pro' | 'client' | 'ia';
  media_type?: string;
  frames: Frame[];
  created_at: Date;
  updated_at: Date;
  analysis_id?: AnalysisData;
	is_reference: boolean;
}

export interface Frame {
  timestamp?: number; // Horodatage de la frame en ms
  persons: Person[]; // Personnes détectées dans la frame
  frame_number?: number;
  keypoints_positions?: Record<string, any>;
  angles?: Angle[];
  class_name?: string;
  feedback?: Record<string, any>;
  url_path_frame?: string;
}

export interface Person {
  step_position?:
    | 'shot_preparation'
    | 'shot_release'
    | 'shot_follow'
    | 'shot_holding'; // Phase du mouvement
  precision_global?: number; // Précision globale par rapport à la référence (0-100)
  reference?: any; // Données de référence (null si role=pro ou ia)
  keypoint?: Keypoints; // Points-clés du corps
  angles?: Angle[]; // Angles entre articulations
  feedback?: string[]; // Retours d'amélioration textuels
  improvements?: Improvement[]; // Suggestions d'améliorations précises
}

export interface Keypoints {
  // Points du visage
  nose?: Point;
  left_eye?: Point;
  right_eye?: Point;
  left_ear?: Point;
  right_ear?: Point;

  // Membres supérieurs
  left_shoulder?: Point;
  right_shoulder?: Point;
  left_elbow?: Point;
  right_elbow?: Point;
  left_wrist?: Point;
  right_wrist?: Point;

  // Membres inférieurs
  left_hip?: Point;
  right_hip?: Point;
  left_knee?: Point;
  right_knee?: Point;
  left_ankle?: Point;
  right_ankle?: Point;
}

export interface Point {
  x: number; // -1 si non détecté
  y: number; // -1 si non détecté
  confidence?: number; // Score de confiance de la détection (0-1)
}

export interface Angle {
  start_point?: Point; // Premier point définissant l'angle
  middle_point?: Point; // Point au milieu/sommet de l'angle
  end_point?: Point; // Dernier point définissant l'angle
  angle?: number; // Valeur de l'angle en degrés
  name?: string | [string, number]; // Nom descriptif (ex: "coude_droit") ou tuple [type, direction]
  angle_name?: [string, number]; // Tuple [type, direction]
}

export interface Improvement {
  angle_index: number; // Index correspondant dans le tableau angles
  target_angle: number; // Angle cible à atteindre
  direction: 'increase' | 'decrease'; // Direction de correction
  magnitude: number; // Amplitude de la correction nécessaire
  priority: 'high' | 'medium' | 'low'; // Priorité de la correction
}
