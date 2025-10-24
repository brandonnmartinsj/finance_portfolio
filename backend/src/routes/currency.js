import express from 'express';
import { getExchangeRate, convertCurrency } from '../controllers/currencyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/exchange-rate', getExchangeRate);
router.post('/convert', convertCurrency);

export default router;
