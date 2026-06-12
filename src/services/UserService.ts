import { User } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { ApiError } from '../utils/response';
import { IUser } from '../types';

export class UserService {
  async register(name: string, email: string, password: string, role: string = 'customer'): Promise<{ user: IUser; token: string }> {
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ApiError('Email already registered', 400);
      }

      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role as any,
      });

      const userWithoutPassword = user.toJSON() as any;
      delete userWithoutPassword.password;

      return { user: userWithoutPassword, token };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Registration failed', 500);
    }
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new ApiError('Invalid email or password', 401);
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new ApiError('Account is disabled', 403);
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role as any,
      });

      const userWithoutPassword = user.toJSON() as any;
      delete userWithoutPassword.password;

      return { user: userWithoutPassword, token };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Login failed', 500);
    }
  }

  async getUserById(id: number): Promise<IUser> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    const userWithoutPassword = user.toJSON() as any;
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async getAllWaiters(): Promise<IUser[]> {
    const waiters = await User.findAll({ where: { role: 'waiter' } });
    return waiters.map(w => {
      const waiter = w.toJSON() as any;
      delete waiter.password;
      return waiter;
    });
  }

  async createWaiter(name: string, email: string, password: string): Promise<IUser> {
    return (await this.register(name, email, password, 'waiter')).user;
  }

  async getAllChefs(): Promise<IUser[]> {
    const { Op } = require('sequelize');
    const chefs = await User.findAll({
      where: { role: { [Op.in]: ['head_chef', 'pastry_chef'] } },
      order: [['name', 'ASC']],
    });
    return chefs.map(c => {
      const chef = c.toJSON() as any;
      delete chef.password;
      return chef;
    });
  }

  async createChef(name: string, email: string, password: string, role: 'head_chef' | 'pastry_chef'): Promise<IUser> {
    return (await this.register(name, email, password, role)).user;
  }

  async updateStaff(id: number, name: string, email: string): Promise<IUser> {
    const user = await User.findByPk(id);
    if (!user) throw new ApiError('User not found', 404);
    user.name = name;
    user.email = email;
    await user.save();
    const result = user.toJSON() as any;
    delete result.password;
    return result;
  }

  async toggleActive(id: number): Promise<IUser> {
    const user = await User.findByPk(id);
    if (!user) throw new ApiError('User not found', 404);
    user.isActive = !user.isActive;
    await user.save();
    const result = user.toJSON() as any;
    delete result.password;
    return result;
  }

  async updateWaiter(id: number, name: string, email: string): Promise<IUser> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('Waiter not found', 404);
    }

    user.name = name;
    user.email = email;
    await user.save();

    const userWithoutPassword = user.toJSON() as any;
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async disableWaiter(id: number): Promise<IUser> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('Waiter not found', 404);
    }

    user.isActive = false;
    await user.save();

    const userWithoutPassword = user.toJSON() as any;
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
  }
}

export default new UserService();
