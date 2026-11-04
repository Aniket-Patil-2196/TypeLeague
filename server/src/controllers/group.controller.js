import * as groupService from '../services/group.service.js';

export const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: { group },
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicGroups = async (req, res, next) => {
  try {
    const result = await groupService.getPublicGroups(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyGroups = async (req, res, next) => {
  try {
    const groups = await groupService.getMyGroups(req.user._id);
    res.status(200).json({
      success: true,
      data: { groups },
    });
  } catch (err) {
    next(err);
  }
};

export const getGroupDetails = async (req, res, next) => {
  try {
    const result = await groupService.getGroupDetails(req.params.id, req.user?._id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const group = await groupService.updateGroup(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      data: { group },
    });
  } catch (err) {
    next(err);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    const membership = await groupService.joinPublicGroup(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      data: { membership },
    });
  } catch (err) {
    next(err);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const result = await groupService.leaveGroup(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getGroupMembers = async (req, res, next) => {
  try {
    const result = await groupService.getGroupMembers(req.params.id, req.user?._id, req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const membership = await groupService.updateMemberRole(
      req.params.id,
      req.params.userId,
      role,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: `Member role updated to ${role}`,
      data: { membership },
    });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const result = await groupService.removeMember(req.params.id, req.params.userId, req.user._id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
