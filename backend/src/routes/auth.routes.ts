import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Routes d'authentification
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

export default router; 