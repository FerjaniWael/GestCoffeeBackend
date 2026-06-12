import { Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import KitchenService from '../services/KitchenService';
import NotificationService from '../services/NotificationService';
import { emitKitchenTicketUpdate, emitNotification } from '../socket/socketHandler';
import { AuthRequest } from '../types';
import { Order, User } from '../models';

export class KitchenController {
  async getMyTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const tickets = await KitchenService.getTicketsForChef(req.user.role);
      sendSuccess(res, tickets, 'Kitchen tickets retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateTicketStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['cooking', 'ready'].includes(status)) {
        return sendError(res, 'Status must be "cooking" or "ready"', 400);
      }

      const ticket = await KitchenService.updateTicketStatus(parseInt(id), status, req.user.role);

      // Broadcast the status update to all chefs of this role
      emitKitchenTicketUpdate(ticket.chefRole, ticket);

      if (status === 'ready') {
        const chefLabel = ticket.chefRole === 'head_chef' ? 'Head Chef' : 'Pastry Chef';
        const order = await Order.findByPk(ticket.orderId);

        if (order?.assignedWaiterId) {
          const msg = `Table #${ticket.tableNumber} — order is ready to be served (${chefLabel})`;
          const notif = await NotificationService.createNotification(
            order.assignedWaiterId,
            msg,
            'kitchen_ready',
            { ticketId: ticket.id, orderId: ticket.orderId, tableNumber: ticket.tableNumber, chefRole: ticket.chefRole }
          );
          emitNotification(order.assignedWaiterId, notif);
        } else {
          // No waiter assigned — notify admins
          const admins = await User.findAll({ where: { role: 'admin', isActive: true } });
          for (const admin of admins) {
            const msg = `Table #${ticket.tableNumber} order is ready (${chefLabel}) — no waiter assigned`;
            const notif = await NotificationService.createNotification(
              admin.id,
              msg,
              'kitchen_ready',
              { ticketId: ticket.id, tableNumber: ticket.tableNumber, chefRole: ticket.chefRole }
            );
            emitNotification(admin.id, notif);
          }
        }
      }

      sendSuccess(res, ticket, `Ticket marked as ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

export default new KitchenController();
