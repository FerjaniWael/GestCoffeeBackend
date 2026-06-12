import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  statusCode: number;
}

export const sendSuccess = <T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
  });
};

export const sendError = (res: Response, message: string, statusCode: number = 400, errors?: any) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
    statusCode,
  });
};

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
