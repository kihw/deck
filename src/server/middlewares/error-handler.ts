import { Request, Response, NextFunction } from 'express';

export class HttpException extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export function errorHandler(
  error: HttpException, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';

  res.status(status).json({
    status,
    message
  });
}