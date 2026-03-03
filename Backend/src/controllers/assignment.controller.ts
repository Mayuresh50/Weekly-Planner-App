import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { AuthRequest } from '../middleware/auth.middleware';

const assignmentService = new AssignmentService();

export const assignTaskNode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await assignmentService.assignTask({
      ...req.body,
      userId: req.user?.id
    });
    res.status(201).json({
      status: 'success',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await assignmentService.updateProgress(
      req.params.id as string,
      req.body.progressPercentage,
      req.user?.id as string,
      req.user?.role as string
    );
    res.status(200).json({
      status: 'success',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};
