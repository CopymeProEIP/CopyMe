/** @format */

import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { logger } from '../config/logger';
import { ProcessedData } from '../models/ProcessedData';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Exercise } from '../models/Exercise';
import { AnalysisResult } from '../models/AnalysisResult';

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
		const limit = req.query.limit ? parseInt(req.query.limit?.toString()) : -1;
		const range = req.query.range?.toString() || 'all';
		const withReference = req.query.withReference || false;
		let query = { userId: req.user?.id, is_reference: withReference };

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

		console.log('Query for processed data:', query);

		let processedDataQuery = ProcessedData.find(query)
			.select('-__v -user_id -frames')
			.populate({ path: 'exercise_id', select: '-user_id -_id' })
			.populate({ path: 'analysis_id', select: '-user_id -_id -frame_analysis' });

		if (limit > 0) {
			processedDataQuery = processedDataQuery.limit(limit);
		}

		const processedData = await processedDataQuery;

		if (!processedData || processedData.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Aucune donnée traitée trouvée',
			});
		}

		return res.status(200).json({
			success: true,
			count: processedData.length,
			data: processedData,
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
		const processedDataId = req.params.id;

		const processedData = await ProcessedData.findById(processedDataId)
			.select('-__v')
			.populate({ path: 'exercise_id', select: '-user_id -_id' })
			.populate({ path: 'analysis_id', select: '-__v -createdAt -updatedAt' });

		if (!processedData) {
			return res.status(404).json({
				success: false,
				message: 'Processed data non trouvée',
			});
		}

		return res.status(200).json({
			success: true,
			data: processedData,
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

		const fileBuffer = fs.readFileSync(req.file.path);

		const formData = new FormData();

		formData.append('userId', req.user?.id || '');

		const blob = new Blob([fileBuffer], { type: req.file!.mimetype });
		formData.append('files', blob, req.file!.originalname);
		formData.append('original_path', req.file.path);

		// Ajouter l'URL pour accéder au fichier
		const fileName = path.basename(req.file.path);
		const fileUrl = `/uploads/${fileName}`;
		console.log('File URL to be used:', fileUrl);
		formData.append('url', fileUrl);

		formData.append('exercise_id', exercise_id);
		formData.append('fileType', fileType);

		const response = await fetch(`${process.env.AI_API_URL}/process`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.AI_API_KEY}`,
			},
			body: formData,
		});

		if (!response.ok) {
			logger.error("Erreur lors de l'envoi des données traitées à l'API AI:", response.statusText);
			return res.status(response.status).json({
				success: false,
				message: "Erreur lors de l'envoi des données traitées à l'API AI",
				error: await response.text(),
			});
		}

		const data = await response.json();

		return res.status(201).json({
			success: true,
			data,
			_id: data._id,
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

export const analyzeProcessedData = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { video_id, reference_id, email } = req.body;
		console.log('Analyse des données traitées:', video_id, reference_id, email);
		const response = await fetch(`${process.env.AI_API_URL}/analyze`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.AI_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				video_id: video_id,
				reference_id: reference_id,
			}),
		});
		const data = await response.json();

		if (!data || !data.analysis_id) {
			logger.error('Analyse des données traitées échouée, réponse invalide:', data);
			return res.status(400).json({
				success: false,
				message: 'Analyse des données traitées échouée, réponse invalide',
			});
		}

		await ProcessedData.updateOne(
			{ _id: video_id },
			{
				$set: {
					analysis_id: data.analysis_id,
				},
			},
		);

		if (!response.ok) {
			logger.error("Erreur lors de l'analyse des données traitées:", data);
			return res.status(response.status).json({
				success: false,
				message: "Erreur lors de l'analyse des données traitées",
				error: data,
			});
		}

		return res.status(201).json({
			success: true,
			data: data,
		});
	} catch (error) {
		logger.error("Erreur lors de l'analyse des données traitées:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de l'analyse des données traitées",
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		});
	}
};

export const getAnalysisResultByVideoId = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { video_id } = req.params;
		const analysis = await AnalysisResult.findOne({ video_id });
		if (!analysis) {
			return res.status(404).json({
				success: false,
				message: "Aucun résultat d'analyse trouvé pour cette vidéo",
			});
		}
		return res.status(200).json({
			success: true,
			data: analysis,
		});
	} catch (error) {
		logger.error("Erreur lors de la récupération du résultat d'analyse:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération du résultat d'analyse",
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		});
	}
};
