import { Category } from '../models';
import { ApiError } from '../utils/response';
import { ICategory } from '../types';

export class CategoryService {
  async createCategory(name: string): Promise<ICategory> {
    try {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        throw new ApiError('Category already exists', 400);
      }

      const category = await Category.create({
        name,
        active: true,
      });

      return category.toJSON() as ICategory;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create category', 500);
    }
  }

  async getCategories(active?: boolean): Promise<ICategory[]> {
    const where: any = {};
    if (active !== undefined) {
      where.active = active;
    }

    const categories = await Category.findAll({ where });
    return categories.map(c => c.toJSON() as ICategory);
  }

  async getCategoryById(id: number): Promise<ICategory> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
    return category.toJSON() as ICategory;
  }

  async updateCategory(id: number, name: string): Promise<ICategory> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    category.name = name;
    await category.save();

    return category.toJSON() as ICategory;
  }

  async toggleCategory(id: number): Promise<ICategory> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    category.active = !category.active;
    await category.save();

    return category.toJSON() as ICategory;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    await category.destroy();
  }
}

export default new CategoryService();
