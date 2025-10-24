import React from 'react';
import WidgetContainer from './WidgetContainer';

const PortfolioSummaryWidget = ({ data, quotes, onRemove }) => {
  const calculateTotals = () => {
    if (!data || data.length === 0) {
      return { totalInvested: 0, totalCurrent: 0, profit: 0, profitPercent: 0 };
    }

    let totalInvested = 0;
    let totalCurrent = 0;

    data.forEach(item => {
      totalInvested += item.total_invested;
      const quote = quotes?.[item.ticker];
      if (quote && quote.price) {
        totalCurrent += item.total_quantity * quote.price;
      } else {
        totalCurrent += item.total_invested;
      }
    });

    const profit = totalCurrent - totalInvested;
    const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrent, profit, profitPercent };
  };

  const totals = calculateTotals();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <WidgetContainer title="Resumo do Portfólio" onRemove={onRemove}>
      <div className="stats-grid-mini">
        <div className="stat-item">
          <div className="stat-label">Total Investido</div>
          <div className="stat-value">{formatCurrency(totals.totalInvested)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Valor Atual</div>
          <div className="stat-value">{formatCurrency(totals.totalCurrent)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Lucro/Prejuízo</div>
          <div className={`stat-value ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totals.profit)}
          </div>
          <div className={`stat-percent ${totals.profitPercent >= 0 ? 'positive' : 'negative'}`}>
            {totals.profitPercent.toFixed(2)}%
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Ativos</div>
          <div className="stat-value">{data?.length || 0}</div>
        </div>
      </div>
    </WidgetContainer>
  );
};

export default PortfolioSummaryWidget;
