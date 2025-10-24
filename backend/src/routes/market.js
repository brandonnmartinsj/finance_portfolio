import express from 'express';
import {
  getQuote,
  getMultipleQuotes,
  getTesouroDireto,
  getFundamentals,
  getHistorical,
  getDividends,
  getStatistics,
  getFundamentusData,
  getFundamentusDividends,
  searchSymbol,
  getSplits
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/quote/:ticker', getQuote);
router.post('/quotes', getMultipleQuotes);
router.get('/tesouro-direto', getTesouroDireto);
router.get('/search', searchSymbol);
router.get('/fundamentals/:ticker', getFundamentals);
router.get('/historical/:ticker', getHistorical);
router.get('/dividends/:ticker', getDividends);
router.get('/splits/:ticker', getSplits);
router.get('/statistics/:ticker', getStatistics);
router.get('/fundamentus/:ticker', getFundamentusData);
router.get('/fundamentus-dividends/:ticker', getFundamentusDividends);

export default router;
