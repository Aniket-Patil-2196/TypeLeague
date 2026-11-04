import crypto from 'crypto';
import { Challenge } from '../models/challenge.model.js';
import { Attempt, DailyResult } from '../models/attempt.model.js';
import { User } from '../models/user.model.js';
import { Membership } from '../models/membership.model.js';
import { TypingContent } from '../models/content.model.js';
import { calculateScores, compareAttempts, getDateKey } from './scoring.service.js';
import { checkAndUnlockAchievements } from './gamification.service.js';

// Cache active attempt sessions in memory: sessionToken -> { challengeId, userId, startedAt, duration }
const activeSessions = new Map();

export const publishChallenge = async (userId, data) => {
  const { title, passageText, contentId, scope, groupId, duration = 60, difficulty = 'Medium', attemptsAllowed = 3, timezone = 'Asia/Kolkata' } = data;

  if (scope === 'group') {
    if (!groupId) {
      const error = new Error('Group ID is required for group-scoped challenges');
      error.statusCode = 400;
      throw error;
    }
    const membership = await Membership.findOne({ group: groupId, user: userId });
    if (!membership || !['owner', 'moderator'].includes(membership.role)) {
      const error = new Error('Only owners and moderators can publish challenges');
      error.statusCode = 403;
      throw error;
    }
  }

  const dateKey = getDateKey(new Date(), timezone);

  const existing = await Challenge.findOne({ scope, group: scope === 'group' ? groupId : undefined, dateKey });
  if (existing) {
    return existing;
  }

  const challenge = await Challenge.create({
    title,
    passageText,
    contentId,
    scope,
    group: scope === 'group' ? groupId : undefined,
    duration: Number(duration),
    difficulty,
    attemptsAllowed: Number(attemptsAllowed),
    dateKey,
    timezone,
    status: 'active',
    createdBy: userId,
  });

  return challenge;
};

export const getTodayChallenge = async (scope = 'global', groupId = null, timezone = 'Asia/Kolkata', contentId = null, challengeId = null) => {
  const dateKey = getDateKey(new Date(), timezone);

  // If specific challenge ID requested directly
  if (challengeId) {
    const directChallenge = await Challenge.findById(challengeId);
    if (directChallenge) return directChallenge;
  }

  // If specific passage practice requested
  if (contentId) {
    let passageChallenge = await Challenge.findOne({ contentId });
    if (!passageChallenge) {
      const groupContent = await TypingContent.findById(contentId);
      if (groupContent) {
        const creator = groupContent.createdBy || (await User.findOne())?._id;
        passageChallenge = await Challenge.create({
          title: groupContent.title,
          passageText: groupContent.passageText,
          contentId: groupContent._id,
          scope: scope === 'group' ? 'group' : 'global',
          group: groupId || groupContent.group || undefined,
          duration: groupContent.estimatedDuration || 60,
          difficulty: groupContent.difficulty || 'Medium',
          attemptsAllowed: 0, // unlimited practice attempts
          dateKey,
          timezone,
          status: 'active',
          createdBy: creator,
        });
      }
    }
    if (passageChallenge) return passageChallenge;
  }

  const query = { scope, dateKey, status: 'active' };
  if (scope === 'group' && groupId) query.group = groupId;

  let challenge = await Challenge.findOne(query);

  // Auto-activate group challenge if not yet created for today
  if (!challenge && scope === 'group' && groupId) {
    const groupContent = await TypingContent.findOne({ group: groupId, status: 'Published' }).sort({ createdAt: -1 });
    if (groupContent) {
      challenge = await Challenge.create({
        title: groupContent.title,
        passageText: groupContent.passageText,
        contentId: groupContent._id,
        scope: 'group',
        group: groupId,
        duration: Math.min(Math.max(groupContent.estimatedDuration || 60, 30), 180),
        difficulty: groupContent.difficulty || 'Medium',
        attemptsAllowed: 3,
        dateKey,
        timezone,
        status: 'active',
        createdBy: groupContent.createdBy,
      });
    } else {
      const fallbackClanText = "Consistent deliberate practice separates casual typists from elite competitors. Speed without accuracy is chaotic noise, but precision under pressure constructs mastery. Train daily with your circle.";
      const admin = await User.findOne();
      if (admin) {
        challenge = await Challenge.create({
          title: "Clan Daily Benchmark: Precision & Velocity",
          passageText: fallbackClanText,
          scope: "group",
          group: groupId,
          duration: 60,
          difficulty: "Medium",
          attemptsAllowed: 3,
          dateKey,
          timezone,
          status: "active",
          createdBy: admin._id,
        });
      }
    }
  }

  // If no global challenge exists for today, automatically activate one from shared library or default fallback
  if (!challenge && scope === 'global') {
    const fallbackText = "Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface. The design of Unix encouraged developers to view computation as an interconnected assembly of sharp tools rather than monolithic architectures.";
    const admin = await User.findOne();
    if (admin) {
      challenge = await Challenge.create({
        title: "Daily Benchmark: Unix Philosophy",
        passageText: fallbackText,
        scope: "global",
        duration: 60,
        difficulty: "Medium",
        attemptsAllowed: 3,
        dateKey,
        timezone,
        status: "active",
        createdBy: admin._id,
      });
    }
  }

  return challenge;
};

