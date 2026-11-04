import { Router } from 'express';
import * as contentController from '../controllers/content.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/shared', contentController.getSharedLibrary);
router.get('/:id', contentController.getContentById);

// Protected routes
router.use(protect);
router.post('/', contentController.createContent);
router.post('/upload', contentController.uploadTxt.single('file'), contentController.uploadContentFile);
router.patch('/:id/archive', contentController.archiveContent);

export default router;
