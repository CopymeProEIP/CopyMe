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
