import { Router } from 'express';
import * as invitationController from '../controllers/invitation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Public verification of token
router.get('/:token/verify', invitationController.verifyInvitation);

// Protected action: accept invitation
router.post('/:token/join', protect, invitationController.joinViaInvitation);
router.delete('/:id', protect, invitationController.revokeInvitation);

export default router;
