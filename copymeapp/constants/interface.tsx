/** @format */

export interface Exercise {
  id: string;
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  completed?: number;
  instructions: string;
  imageUrl?: string;
  videoUrl?: string;
  targetMuscles: string[];
  equipment?: string[];
}