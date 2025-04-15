/** @format */

export interface ProcessedData {
	id: string;
	url: string; // URL de la vidéo ou image
	exercise_id: string; // ID de l'exercice
	role: 'pro' | 'client' | 'ia'; // Origine: client = utilisateur, pro = référence, ia = généré
	frames: Frame[]; // Données de la vidéo (plusieurs frames) ou image (une seule frame)
}

export interface Frame {
	timestamp?: number; // Horodatage de la frame en ms
	persons: Person[]; // Personnes détectées dans la frame
}

export interface Person {
	step_position: 'shot_preparation' | 'shot_release' | 'shot_follow' | 'shot_holding'; // Phase du mouvement
	precision_global: number; // Précision globale par rapport à la référence (0-100)
	reference?: ProcessedData; // Données de référence (null si role=pro ou ia)
	keypoint: Keypoints; // Points-clés du corps
	angles: Angle[]; // Angles entre articulations
	feedback: string[]; // Retours d'amélioration textuels
	improvements: Improvement[]; // Suggestions d'améliorations précises
}

export interface Keypoints {
	// Points du visage
	nose: Point;
	left_eye: Point;
	right_eye: Point;
	left_ear: Point;
	right_ear: Point;

	// Membres supérieurs
	left_shoulder: Point;
	right_shoulder: Point;
	left_elbow: Point;
	right_elbow: Point;
	left_wrist: Point;
	right_wrist: Point;

	// Membres inférieurs
	left_hip: Point;
	right_hip: Point;
	left_knee: Point;
	right_knee: Point;
	left_ankle: Point;
	right_ankle: Point;
}

export interface Point {
	x: number; // -1 si non détecté
	y: number; // -1 si non détecté
	confidence?: number; // Score de confiance de la détection (0-1)
}

export interface Angle {
	start_point: Point; // Premier point définissant l'angle
	middle_point: Point; // Point au milieu/sommet de l'angle
	end_point: Point; // Dernier point définissant l'angle
	angle: number; // Valeur de l'angle en degrés
	name?: string; // Nom descriptif (ex: "coude_droit")
}

export interface Improvement {
	angle_index: number; // Index correspondant dans le tableau angles
	target_angle: number; // Angle cible à atteindre
	direction: 'increase' | 'decrease'; // Direction de correction
	magnitude: number; // Amplitude de la correction nécessaire
	priority: 'high' | 'medium' | 'low'; // Priorité de la correction
}
