import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DataTypes } from 'sequelize';
import path from 'path';
import fs from 'fs';

import sequelize from './config/database';
import { initSocket } from './socket/socketHandler';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import all models to ensure associations are set up
import './models';

// Import routes
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import articleRoutes from './routes/article.routes';
import tableRoutes from './routes/table.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import zoneRoutes from './routes/zone.routes';
import kitchenRoutes from './routes/kitchen.routes';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

initSocket(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/kitchen', kitchenRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Coffee Shop API is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000');

// Add new columns to an existing table only if they are missing.
// Safe alternative to alter:true, which breaks on MySQL ENUM columns.
async function runMigrations() {
  const qi = sequelize.getQueryInterface();

  // notifications: add type + metadata columns
  try {
    const notifCols = await qi.describeTable('notifications');
    if (!notifCols['type']) {
      await qi.addColumn('notifications', 'type', { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'system' });
      console.log('  → notifications.type added');
    }
    if (!notifCols['metadata']) {
      await qi.addColumn('notifications', 'metadata', { type: DataTypes.TEXT, allowNull: true });
      console.log('  → notifications.metadata added');
    }
  } catch (err) {
    console.warn('⚠️  notifications migration warning:', (err as Error).message);
  }

  // articles: add chefRole column
  try {
    const articleCols = await qi.describeTable('articles');
    if (!articleCols['chefRole']) {
      await qi.addColumn('articles', 'chefRole', { type: DataTypes.STRING(50), allowNull: true, defaultValue: null });
      console.log('  → articles.chefRole added');
    }
  } catch (err) {
    console.warn('⚠️  articles migration warning:', (err as Error).message);
  }

  // users: extend role ENUM only if head_chef is not already present
  try {
    const [[colInfo]]: any = await sequelize.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME  = 'users'
         AND COLUMN_NAME = 'role'`
    );
    if (colInfo && !String(colInfo.COLUMN_TYPE).includes('head_chef')) {
      await sequelize.query(
        `ALTER TABLE users MODIFY COLUMN role ENUM('admin','waiter','customer','head_chef','pastry_chef') NOT NULL DEFAULT 'customer'`
      );
      console.log('  → users.role ENUM extended');
    }
  } catch (err) {
    console.warn('⚠️  users role ENUM migration warning:', (err as Error).message);
  }
}

// Start server
const startServer = async () => {
  // Step 1: DB connection — fatal if this fails
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Step 2: Sync models — non-fatal: log the error but keep going so existing
  // tables (users, orders …) continue to work even if a new table can't be created.
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synced successfully.');
  } catch (error) {
    console.error('⚠️  Database sync error (server will still start — check the error below):');
    console.error(error);
  }

  // Step 3: Targeted column/ENUM migrations — MySQL only (INFORMATION_SCHEMA not available on SQLite)
  if (sequelize.getDialect() !== 'sqlite') {
    await runMigrations();
  }

  // Step 4: Start listening
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Coffee Shop API Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO listening on ws://localhost:${PORT}`);
    console.log(`📁 Uploads served from /uploads`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   GET    /api/auth/profile`);
    console.log(`   GET    /api/categories`);
    console.log(`   GET    /api/articles`);
    console.log(`   GET    /api/tables`);
    console.log(`   POST   /api/orders`);
    console.log(`   GET    /api/users/waiters`);
    console.log(`   GET    /api/notifications`);
    console.log(`   GET    /api/zones`);
    console.log(`   GET    /api/health\n`);
  });
};

startServer();

export default app;
