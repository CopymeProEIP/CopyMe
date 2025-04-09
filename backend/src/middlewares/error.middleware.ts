import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Journaliser l'erreur
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Erreurs de développement : envoi de la pile complète
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  
  // Erreurs de production : ne pas exposer les détails
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Erreurs non opérationnelles : ne pas les exposer au client
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur s\'est produite. Veuillez réessayer plus tard.'
  });
}; 