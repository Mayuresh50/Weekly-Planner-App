import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

// Utility to remove password before sending response
const sanitizeUser = (user: any) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.signup(req.body);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};