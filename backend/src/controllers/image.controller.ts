import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Image, { IImage } from '../models/Image';
import { logger } from '../config/logger';

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

// Filtrer les fichiers pour n'accepter que les images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

// Initialiser l'upload
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 MB
  fileFilter
});

// Récupérer toutes les images
export const getAllImages = async (req: Request, res: Response) => {
  try {
    // Si l'utilisateur est un admin, il peut voir toutes les images
    // Sinon, il ne voit que ses propres images
    const images = req.user?.role === 'admin'
      ? await Image.find()
      : await Image.find({ userId: req.user?._id });
    
    return res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des images:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des images',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Récupérer une image par son ID
export const getImageById = async (req: Request, res: Response) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image non trouvée'
      });
    }
    
    // Vérifier les permissions
    if (req.user?.role !== 'admin' && image.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à cette image'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'image:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'image',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Télécharger une nouvelle image
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez télécharger une image'
      });
    }
    
    // Créer l'entrée dans la base de données
    const image = await Image.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.user?._id,
      metadata: {
        processingStatus: 'pending'
      }
    });
    
    // Ici, vous pourriez ajouter une logique pour traiter l'image
    // Par exemple, redimensionner, ajouter des filtres, etc.
    
    // Simuler un traitement asynchrone (dans un environnement réel, cela pourrait être un job en arrière-plan)
    setTimeout(async () => {
      try {
        // Mettre à jour le statut du traitement
        await Image.findByIdAndUpdate(image._id, {
          'metadata.processingStatus': 'processed'
        });
        
        logger.info(`Image ${image._id} traitée avec succès`);
      } catch (error) {
        logger.error(`Erreur lors du traitement de l'image ${image._id}:`, error);
        await Image.findByIdAndUpdate(image._id, {
          'metadata.processingStatus': 'failed',
          'metadata.processingDetails': 'Erreur lors du traitement de l\'image'
        });
      }
    }, 2000);
    
    return res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    logger.error('Erreur lors du téléchargement de l\'image:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement de l\'image',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}; 