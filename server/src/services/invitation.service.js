import crypto from 'crypto';
import { Invitation } from '../models/invitation.model.js';
import { Group } from '../models/group.model.js';
import { Membership } from '../models/membership.model.js';
import { hashToken } from '../utils/jwt.utils.js';

export const createInvitation = async (groupId, userId, { expiresInDays = 7, maxUses = 0 } = {}) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Requester must be owner or moderator
  const requesterMembership = await Membership.findOne({ group: groupId, user: userId });
  if (!requesterMembership || !['owner', 'moderator'].includes(requesterMembership.role)) {
    const error = new Error('Only owners and moderators can generate invitation links');
    error.statusCode = 403;
    throw error;
  }

  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(expiresInDays || 7));

  const invitation = await Invitation.create({
    group: groupId,
    tokenHash,
    createdBy: userId,
    expiresAt,
    maxUses: Number(maxUses || 0),
  });

  return {
    rawToken,
    invitationId: invitation._id,
    expiresAt: invitation.expiresAt,
    maxUses: invitation.maxUses,
  };
};

export const verifyInvitationToken = async (rawToken) => {
  if (!rawToken) {
    const error = new Error('Invitation token is required');
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashToken(rawToken);
  const invitation = await Invitation.findOne({
    tokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate('group', 'name description category visibility coverImage stats');

  if (!invitation) {
    const error = new Error('Invitation is invalid, expired, or has been revoked');
    error.statusCode = 404;
    throw error;
  }

  if (invitation.maxUses > 0 && invitation.usesCount >= invitation.maxUses) {
    const error = new Error('This invitation link has reached its maximum usage limit');
    error.statusCode = 410;
    throw error;
  }

  return invitation;
};

export const acceptInvitation = async (rawToken, userId) => {
  const invitation = await verifyInvitationToken(rawToken);
  const groupId = invitation.group._id;

  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = await Membership.findOne({ group: groupId, user: userId });
  if (existing) {
    return {
      message: 'You are already a member of this community',
      group,
      membership: existing,
    };
  }

  if (group.maxMembers > 0 && group.stats.memberCount >= group.maxMembers) {
    const error = new Error('This group has reached its maximum member capacity');
    error.statusCode = 400;
    throw error;
  }

  const membership = await Membership.create({
    user: userId,
    group: groupId,
    role: 'member',
    status: 'active',
  });

  // Increment usage count
  invitation.usesCount += 1;
  await invitation.save();

  // Increment group count
  group.stats.memberCount += 1;
  await group.save();

  return {
    message: 'Successfully joined community via invitation',
    group,
    membership,
  };
};

export const revokeInvitation = async (invitationId, userId) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    const error = new Error('Invitation not found');
    error.statusCode = 404;
    throw error;
  }

  const membership = await Membership.findOne({ group: invitation.group, user: userId });
  if (!membership || !['owner', 'moderator'].includes(membership.role)) {
    const error = new Error('Only owners and moderators can revoke invitation links');
    error.statusCode = 403;
    throw error;
  }

  invitation.isRevoked = true;
  await invitation.save();

  return { message: 'Invitation link has been revoked' };
};

export const getGroupInvitations = async (groupId, userId) => {
  const membership = await Membership.findOne({ group: groupId, user: userId });
  if (!membership || !['owner', 'moderator'].includes(membership.role)) {
    const error = new Error('Access denied to invitation records');
    error.statusCode = 403;
    throw error;
  }

  return Invitation.find({ group: groupId, isRevoked: false, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'username fullName');
};
