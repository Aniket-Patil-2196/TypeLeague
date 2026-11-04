import { Group } from '../models/group.model.js';
import { Membership } from '../models/membership.model.js';

export const createGroup = async (userId, data) => {
  const { name, description, category, visibility, rules, maxMembers, timezone, coverImage } = data;

  const group = await Group.create({
    name: name.trim(),
    description: description?.trim() || '',
    category: category || 'General',
    visibility: visibility || 'public',
    rules: rules?.trim() || '',
    maxMembers: maxMembers ? Number(maxMembers) : 0,
    timezone: timezone || 'Asia/Kolkata',
    coverImage: coverImage || '',
    owner: userId,
    stats: { memberCount: 1, averageWpm: 0, averageAccuracy: 0, activeToday: 0 },
  });

  // Automatically create membership as owner
  await Membership.create({
    user: userId,
    group: group._id,
    role: 'owner',
    status: 'active',
  });

  return group;
};

export const getPublicGroups = async ({ search, category, sortBy = 'members', page = 1, limit = 12 }) => {
  const query = { visibility: 'public' };

  if (search) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  const sortOptions = {};
  if (sortBy === 'members') sortOptions['stats.memberCount'] = -1;
  else if (sortBy === 'newest') sortOptions.createdAt = -1;
  else if (sortBy === 'name') sortOptions.name = 1;
  else sortOptions['stats.memberCount'] = -1;

  const skip = (page - 1) * limit;

  const [groups, total] = await Promise.all([
    Group.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'username fullName avatar'),
    Group.countDocuments(query),
  ]);

  return {
    groups,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getMyGroups = async (userId) => {
  const memberships = await Membership.find({ user: userId, status: 'active' })
    .populate({
      path: 'group',
      populate: { path: 'owner', select: 'username fullName avatar' },
    })
    .sort({ updatedAt: -1 });

  return memberships
    .filter((m) => m.group)
    .map((m) => ({
      ...m.group.toObject(),
      userRole: m.role,
      joinedAt: m.joinedAt,
    }));
};

export const getGroupDetails = async (groupId, userId) => {
  const group = await Group.findById(groupId).populate('owner', 'username fullName avatar');
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  let userMembership = null;
  if (userId) {
    userMembership = await Membership.findOne({ user: userId, group: groupId, status: 'active' });
  }

  // If private group and user is not a member, deny access
  if (group.visibility === 'private' && !userMembership) {
    const error = new Error('This group is private. You must join via invitation link.');
    error.statusCode = 403;
    throw error;
  }

  return {
    group,
    userRole: userMembership?.role || null,
    isMember: !!userMembership,
  };
};

export const updateGroup = async (groupId, userId, updateData) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  if (group.owner.toString() !== userId.toString()) {
    const error = new Error('Only the group owner can modify group settings');
    error.statusCode = 403;
    throw error;
  }

  const allowedUpdates = [
    'name',
    'description',
    'category',
    'visibility',
    'rules',
    'maxMembers',
    'timezone',
    'coverImage',
  ];

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      group[key] = updateData[key];
    }
  }

  await group.save();
  return group;
};

export const joinPublicGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  if (group.visibility !== 'public') {
    const error = new Error('This group is private. An invitation link is required.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await Membership.findOne({ user: userId, group: groupId });
  if (existing) {
    const error = new Error('You are already a member of this group');
    error.statusCode = 409;
    throw error;
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

  group.stats.memberCount += 1;
  await group.save();

  return membership;
};

export const leaveGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  const membership = await Membership.findOne({ user: userId, group: groupId });
  if (!membership) {
    const error = new Error('You are not a member of this group');
    error.statusCode = 400;
    throw error;
  }

  if (membership.role === 'owner') {
    const otherOwners = await Membership.countDocuments({
      group: groupId,
      role: 'owner',
      user: { $ne: userId },
    });
    if (otherOwners === 0) {
      const error = new Error(
        'Sole owner cannot leave group. Transfer ownership or delete the group first.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  await Membership.findByIdAndDelete(membership._id);
  group.stats.memberCount = Math.max(group.stats.memberCount - 1, 0);
  await group.save();

  return { message: 'Successfully left the group' };
};

export const getGroupMembers = async (groupId, userId, { page = 1, limit = 20 }) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  if (group.visibility === 'private') {
    const member = await Membership.findOne({ group: groupId, user: userId });
    if (!member) {
      const error = new Error('Access denied to private group member roster');
      error.statusCode = 403;
      throw error;
    }
  }

  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    Membership.find({ group: groupId, status: 'active' })
      .sort({ role: 1, joinedAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName avatar stats xp level'),
    Membership.countDocuments({ group: groupId, status: 'active' }),
  ]);

  return {
    members,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const updateMemberRole = async (groupId, targetUserId, newRole, requesterId) => {
  if (!['moderator', 'member'].includes(newRole)) {
    const error = new Error('Invalid role specified');
    error.statusCode = 400;
    throw error;
  }

  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Only the owner can promote or demote moderators
  if (group.owner.toString() !== requesterId.toString()) {
    const error = new Error('Only the group owner can manage roles');
    error.statusCode = 403;
    throw error;
  }

  if (targetUserId.toString() === requesterId.toString()) {
    const error = new Error('Cannot change owner role');
    error.statusCode = 400;
    throw error;
  }

  const targetMembership = await Membership.findOne({ group: groupId, user: targetUserId });
  if (!targetMembership) {
    const error = new Error('Target user is not a member of this group');
    error.statusCode = 404;
    throw error;
  }

  targetMembership.role = newRole;
  await targetMembership.save();

  return targetMembership;
};

export const removeMember = async (groupId, targetUserId, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  const requesterMembership = await Membership.findOne({ group: groupId, user: requesterId });
  if (!requesterMembership) {
    const error = new Error('You are not a member of this group');
    error.statusCode = 403;
    throw error;
  }

  const targetMembership = await Membership.findOne({ group: groupId, user: targetUserId });
  if (!targetMembership) {
    const error = new Error('Target member not found');
    error.statusCode = 404;
    throw error;
  }

  if (targetMembership.role === 'owner') {
    const error = new Error('Cannot remove group owner');
    error.statusCode = 403;
    throw error;
  }

  // Moderator can only remove regular members; owner can remove anyone except self
  if (requesterMembership.role === 'moderator' && targetMembership.role !== 'member') {
    const error = new Error('Moderators cannot remove other moderators or owners');
    error.statusCode = 403;
    throw error;
  }

  if (requesterMembership.role === 'member') {
    const error = new Error('Regular members cannot remove other members');
    error.statusCode = 403;
    throw error;
  }

  await Membership.findByIdAndDelete(targetMembership._id);
  group.stats.memberCount = Math.max(group.stats.memberCount - 1, 0);
  await group.save();

  return { message: 'Member successfully removed' };
};
