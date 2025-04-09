import { Router } from 'express';
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
} from '../controllers/exercise.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes exercices
router.route('/')
  .get(getAllExercises)
  .post(restrictTo('admin'), createExercise);

router.route('/:id')
  .get(getExerciseById)
  .put(restrictTo('admin'), updateExercise)
  .delete(restrictTo('admin'), deleteExercise);

export default router; 