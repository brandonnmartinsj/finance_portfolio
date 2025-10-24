import express from 'express';
import {
  getAllLayouts,
  getActiveLayout,
  getLayoutById,
  createLayout,
  updateLayout,
  setActiveLayout,
  deleteLayout
} from '../controllers/dashboardLayoutController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllLayouts);
router.get('/active', getActiveLayout);
router.get('/:id', getLayoutById);
router.post('/', createLayout);
router.put('/:id', updateLayout);
router.patch('/:id/activate', setActiveLayout);
router.delete('/:id', deleteLayout);

export default router;
