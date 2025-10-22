import Transaction from '../models/Transaction.js';
import Asset from '../models/Asset.js';

export const getAllTransactions = (req, res) => {
  try {
    const transactions = Transaction.getAll();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionById = (req, res) => {
  try {
    const transaction = Transaction.getById(req.params.id);
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

    // Verificar se o ativo existe, se não, criar
    let asset = Asset.getByTicker(ticker);
    if (!asset && name && market) {
      Asset.create({
        ticker,
        name,
        type: req.body.asset_type,
        market
      });
    }

    const transaction = Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTransaction = (req, res) => {
  try {
    const transaction = Transaction.update(req.params.id, req.body);
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
    Transaction.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPortfolioSummary = (req, res) => {
  try {
    const summary = Transaction.getPortfolioSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
