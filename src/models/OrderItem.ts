import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import Article from './Article';

class OrderItem extends Model {
  public id!: number;
  public orderId!: number;
  public articleId!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Article,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
  }
);

OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'Order' });
OrderItem.belongsTo(Article, { foreignKey: 'articleId', as: 'Article' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
Article.hasMany(OrderItem, { foreignKey: 'articleId', as: 'OrderItems' });

export default OrderItem;
