import * as gamificationService from '../services/gamification.service.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { scope = 'global', groupId, period = 'all-time' } = req.query;
    const standings = await gamificationService.getLeaderboardData({ scope, groupId, period });
    res.status(200).json({
      success: true,
      data: { standings },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserAnalytics = async (req, res, next) => {
  try {
    const analytics = await gamificationService.getUserAnalytics(req.user._id);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
};

export const getAchievements = async (req, res, next) => {
  try {
    const analytics = await gamificationService.getUserAnalytics(req.user._id);
    res.status(200).json({
      success: true,
      data: { achievements: analytics.achievements },
    });
  } catch (err) {
    next(err);
  }
};

export const awardRewards = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const rewards = await gamificationService.awardChallengeRewards(challengeId);
    res.status(200).json({
      success: true,
      message: 'Rewards computed and distributed idempotently',
      data: { rewards },
    });
  } catch (err) {
    next(err);
  }
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const stats = await gamificationService.getPlatformAnalytics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
