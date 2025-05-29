import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export function authorizeRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Accès interdit : rôle insuffisant' });
      return;
    }
    next();
  };
}
