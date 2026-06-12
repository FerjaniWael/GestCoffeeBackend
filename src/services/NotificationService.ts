import { Notification, User } from '../models';
import { ApiError } from '../utils/response';
import { INotification } from '../types';

export class NotificationService {
  async createNotification(
    userId: number,
    message: string,
    type: string = 'system',
    metadata: Record<string, any> | null = null
  ): Promise<INotification> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const notification = await Notification.create({
        userId,
        message,
        read: false,
        type,
        metadata,
      });

      return notification.toJSON() as INotification;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create notification', 500);
    }
  }

  async getNotifications(userId: number, unreadOnly?: boolean): Promise<INotification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return notifications.map(n => n.toJSON() as INotification);
  }

  async markAsRead(notificationId: number): Promise<INotification> {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    notification.read = true;
    await notification.save();

    return notification.toJSON() as INotification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await Notification.update({ read: true }, { where: { userId } });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    await notification.destroy();
  }

  async getUnreadCount(userId: number): Promise<number> {
    const count = await Notification.count({
      where: { userId, read: false },
    });

    return count;
  }
}

export default new NotificationService();
