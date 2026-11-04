import * as invitationService from '../services/invitation.service.js';

export const createInvitation = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const result = await invitationService.createInvitation(groupId, req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invitation = await invitationService.verifyInvitationToken(token);
    res.status(200).json({
      success: true,
      data: { invitation },
    });
  } catch (err) {
    next(err);
  }
};

export const joinViaInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await invitationService.acceptInvitation(token, req.user._id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const revokeInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await invitationService.revokeInvitation(id, req.user._id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getGroupInvitations = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const invitations = await invitationService.getGroupInvitations(groupId, req.user._id);
    res.status(200).json({
      success: true,
      data: { invitations },
    });
  } catch (err) {
    next(err);
  }
};
