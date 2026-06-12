import { Sequelize, Dialect } from 'sequelize';

const dialect = (process.env.DB_DIALECT || 'mysql') as Dialect;

const sequelize = dialect === 'sqlite'
  ? new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
  })
  : new Sequelize(
    process.env.DB_NAME || 'coffee_shop_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

export default sequelize;
