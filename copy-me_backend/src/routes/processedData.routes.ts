/** @format */

import { Router } from 'express';
import {
	getAllProcessedData,
	getProcessedDataById,
	uploadProcessedData,
	upload,
	analyzeProcessedData,
} from '../controllers/processedData.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
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

export default router;
