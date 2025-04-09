import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import User, { IUser } from '../models/User';

interface TokenPayload {
  id: string;
  role: string;
}

// Étend l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifier l'existence du token
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Non autorisé, aucun token fourni' });
    }
    
    // Vérifier la validité du token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Non autorisé, token invalide' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Vous n\'avez pas la permission d\'effectuer cette action' });
    }
    
    next();
  };
}; 