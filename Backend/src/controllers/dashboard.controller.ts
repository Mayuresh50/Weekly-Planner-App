import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';

const dashboardService = new DashboardService();

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await dashboardService.getWeeklySummary(
      req.params.id as string,
      req.query
    );
    res.status(200).json({
      status: 'success',
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};
