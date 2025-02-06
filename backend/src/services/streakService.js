import { User } from '../models/User.js';
import { Status } from '../models/Status.js';
import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import { ApiError } from '../helpers/errors/ApiError.js';

export const STREAK_THRESHOLDS = {
  BRONZE: 7,
  SILVER: 30,
  GOLD: 100,
  PLATINUM: 365
};

const updateBadges = async (user) => {
  const streak = user.currentStreak;
  const newBadges = [];

  if (streak >= STREAK_THRESHOLDS.PLATINUM && !user.badges.includes('PLATINUM')) {
    newBadges.push('PLATINUM');
  } else if (streak >= STREAK_THRESHOLDS.GOLD && !user.badges.includes('GOLD')) {
    newBadges.push('GOLD');
  } else if (streak >= STREAK_THRESHOLDS.SILVER && !user.badges.includes('SILVER')) {
    newBadges.push('SILVER');
  } else if (streak >= STREAK_THRESHOLDS.BRONZE && !user.badges.includes('BRONZE')) {
    newBadges.push('BRONZE');
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    
    const notifications = [];

    if (user.email) {
      notifications.push(
        sendEmail({
          to: user.email,
          template: 'streakUpdate',
          data: {
            username: user.username,
            streakCount: streak
          }
        })
      );
    }

    if (user.phone) {
      notifications.push(
        sendSMS({
          to: user.phone,
          template: 'streakReminder',
          data: streak
        })
      );
    }

    await Promise.all(notifications);
  }
};

export const calculateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayStatus, yesterdayStatus] = await Promise.all([
      Status.findOne({
        userId,
        createdAt: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }),
      Status.findOne({
        userId,
        createdAt: {
          $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          $lt: new Date(yesterday.setHours(23, 59, 59, 999))
        }
      })
    ]);

    if (todayStatus) {
      user.lastActive = new Date();
      user.currentStreak = yesterdayStatus ? user.currentStreak + 1 : 1;
    } else if (!yesterdayStatus) {
      user.currentStreak = 0;
    }

    if (user.currentStreak > user.highestStreak) {
      user.highestStreak = user.currentStreak;
      await updateBadges(user);
    }

    await user.save();
    return user.currentStreak;
  } catch (error) {
    throw new ApiError(500, 'Failed to calculate streak');
  }
};

export const checkStreakRisk = async () => {
  const riskUsers = await User.find({
    currentStreak: { $gt: 0 },
    lastActive: {
      $lt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      $gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });

  const notifications = riskUsers.flatMap(user => {
    if (!user.streakNotifications) return [];

    const userNotifications = [];
    
    if (user.email) {
      userNotifications.push(
        sendEmail({
          to: user.email,
          template: 'streakUpdate',
          data: {
            username: user.username,
            streakCount: user.currentStreak
          }
        })
      );
    }

    if (user.phone) {
      userNotifications.push(
        sendSMS({
          to: user.phone,
          template: 'streakReminder',
          data: user.currentStreak
        })
      );
    }

    return userNotifications;
  });

  await Promise.all(notifications);
};