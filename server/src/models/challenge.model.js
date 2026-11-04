import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    passageText: {
      type: String,
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TypingContent',
    },
    scope: {
      type: String,
      enum: ['global', 'group'],
      required: true,
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    attemptsAllowed: {
      type: Number,
      default: 3,
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One official active challenge per scope + group per dateKey
challengeSchema.index({ scope: 1, group: 1, dateKey: 1 }, { unique: true });

export const Challenge = mongoose.model('Challenge', challengeSchema);
