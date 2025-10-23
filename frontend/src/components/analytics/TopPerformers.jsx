import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const TopPerformers = ({ data, currency = 'BRL' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.percentGain - a.percentGain);
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  const renderAssetRow = (asset, index) => {
    const isPositive = asset.percentGain >= 0;

    return (
      <Link
        key={index}
        to={`/asset/${asset.ticker}`}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
          borderRadius: '6px',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9fafb' : 'white'}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            {asset.ticker}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {asset.quantity} {asset.quantity === 1 ? 'ação' : 'ações'}
          </div>
        </div>

        <div style={{ textAlign: 'right', marginLeft: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            {formatCurrency(asset.currentValue, currency)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Investido: {formatCurrency(asset.invested, currency)}
          </div>
        </div>

        <div style={{ textAlign: 'right', marginLeft: '20px', minWidth: '100px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: isPositive ? '#16a34a' : '#dc2626'
            }}
          >
            {isPositive ? '+' : ''}{formatPercent(asset.percentGain)}
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isPositive ? '#16a34a' : '#dc2626'
            }}
          >
            {isPositive ? '+' : ''}{formatCurrency(asset.profitLoss, currency)}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Performance dos Ativos</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Top Gainers */}
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#16a34a',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: '2px solid #16a34a'
          }}>
            🎯 Maiores Ganhos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topGainers.map(renderAssetRow)}
          </div>
        </div>

        {/* Top Losers */}
        {topLosers.some(asset => asset.percentGain < 0) && (
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #dc2626'
            }}>
              📉 Maiores Perdas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topLosers.map(renderAssetRow)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPerformers;
