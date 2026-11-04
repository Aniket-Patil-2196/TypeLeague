import { TypingContent } from '../models/content.model.js';
import { Membership } from '../models/membership.model.js';
import { Group } from '../models/group.model.js';
import { areIdsEqual } from '../utils/id.utils.js';

/**
 * Text normalization & hygiene utility
 * Strips non-printable ASCII control characters, normalizes line endings & multiple spaces
 */
export const sanitizePassageText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // strip control characters except newline (\n) and tab (\t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
};

export const createContent = async (userId, data) => {
  const { title, description, passageText, category, difficulty, status, scope, groupId } = data;

  const cleanedText = sanitizePassageText(passageText);

  if (cleanedText.length < 20) {
    const error = new Error('Passage must contain at least 20 valid characters');
    error.statusCode = 400;
    throw error;
  }

  if (cleanedText.length > 5000) {
    const error = new Error('Passage length cannot exceed 5000 characters');
    error.statusCode = 400;
    throw error;
  }

  // If group scope, verify requester is owner or moderator
  if (scope === 'group') {
    if (!groupId) {
      const error = new Error('Group ID is required for group-scoped content');
      error.statusCode = 400;
      throw error;
    }
    const membership = await Membership.findOne({ group: groupId, user: userId });
    if (!membership || !['owner', 'moderator'].includes(membership.role)) {
      const error = new Error('Only owners and moderators can upload content to a group');
      error.statusCode = 403;
      throw error;
    }
  }

  const content = await TypingContent.create({
    title: title.trim(),
    description: description?.trim() || '',
    passageText: cleanedText,
    category: category || 'Technology',
    difficulty: difficulty || 'Medium',
    status: status || 'Published',
    scope: scope || 'group',
    group: scope === 'group' ? groupId : undefined,
    createdBy: userId,
  });

  return content;
};

export const getGroupContentList = async (groupId, userId, { category, difficulty, search, page = 1, limit = 20 }) => {
  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) {
      const error = new Error('Group not found');
      error.statusCode = 404;
      throw error;
    }
    if (group.visibility === 'private') {
      const isOwner = userId ? areIdsEqual(group.owner, userId) : false;
      const membership = userId
        ? await Membership.findOne({ group: groupId, user: userId, status: 'active' })
        : null;
      if (!isOwner && !membership) {
        const error = new Error('Access denied to private community content');
        error.statusCode = 403;
        throw error;
      }
    }
  }

  const query = { group: groupId, status: { $ne: 'Archived' } };

  if (category && category !== 'All') query.category = category;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) query.title = { $regex: search.trim(), $options: 'i' };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    TypingContent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username fullName'),
    TypingContent.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getSharedLibrary = async ({ category, difficulty, search, page = 1, limit = 20 }) => {
  const query = { scope: 'global', status: 'Published' };

  if (category && category !== 'All') query.category = category;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) query.title = { $regex: search.trim(), $options: 'i' };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    TypingContent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username fullName'),
    TypingContent.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getContentById = async (contentId) => {
  const content = await TypingContent.findById(contentId).populate('createdBy', 'username fullName');
  if (!content) {
    const error = new Error('Content not found');
    error.statusCode = 404;
    throw error;
  }
  return content;
};

export const archiveContent = async (contentId, userId, userRole) => {
  const content = await TypingContent.findById(contentId);
  if (!content) {
    const error = new Error('Content not found');
    error.statusCode = 404;
    throw error;
  }

  if (content.scope === 'global' && userRole !== 'admin') {
    const error = new Error('Only administrators can archive global shared library content');
    error.statusCode = 403;
    throw error;
  }

  if (content.scope === 'group') {
    const membership = await Membership.findOne({ group: content.group, user: userId });
    if (!membership || !['owner', 'moderator'].includes(membership.role)) {
      const error = new Error('Only owners and moderators can archive group content');
      error.statusCode = 403;
      throw error;
    }
  }

  content.status = 'Archived';
  await content.save();

  return { message: 'Content archived successfully' };
};
