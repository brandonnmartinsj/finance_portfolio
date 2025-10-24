import Transaction from '../models/Transaction.js';
import Asset from '../models/Asset.js';
import currencyService from '../services/currencyService.js';

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

export const createTransaction = async (req, res) => {
  try {
    const { ticker, name, market, currency, price } = req.body;

    let asset = Asset.getByTicker(ticker);
    if (!asset && name && market) {
      Asset.create({
        ticker,
        name,
        type: req.body.asset_type,
        market
      });
    }

    const transactionData = { ...req.body };

    if (currency && currency !== 'BRL') {
      const conversionResult = await currencyService.convertToReais(price, currency);

      transactionData.currency = currency;
      transactionData.original_price = price;
      transactionData.price = conversionResult.convertedAmount;
      transactionData.exchange_rate = conversionResult.exchangeRate;

      console.log(`Converted ${currency} ${price} to BRL ${conversionResult.convertedAmount} (rate: ${conversionResult.exchangeRate})`);
    } else {
      transactionData.currency = 'BRL';
      transactionData.original_price = price;
      transactionData.exchange_rate = 1.0;
    }

    const transaction = Transaction.create(transactionData, req.user.id);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { currency, price } = req.body;

    const transactionData = { ...req.body };

    if (currency && currency !== 'BRL') {
      const conversionResult = await currencyService.convertToReais(price, currency);

      transactionData.currency = currency;
      transactionData.original_price = price;
      transactionData.price = conversionResult.convertedAmount;
      transactionData.exchange_rate = conversionResult.exchangeRate;

      console.log(`Converted ${currency} ${price} to BRL ${conversionResult.convertedAmount} (rate: ${conversionResult.exchangeRate})`);
    } else {
      transactionData.currency = 'BRL';
      transactionData.original_price = price;
      transactionData.exchange_rate = 1.0;
    }

    const transaction = Transaction.update(req.params.id, transactionData, req.user.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
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
