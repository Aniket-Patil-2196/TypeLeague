import { Notification } from '../models/notification.model.js';

export const createNotification = async ({ userId, type, title, message, link = '', io = null }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }

  return notification;
};

export const getUserNotifications = async (userId) => {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(30);
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};
