/** @format */

import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { logger } from '../config/logger';
import { ProcessedData } from '../models/ProcessedData';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Exercise } from '../models/Exercise';

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, '../../uploads');

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `media-${uniqueSuffix}${ext}`);
	},
});

// Filtrer les fichiers pour accepter les images et vidéos
const fileFilter = (
	req: AuthenticatedRequest,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	// Accepter les images et vidéos
	if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
		// Vérifier la durée de la vidéo côté client à travers les en-têtes personnalisés
		if (file.mimetype.startsWith('video/') && req.headers['x-video-duration']) {
			const duration = parseInt(req.headers['x-video-duration'] as string);
			if (duration > 30) {
				return cb(new Error('La vidéo ne doit pas dépasser 30 secondes'));
			}
		}
		cb(null, true);
	} else {
		cb(new Error('Seules les images et vidéos sont autorisées'));
	}
};

// Initialiser l'upload
export const upload = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 }, // Augmente la limite à 50 MB pour les vidéos
	fileFilter,
});

export const getAllProcessedData = async (req: AuthenticatedRequest, res: Response) => {
	try {
<<<<<<< HEAD
		const limit = req.query.limit ? parseInt(req.query.limit?.toString()) : -1;
		const range = req.query.range?.toString() || 'all';
=======
		const limit = req.body.limit || -1;
		const range = req.body.range || 'all';
>>>>>>> cb47a819621a284695bb4004b1d0916bc91bb793
		let query = { user_id: req.user?.id };

		if (range !== 'all') {
			const now = new Date();
			let dateFilter;

			switch (range) {
				case '3months':
					const threeMonthsAgo = new Date(now);
					threeMonthsAgo.setMonth(now.getMonth() - 3);
					dateFilter = { createdAt: { $gte: threeMonthsAgo } };
					break;
				case '1month':
					const oneMonthAgo = new Date(now);
					oneMonthAgo.setMonth(now.getMonth() - 1);
					dateFilter = { createdAt: { $gte: oneMonthAgo } };
					break;
				case '1week':
					const oneWeekAgo = new Date(now);
					oneWeekAgo.setDate(now.getDate() - 7);
					dateFilter = { createdAt: { $gte: oneWeekAgo } };
					break;
				default:
					if (range.match(/^\d{4}-\d{2}-\d{2}$/)) {
						const specificDate = new Date(range);
						const nextDay = new Date(specificDate);
						nextDay.setDate(specificDate.getDate() + 1);

						dateFilter = {
							createdAt: {
								$gte: specificDate,
								$lt: nextDay,
							},
						};
					}
			}

			if (dateFilter) {
				query = { ...query, ...dateFilter };
			}
		}

<<<<<<< HEAD
		const processedData = await ProcessedData.find(query)
			.limit(limit)
			.select('-__v -user_id')
			.populate({ path: 'exercise_id', select: '-user_id -_id' });

		const transformedData = processedData.map((item) => {
			const itemObj = item.toObject() as any;
			itemObj.exercise = itemObj.exercise_id;
			delete itemObj.exercise_id;
			return itemObj;
		});

		return res.status(200).json({
			success: true,
			count: transformedData.length,
			data: transformedData,
=======
		const processedData = await ProcessedData.find(query).limit(limit);

		return res.status(200).json({
			success: true,
			count: processedData.length,
			data: processedData,
>>>>>>> cb47a819621a284695bb4004b1d0916bc91bb793
		});
	} catch (error) {
		logger.error('Erreur lors de la récupération des processed data:', error);
		return res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des processed data',
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		});
	}
};

export const getProcessedDataById = async (req: AuthenticatedRequest, res: Response) => {
	try {
<<<<<<< HEAD
		const processedData = await ProcessedData.findById(req.params.id)
			.select('-__v -user_id')
			.populate({ path: 'exercise_id', select: '-user_id -_id' });
=======
		const processedData = await ProcessedData.findById(req.params.id);
>>>>>>> cb47a819621a284695bb4004b1d0916bc91bb793

		if (!processedData) {
			return res.status(404).json({
				success: false,
				message: 'Processed data non trouvée',
			});
		}

		if (
			req.user?.role !== 'admin' &&
			processedData.user_id.toString() !== req.user?.id.toString()
		) {
			return res.status(403).json({
				success: false,
				message: 'Non autorisé à accéder à cette processed data',
			});
		}

<<<<<<< HEAD
		const itemObj = processedData.toObject() as any;
		itemObj.exercise = itemObj.exercise_id;
		delete itemObj.exercise_id;
		const transformedData = itemObj;

		console.log('Transformed Data:', transformedData);

		return res.status(200).json({
			success: true,
			data: transformedData,
=======
		return res.status(200).json({
			success: true,
			data: processedData,
>>>>>>> cb47a819621a284695bb4004b1d0916bc91bb793
		});
	} catch (error) {
		logger.error('Erreur lors de la récupération de la processed data:', error);
		return res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération de la processed data',
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		});
	}
};

export const uploadProcessedData = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'Veuillez télécharger un fichier (image ou vidéo)',
			});
		}

		const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
		const exercise_id = req.body.exercise_id;
		if (!exercise_id) {
			return res.status(400).json({
				success: false,
				message: "L'ID de l'exercice est requis",
			});
		}
		const validExerciseId = await Exercise.findById(exercise_id);
		if (!validExerciseId) {
			return res.status(400).json({
				success: false,
				message: "L'ID de l'exercice n'est pas valide",
			});
		}
		const processedData = await ProcessedData.create({
			url: req.file.path,
			exercise_id: exercise_id,
			user_id: req.user?.id,
			role: 'client',
			media_type: fileType,
			frames: [],
		});

		const fileBuffer = fs.readFileSync(req.file.path);

		const formData = new FormData();

		formData.append('userId', req.user?.id || '');

		const blob = new Blob([fileBuffer], { type: req.file!.mimetype });
		formData.append('files', blob, req.file!.originalname);

		formData.append('processedDataId', processedData.id);
		formData.append('exerciseId', exercise_id);
		formData.append('fileType', fileType);

		await fetch(`${process.env.AI_API_URL}/process`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.AI_API_KEY}`,
			},
			body: formData,
		});

		return res.status(201).json({
			success: true,
			data: processedData,
		});
	} catch (error) {
		logger.error('Erreur lors du téléchargement du média:', error);
		return res.status(500).json({
			success: false,
			message: 'Erreur lors du téléchargement du média',
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		});
	}
};
