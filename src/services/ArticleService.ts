import { Article, Category } from '../models';
import { ApiError } from '../utils/response';
import { IArticle } from '../types';

export class ArticleService {
  async createArticle(
    categoryId: number,
    name: string,
    description: string,
    price: number,
    image?: string,
    chefRole?: string | null
  ): Promise<IArticle> {
    try {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new ApiError('Category not found', 404);
      }

      const article = await Article.create({
        categoryId,
        name,
        description,
        price,
        image,
        active: true,
        chefRole: chefRole ?? null,
      });

      return article.toJSON() as IArticle;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create article', 500);
    }
  }

  async getArticles(categoryId?: number, active?: boolean): Promise<IArticle[]> {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (active !== undefined) where.active = active;

    const articles = await Article.findAll({
      where,
      include: ['category'],
    });

    return articles.map(a => a.toJSON() as IArticle);
  }

  async getArticleById(id: number): Promise<IArticle> {
    const article = await Article.findByPk(id, {
      include: ['category'],
    });
    if (!article) {
      throw new ApiError('Article not found', 404);
    }
    return article.toJSON() as IArticle;
  }

  async updateArticle(
    id: number,
    name?: string,
    description?: string,
    price?: number,
    image?: string,
    categoryId?: number,
    chefRole?: string | null
  ): Promise<IArticle> {
    const article = await Article.findByPk(id);
    if (!article) {
      throw new ApiError('Article not found', 404);
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new ApiError('Category not found', 404);
      }
      article.categoryId = categoryId;
    }

    if (name) article.name = name;
    if (description) article.description = description;
    if (price) article.price = price;
    if (image) article.image = image;
    // chefRole can be set to null (clear it) or a string value
    if (chefRole !== undefined) article.chefRole = chefRole as any;

    await article.save();
    return article.toJSON() as IArticle;
  }

  async toggleArticle(id: number): Promise<IArticle> {
    const article = await Article.findByPk(id);
    if (!article) {
      throw new ApiError('Article not found', 404);
    }

    article.active = !article.active;
    await article.save();

    return article.toJSON() as IArticle;
  }

  async deleteArticle(id: number): Promise<void> {
    const article = await Article.findByPk(id);
    if (!article) {
      throw new ApiError('Article not found', 404);
    }

    await article.destroy();
  }
}

export default new ArticleService();
