import { Router } from 'express';
import * as groupController from '../controllers/group.controller.js';
import * as invitationController from '../controllers/invitation.controller.js';
import * as contentController from '../controllers/content.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public and Optional Auth routes
router.get('/public', groupController.getPublicGroups);
router.get('/user/me', protect, groupController.getMyGroups);
router.get('/:id', optionalAuth, groupController.getGroupDetails);
router.get('/:id/members', optionalAuth, groupController.getGroupMembers);
router.get('/:groupId/content', optionalAuth, contentController.getGroupContent);

// Strictly Protected Routes
router.use(protect);

router.post('/', groupController.createGroup);
router.patch('/:id', groupController.updateGroup);
router.post('/:id/join', groupController.joinGroup);
router.post('/:id/leave', groupController.leaveGroup);
router.patch('/:id/members/:userId/role', groupController.updateMemberRole);
router.delete('/:id/members/:userId', groupController.removeMember);

// Group invitation routes
router.post('/:groupId/invitations', invitationController.createInvitation);
router.get('/:groupId/invitations', invitationController.getGroupInvitations);

export default router;
