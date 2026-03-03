import { Request, Response, NextFunction } from 'express';
import { PlanningService } from '../services/planning.service';
import { AuthRequest } from '../middleware/auth.middleware';

const planningService = new PlanningService();

export const createPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await planningService.createWeeklyPlan(req.body);
    res.status(201).json({
      status: 'success',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

export const freezePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await planningService.freezePlan(req.params.id as string);
    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await planningService.getCurrentPlan();
    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};
