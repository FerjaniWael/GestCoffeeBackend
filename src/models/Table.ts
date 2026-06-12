import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Table extends Model {
  public id!: number;
  public tableNumber!: number;
  public qrCode!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Table.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Table',
    tableName: 'restaurant_tables',
    timestamps: true,
  }
);

export default Table;
