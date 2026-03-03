import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1️⃣ Extract token (Case-insensitive check)
    if (
      req.headers.authorization &&
      req.headers.authorization.toLowerCase().startsWith('bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // Clean up potential Swagger UI quirks (literal quotes)
    token = token.replace(/"/g, '');

    // 2️⃣ Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      return next(new AppError('JWT secret is not configured properly.', 500));
    }

    // 3️⃣ Verify token
    // We do this OUTSIDE the main try..catch to isolate specific JWT errors from Prisma errors
    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    } catch (jwtError) {
      console.error('JWT Verification Failed:', jwtError);
      return next(new AppError('Invalid or expired token. Please log in again!', 401));
    }

    // 4️⃣ Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token no longer exists.',
          401
        )
      );
    }

    // 5️⃣ Attach user to request
    req.user = {
      id: currentUser.id,
      role: currentUser.role,
      email: currentUser.email,
    };

    next();
  } catch (error) {
    // If we land here, it is NOT a JWT error. It's likely a database/Prisma error.
    console.error('Auth Middleware Internal Error:', error);
    return next(new AppError('Internal server error during authentication.', 500));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError('You are not authenticated.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};