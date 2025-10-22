import React from 'react';
import { formatCurrency, formatNumber, formatMarketCap } from '../../utils/formatters';

function FinancialMetrics({ metrics }) {
  if (!metrics) {
    return (
      <div className="card">
        <h2>Métricas Financeiras</h2>
        <p style={{ color: '#666' }}>Métricas não disponíveis</p>
      </div>
    );
  }

  const metricItems = [
    {
      label: 'Preço Atual',
      value: formatCurrency(metrics.regularMarketPrice, metrics.currency),
      description: 'Cotação mais recente'
    },
    {
      label: 'P/L (Price/Earnings)',
      value: metrics.priceEarnings ? formatNumber(metrics.priceEarnings) : 'N/A',
      description: 'Preço dividido pelo lucro por ação'
    },
    {
      label: 'LPA (Lucro por Ação)',
      value: metrics.earningsPerShare ? formatCurrency(metrics.earningsPerShare, metrics.currency) : 'N/A',
      description: 'Earnings Per Share'
    },
    {
      label: 'Valor de Mercado',
      value: metrics.marketCap ? formatMarketCap(metrics.marketCap) : 'N/A',
      description: 'Market Cap'
    }
  ];

  return (
    <div className="card">
      <h2>Métricas Financeiras</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {metricItems.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '500' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
              {item.value}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#1e40af' }}>
          💡 Sobre as Métricas
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e40af', lineHeight: '1.8' }}>
          <li><strong>P/L baixo</strong> pode indicar ação subvalorizada (ou problemas na empresa)</li>
          <li><strong>LPA positivo</strong> indica que a empresa é lucrativa</li>
          <li><strong>Market Cap</strong> representa o valor total da empresa no mercado</li>
        </ul>
      </div>
    </div>
  );
}

export default FinancialMetrics;
