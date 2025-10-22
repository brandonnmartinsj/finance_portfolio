import React from 'react';
import { useNavigate } from 'react-router-dom';

function PortfolioSummary({ summary, quotes }) {
  const navigate = useNavigate();
  const calculateTotals = () => {
    let totalInvested = 0;
    let totalCurrent = 0;

    summary.forEach(item => {
      totalInvested += item.total_invested;

      const quote = quotes[item.ticker];
      if (quote && quote.price) {
        totalCurrent += item.total_quantity * quote.price;
      } else {
        // Se não tiver cotação, usar o valor investido
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
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Investido</h3>
          <div className="value">{formatCurrency(totals.totalInvested)}</div>
        </div>

        <div className="stat-card">
          <h3>Valor Atual</h3>
          <div className="value">{formatCurrency(totals.totalCurrent)}</div>
        </div>

        <div className="stat-card">
          <h3>Lucro/Prejuízo</h3>
          <div className={`value ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totals.profit)}
          </div>
          <div className={totals.profitPercent >= 0 ? 'positive' : 'negative'}>
            {totals.profitPercent.toFixed(2)}%
          </div>
        </div>

        <div className="stat-card">
          <h3>Total de Ativos</h3>
          <div className="value">{summary.length}</div>
        </div>
      </div>

      <div className="card">
        <h2>Posições</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Preço Médio</th>
              <th>Cotação Atual</th>
              <th>Total Investido</th>
              <th>Valor Atual</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => {
              const avgPrice = item.total_invested / item.total_quantity;
              const quote = quotes[item.ticker];
              const currentPrice = quote?.price || avgPrice;
              const currentValue = item.total_quantity * currentPrice;
              const profit = currentValue - item.total_invested;
              const profitPercent = (profit / item.total_invested) * 100;

              return (
                <tr key={item.ticker}>
                  <td>
                    <strong
                      onClick={() => navigate(`/asset/${item.ticker}`)}
                      style={{
                        cursor: 'pointer',
                        color: '#0066cc',
                        textDecoration: 'underline'
                      }}
                      title={`Ver detalhes de ${item.ticker}`}
                    >
                      {item.ticker}
                    </strong>
                  </td>
                  <td>{item.asset_type}</td>
                  <td>{item.total_quantity.toFixed(2)}</td>
                  <td>{formatCurrency(avgPrice)}</td>
                  <td>
                    {quote ? formatCurrency(currentPrice) : '-'}
                    {quote?.change && (
                      <small className={quote.change >= 0 ? 'positive' : 'negative'}>
                        {' '}({quote.change.toFixed(2)}%)
                      </small>
                    )}
                  </td>
                  <td>{formatCurrency(item.total_invested)}</td>
                  <td>{formatCurrency(currentValue)}</td>
                  <td className={profit >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(profit)}
                    <br />
                    <small>({profitPercent.toFixed(2)}%)</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PortfolioSummary;
