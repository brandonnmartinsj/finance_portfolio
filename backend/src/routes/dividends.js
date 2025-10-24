import express from 'express';
import {
  getAllDividends,
  getDividendById,
  createDividend,
  updateDividend,
  deleteDividend,
  getDividendSummary,
  getMonthlyDividends,
  getYearlyDividends,
  syncDividends
} from '../controllers/dividendController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllDividends);
router.get('/summary', getDividendSummary);
router.get('/monthly', getMonthlyDividends);
router.get('/yearly', getYearlyDividends);
router.post('/sync', syncDividends);
router.get('/:id', getDividendById);
router.post('/', createDividend);
router.put('/:id', updateDividend);
router.delete('/:id', deleteDividend);

export default router;
