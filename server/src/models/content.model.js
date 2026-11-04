import mongoose from 'mongoose';

const typingContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Passage title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    passageText: {
      type: String,
      required: [true, 'Passage text content is required'],
      trim: true,
      minlength: [20, 'Passage must be at least 20 characters long'],
      maxlength: [5000, 'Passage cannot exceed 5000 characters'],
    },
    scope: {
      type: String,
      enum: ['global', 'group'],
      default: 'group',
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Technology',
        'Programming',
        'Science',
        'Literature',
        'General Knowledge',
        'Business',
        'History',
        'Other',
      ],
      default: 'Technology',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    charCount: {
      type: Number,
      default: 0,
    },
    estimatedDuration: {
      type: Number, // in seconds
      default: 60,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation of metrics
typingContentSchema.pre('validate', function (next) {
  if (this.passageText) {
    this.charCount = this.passageText.length;
    // Normalized words count
    const words = this.passageText.trim().split(/\s+/).filter(Boolean);
    this.wordCount = words.length;
    // Average reading/typing speed calculation: 40 WPM base estimate
    this.estimatedDuration = Math.max(Math.round((this.wordCount / 40) * 60), 30);
  }
  next();
});

export const TypingContent = mongoose.model('TypingContent', typingContentSchema);
