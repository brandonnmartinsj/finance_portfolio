import Dividend from '../models/Dividend.js';
import DividendSyncService from '../services/dividendSyncService.js';

export const getAllDividends = async (req, res) => {
  try {
    const userId = req.user.id;
    const dividends = Dividend.getAll(userId);
    res.json(dividends);
  } catch (error) {
    console.error('Error fetching dividends:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDividendById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const dividend = Dividend.getById(id, userId);

    if (!dividend) {
      return res.status(404).json({ error: 'Dividend not found' });
    }

    res.json(dividend);
  } catch (error) {
    console.error('Error fetching dividend:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createDividend = async (req, res) => {
  try {
    const userId = req.user.id;
    const dividend = req.body;

    if (!dividend.ticker || !dividend.type || !dividend.amount || !dividend.payment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newDividend = Dividend.create(dividend, userId);
    res.status(201).json(newDividend);
  } catch (error) {
    console.error('Error creating dividend:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateDividend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const dividend = req.body;

    if (!dividend.ticker || !dividend.type || !dividend.amount || !dividend.payment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedDividend = Dividend.update(id, dividend, userId);

    if (!updatedDividend) {
      return res.status(404).json({ error: 'Dividend not found' });
    }

    res.json(updatedDividend);
  } catch (error) {
    console.error('Error updating dividend:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteDividend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = Dividend.delete(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Dividend not found' });
    }

    res.json({ message: 'Dividend deleted successfully' });
  } catch (error) {
    console.error('Error deleting dividend:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDividendSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = Dividend.getSummaryByTicker(userId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching dividend summary:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyDividends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    const monthlyData = Dividend.getMonthlyTotal(userId, year);
    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly dividends:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getYearlyDividends = async (req, res) => {
  try {
    const userId = req.user.id;
    const yearlyData = Dividend.getYearlyTotal(userId);
    res.json(yearlyData);
  } catch (error) {
    console.error('Error fetching yearly dividends:', error);
    res.status(500).json({ error: error.message });
  }
};

export const syncDividends = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`Starting dividend sync for user ${userId}...`);
    const result = await DividendSyncService.syncAllDividends(userId);

    res.json(result);
  } catch (error) {
    console.error('Error syncing dividends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
