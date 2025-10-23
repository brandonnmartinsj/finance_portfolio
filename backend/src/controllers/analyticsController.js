import Transaction from '../models/Transaction.js';
import MarketDataService from '../services/marketDataService.js';

/**
 * Retorna evolução patrimonial ao longo do tempo
 * Calcula valor investido vs valor atual para cada data
 */
export const getPortfolioEvolution = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = Transaction.getAll(userId);

    if (transactions.length === 0) {
      return res.json([]);
    }

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    const tickers = [...new Set(transactions.map(t => t.ticker))];
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    const evolutionData = [];
    const holdings = {};
    let totalInvested = 0;

    sortedTransactions.forEach(tx => {
      if (!holdings[tx.ticker]) {
        holdings[tx.ticker] = { quantity: 0, totalCost: 0 };
      }

      if (tx.type === 'BUY') {
        holdings[tx.ticker].quantity += tx.quantity;
        holdings[tx.ticker].totalCost += (tx.quantity * tx.price) + (tx.fees || 0);
        totalInvested += (tx.quantity * tx.price) + (tx.fees || 0);
      } else {
        const avgPrice = holdings[tx.ticker].quantity > 0
          ? holdings[tx.ticker].totalCost / holdings[tx.ticker].quantity
          : 0;
        holdings[tx.ticker].quantity -= tx.quantity;
        holdings[tx.ticker].totalCost -= tx.quantity * avgPrice;
        totalInvested -= tx.quantity * avgPrice;
      }

      let currentValue = 0;
      Object.keys(holdings).forEach(ticker => {
        const holding = holdings[ticker];
        if (holding.quantity > 0 && priceMap[ticker]) {
          currentValue += holding.quantity * priceMap[ticker];
        }
      });

      evolutionData.push({
        date: tx.date,
        invested: parseFloat(totalInvested.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat((currentValue - totalInvested).toFixed(2))
      });
    });

    res.json(evolutionData);
  } catch (error) {
    console.error('Error calculating portfolio evolution:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna distribuição do portfólio por ativo individual
 */
export const getAssetDistribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = Transaction.getPortfolioSummary(userId);

    if (summary.length === 0) {
      return res.json([]);
    }

    const tickers = summary.map(s => s.ticker);
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    const distribution = summary
      .map(item => ({
        ticker: item.ticker,
        name: item.ticker,
        type: item.asset_type,
        value: priceMap[item.ticker] ? item.total_quantity * priceMap[item.ticker] : 0,
        quantity: item.total_quantity,
        invested: item.total_invested
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    res.json(distribution);
  } catch (error) {
    console.error('Error calculating asset distribution:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna distribuição por tipo de ativo (ações, FIIs, cripto, renda fixa)
 */
export const getAssetTypeDistribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = Transaction.getPortfolioSummary(userId);

    if (summary.length === 0) {
      return res.json([]);
    }

    const tickers = summary.map(s => s.ticker);
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    const typeMap = {};
    summary.forEach(item => {
      const currentPrice = priceMap[item.ticker];
      if (!currentPrice || item.total_quantity <= 0) return;

      const value = item.total_quantity * currentPrice;
      const type = item.asset_type;

      if (!typeMap[type]) {
        typeMap[type] = {
          type,
          value: 0,
          count: 0
        };
      }

      typeMap[type].value += value;
      typeMap[type].count += 1;
    });

    const distribution = Object.values(typeMap)
      .sort((a, b) => b.value - a.value);

    res.json(distribution);
  } catch (error) {
    console.error('Error calculating asset type distribution:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna performance individual de cada ativo
 * Com ganhos/perdas realizados e não realizados
 */
export const getTopPerformers = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = Transaction.getPortfolioSummary(userId);

    if (summary.length === 0) {
      return res.json([]);
    }

    const tickers = summary.map(s => s.ticker);
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    const performers = summary
      .map(item => {
        const currentPrice = priceMap[item.ticker];
        if (!currentPrice || item.total_quantity <= 0) return null;

        const currentValue = item.total_quantity * currentPrice;
        const invested = item.total_invested;
        const profitLoss = currentValue - invested;
        const percentGain = (profitLoss / invested) * 100;

        return {
          ticker: item.ticker,
          type: item.asset_type,
          quantity: item.total_quantity,
          invested: parseFloat(invested.toFixed(2)),
          currentValue: parseFloat(currentValue.toFixed(2)),
          profitLoss: parseFloat(profitLoss.toFixed(2)),
          percentGain: parseFloat(percentGain.toFixed(2)),
          currentPrice: parseFloat(currentPrice.toFixed(2))
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => b.percentGain - a.percentGain);

    res.json(performers);
  } catch (error) {
    console.error('Error calculating top performers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna resumo consolidado de métricas do portfólio
 */
export const getPortfolioMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = Transaction.getPortfolioSummary(userId);

    if (summary.length === 0) {
      return res.json({
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        percentGain: 0,
        assetCount: 0,
        typeDistribution: {}
      });
    }

    const tickers = summary.map(s => s.ticker);
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    let totalInvested = 0;
    let currentValue = 0;
    const typeDistribution = {};

    summary.forEach(item => {
      const price = priceMap[item.ticker];
      if (!price || item.total_quantity <= 0) return;

      const itemValue = item.total_quantity * price;
      totalInvested += item.total_invested;
      currentValue += itemValue;

      const type = item.asset_type;
      if (!typeDistribution[type]) {
        typeDistribution[type] = { count: 0, value: 0 };
      }
      typeDistribution[type].count += 1;
      typeDistribution[type].value += itemValue;
    });

    const totalProfitLoss = currentValue - totalInvested;
    const percentGain = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    res.json({
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      percentGain: parseFloat(percentGain.toFixed(2)),
      assetCount: summary.filter(s => s.total_quantity > 0).length,
      typeDistribution
    });
  } catch (error) {
    console.error('Error calculating portfolio metrics:', error);
    res.status(500).json({ error: error.message });
  }
};
