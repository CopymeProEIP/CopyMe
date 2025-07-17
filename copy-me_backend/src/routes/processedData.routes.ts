/** @format */

import { Router } from 'express';
import {
	getAllProcessedData,
	getProcessedDataById,
	uploadProcessedData,
	upload,
	analyzeProcessedData,
	getAnalysisResultByVideoId,
} from '../controllers/processedData.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import path from 'path';
import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
const pipeline = promisify(stream.pipeline);
const router = Router();

// Routes processed data - Ajout du middleware d'authentification
router
	.route('/')
	.get(authenticateToken, (req, res) => {
		getAllProcessedData(req, res);
	})
	.post(authenticateToken, upload.single('media'), (req, res) => {
		uploadProcessedData(req, res);
	});

router.route('/analyze').post(authenticateToken, (req, res) => {
	analyzeProcessedData(req, res);
});

router.route('/:id').get(authenticateToken, (req, res) => {
	getProcessedDataById(req, res);
});

// Nouvelle route pour obtenir la vidéo d'un processedData par son ID
router.route('/:id/video').get(authenticateToken, async (req, res) => {
	try {
		const processedData = await import('../models/ProcessedData').then((m) => m.ProcessedData);
		const data = await processedData.findById(req.params.id);

		if (!data) {
			return res.status(404).json({
				success: false,
				message: 'Processed data non trouvée',
			});
		}

		// Si l'API a retourné une URL, on récupère et on renvoie directement le fichier
		if (data.url) {
			// Vérifier si l'URL est relative ou absolue
			if (data.url.startsWith('/') || !data.url.startsWith('http')) {
				// URL relative, on renvoie directement le fichier
				try {
					// Assurer que le chemin commence par '/'
					const urlPath = data.url.startsWith('/') ? data.url : `/${data.url}`;
					const filePath = path.join(__dirname, '../..', urlPath);

					console.log("Tentative d'accès au fichier:", filePath);

					// Vérifier que le fichier existe
					if (fs.existsSync(filePath)) {
						// Définir le type de contenu pour les vidéos
						const fileName = path.basename(filePath);
						const fileExtension = path.extname(fileName).toLowerCase();

						// Définir le type MIME approprié
						let contentType = 'application/octet-stream'; // Par défaut
						if (fileExtension === '.mp4') {
							contentType = 'video/mp4';
						} else if (fileExtension === '.mov') {
							contentType = 'video/quicktime';
						} else if (fileExtension === '.avi') {
							contentType = 'video/x-msvideo';
						}

						console.log('Fichier trouvé, envoi complet avec type MIME:', contentType);

						// Toujours envoyer le fichier complet sans streaming
						res.setHeader('Content-Type', contentType);
						res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
						res.setHeader('X-Content-Type-Options', 'nosniff');
						res.setHeader('Accept-Ranges', 'none'); // Désactiver les requêtes partielles
						res.setHeader('Cache-Control', 'no-store'); // Empêcher la mise en cache

						// Lire tout le fichier en mémoire et l'envoyer d'un coup
						const fileData = fs.readFileSync(filePath);
						return res.send(fileData);
					} else {
						// Essayons de trouver le fichier dans le répertoire uploads
						const uploadsPath = path.join(__dirname, '../../uploads', path.basename(data.url));
						console.log('Fichier non trouvé, tentative avec:', uploadsPath);

						if (fs.existsSync(uploadsPath)) {
							const fileName = path.basename(uploadsPath);
							const fileExtension = path.extname(fileName).toLowerCase();

							let contentType = 'application/octet-stream';
							if (fileExtension === '.mp4') {
								contentType = 'video/mp4';
							} else if (fileExtension === '.mov') {
								contentType = 'video/quicktime';
							} else if (fileExtension === '.avi') {
								contentType = 'video/x-msvideo';
							}

							console.log(
								'Fichier trouvé dans uploads, envoi complet avec type MIME:',
								contentType,
							);

							// Toujours envoyer le fichier complet sans streaming
							res.setHeader('Content-Type', contentType);
							res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
							res.setHeader('X-Content-Type-Options', 'nosniff');
							res.setHeader('Accept-Ranges', 'none'); // Désactiver les requêtes partielles
							res.setHeader('Cache-Control', 'no-store'); // Empêcher la mise en cache

							// Lire tout le fichier en mémoire et l'envoyer d'un coup
							const fileData = fs.readFileSync(uploadsPath);
							return res.send(fileData);
						}

						console.log('Fichier introuvable:', data.url);
					}
				} catch (error) {
					console.error("Erreur lors de l'accès au fichier:", error);
				}
			} else {
				// URL absolue - on télécharge le fichier et on le renvoie
				try {
					console.log("Récupération de l'URL absolue:", data.url);
					const response = await fetch(data.url);
					if (response.ok) {
						const contentType = response.headers.get('Content-Type') || 'video/mp4';

						// Configurer les en-têtes pour un téléchargement complet
						res.setHeader('Content-Type', contentType);
						res.setHeader('Content-Disposition', 'inline');
						res.setHeader('X-Content-Type-Options', 'nosniff');
						res.setHeader('Accept-Ranges', 'none'); // Désactiver les requêtes partielles
						res.setHeader('Cache-Control', 'no-store'); // Empêcher la mise en cache

						// Télécharger le fichier complet en une seule fois
						const buffer = await response.arrayBuffer();
						console.log('Fichier distant téléchargé, taille:', buffer.byteLength);

						// Envoyer tout le contenu en une fois
						res.write(Buffer.from(buffer));
						return res.end();
					}
				} catch (error) {
					console.error('Erreur lors de la récupération du fichier distant:', error);
				}
			}
		}

		return res.status(404).json({
			success: false,
			message: 'Fichier vidéo non trouvé',
		});
	} catch (error) {
		console.error('Erreur lors de la récupération de la vidéo:', error);
		return res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération de la vidéo',
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		});
	}
});

export default router;
