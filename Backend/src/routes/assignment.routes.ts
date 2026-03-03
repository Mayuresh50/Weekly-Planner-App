import express from 'express';
import * as assignmentController from '../controllers/assignment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', assignmentController.assignTaskNode);
router.patch('/:id/progress', assignmentController.updateProgress);

export default router;
