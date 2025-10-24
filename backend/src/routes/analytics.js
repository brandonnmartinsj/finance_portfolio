import express from 'express';
import {
  getPortfolioEvolution,
  getAssetDistribution,
  getAssetTypeDistribution,
  getTopPerformers,
  getPortfolioMetrics,
  getSectorDistribution,
  getDividendAnalysis,
  getRiskMetrics
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/portfolio-evolution', getPortfolioEvolution);
router.get('/asset-distribution', getAssetDistribution);
router.get('/asset-type-distribution', getAssetTypeDistribution);
router.get('/top-performers', getTopPerformers);
router.get('/portfolio-metrics', getPortfolioMetrics);
router.get('/sector-distribution', getSectorDistribution);
router.get('/dividend-analysis', getDividendAnalysis);
router.get('/risk-metrics', getRiskMetrics);

export default router;
