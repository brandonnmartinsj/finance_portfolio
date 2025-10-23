import express from 'express';
import multer from 'multer';
import { uploadAndParsePDF, importTransactions, importCSV } from '../controllers/importController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configurar multer para armazenar em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

router.use(authenticateToken);

// Upload e parse de PDF (retorna preview)
router.post('/pdf/parse', upload.single('file'), uploadAndParsePDF);

// Upload e parse de CSV (retorna preview)
router.post('/csv/parse', upload.single('file'), importCSV);

// Importar transações validadas
router.post('/transactions', importTransactions);

export default router;
