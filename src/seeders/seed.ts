import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';
import { User, Category, Article, Table } from '../models';
import { hashPassword } from '../utils/auth';
import { generateQRCode } from '../utils/qrcode';

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect and sync
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ force: true });
    console.log('✅ Database tables created (force sync).\n');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@coffee.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });
    console.log('👤 Admin user created: admin@coffee.com / admin123');

    // Create waiter users
    const waiterPassword = await hashPassword('waiter123');
    const waiter1 = await User.create({
      name: 'John Waiter',
      email: 'john@coffee.com',
      password: waiterPassword,
      role: 'waiter',
      isActive: true,
    });
    const waiter2 = await User.create({
      name: 'Sarah Waiter',
      email: 'sarah@coffee.com',
      password: waiterPassword,
      role: 'waiter',
      isActive: true,
    });
    console.log('👤 Waiter users created: john@coffee.com / waiter123, sarah@coffee.com / waiter123\n');

    // Create categories
    const categories = await Promise.all([
      Category.create({ name: 'Coffee', active: true }),
      Category.create({ name: 'Drinks', active: true }),
      Category.create({ name: 'Desserts', active: true }),
      Category.create({ name: 'Sandwiches', active: true }),
      Category.create({ name: 'Pizza', active: true }),
    ]);
    console.log('📂 Categories created: Coffee, Drinks, Desserts, Sandwiches, Pizza');

    // Create articles
    const coffeeCategory = categories[0];
    const drinksCategory = categories[1];
    const dessertsCategory = categories[2];
    const sandwichesCategory = categories[3];
    const pizzaCategory = categories[4];

    await Promise.all([
      // Coffee
      Article.create({ categoryId: coffeeCategory.id, name: 'Espresso', description: 'Strong Italian coffee shot', price: 2.50, active: true }),
      Article.create({ categoryId: coffeeCategory.id, name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 3.50, active: true }),
      Article.create({ categoryId: coffeeCategory.id, name: 'Latte', description: 'Espresso with lots of steamed milk', price: 4.00, active: true }),
      Article.create({ categoryId: coffeeCategory.id, name: 'Americano', description: 'Espresso diluted with hot water', price: 3.00, active: true }),
      Article.create({ categoryId: coffeeCategory.id, name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 4.50, active: true }),

      // Drinks
      Article.create({ categoryId: drinksCategory.id, name: 'Water', description: 'Still mineral water 500ml', price: 1.50, active: true }),
      Article.create({ categoryId: drinksCategory.id, name: 'Coca Cola', description: 'Classic Coca Cola 330ml', price: 2.50, active: true }),
      Article.create({ categoryId: drinksCategory.id, name: 'Orange Juice', description: 'Freshly squeezed orange juice', price: 3.50, active: true }),
      Article.create({ categoryId: drinksCategory.id, name: 'Lemonade', description: 'Homemade fresh lemonade', price: 3.00, active: true }),

      // Desserts
      Article.create({ categoryId: dessertsCategory.id, name: 'Tiramisu', description: 'Classic Italian tiramisu', price: 5.50, active: true }),
      Article.create({ categoryId: dessertsCategory.id, name: 'Cheesecake', description: 'New York style cheesecake', price: 5.00, active: true }),
      Article.create({ categoryId: dessertsCategory.id, name: 'Chocolate Cake', description: 'Rich dark chocolate cake', price: 4.50, active: true }),

      // Sandwiches
      Article.create({ categoryId: sandwichesCategory.id, name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, lettuce', price: 7.50, active: true }),
      Article.create({ categoryId: sandwichesCategory.id, name: 'BLT', description: 'Bacon, lettuce, and tomato', price: 6.00, active: true }),
      Article.create({ categoryId: sandwichesCategory.id, name: 'Grilled Cheese', description: 'Melted cheddar on sourdough', price: 5.00, active: true }),

      // Pizza
      Article.create({ categoryId: pizzaCategory.id, name: 'Margherita', description: 'Tomato, mozzarella, fresh basil', price: 9.00, active: true }),
      Article.create({ categoryId: pizzaCategory.id, name: 'Pepperoni', description: 'Classic pepperoni with mozzarella', price: 10.00, active: true }),
      Article.create({ categoryId: pizzaCategory.id, name: 'Hawaiian', description: 'Ham and pineapple with mozzarella', price: 10.50, active: true }),
    ]);
    console.log('📦 Articles created: 18 items across 5 categories');

    // Create tables with QR codes
    for (let i = 1; i <= 8; i++) {
      const qrCode = await generateQRCode(i);
      await Table.create({
        tableNumber: i,
        qrCode,
      });
    }
    console.log('🪑 Tables created: 8 tables with QR codes\n');

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@coffee.com / admin123');
    console.log('   Waiter: john@coffee.com / waiter123');
    console.log('   Waiter: sarah@coffee.com / waiter123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