export const startAttemptSession = async (challengeId, userId) => {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge || challenge.status !== 'active') {
    const error = new Error('Challenge is not active or does not exist');
    error.statusCode = 404;
    throw error;
  }

  if (challenge.scope === 'group' && challenge.group) {
    const group = await Group.findById(challenge.group);
    const isOwner = group && userId ? areIdsEqual(group.owner, userId) : false;
    const membership = await Membership.findOne({ group: challenge.group, user: userId, status: 'active' });
    if (!isOwner && !membership) {
      const error = new Error('You must be a member of this clan to participate');
      error.statusCode = 403;
      throw error;
    }
  }

  // Check attempt limit
  if (challenge.attemptsAllowed > 0) {
    const attemptsCount = await Attempt.countDocuments({ challenge: challengeId, user: userId });
    if (attemptsCount >= challenge.attemptsAllowed) {
      const error = new Error(`Attempt limit reached (${challenge.attemptsAllowed} of ${challenge.attemptsAllowed})`);
      error.statusCode = 400;
      throw error;
    }
  }

  const sessionToken = crypto.randomUUID();
  const sessionData = {
    challengeId: challenge._id.toString(),
    userId: userId.toString(),
    startedAt: Date.now(),
    duration: challenge.duration,
  };

  activeSessions.set(sessionToken, sessionData);

  return {
    sessionToken,
    duration: challenge.duration,
    startedAt: sessionData.startedAt,
    attemptsRemaining: challenge.attemptsAllowed > 0 
      ? challenge.attemptsAllowed - (await Attempt.countDocuments({ challenge: challengeId, user: userId }))
      : null,
  };
};

export const submitAttempt = async (userId, { sessionToken, typedText, timeInSeconds, events = [] }) => {
  const session = activeSessions.get(sessionToken);
  if (!session) {
    const error = new Error('Invalid or expired attempt session');
    error.statusCode = 400;
    throw error;
  }

  if (session.userId !== userId.toString()) {
    const error = new Error('Unauthorized session identifier');
    error.statusCode = 403;
    throw error;
  }

  activeSessions.delete(sessionToken);

  const challenge = await Challenge.findById(session.challengeId);
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }

  // Server-side elapsed time measured from session start, capped at challenge duration
  const serverElapsedSeconds = Math.max((Date.now() - session.startedAt) / 1000, 0.5);
  const validatedTimeSeconds = Math.min(challenge.duration, Math.max(serverElapsedSeconds, Number(timeInSeconds) || 1));

  // Recalculate strictly server-side
  const metrics = calculateScores({
    passageText: challenge.passageText,
    typedText: typedText || '',
    timeInSeconds: validatedTimeSeconds,
    events,
    minTypedLength: 15,
  });

  // Integrity checks
  let isFlagged = false;
  let flagReason = '';
  if (metrics.netWpm > 240) {
    isFlagged = true;
    flagReason = 'Implausible velocity (>240 WPM)';
  }

  const attempt = await Attempt.create({
    challenge: challenge._id,
    user: userId,
    group: challenge.group,
    sessionToken,
    sessionStartedAt: new Date(session.startedAt),
    submittedAt: new Date(),
    typedText: typedText || '',
    timeInSeconds: validatedTimeSeconds,
    correctChars: metrics.correctChars,
    incorrectChars: metrics.incorrectChars,
    netWpm: metrics.netWpm,
    rawWpm: metrics.rawWpm,
    accuracy: metrics.accuracy,
    score: metrics.score,
    isValid: metrics.isValid && !isFlagged,
    isFlagged,
    flagReason,
    dateKey: challenge.dateKey,
  });

  // Update or insert DailyResult
  let dailyResult = await DailyResult.findOne({ challenge: challenge._id, user: userId });
  if (!dailyResult) {
    dailyResult = await DailyResult.create({
      challenge: challenge._id,
      user: userId,
      group: challenge.group,
      bestAttempt: attempt._id,
      bestScore: attempt.score,
      bestWpm: attempt.netWpm,
      bestAccuracy: attempt.accuracy,
      attemptsCount: 1,
      dateKey: challenge.dateKey,
    });
  } else {
    dailyResult.attemptsCount += 1;
    // Compare if current attempt beats best attempt
    if (attempt.score > dailyResult.bestScore || (attempt.score === dailyResult.bestScore && attempt.accuracy > dailyResult.bestAccuracy)) {
      dailyResult.bestAttempt = attempt._id;
      dailyResult.bestScore = attempt.score;
      dailyResult.bestWpm = attempt.netWpm;
      dailyResult.bestAccuracy = attempt.accuracy;
    }
    await dailyResult.save();
  }

  // Update user stats
  const user = await User.findById(userId);
  if (user) {
    user.stats.testsCompleted += 1;
    if (attempt.netWpm > user.stats.bestWpm) {
      user.stats.bestWpm = attempt.netWpm;
    }
    // Update moving average accuracy
    const totalAcc = user.stats.averageAccuracy * (user.stats.testsCompleted - 1) + attempt.accuracy;
    user.stats.averageAccuracy = totalAcc / user.stats.testsCompleted;
    await user.save();

    await checkAndUnlockAchievements(userId, attempt);
  }

  return {
    attempt,
    dailyResult,
    metrics,
  };
};

export const getChallengeLeaderboard = async (challengeId) => {
  const results = await DailyResult.find({ challenge: challengeId })
    .sort({ bestScore: -1, bestAccuracy: -1, bestWpm: -1, createdAt: 1 })
    .populate('user', 'username fullName avatar stats xp level')
    .limit(50);

  return results.map((res, index) => ({
    rank: index + 1,
    ...res.toObject(),
  }));
};

export const getChallengeById = async (challengeId) => {
  return await Challenge.findById(challengeId);
};
