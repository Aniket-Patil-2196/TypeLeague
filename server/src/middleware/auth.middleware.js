import { verifyAccessToken } from '../utils/jwt.utils.js';
import { User } from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Authentication required. No token provided.');
      error.statusCode = 401;
      return next(error);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-refreshTokens');

    if (!user) {
      const error = new Error('The user belonging to this token no longer exists.');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      return next();
    }

    const user = await User.findById(decoded.id).select('-refreshTokens');
    if (user) {
      req.user = user;
    }
    return next();
  } catch (err) {
    // If token is missing, expired, or invalid, continue as unauthenticated guest
    return next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
