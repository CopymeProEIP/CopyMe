import { Router, Response } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
const router = Router();

// ✅ Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/profil', authenticateToken, getProfile);

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ message: `Tu es bien connecté ✅ (ID: ${req.user?.id})` });
});

router.get('/admin', authenticateToken, authorizeRoles('admin'), (req: AuthenticatedRequest, res: Response): void => {
  res.json({ message: `Bienvenue admin 👑 (ID: ${req.user?.id})` });
});

export default router;
