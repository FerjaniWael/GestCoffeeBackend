import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Table from './Table';
import User from './User';

class Order extends Model {
  public id!: number;
  public tableId!: number;
  public status!: 'pending' | 'in_progress' | 'served' | 'completed';
  public assignedWaiterId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Table,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'served', 'completed'),
      defaultValue: 'pending',
    },
    assignedWaiterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  }
);

Order.belongsTo(Table, { foreignKey: 'tableId', as: 'Table' });
Order.belongsTo(User, { foreignKey: 'assignedWaiterId', as: 'Waiter' });
Table.hasMany(Order, { foreignKey: 'tableId', as: 'Orders' });

export default Order;
