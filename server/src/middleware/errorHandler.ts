import { Request, Response, NextFunction } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  if (err instanceof PrismaClientInitializationError) {
    console.error('Prisma (DB unavailable):', err.message);
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    console.error('Prisma:', err.code, err.message);
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
};
