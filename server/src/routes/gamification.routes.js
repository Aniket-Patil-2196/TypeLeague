import { Router } from 'express';
import * as gamificationController from '../controllers/gamification.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Public leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

// Protected routes
router.use(protect);
router.get('/analytics', gamificationController.getUserAnalytics);
router.get('/achievements', gamificationController.getAchievements);
router.post('/challenges/:challengeId/award', gamificationController.awardRewards);

// Admin-only platform metrics
router.get('/admin/platform', authorize('admin'), gamificationController.getPlatformStats);

export default router;
