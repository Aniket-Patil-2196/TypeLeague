import * as challengeService from '../services/challenge.service.js';

export const publishChallenge = async (req, res, next) => {
  try {
    const challenge = await challengeService.publishChallenge(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: { challenge },
    });
  } catch (err) {
    next(err);
  }
};

export const getTodayChallenge = async (req, res, next) => {
  try {
    const { scope = 'global', groupId, timezone, contentId, challengeId } = req.query;
    const challenge = await challengeService.getTodayChallenge(scope, groupId, timezone, contentId, challengeId);
    res.status(200).json({
      success: true,
      data: { challenge },
    });
  } catch (err) {
    next(err);
  }
};

export const getChallengeById = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const challenge = await challengeService.getChallengeById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }
    res.status(200).json({
      success: true,
      data: { challenge },
    });
  } catch (err) {
    next(err);
  }
};

export const startSession = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const session = await challengeService.startAttemptSession(challengeId, req.user._id);
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const result = await challengeService.submitAttempt(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Attempt verified and recorded',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const leaderboard = await challengeService.getChallengeLeaderboard(challengeId);
    res.status(200).json({
      success: true,
      data: { leaderboard },
    });
  } catch (err) {
    next(err);
  }
};
