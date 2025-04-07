/**
 * Generic structure for API responses.
 * @template T - The type of the response data.
 */
export interface RequestResponse<T = any> {
  status: RequestStatus;
  message: string;
  data: T;
}

/**
 * Enum for HTTP status codes.
 */
export enum RequestStatus {
  SUCCESS = 200,
  ERROR = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

/**
 * Represents an exercise.
 */
export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category?: string;
}

/**
 * Feedback for a specific exercise.
 */
export interface Feedback {
  id: string;
  exo_id: string;
  name: string;
  accuracy: number;
  feedback: string;
  timestamp?: string;
}

/**
 * Tips for improving exercise performance.
 */
export interface Tips {
  id: string;
  exo_id: string;
  name: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Analytics data for a user.
 */
export interface Analytics {
  id: string;
  user_id: string;
  feedback: Feedback[];
  tips: Tips[];
  sessionCount?: number;
  lastUpdated?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  analytics?: Analytics;
}

/**
 * Supported user roles in the system.
 */
export type Role = 'pro' | 'client' | 'ia';

/**
 * Exercise difficulty levels.
 */
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Possible step positions in a shooting motion.
 */
export type StepPosition = 'shot_follow' | 'shot_preparation' | 'shot_release' | 'shot_holding';

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Keypoint representing body parts coordinates.
 */
export interface Keypoint {
  ankle?: Point;
  knee?: Point;
  hip?: Point;
  shoulder?: Point;
  elbow?: Point;
  wrist?: Point;
  [key: string]: Point | undefined;
}

/**
 * Angle calculation between three points.
 */
export interface Angle {
  start_point: [number, number];
  end_point: [number, number];
  third_point: [number, number];
  angle: number;
}

/**
 * Person detected in a frame with pose estimation.
 */
export interface Person {
  step_position: StepPosition;
  keypoint: Keypoint;
  angles: Angle[];
  feedback: string[];
}

/**
 * Frame data from processed video.
 */
export interface Frame {
  persons: Person[];
  timestamp?: number;
}

/**
 * Processed image/video analysis data.
 */
export interface ProcessedImage {
  id: string;
  url: string;
  role: Role;
  exercise: string;
  frames: Frame[];
}

/**
 * Client/User profile.
 */
export interface Client {
  id: string;
  nom: string;
  email: string;
  role: Role;
  date_creation: number; // timestamp
}

/**
 * Enhanced exercise definition.
 */
export interface EnhancedExercise {
  id: string;
  title: string;
  level: ExerciseLevel;
  description: string;
  completed: number;
  thumbnail_url?: string;
  video_url?: string;
  created_at?: number;
  updated_at?: number;
}
