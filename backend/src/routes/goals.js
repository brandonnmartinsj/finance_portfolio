import express from 'express';
import {
  getAllGoals,
  getActiveGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress
} from '../controllers/goalsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllGoals);
router.get('/active', getActiveGoals);
router.get('/:id', getGoalById);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/progress', updateGoalProgress);

export default router;
