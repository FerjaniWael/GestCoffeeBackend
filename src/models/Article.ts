import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

class Article extends Model {
  public id!: number;
  public categoryId!: number;
  public name!: string;
  public description!: string;
  public image?: string;
  public price!: number;
  public active!: boolean;
  public chefRole!: 'head_chef' | 'pastry_chef' | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    chefRole: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'Article',
    tableName: 'articles',
    timestamps: true,
  }
);

Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Article, { foreignKey: 'categoryId', as: 'articles' });

export default Article;
