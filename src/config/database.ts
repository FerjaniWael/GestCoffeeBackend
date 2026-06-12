import { Sequelize, Dialect } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
const dialect = (process.env.DB_DIALECT || 'mysql') as Dialect;

const poolConfig = { max: 5, min: 0, acquire: 30000, idle: 10000 };

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, { logging: false, pool: poolConfig })
  : dialect === 'sqlite'
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
          pool: poolConfig,
        }
      );

export default sequelize;
