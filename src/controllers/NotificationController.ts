import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import NotificationService from '../services/NotificationService';
import ZoneService from '../services/ZoneService';
import { emitNotification } from '../socket/socketHandler';
import { AuthRequest } from '../types';
import { User, Table } from '../models';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const unreadOnly = req.query.unread === 'true';
      const notifications = await NotificationService.getNotifications(req.user.id, unreadOnly);
      sendSuccess(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(parseInt(id));
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      await NotificationService.markAllAsRead(req.user.id);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await NotificationService.deleteNotification(parseInt(id));
      sendSuccess(res, null, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const count = await NotificationService.getUnreadCount(req.user.id);
      sendSuccess(res, { count }, 'Unread count retrieved');
    } catch (error) {
      next(error);
    }
  }

  async callWaiter(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber } = req.body;
      if (!tableNumber) return sendError(res, 'Table number is required', 400);

      const table = await Table.findOne({ where: { tableNumber: parseInt(tableNumber) } });

      if (!table) {
        return sendError(res, `Table #${tableNumber} not found`, 404);
      }

      // Zone-aware routing
      const { zone, waiters: zoneWaiters } = await ZoneService.getZoneWaitersForTable(table.id);

      if (zoneWaiters.length > 0) {
        // Notify all zone waiters directly — no admin involvement needed
        const zoneName = zone?.name ?? '';
        const message = `Table #${tableNumber}${zoneName ? ` (${zoneName})` : ''} is calling for service`;
        for (const waiter of zoneWaiters) {
          const notif = await NotificationService.createNotification(waiter.id, message, 'call_waiter_direct', {
            tableNumber: parseInt(tableNumber),
            tableId: table.id,
            zoneName,
            zoneId: zone?.id ?? null,
          });
          emitNotification(waiter.id, notif);
        }
      } else {
        // No zone waiter — alert admin so they can dispatch manually
        const zoneName = zone?.name ?? null;
        const note = zone
          ? `Zone "${zone.name}" has no assigned waiter`
          : 'Table has no zone configured';
        const message = `Table #${tableNumber} needs service — ${note}`;
        const metadata = {
          tableNumber: parseInt(tableNumber),
          tableId: table.id,
          zoneName,
          zoneId: zone?.id ?? null,
          needsDispatch: true,
        };
        const admins = await User.findAll({ where: { role: 'admin', isActive: true } });
        for (const admin of admins) {
          const notif = await NotificationService.createNotification(admin.id, message, 'call_waiter', metadata);
          emitNotification(admin.id, notif);
        }
      }

      sendSuccess(res, null, 'Waiter call sent successfully');
    } catch (error) {
      next(error);
    }
  }

  async dispatchWaiter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { waiterId, tableNumber, tableId, zoneName, zoneId } = req.body;

      if (!waiterId || !tableNumber) {
        return sendError(res, 'Waiter ID and table number are required', 400);
      }

      const waiter = await User.findByPk(parseInt(waiterId));
      if (!waiter || waiter.role !== 'waiter' || !waiter.isActive) {
        return sendError(res, 'Active waiter not found', 404);
      }

      const message = `Please go to Table #${tableNumber}${zoneName ? ` (${zoneName})` : ''} — a customer is waiting for service`;
      const notif = await NotificationService.createNotification(
        parseInt(waiterId),
        message,
        'dispatch',
        { tableNumber, tableId: tableId ?? null, zoneName: zoneName ?? null, zoneId: zoneId ?? null }
      );
      emitNotification(parseInt(waiterId), notif);

      sendSuccess(res, null, `${waiter.name} has been dispatched to Table #${tableNumber}`);
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
