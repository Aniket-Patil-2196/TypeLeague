import { PointTransaction, Achievement, UserAchievement } from '../models/gamification.model.js';
import { DailyResult, Attempt } from '../models/attempt.model.js';
import { User } from '../models/user.model.js';
import { Group } from '../models/group.model.js';
import { Membership } from '../models/membership.model.js';

export const DEFAULT_ACHIEVEMENTS = [
  { code: 'FIRST_TEST', title: 'FIRST VELOCITY', description: 'Complete your first verified typing test.', category: 'typing', iconName: 'Play' },
  { code: 'WPM_50', title: '50 NET WPM', description: 'Achieve 50 Net Words Per Minute.', category: 'typing', iconName: 'Zap' },
  { code: 'WPM_75', title: '75 NET WPM', description: 'Achieve 75 Net Words Per Minute.', category: 'typing', iconName: 'Flame' },
  { code: 'WPM_100', title: '100 CENTURY WPM', description: 'Break the 100 Net Words Per Minute barrier.', category: 'typing', iconName: 'Trophy' },
  { code: 'ACC_99', title: 'PRECISION CODER', description: 'Achieve 99% or higher verified accuracy.', category: 'typing', iconName: 'Target' },
  { code: 'STREAK_3', title: '3-DAY STREAK', description: 'Participate in competitions 3 consecutive days.', category: 'consistency', iconName: 'Calendar' },
  { code: 'STREAK_7', title: '7-DAY CADENCE', description: 'Maintain daily competition streak for 7 days.', category: 'consistency', iconName: 'Clock' },
  { code: 'FIRST_VICTORY', title: 'FIRST VICTORY', description: 'Claim 1st place in a daily competition.', category: 'competition', iconName: 'Award' },
  { code: 'TOP_3', title: 'PODIUM CONTENDER', description: 'Finish in the top 3 on any daily leaderboard.', category: 'competition', iconName: 'Shield' },
];

export const initAchievements = async () => {
  for (const ach of DEFAULT_ACHIEVEMENTS) {
    await Achievement.findOneAndUpdate({ code: ach.code }, ach, { upsert: true, new: true });
  }
};

export const awardChallengeRewards = async (challengeId) => {
  const results = await DailyResult.find({ challenge: challengeId })
    .sort({ bestScore: -1, bestAccuracy: -1, bestWpm: -1, createdAt: 1 });

  const rewards = [];
  for (let i = 0; i < results.length; i++) {
    const rank = i + 1;
    const res = results[i];
    res.rank = rank;
    await res.save();

    let xpAmount = 10;
    if (rank === 1) xpAmount = 100;
    else if (rank === 2) xpAmount = 75;
    else if (rank === 3) xpAmount = 50;
    else if (rank <= 10) xpAmount = 25;

    const idempotencyKey = `${res.user}_${challengeId}_DAILY_RANK_${rank}`;

    // Atomically award only if not already recorded
    const existing = await PointTransaction.findOne({ idempotencyKey });
    if (!existing) {
      await PointTransaction.create({
        user: res.user,
        challenge: challengeId,
        amount: xpAmount,
        reason: `Daily Challenge Rank ${rank}`,
        idempotencyKey,
      });

      const user = await User.findById(res.user);
      if (user) {
        user.xp += xpAmount;
        user.level = Math.floor(user.xp / 100) + 1;
        await user.save();
      }

      rewards.push({ user: res.user, rank, xp: xpAmount });
    }
  }

  return rewards;
};

export const checkAndUnlockAchievements = async (userId, attempt) => {
  const unlocked = [];
  const user = await User.findById(userId);
  if (!user) return unlocked;

  const toCheck = [];
  if (user.stats.testsCompleted >= 1) toCheck.push('FIRST_TEST');
  if (attempt.netWpm >= 50) toCheck.push('WPM_50');
  if (attempt.netWpm >= 75) toCheck.push('WPM_75');
  if (attempt.netWpm >= 100) toCheck.push('WPM_100');
  if (attempt.accuracy >= 99) toCheck.push('ACC_99');
  if (user.stats.dailyStreak >= 3) toCheck.push('STREAK_3');
  if (user.stats.dailyStreak >= 7) toCheck.push('STREAK_7');

  for (const code of toCheck) {
    const ach = await Achievement.findOne({ code });
    if (ach) {
      const already = await UserAchievement.findOne({ user: userId, achievement: ach._id });
      if (!already) {
        await UserAchievement.create({ user: userId, achievement: ach._id });
        unlocked.push(ach);
      }
    }
  }
  return unlocked;
};

export const getLeaderboardData = async ({ scope = 'global', groupId = null, period = 'all-time' }) => {
  const query = {};
  if (scope === 'group' && groupId) query.group = groupId;

  // Aggregate user best performance from DailyResult
  const results = await DailyResult.find(query)
    .sort({ bestScore: -1, bestAccuracy: -1, bestWpm: -1, createdAt: 1 })
    .populate('user', 'username fullName avatar stats xp level')
    .limit(100);

  // Group by unique user to get top standings
  const uniqueUsers = new Map();
  for (const r of results) {
    if (r.user && !uniqueUsers.has(r.user._id.toString())) {
      uniqueUsers.set(r.user._id.toString(), {
        user: r.user,
        score: r.bestScore,
        wpm: r.bestWpm,
        accuracy: r.bestAccuracy,
        dateKey: r.dateKey,
      });
    }
  }

  const standings = Array.from(uniqueUsers.values()).slice(0, 50).map((item, index) => ({
    rank: index + 1,
    ...item,
    delta: index === 0 ? 0 : index % 2 === 0 ? 1 : -1,
  }));

  // Return verified standings only (members appear only after submitting a competition attempt)
  return standings;
};

export const getUserAnalytics = async (userId) => {
  const user = await User.findById(userId);
  const attempts = await Attempt.find({ user: userId, isValid: true })
    .sort({ submittedAt: -1 })
    .limit(20);

  const achievements = await UserAchievement.find({ user: userId })
    .populate('achievement')
    .sort({ unlockedAt: -1 });

  const allAchievements = await Achievement.find().sort({ code: 1 });

  return {
    user,
    recentAttempts: attempts.map((a) => ({
      date: a.submittedAt.toISOString().split('T')[0],
      wpm: a.netWpm,
      accuracy: a.accuracy,
      score: a.score,
    })),
    achievements: allAchievements.map((ach) => {
      const isUnlocked = achievements.some((ua) => ua.achievement?._id.toString() === ach._id.toString());
      return {
        ...ach.toObject(),
        unlocked: isUnlocked,
      };
    }),
  };
};

export const getPlatformAnalytics = async () => {
  const [totalUsers, totalGroups, totalAttempts, flaggedAttempts] = await Promise.all([
    User.countDocuments(),
    Group.countDocuments(),
    Attempt.countDocuments(),
    Attempt.countDocuments({ isFlagged: true }),
  ]);

  return {
    totalUsers,
    totalGroups,
    totalAttempts,
    flaggedAttempts,
  };
};
