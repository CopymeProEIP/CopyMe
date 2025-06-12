import { Keypoints, ProcessedData } from "./processedData";

const mockProcessedData: ProcessedData = {
	id: '123456',
	url: 'https://example.com/videos/shot_analysis.mp4',
	exercise: {
		id: 'exercise_1',
		name: 'Basketball Shot',
		description: 'Analyzing the shooting technique in basketball.',
	},
	role: 'client',
	created_at: Date.now(),
	alignement_score: 85, // Score d'alignement (0-100)
	precision_score: 90, // Score de précision (0-100)
	frames: [
		{
			timestamp: 1200, // 1.2 secondes
			persons: [
				{
					step_position: 'shot_preparation',
					precision_global: 78,
					keypoint: {
						nose: { x: 320, y: 240, confidence: 0.92 },
						left_eye: { x: 310, y: 235, confidence: 0.91 },
						right_eye: { x: 330, y: 235, confidence: 0.91 },
						left_ear: { x: 300, y: 240, confidence: 0.85 },
						right_ear: { x: 340, y: 240, confidence: 0.87 },
						left_shoulder: { x: 300, y: 280, confidence: 0.95 },
						right_shoulder: { x: 340, y: 280, confidence: 0.96 },
						left_elbow: { x: 280, y: 320, confidence: 0.92 },
						right_elbow: { x: 360, y: 320, confidence: 0.93 },
						left_wrist: { x: 290, y: 350, confidence: 0.89 },
						right_wrist: { x: 350, y: 350, confidence: 0.91 },
						left_hip: { x: 310, y: 380, confidence: 0.88 },
						right_hip: { x: 330, y: 380, confidence: 0.89 },
						left_knee: { x: 310, y: 450, confidence: 0.87 },
						right_knee: { x: 330, y: 450, confidence: 0.88 },
						left_ankle: { x: 310, y: 510, confidence: 0.85 },
						right_ankle: { x: 330, y: 510, confidence: 0.86 },
					},
					angles: [
						{
							name: 'right_elbow',
							start_point: { x: 340, y: 280 }, // épaule droite
							middle_point: { x: 360, y: 320 }, // coude droit
							end_point: { x: 350, y: 350 }, // poignet droit
							angle: 110,
						},
						{
							name: 'left_elbow',
							start_point: { x: 300, y: 280 }, // épaule gauche
							middle_point: { x: 280, y: 320 }, // coude gauche
							end_point: { x: 290, y: 350 }, // poignet gauche
							angle: 120,
						},
						{
							name: 'right_knee',
							start_point: { x: 330, y: 380 }, // hanche droite
							middle_point: { x: 330, y: 450 }, // genou droit
							end_point: { x: 330, y: 510 }, // cheville droite
							angle: 175,
						},
					],
					feedback: [
						'Your elbow angle is too wide',
						'Keep your elbow closer to your body',
						'Maintain vertical alignment',
					],
					improvements: [
						{
							angle_index: 0, // coude droit
							target_angle: 90,
							direction: 'decrease',
							magnitude: 20,
							priority: 'high',
						},
						{
							angle_index: 1, // coude gauche
							target_angle: 100,
							direction: 'decrease',
							magnitude: 20,
							priority: 'medium',
						},
					],
				},
			],
		},
		{
			timestamp: 1800, // 1.8 secondes
			persons: [
				{
					step_position: 'shot_release',
					precision_global: 85,
					keypoint: {
						// ... données similaires mais avec position différente
						nose: { x: 320, y: 230, confidence: 0.94 },
						// ... autres keypoints similaires
						right_shoulder: { x: 340, y: 270, confidence: 0.97 },
						right_elbow: { x: 355, y: 290, confidence: 0.95 },
						right_wrist: { x: 365, y: 320, confidence: 0.94 },
						// ... autres keypoints
					} as Keypoints, // type assertion pour éviter d'écrire tous les points
					angles: [
						{
							name: 'right_elbow',
							start_point: { x: 340, y: 270 },
							middle_point: { x: 355, y: 290 },
							end_point: { x: 365, y: 320 },
							angle: 165,
						},
						// ... autres angles
					],
					feedback: ['Good extension at release', 'Follow through could be more pronounced'],
					improvements: [
						{
							angle_index: 0,
							target_angle: 175,
							direction: 'increase',
							magnitude: 10,
							priority: 'low',
						},
					],
				},
			],
		},
	],
};

export const mockupProcessedData = mockProcessedData;