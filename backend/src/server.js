import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactions.js';
import marketRoutes from './routes/market.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import goalsRoutes from './routes/goals.js';
import importRoutes from './routes/import.js';
import dividendRoutes from './routes/dividends.js';
import dashboardLayoutRoutes from './routes/dashboardLayouts.js';
import currencyRoutes from './routes/currency.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/dividends', dividendRoutes);
app.use('/api/dashboard-layouts', dashboardLayoutRoutes);
app.use('/api/currency', currencyRoutes);

// Rota de status
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance Portfolio API is running' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});
