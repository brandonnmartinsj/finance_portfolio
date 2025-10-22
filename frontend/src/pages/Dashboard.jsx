import React, { useState, useEffect } from 'react';
import { transactionService, marketService } from '../services/api';
import PortfolioSummary from '../components/PortfolioSummary';
import TransactionList from '../components/TransactionList';

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar resumo do portfolio
      const summaryRes = await transactionService.getSummary();
      setSummary(summaryRes.data);

      // Carregar transações
      const transactionsRes = await transactionService.getAll();
      setTransactions(transactionsRes.data);

      // Carregar cotações dos ativos do portfolio
      if (summaryRes.data.length > 0) {
        const tickers = summaryRes.data.map(item => item.ticker);
        const quotesRes = await marketService.getMultipleQuotes(tickers);

        const quotesMap = {};
        quotesRes.data.forEach(quote => {
          if (quote.price) {
            quotesMap[quote.ticker] = quote;
          }
        });
        setQuotes(quotesMap);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Deseja realmente excluir esta transação?')) {
      try {
        await transactionService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação');
      }
    }
  };

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <div>
      <PortfolioSummary summary={summary} quotes={quotes} />
      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}

export default Dashboard;
