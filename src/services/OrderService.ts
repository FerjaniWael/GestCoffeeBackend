import { Order, OrderItem, Article, Table, User } from '../models';
import { ApiError } from '../utils/response';
import { IOrder } from '../types';

export interface CreateOrderDto {
  tableId: number;
  items: Array<{ articleId: number; quantity: number }>;
}

const ORDER_INCLUDE = [
  { association: 'Table', attributes: ['id', 'tableNumber'] },
  { association: 'Waiter', attributes: ['id', 'name', 'email'] },
  {
    association: 'OrderItems',
    include: [{ association: 'Article', attributes: ['id', 'name', 'description', 'price', 'image', 'chefRole'] }],
  },
];

export class OrderService {
  async createOrder(tableId: number, items: Array<{ articleId: number; quantity: number }>): Promise<IOrder> {
    try {
      const table = await Table.findByPk(tableId);
      if (!table) {
        throw new ApiError('Table not found', 404);
      }

      const order = await Order.create({ tableId, status: 'pending' });

      for (const item of items) {
        const article = await Article.findByPk(item.articleId);
        if (!article) {
          throw new ApiError(`Article ${item.articleId} not found`, 404);
        }
        await OrderItem.create({ orderId: order.id, articleId: item.articleId, quantity: item.quantity });
      }

      return await this.getOrderById(order.id);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create order', 500);
    }
  }

  async getOrders(tableId?: number, status?: string): Promise<IOrder[]> {
    const where: any = {};
    if (tableId) where.tableId = tableId;
    if (status) where.status = status;

    const orders = await Order.findAll({
      where,
      include: ORDER_INCLUDE,
      order: [['createdAt', 'DESC']],
    });

    return orders.map(o => o.toJSON() as IOrder);
  }

  async getOrderById(id: number): Promise<IOrder> {
    const order = await Order.findByPk(id, { include: ORDER_INCLUDE });

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    return order.toJSON() as IOrder;
  }

  async updateOrderStatus(id: number, status: 'pending' | 'in_progress' | 'served' | 'completed'): Promise<IOrder> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    order.status = status;
    await order.save();

    return await this.getOrderById(id);
  }

  // Set the assigned waiter without changing order status (used for zone auto-assignment)
  async setOrderWaiter(orderId: number, waiterId: number): Promise<IOrder> {
    const order = await Order.findByPk(orderId);
    if (!order) throw new ApiError('Order not found', 404);

    const waiter = await User.findByPk(waiterId);
    if (!waiter || waiter.role !== 'waiter') throw new ApiError('Waiter not found', 404);

    order.assignedWaiterId = waiterId;
    await order.save();
    return await this.getOrderById(orderId);
  }

  async assignOrderToWaiter(orderId: number, waiterId: number): Promise<IOrder> {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    const waiter = await User.findByPk(waiterId);
    if (!waiter || waiter.role !== 'waiter') {
      throw new ApiError('Waiter not found', 404);
    }

    order.assignedWaiterId = waiterId;
    order.status = 'in_progress';
    await order.save();

    return await this.getOrderById(orderId);
  }

  async completeOrder(id: number): Promise<IOrder> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    order.status = 'completed';
    await order.save();

    return await this.getOrderById(id);
  }

  async deleteOrder(id: number): Promise<void> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    await OrderItem.destroy({ where: { orderId: id } });
    await order.destroy();
  }

  async getWaiterOrders(waiterId: number): Promise<IOrder[]> {
    const orders = await Order.findAll({
      where: { assignedWaiterId: waiterId },
      include: ORDER_INCLUDE,
      order: [['createdAt', 'DESC']],
    });

    return orders.map(o => o.toJSON() as IOrder);
  }
}

export default new OrderService();
