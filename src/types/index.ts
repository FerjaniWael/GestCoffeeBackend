export interface IUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'waiter' | 'customer' | 'head_chef' | 'pastry_chef';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  id: number;
  name: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IArticle {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  active: boolean;
  chefRole?: 'head_chef' | 'pastry_chef' | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITable {
  id: number;
  tableNumber: number;
  qrCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem {
  id: number;
  orderId: number;
  articleId: number;
  quantity: number;
  Article?: IArticle;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  id: number;
  tableId: number;
  status: 'pending' | 'in_progress' | 'served' | 'completed';
  assignedWaiterId?: number;
  Table?: ITable;
  Waiter?: IUser;
  OrderItems?: IOrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationMetadata {
  tableNumber?: number;
  tableId?: number;
  zoneName?: string | null;
  zoneId?: number | null;
  needsDispatch?: boolean;
}

export interface INotification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  type: string;
  metadata?: INotificationMetadata | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IKitchenTicket {
  id: number;
  orderId: number;
  chefRole: string;
  status: 'pending' | 'cooking' | 'ready';
  tableNumber: number;
  Order?: IOrder;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: 'admin' | 'waiter' | 'customer' | 'head_chef' | 'pastry_chef';
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
