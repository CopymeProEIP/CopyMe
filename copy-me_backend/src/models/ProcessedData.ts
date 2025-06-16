/** @format */

import mongoose, { model, Schema } from 'mongoose';
import Joi from 'joi';

interface ProcessedData {
	id: string;
	url: string;
	exercise_id: mongoose.Types.ObjectId;
	user_id: mongoose.Types.ObjectId;
	role: 'pro' | 'client' | 'ia';
	media_type: 'image' | 'video';
	frames: Frame[];
}

interface Frame {
	timestamp?: number;
	persons: Person[];
}

interface Person {
	step_position: 'shot_preparation' | 'shot_release' | 'shot_follow' | 'shot_holding';
	precision_global: number;
	reference?: ProcessedData;
	keypoint: Keypoints;
}

interface Keypoints {
	nose: Point;
	left_eye: Point;
	right_eye: Point;
	left_ear: Point;
	right_ear: Point;
	left_shoulder: Point;
	right_shoulder: Point;
	left_elbow: Point;
	right_elbow: Point;
	left_wrist: Point;
	right_wrist: Point;
	left_hip: Point;
	right_hip: Point;
	left_knee: Point;
	right_knee: Point;
	left_ankle: Point;
	right_ankle: Point;
}

interface Point {
	x: number;
	y: number;
	confidence?: number;
}

interface Angle {
	start_point: Point;
	middle_point: Point;
	end_point: Point;
	angle: number;
	name?: string;
}

interface Improvement {
	angle_index: number;
	target_angle: number;
	direction: 'increase' | 'decrease';
	magnitude: number;
	priority: 'high' | 'medium' | 'low';
}

const ProcessedDataSchema = new Schema<ProcessedData>(
	{
		url: { type: String, required: true },
		exercise_id: { type: 'ObjectId', ref: 'Exercise', required: true },
		user_id: { type: 'ObjectId', ref: 'Users', required: true },
		role: { type: String, enum: ['pro', 'client', 'ia'], required: true },
		media_type: { type: String, enum: ['image', 'video'], required: true, default: 'image' },
		frames: [
			{
				timestamp: { type: Number },
				persons: [
					{
						step_position: {
							type: String,
							enum: ['shot_preparation', 'shot_release', 'shot_follow', 'shot_holding'],
							required: true,
						},
						precision_global: { type: Number, required: true },
						reference: { type: 'ObjectId', ref: 'ProcessedData' },
						keypoint: {
							nose: { x: Number, y: Number, confidence: Number },
							left_eye: { x: Number, y: Number, confidence: Number },
							right_eye: { x: Number, y: Number, confidence: Number },
							left_ear: { x: Number, y: Number, confidence: Number },
							right_ear: { x: Number, y: Number, confidence: Number },
							left_shoulder: { x: Number, y: Number, confidence: Number },
							right_shoulder: { x: Number, y: Number, confidence: Number },
							left_elbow: { x: Number, y: Number, confidence: Number },
							right_elbow: { x: Number, y: Number, confidence: Number },
							left_wrist: { x: Number, y: Number, confidence: Number },
							right_wrist: { x: Number, y: Number, confidence: Number },
							left_hip: { x: Number, y: Number, confidence: Number },
							right_hip: { x: Number, y: Number, confidence: Number },
							left_knee: { x: Number, y: Number, confidence: Number },
							right_knee: { x: Number, y: Number, confidence: Number },
							left_ankle: { x: Number, y: Number, confidence: Number },
							right_ankle: { x: Number, y: Number, confidence: Number },
						},
					},
				],
			},
		],
	},
	{
		timestamps: true,
	},
);

export const ProcessedData = model<ProcessedData>(
	'ProcessedData',
	ProcessedDataSchema,
	'processed_data',
);
