import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import OrderService from '../services/OrderService';
import ZoneService from '../services/ZoneService';
import NotificationService from '../services/NotificationService';
import { emitNewOrder, emitOrderAssigned, emitOrderStatusUpdate } from '../socket/socketHandler';
import { AuthRequest } from '../types';
import { User } from '../models';
import KitchenService from '../services/KitchenService';
import { emitKitchenNewTicket } from '../socket/socketHandler';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId, items } = req.body;

      if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'Table ID and items are required', 400);
      }

      const order = await OrderService.createOrder(parseInt(tableId), items);

      // Zone-aware routing: find zone and its waiters for this table
      try {
        const { zone, waiters: zoneWaiters } = await ZoneService.getZoneWaitersForTable(parseInt(tableId));

        if (zoneWaiters.length > 0) {
          // Assign to the first active zone waiter and notify all zone waiters
          const primaryWaiter = zoneWaiters[0];
          const assignedOrder = await OrderService.setOrderWaiter(order.id, primaryWaiter.id);

          for (const waiter of zoneWaiters) {
            emitOrderAssigned(waiter.id, assignedOrder);
            await NotificationService.createNotification(
              waiter.id,
              `New order from Table #${assignedOrder.Table?.tableNumber ?? tableId} in your zone (${zone.name})`
            );
          }

          // Notify admin — auto-assigned
          emitNewOrder(assignedOrder);
          const admins = await User.findAll({ where: { role: 'admin' } });
          for (const admin of admins) {
            await NotificationService.createNotification(
              admin.id,
              `New order from Table #${assignedOrder.Table?.tableNumber ?? tableId} — auto-assigned to ${primaryWaiter.name} (${zone.name})`
            );
          }

          await createKitchenTickets(assignedOrder);
          return sendSuccess(res, assignedOrder, 'Order created and assigned to zone waiter', 201);
        }

        // Zone exists but has no active waiters — alert admin
        emitNewOrder(order);
        const admins = await User.findAll({ where: { role: 'admin' } });
        const note = zone
          ? `Zone "${zone.name}" has no assigned waiter — please assign manually`
          : 'No zone configured for this table — please assign a waiter';
        for (const admin of admins) {
          await NotificationService.createNotification(
            admin.id,
            `New order from Table #${order.Table?.tableNumber ?? tableId}: ${note}`
          );
        }
      } catch (zoneErr) {
        // Zone lookup error — fall back gracefully
        console.error('Zone lookup failed during order creation:', zoneErr);
        emitNewOrder(order);
        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
          await NotificationService.createNotification(
            admin.id,
            `New order from Table #${order.Table?.tableNumber ?? tableId}`
          );
        }
      }

      // Kitchen routing — create a ticket for each chef role that has items
      await createKitchenTickets(order);

      sendSuccess(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const tableId = req.query.tableId ? parseInt(req.query.tableId as string) : undefined;
      const status = req.query.status as string | undefined;
      const orders = await OrderService.getOrders(tableId, status);
      sendSuccess(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(parseInt(id));
      sendSuccess(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return sendError(res, 'Status is required', 400);
      }

      const validStatuses = ['pending', 'in_progress', 'served', 'completed'];
      if (!validStatuses.includes(status)) {
        return sendError(res, 'Invalid status', 400);
      }

      const order = await OrderService.updateOrderStatus(parseInt(id), status);
      emitOrderStatusUpdate(order);
      sendSuccess(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { waiterId } = req.body;

      if (!waiterId) {
        return sendError(res, 'Waiter ID is required', 400);
      }

      const order = await OrderService.assignOrderToWaiter(parseInt(id), parseInt(waiterId));

      emitOrderAssigned(parseInt(waiterId), order);
      await NotificationService.createNotification(
        parseInt(waiterId),
        `New order assigned: Table #${order.Table?.tableNumber ?? order.tableId}`
      );

      sendSuccess(res, order, 'Order assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async completeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await OrderService.completeOrder(parseInt(id));
      emitOrderStatusUpdate(order);
      sendSuccess(res, order, 'Order completed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await OrderService.deleteOrder(parseInt(id));
      sendSuccess(res, null, 'Order deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWaiterOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      const orders = await OrderService.getWaiterOrders(req.user.id);
      sendSuccess(res, orders, 'Waiter orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();

// Helper: create kitchen tickets for every chef role that has items in the order
async function createKitchenTickets(order: any): Promise<void> {
  try {
    const tickets = await KitchenService.createTicketsForOrder(order);
    for (const { chefRole, ticket } of tickets) {
      // Emit to all online chefs of this role
      emitKitchenNewTicket(chefRole, { ...ticket, Order: order });

      // DB notification for each active chef of this role
      const chefs = await KitchenService.getChefsByRole(chefRole);
      const chefLabel = chefRole === 'head_chef' ? 'Head Chef' : 'Pastry Chef';
      const itemSummary = (order.OrderItems || [])
        .filter((i: any) => i.Article?.chefRole === chefRole)
        .map((i: any) => `${i.quantity}× ${i.Article?.name}`)
        .join(', ');
      for (const chef of chefs) {
        await NotificationService.createNotification(
          chef.id,
          `New order — Table #${ticket.tableNumber}: ${itemSummary}`,
          'kitchen_ticket',
          { ticketId: ticket.id, orderId: order.id, tableNumber: ticket.tableNumber, chefRole }
        );
      }
    }
  } catch (err) {
    console.error('Kitchen ticket creation failed (non-fatal):', err);
  }
}
