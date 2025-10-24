import Transaction from '../models/Transaction.js';
import MarketDataService from '../services/marketDataService.js';
import SectorService from '../services/sectorService.js';
import Dividend from '../models/Dividend.js';
import BenchmarkService from '../services/benchmarkService.js';

/**
 * Retorna evolução patrimonial ao longo do tempo
 * Calcula valor investido vs valor atual para cada data
 */
export const getPortfolioEvolution = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let transactions = Transaction.getAll(userId);

    if (transactions.length === 0) {
      return res.json([]);
    }

    let sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      sortedTransactions = sortedTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        if (start && txDate < start) return false;
        if (end && txDate > end) return false;
        return true;
      });
    }

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

/**
 * Retorna distribuição do portfólio por setor econômico
 */
export const getSectorDistribution = async (req, res) => {
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

    const sectorDistribution = await SectorService.getSectorDistribution(summary, priceMap);

    res.json(sectorDistribution);
  } catch (error) {
    console.error('Error calculating sector distribution:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna métricas de risco e performance comparativa
 */
export const getRiskMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = Transaction.getPortfolioSummary(userId);

    if (summary.length === 0) {
      return res.json({
        concentration: { top5: 0, top10: 0, herfindahlIndex: 0 },
        volatility: 0,
        benchmarks: {},
        sharpeRatio: null,
        beta: null
      });
    }

    const tickers = summary.map(s => s.ticker);
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    const holdings = summary
      .map(item => ({
        ticker: item.ticker,
        value: (priceMap[item.ticker] || 0) * item.total_quantity,
        invested: item.total_invested
      }))
      .filter(h => h.value > 0)
      .sort((a, b) => b.value - a.value);

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);

    const percentages = holdings.map(h => h.value / totalValue);

    const top5 = percentages.slice(0, 5).reduce((sum, p) => sum + p, 0) * 100;
    const top10 = percentages.slice(0, 10).reduce((sum, p) => sum + p, 0) * 100;

    const herfindahlIndex = percentages.reduce((sum, p) => sum + (p * p), 0) * 10000;

    const portfolioReturn = totalInvested > 0
      ? ((totalValue - totalInvested) / totalInvested) * 100
      : 0;

    const returns = holdings.map(h => {
      return h.invested > 0 ? ((h.value - h.invested) / h.invested) * 100 : 0;
    });

    const avgReturn = returns.length > 0
      ? returns.reduce((sum, r) => sum + r, 0) / returns.length
      : 0;

    const variance = returns.length > 1
      ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
      : 0;

    const volatility = Math.sqrt(variance);

    const benchmarks = {
      CDI: BenchmarkService.comparePortfolioToBenchmark(portfolioReturn, 'CDI'),
      IBOV: BenchmarkService.comparePortfolioToBenchmark(portfolioReturn, 'IBOV'),
      IFIX: BenchmarkService.comparePortfolioToBenchmark(portfolioReturn, 'IFIX'),
      POUPANCA: BenchmarkService.comparePortfolioToBenchmark(portfolioReturn, 'POUPANCA')
    };

    const cdiRate = BenchmarkService.getBenchmark('CDI').annual2024;
    const sharpeRatio = BenchmarkService.calculateSharpeRatio(portfolioReturn, cdiRate, volatility);

    res.json({
      concentration: {
        top5: parseFloat(top5.toFixed(2)),
        top10: parseFloat(top10.toFixed(2)),
        herfindahlIndex: parseFloat(herfindahlIndex.toFixed(2)),
        holdings: holdings.length,
        interpretation: herfindahlIndex < 1000 ? 'Bem diversificado' :
                        herfindahlIndex < 1800 ? 'Moderadamente concentrado' :
                        'Altamente concentrado'
      },
      volatility: parseFloat(volatility.toFixed(2)),
      benchmarks,
      sharpeRatio,
      portfolioReturn: parseFloat(portfolioReturn.toFixed(2))
    });
  } catch (error) {
    console.error('Error calculating risk metrics:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna análise detalhada de dividendos
 */
export const getDividendAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const allDividends = Dividend.getAll(userId);
    const summaryByTicker = Dividend.getSummaryByTicker(userId);
    const monthlyData = Dividend.getMonthlyTotal(userId);
    const yearlyData = Dividend.getYearlyTotal(userId);

    const currentYear = new Date().getFullYear();
    const currentYearData = yearlyData.find(y => parseInt(y.year) === currentYear);
    const previousYearData = yearlyData.find(y => parseInt(y.year) === currentYear - 1);

    const totalReceived = allDividends.reduce((sum, d) => sum + d.amount, 0);
    const avgMonthly = monthlyData.length > 0
      ? totalReceived / monthlyData.length
      : 0;

    const currentYearTotal = currentYearData ? currentYearData.total : 0;
    const previousYearTotal = previousYearData ? previousYearData.total : 0;
    const yearOverYearGrowth = previousYearTotal > 0
      ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100
      : 0;

    const summary = Transaction.getPortfolioSummary(userId);
    const tickers = summary.map(s => s.ticker);
    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    const priceMap = {};
    quotes.forEach(q => {
      if (q.price) priceMap[q.ticker] = q.price;
    });

    const portfolioValue = summary.reduce((sum, item) => {
      const price = priceMap[item.ticker];
      if (price && item.total_quantity > 0) {
        return sum + (item.total_quantity * price);
      }
      return sum;
    }, 0);

    const annualizedYield = portfolioValue > 0 && currentYearTotal > 0
      ? (currentYearTotal / portfolioValue) * 100
      : 0;

    const dividendsByTicker = summaryByTicker.map(ticker => {
      const holding = summary.find(s => s.ticker === ticker.ticker);
      const currentPrice = priceMap[ticker.ticker];
      const currentValue = holding && currentPrice
        ? holding.total_quantity * currentPrice
        : 0;

      const yieldPercentage = currentValue > 0
        ? (ticker.total_amount / currentValue) * 100
        : 0;

      return {
        ...ticker,
        currentValue,
        yieldPercentage: parseFloat(yieldPercentage.toFixed(2))
      };
    });

    res.json({
      summary: {
        totalReceived: parseFloat(totalReceived.toFixed(2)),
        avgMonthly: parseFloat(avgMonthly.toFixed(2)),
        currentYearTotal: parseFloat(currentYearTotal.toFixed(2)),
        previousYearTotal: parseFloat(previousYearTotal.toFixed(2)),
        yearOverYearGrowth: parseFloat(yearOverYearGrowth.toFixed(2)),
        annualizedYield: parseFloat(annualizedYield.toFixed(2)),
        portfolioValue: parseFloat(portfolioValue.toFixed(2))
      },
      monthlyData: monthlyData.map(m => ({
        ...m,
        total: parseFloat(m.total.toFixed(2))
      })),
      yearlyData: yearlyData.map(y => ({
        ...y,
        total: parseFloat(y.total.toFixed(2))
      })),
      dividendsByTicker: dividendsByTicker.sort((a, b) => b.total_amount - a.total_amount)
    });
  } catch (error) {
    console.error('Error calculating dividend analysis:', error);
    res.status(500).json({ error: error.message });
  }
};
