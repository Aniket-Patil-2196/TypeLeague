import crypto from 'crypto';
import { User } from '../models/user.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/jwt.utils.js';
import { env } from '../config/env.js';

export const registerUser = async ({ fullName, username, email, password, confirmPassword }) => {
  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  // Check existing user
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    const error = new Error(
      existingUser.email === normalizedEmail
        ? 'Email is already registered'
        : 'Username is already taken'
    );
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    fullName: fullName.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
  });

  const familyId = crypto.randomUUID();
  const refreshToken = generateRefreshToken(user, familyId);
  const accessToken = generateAccessToken(user);

  // Store hashed refresh token
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    familyId,
    createdAt: new Date(),
  });
  await user.save();

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  return { user: userObject, accessToken, refreshToken };
};

export const loginUser = async ({ credential, password }) => {
  const normalizedCred = credential.toLowerCase().trim();

  const user = await User.findOne({
    $or: [{ email: normalizedCred }, { username: normalizedCred }],
  }).select('+password');

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const familyId = crypto.randomUUID();
  const refreshToken = generateRefreshToken(user, familyId);
  const accessToken = generateAccessToken(user);

  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    familyId,
    createdAt: new Date(),
  });

  // Keep at most 10 active tokens per user
  if (user.refreshTokens.length > 10) {
    user.refreshTokens = user.refreshTokens.slice(-10);
  }

  await user.save();

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  return { user: userObject, accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  const hashedOldToken = hashToken(oldRefreshToken);
  const tokenIndex = user.refreshTokens.findIndex(
    (t) => t.tokenHash === hashedOldToken
  );

  // REUSE DETECTION:
  // If the token matches the family but hash is not found in active list, reuse attack suspected!
  if (tokenIndex === -1) {
    // Revoke all refresh tokens for this user family
    user.refreshTokens = user.refreshTokens.filter((t) => t.familyId !== decoded.familyId);
    await user.save();
    const error = new Error('Token reuse detected. All sessions revoked for security.');
    error.statusCode = 403;
    throw error;
  }

  // Valid token found: rotate it within same family
  const newRefreshToken = generateRefreshToken(user, decoded.familyId);
  const newAccessToken = generateAccessToken(user);

  // Replace old token with new token
  user.refreshTokens[tokenIndex] = {
    tokenHash: hashToken(newRefreshToken),
    familyId: decoded.familyId,
    createdAt: new Date(),
  };

  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId, refreshToken) => {
  if (!refreshToken) return;
  const hashed = hashToken(refreshToken);
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { tokenHash: hashed } },
  });
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Return success to avoid email enumeration
    return { message: 'If that email is registered, a password reset link has been sent.' };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET LINK for ${user.email}]:`);
  console.log(resetUrl);
  console.log(`======================================================\n`);

  return {
    message: 'If that email is registered, a password reset link has been sent.',
    devResetUrl: env.NODE_ENV === 'development' ? resetUrl : undefined,
  };
};

export const resetPasswordWithToken = async ({ token, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    const error = new Error('Invalid or expired password reset token');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Invalidate all existing sessions on password change
  user.refreshTokens = [];
  await user.save();

  return { message: 'Password has been reset successfully. Please log in.' };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-refreshTokens');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};
