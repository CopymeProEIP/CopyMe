import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import exerciseRoutes from './routes/exercise.routes';
import imageRoutes from './routes/image.routes';

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/data/images', imageRoutes);

// Route de test
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Gestion des routes non trouvées
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} non trouvée`
  });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer(); 