import Transaction from '../models/Transaction.js';
import Asset from '../models/Asset.js';

export const getAllTransactions = (req, res) => {
  try {
    const transactions = Transaction.getAll(req.user.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionById = (req, res) => {
  try {
    const transaction = Transaction.getById(req.params.id, req.user.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = (req, res) => {
  try {
    const { ticker, name, market } = req.body;

    let asset = Asset.getByTicker(ticker);
    if (!asset && name && market) {
      Asset.create({
        ticker,
        name,
        type: req.body.asset_type,
        market
      });
    }

    const transaction = Transaction.create(req.body, req.user.id);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTransaction = (req, res) => {
  try {
    const transaction = Transaction.update(req.params.id, req.body, req.user.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransaction = (req, res) => {
  try {
    Transaction.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPortfolioSummary = (req, res) => {
  try {
    const summary = Transaction.getPortfolioSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
