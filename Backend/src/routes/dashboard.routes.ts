import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('TEAM_LEAD'));

router.get('/:id/summary', dashboardController.getSummary);

export default router;
