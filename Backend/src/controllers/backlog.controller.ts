import { Request, Response, NextFunction } from 'express';
import { BacklogService } from '../services/backlog.service';

const backlogService = new BacklogService();

export const getAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await backlogService.getAllBacklogItems(req.query);
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await backlogService.createBacklogItem(req.body);
    res.status(201).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const getItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await backlogService.getBacklogItem(req.params.id as string);
    res.status(200).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await backlogService.updateBacklogItem(req.params.id as string, req.body);
    res.status(200).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await backlogService.deleteBacklogItem(req.params.id as string);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
