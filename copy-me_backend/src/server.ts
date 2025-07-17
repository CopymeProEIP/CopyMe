/** @format */
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import exerciseRoutes from './routes/exercise.routes';
import processedDataRoutes from './routes/processedData.routes';
import { logger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI as string;

// Middleware
app.use(
	cors({
		origin: 'http://localhost:3000', // Origine spécifique au lieu de '*'
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
		exposedHeaders: ['Content-Length', 'X-Requested-With', 'Authorization'],
		credentials: true, // Autoriser l'envoi de cookies
	}),
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(logger);
// Middleware pour servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/process', processedDataRoutes);
app.use(errorHandler);

const startServer = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('✅ MongoDB connecté');

		app.listen(PORT, () => {
			console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('❌ Erreur de connexion MongoDB:', error);
		process.exit(1);
	}
};

startServer();
