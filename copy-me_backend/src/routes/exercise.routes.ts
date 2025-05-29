import { Router } from 'express';
import { insertExercise, getExercise, listExercises, modifyExercise, removeExercise } from '../controllers/exercise.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Routes publiques (accessibles à tous les utilisateurs authentifiés)
router.get('/', authenticateToken, listExercises);
router.get('/:id', authenticateToken, getExercise);

// Routes protégées (accessibles uniquement aux administrateurs)
router.post('/', authenticateToken, authorizeRoles('admin'), insertExercise);
router.put('/:id', authenticateToken, authorizeRoles('admin'), modifyExercise);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), removeExercise);

export default router; 