import React, { useState, useEffect } from 'react';
import { transactionService, marketService } from '../services/api';
import PortfolioSummary from '../components/PortfolioSummary';
import TransactionList from '../components/TransactionList';
import { exportTransactionsToCSV, exportPortfolioToCSV } from '../utils/exportData';

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

      const summaryRes = await transactionService.getSummary();
      setSummary(summaryRes.data);

      const transactionsRes = await transactionService.getAll();
      setTransactions(transactionsRes.data);

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
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => exportPortfolioToCSV(summary, quotes)}
          disabled={summary.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: summary.length === 0 ? '#e5e7eb' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: summary.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          📊 Exportar Portfólio
        </button>
        <button
          onClick={() => exportTransactionsToCSV(transactions)}
          disabled={transactions.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: transactions.length === 0 ? '#e5e7eb' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          📝 Exportar Transações
        </button>
      </div>

      <PortfolioSummary summary={summary} quotes={quotes} />
      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}

export default Dashboard;
