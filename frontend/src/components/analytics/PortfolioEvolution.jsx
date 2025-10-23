import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PortfolioEvolution = ({ data, currency = 'BRL' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Sem dados históricos disponíveis</p>
        <small>Adicione transações para ver a evolução do seu portfólio</small>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1f2937' }}>
          {formatDate(payload[0].payload.date)}
        </p>
        <p style={{ margin: '4px 0', color: '#2563eb' }}>
          <strong>Investido:</strong> {formatCurrency(payload[0].value, currency)}
        </p>
        <p style={{ margin: '4px 0', color: '#16a34a' }}>
          <strong>Valor Atual:</strong> {formatCurrency(payload[1].value, currency)}
        </p>
        <p style={{ margin: '4px 0', color: payload[2].value >= 0 ? '#16a34a' : '#dc2626' }}>
          <strong>Lucro/Prejuízo:</strong> {formatCurrency(payload[2].value, currency)}
        </p>
        <p style={{ margin: '4px 0', fontWeight: 'bold', color: payload[2].value >= 0 ? '#16a34a' : '#dc2626' }}>
          {payload[2].value >= 0 ? '+' : ''}{((payload[2].value / payload[0].value) * 100).toFixed(2)}%
        </p>
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Evolução Patrimonial</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(value, 'dd/MM')}
            stroke="#6b7280"
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value, currency)}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="invested"
            stroke="#2563eb"
            strokeWidth={2}
            name="Investido"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="currentValue"
            stroke="#16a34a"
            strokeWidth={2}
            name="Valor Atual"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="profitLoss"
            stroke="#9333ea"
            strokeWidth={2}
            name="Lucro/Prejuízo"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioEvolution;
