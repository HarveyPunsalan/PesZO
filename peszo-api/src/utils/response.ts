export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface SuccessResponseWithStatus<T> extends SuccessResponse<T> {
  statusCode: number;
}

export const successResponse = <T>(data: T, statusCode: number = 200): SuccessResponseWithStatus<T> => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};
