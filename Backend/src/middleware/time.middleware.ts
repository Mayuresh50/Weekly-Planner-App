import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const restrictToWorkingHours = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const now = new Date();
  
  // Convert current time to IST
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  const hours = istTime.getUTCHours();
  
  // 9 AM to 6 PM IST
  if (hours < 9 || hours >= 18) {
    return next(
      new AppError(
        'Requests are only allowed during working hours (9 AM – 6 PM IST).',
        403
      )
    );
  }
  
  next();
};
