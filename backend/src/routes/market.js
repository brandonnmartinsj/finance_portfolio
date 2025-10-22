import express from 'express';
import {
  getQuote,
  getMultipleQuotes,
  getTesouroDireto,
  getFundamentals,
  getHistorical,
  getDividends,
  getStatistics
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/quote/:ticker', getQuote);
router.post('/quotes', getMultipleQuotes);
router.get('/tesouro-direto', getTesouroDireto);
router.get('/fundamentals/:ticker', getFundamentals);
router.get('/historical/:ticker', getHistorical);
router.get('/dividends/:ticker', getDividends);
router.get('/statistics/:ticker', getStatistics);

export default router;
