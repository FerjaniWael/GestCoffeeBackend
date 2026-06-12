import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';

class KitchenTicket extends Model {
  public id!: number;
  public orderId!: number;
  public chefRole!: string;
  public status!: 'pending' | 'cooking' | 'ready';
  public tableNumber!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KitchenTicket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chefRole: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'cooking', 'ready'),
      allowNull: false,
      defaultValue: 'pending',
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'KitchenTicket',
    tableName: 'kitchen_tickets',
    timestamps: true,
  }
);

KitchenTicket.belongsTo(Order, { foreignKey: 'orderId', as: 'Order' });
Order.hasMany(KitchenTicket, { foreignKey: 'orderId', as: 'KitchenTickets' });

export default KitchenTicket;
