import { Schema, model } from 'mongoose';
import Joi from 'joi';

export const ValidateExercise = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    difficulty: Joi.string().required(),
    instructions: Joi.string().required(),
    imageUrl: Joi.string().optional(),
    videoUrl: Joi.string().optional(),
    targetMuscles: Joi.array().items(Joi.string()).required(),
    equipment: Joi.array().items(Joi.string()).optional(),
});

interface IExercises {
    name: string;
    description?: string;
    category: string;
    difficulty: 'débutant' | 'intermédiaire' | 'avancé';
    instructions: string;
    imageUrl?: string;
    videoUrl?: string;
    targetMuscles: string[];
    equipment?: string[];
}

const exerciseSchema = new Schema<IExercises>({
    name: { 
      type: String,
      required: true 
    },
    description: { 
      type: String,
      required: true 
    },
    category: { 
      type: String,
      required: true
    },
    difficulty: { 
      type: String,
      required: true
    },
    instructions: { 
      type: String,
      required: true 
    },
    imageUrl: { 
      type: String,
      required: false 
    },
    videoUrl: { 
      type: String,
      required: false 
    },
    targetMuscles: { 
      type: [String],
      required: true 
    },
    equipment: { 
      type: [String],
      required: false 
    }
}, { timestamps: true });

export const Exercise = model<IExercises>('Exercise', exerciseSchema);