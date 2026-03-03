import express from 'express';
import * as planningController from '../controllers/planning.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/current', planningController.getCurrentPlan);

router.use(restrictTo('TEAM_LEAD'));
router.post('/', planningController.createPlan);
router.patch('/:id/freeze', planningController.freezePlan);

export default router;
