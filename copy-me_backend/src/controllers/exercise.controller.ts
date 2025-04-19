import { Request, Response } from 'express';
import { ValidateExercise } from '../models/Exercise';
import { createExercise, getExerciseById, getAllExercises, updateExercise, deleteExercise } from '../services/excercices';

export const insertExercise = async (req: Request, res: Response) => {
  const data = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    difficulty: req.body.difficulty,
    instructions: req.body.instructions,
    imageUrl: req.body.imageUrl,
    videoUrl: req.body.videoUrl,
    targetMuscles: req.body.targetMuscles,
    equipment: req.body.equipment
  }

  const { error, value } = ValidateExercise.validate(data);
  if (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  } else {
    const serviceResponse = await createExercise(value);
    res.status(201).json(serviceResponse);
  }
}

export const getExercise = async (req: Request, res: Response) => {
  const id = req.params.id;
  const serviceResponse = await getExerciseById(id);
  
  if (serviceResponse.status === 'error') {
    res.status(404).json(serviceResponse);
  } else {
    res.status(200).json(serviceResponse);
  }
}

export const listExercises = async (req: Request, res: Response) => {
  const serviceResponse = await getAllExercises();
  
  if (serviceResponse.status === 'error') {
    res.status(500).json(serviceResponse);
  } else {
    res.status(200).json(serviceResponse);
  }
}

export const modifyExercise = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    difficulty: req.body.difficulty,
    instructions: req.body.instructions,
    imageUrl: req.body.imageUrl,
    videoUrl: req.body.videoUrl,
    targetMuscles: req.body.targetMuscles,
    equipment: req.body.equipment
  }

  const serviceResponse = await updateExercise(id, data);
  
  if (serviceResponse.status === 'error') {
    res.status(400).json(serviceResponse);
  } else {
    res.status(200).json(serviceResponse);
  }
}

export const removeExercise = async (req: Request, res: Response) => {
  const id = req.params.id;
  const serviceResponse = await deleteExercise(id);
  
  if (serviceResponse.status === 'error') {
    res.status(500).json(serviceResponse);
  } else {
    res.status(200).json(serviceResponse);
  }
}


