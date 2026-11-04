import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [80, 'Group name cannot exceed 80 characters'],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['College', 'Friends', 'Coding Community', 'Technology', 'General', 'Other'],
      default: 'General',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },
    rules: {
      type: String,
      maxlength: [1000, 'Rules cannot exceed 1000 characters'],
      default: '',
    },
    maxMembers: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    stats: {
      memberCount: {
        type: Number,
        default: 1,
        index: true,
      },
      averageWpm: {
        type: Number,
        default: 0,
      },
      averageAccuracy: {
        type: Number,
        default: 0,
      },
      activeToday: {
        type: Number,
        default: 0,
      },
    },
    announcements: [
      {
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save slug generator
groupSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }
  next();
});

export const Group = mongoose.model('Group', groupSchema);
