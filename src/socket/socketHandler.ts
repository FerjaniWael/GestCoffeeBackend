import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocket = (socketServer: Server): void => {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join role-based rooms
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Admin joins admin room
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    // Waiter joins their personal room
    socket.on('join-waiter', (waiterId: number) => {
      socket.join(`waiter-${waiterId}`);
      console.log(`Socket ${socket.id} joined waiter-${waiterId} room`);
    });

    // Chef joins role-based kitchen room
    socket.on('join-chef', (chefRole: string) => {
      socket.join(`chef-${chefRole}`);
      console.log(`Socket ${socket.id} joined chef-${chefRole} room`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit to admin room when new order is placed
export const emitNewOrder = (orderData: any): void => {
  if (io) {
    io.to('admin').emit('new-order', orderData);
  }
};

// Emit to specific waiter when order is assigned
export const emitOrderAssigned = (waiterId: number, orderData: any): void => {
  if (io) {
    io.to(`waiter-${waiterId}`).emit('order-assigned', orderData);
  }
};

// Emit order status update to admin and assigned waiter
export const emitOrderStatusUpdate = (orderData: any): void => {
  if (io) {
    io.to('admin').emit('order-status-update', orderData);
    if (orderData.assignedWaiterId) {
      io.to(`waiter-${orderData.assignedWaiterId}`).emit('order-status-update', orderData);
    }
  }
};

// Emit notification to specific user
export const emitNotification = (userId: number, notification: any): void => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
};

// Emit new kitchen ticket to all chefs of a given role
export const emitKitchenNewTicket = (chefRole: string, ticketData: any): void => {
  if (io) {
    io.to(`chef-${chefRole}`).emit('kitchen-new-ticket', ticketData);
  }
};

// Emit ticket status update to chefs of a role
export const emitKitchenTicketUpdate = (chefRole: string, ticketData: any): void => {
  if (io) {
    io.to(`chef-${chefRole}`).emit('kitchen-ticket-update', ticketData);
  }
};
