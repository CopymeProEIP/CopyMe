import { Request, Response } from 'express';
import Exercise, { IExercise } from '../models/Exercise';

// Récupérer tous les exercices
export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find();
    
    return res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des exercices',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Récupérer un exercice par son ID
export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercice non trouvé'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'exercice',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Créer un nouvel exercice
export const createExercise = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      instructions,
      imageUrl,
      videoUrl,
      targetMuscles,
      equipment
    } = req.body;
    
    // Vérifier si un exercice avec ce nom existe déjà
    const existingExercise = await Exercise.findOne({ name });
    if (existingExercise) {
      return res.status(400).json({
        success: false,
        message: 'Un exercice avec ce nom existe déjà'
      });
    }
    
    // Créer l'exercice
    const exercise = await Exercise.create({
      name,
      description,
      category,
      difficulty,
      instructions,
      imageUrl,
      videoUrl,
      targetMuscles,
      equipment
    });
    
    return res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'exercice',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Mettre à jour un exercice
export const updateExercise = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      instructions,
      imageUrl,
      videoUrl,
      targetMuscles,
      equipment
    } = req.body;
    
    // Vérifier si l'exercice existe
    let exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercice non trouvé'
      });
    }
    
    // Vérifier si le nom existe déjà pour un autre exercice
    if (name && name !== exercise.name) {
      const existingExercise = await Exercise.findOne({ name });
      if (existingExercise && existingExercise._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Un exercice avec ce nom existe déjà'
        });
      }
    }
    
    // Mettre à jour l'exercice
    exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        difficulty,
        instructions,
        imageUrl,
        videoUrl,
        targetMuscles,
        equipment
      },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'exercice',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Supprimer un exercice
export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercice non trouvé'
      });
    }
    
    await Exercise.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: 'Exercice supprimé avec succès'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'exercice',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}; 