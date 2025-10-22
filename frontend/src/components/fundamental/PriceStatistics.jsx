import React from 'react';
import { formatCurrency, formatVolume, formatChangePercent } from '../../utils/formatters';

function PriceStatistics({ statistics }) {
  if (!statistics) {
    return (
      <div className="card">
        <h2>Estatísticas de Preço</h2>
        <p style={{ color: '#666' }}>Estatísticas não disponíveis</p>
      </div>
    );
  }

  const { currentPrice, currency, fiftyTwoWeek, regularMarket } = statistics;

  const stats = [
    {
      label: 'Preço Atual',
      value: formatCurrency(currentPrice, currency),
      subValue: regularMarket?.changePercent
        ? formatChangePercent(regularMarket.changePercent)
        : null,
      isPositive: regularMarket?.changePercent >= 0
    },
    {
      label: 'Abertura',
      value: formatCurrency(regularMarket?.open, currency)
    },
    {
      label: 'Fechamento Anterior',
      value: formatCurrency(regularMarket?.previousClose, currency)
    },
    {
      label: 'Máxima do Dia',
      value: formatCurrency(regularMarket?.dayHigh, currency)
    },
    {
      label: 'Mínima do Dia',
      value: formatCurrency(regularMarket?.dayLow, currency)
    },
    {
      label: 'Volume',
      value: formatVolume(regularMarket?.volume)
    }
  ];

  const fiftyTwoWeekStats = [
    {
      label: 'Máxima 52 Semanas',
      value: formatCurrency(fiftyTwoWeek?.high, currency)
    },
    {
      label: 'Mínima 52 Semanas',
      value: formatCurrency(fiftyTwoWeek?.low, currency)
    }
  ];

  return (
    <div className="card">
      <h2>Estatísticas de Preço</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#374151' }}>
          Mercado Atual
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '500' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {stat.value}
              </div>
              {stat.subValue && (
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: stat.isPositive ? '#16a34a' : '#dc2626',
                    marginTop: '4px'
                  }}
                >
                  {stat.subValue}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#374151' }}>
          52 Semanas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {fiftyTwoWeekStats.map((stat, index) => (
            <div
              key={index}
              style={{
                padding: '15px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #fde047'
              }}
            >
              <div style={{ fontSize: '11px', color: '#92400e', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '500' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {fiftyTwoWeek?.high && fiftyTwoWeek?.low && currentPrice && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '13px', color: '#0c4a6e', marginBottom: '10px', fontWeight: '600' }}>
              Posição no Range de 52 Semanas
            </div>
            <div style={{ position: 'relative', height: '30px', backgroundColor: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${((currentPrice - fiftyTwoWeek.low) / (fiftyTwoWeek.high - fiftyTwoWeek.low)) * 100}%`,
                  backgroundColor: '#0284c7',
                  transition: 'width 0.3s ease'
                }}
              />
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#0c4a6e'
                }}
              >
                {(((currentPrice - fiftyTwoWeek.low) / (fiftyTwoWeek.high - fiftyTwoWeek.low)) * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '11px', color: '#64748b' }}>
              <span>Mínima</span>
              <span>Máxima</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceStatistics;
