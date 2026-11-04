import multer from 'multer';
import * as contentService from '../services/content.service.js';

// Multer in-memory storage for controlled .txt processing
const storage = multer.memoryStorage();
export const uploadTxt = multer({
  storage,
  limits: { fileSize: 100 * 1024 }, // 100KB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file format. Only plain text (.txt) files are accepted.');
      err.statusCode = 400;
      cb(err, false);
    }
  },
});

export const createContent = async (req, res, next) => {
  try {
    const content = await contentService.createContent(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: { content },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadContentFile = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No .txt file uploaded');
      error.statusCode = 400;
      throw error;
    }

    // Decode UTF-8 string
    const rawContent = req.file.buffer.toString('utf-8');
    if (!rawContent || !rawContent.trim()) {
      const error = new Error('Uploaded file is empty');
      error.statusCode = 400;
      throw error;
    }

    const { title, description, category, difficulty, scope, groupId } = req.body;

    const content = await contentService.createContent(req.user._id, {
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      description: description || 'Uploaded text passage',
      passageText: rawContent,
      category,
      difficulty,
      scope,
      groupId,
      status: 'Published',
    });

    res.status(201).json({
      success: true,
      message: 'Passage file uploaded and validated successfully',
      data: { content },
    });
  } catch (err) {
    next(err);
  }
};

export const getGroupContent = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const result = await contentService.getGroupContentList(groupId, req.user?._id, req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSharedLibrary = async (req, res, next) => {
  try {
    const result = await contentService.getSharedLibrary(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getContentById = async (req, res, next) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    res.status(200).json({
      success: true,
      data: { content },
    });
  } catch (err) {
    next(err);
  }
};

export const archiveContent = async (req, res, next) => {
  try {
    const result = await contentService.archiveContent(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
