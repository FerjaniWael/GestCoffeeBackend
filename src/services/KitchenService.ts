import { Op } from 'sequelize';
import { KitchenTicket, Order, Table, OrderItem, Article, User } from '../models';
import { ApiError } from '../utils/response';

export class KitchenService {
  // Called after an order is created; creates one ticket per chefRole that has items in the order
  async createTicketsForOrder(order: any): Promise<{ chefRole: string; ticket: any }[]> {
    const results: { chefRole: string; ticket: any }[] = [];

    const chefRoles = new Set<string>();
    for (const item of order.OrderItems || []) {
      const role = item.Article?.chefRole;
      if (role) chefRoles.add(role);
    }

    const tableNum = order.Table?.tableNumber ?? order.tableId;

    for (const chefRole of chefRoles) {
      const ticket = await KitchenTicket.create({
        orderId: order.id,
        chefRole,
        status: 'pending',
        tableNumber: tableNum,
      });
      results.push({ chefRole, ticket: ticket.toJSON() });
    }

    return results;
  }

  async getTicketsForChef(chefRole: string): Promise<any[]> {
    const tickets = await KitchenTicket.findAll({
      where: { chefRole, status: { [Op.in]: ['pending', 'cooking'] } },
      include: [{
        model: Order,
        as: 'Order',
        include: [
          { model: Table, as: 'Table', attributes: ['id', 'tableNumber'] },
          {
            model: OrderItem,
            as: 'OrderItems',
            include: [{ model: Article, as: 'Article', attributes: ['id', 'name', 'price', 'chefRole'] }],
          },
        ],
      }],
      order: [['createdAt', 'ASC']],
    });

    // Filter each ticket's OrderItems to only those belonging to this chef's role
    return tickets.map(t => {
      const json = t.toJSON() as any;
      if (json.Order?.OrderItems) {
        json.Order.OrderItems = json.Order.OrderItems.filter(
          (item: any) => item.Article?.chefRole === chefRole
        );
      }
      return json;
    });
  }

  async getTicketById(id: number): Promise<any> {
    const ticket = await KitchenTicket.findByPk(id, {
      include: [{
        model: Order,
        as: 'Order',
        include: [
          { model: Table, as: 'Table', attributes: ['id', 'tableNumber'] },
          {
            model: OrderItem,
            as: 'OrderItems',
            include: [{ model: Article, as: 'Article', attributes: ['id', 'name', 'price', 'chefRole'] }],
          },
        ],
      }],
    });
    if (!ticket) throw new ApiError('Kitchen ticket not found', 404);
    return ticket.toJSON();
  }

  async updateTicketStatus(id: number, status: 'cooking' | 'ready', requestingChefRole: string): Promise<any> {
    const ticket = await KitchenTicket.findByPk(id);
    if (!ticket) throw new ApiError('Kitchen ticket not found', 404);
    if (ticket.chefRole !== requestingChefRole) {
      throw new ApiError('This ticket does not belong to your role', 403);
    }

    ticket.status = status;
    await ticket.save();
    return ticket.toJSON();
  }

  async getChefsByRole(chefRole: string): Promise<any[]> {
    const chefs = await User.findAll({
      where: { role: chefRole, isActive: true },
      attributes: ['id', 'name', 'email'],
    });
    return chefs.map(c => c.toJSON());
  }
}

export default new KitchenService();
