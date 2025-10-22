import express from 'express';
import {
  getQuote,
  getMultipleQuotes,
  getTesouroDireto
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/quote/:ticker', getQuote);
router.post('/quotes', getMultipleQuotes);
router.get('/tesouro-direto', getTesouroDireto);

export default router;
