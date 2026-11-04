import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    sessionStartedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    typedText: {
      type: String,
      required: true,
    },
    timeInSeconds: {
      type: Number,
      required: true,
    },
    correctChars: {
      type: Number,
      required: true,
    },
    incorrectChars: {
      type: Number,
      required: true,
    },
    netWpm: {
      type: Number,
      required: true,
    },
    rawWpm: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      index: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: '',
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Attempt = mongoose.model('Attempt', attemptSchema);

const dailyResultSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    bestAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
    },
    bestScore: {
      type: Number,
      required: true,
      index: true,
    },
    bestWpm: {
      type: Number,
      required: true,
    },
    bestAccuracy: {
      type: Number,
      required: true,
    },
    attemptsCount: {
      type: Number,
      default: 1,
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
    rank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound constraint: one daily result per user per challenge
dailyResultSchema.index({ challenge: 1, user: 1 }, { unique: true });

export const DailyResult = mongoose.model('DailyResult', dailyResultSchema);
