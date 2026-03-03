import express from 'express';
import * as backlogController from '../controllers/backlog.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(backlogController.getAllItems)
  .post(restrictTo('TEAM_LEAD'), backlogController.createItem);

router
  .route('/:id')
  .get(backlogController.getItem)
  .patch(restrictTo('TEAM_LEAD'), backlogController.updateItem)
  .delete(restrictTo('TEAM_LEAD'), backlogController.deleteItem);

export default router;
