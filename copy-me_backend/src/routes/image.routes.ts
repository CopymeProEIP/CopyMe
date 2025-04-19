import { Router } from 'express';
// import {
//   getAllImages,
//   getImageById,
//   uploadImage,
//   upload
// } from '../controllers/image.controller';
// import { protect } from '../middlewares/auth.middleware';

const router = Router();

// // Toutes les routes nécessitent une authentification
// router.use(protect);

// // Routes images
// router.route('/')
//   .get(getAllImages)
//   .post(upload.single('image'), uploadImage);

// router.route('/:id')
//   .get(getImageById);

export default router; 