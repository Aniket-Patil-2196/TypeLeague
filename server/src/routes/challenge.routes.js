import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/today', challengeController.getTodayChallenge);
router.get('/:challengeId/leaderboard', challengeController.getLeaderboard);
router.get('/:challengeId', challengeController.getChallengeById);

// Protected routes
router.use(protect);
router.post('/publish', challengeController.publishChallenge);
router.post('/:challengeId/start', challengeController.startSession);
router.post('/submit', challengeController.submitAttempt);

export default router;
