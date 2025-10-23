import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const COLORS = {
  'STOCK': '#2563eb',
  'FII': '#16a34a',
  'CRYPTO': '#9333ea',
  'FIXED_INCOME': '#ea580c'
};

const TYPE_NAMES = {
  'STOCK': 'Ações',
  'FII': 'Fundos Imobiliários',
  'CRYPTO': 'Criptomoedas',
  'FIXED_INCOME': 'Renda Fixa'
};

const AssetTypeDistribution = ({ data, currency = 'BRL' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Sem ativos no portfólio</p>
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.map(item => ({
    ...item,
    name: TYPE_NAMES[item.type] || item.type,
    percentage: (item.value / totalValue) * 100,
    fill: COLORS[item.type] || '#6b7280'
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1f2937' }}>
          {data.name}
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Valor:</strong> {formatCurrency(data.value, currency)}
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Percentual:</strong> {formatPercent(data.percentage)}
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Ativos:</strong> {data.count}
        </p>
      </div>
    );
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontWeight: 'bold', fontSize: '14px' }}
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Distribuição por Tipo de Ativo</h2>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => `${entry.payload.name} (${formatPercent(entry.payload.percentage)})`}
          />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {chartData.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              borderLeft: `4px solid ${item.fill}`
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              {formatCurrency(item.value, currency)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563' }}>
              <span>{formatPercent(item.percentage)} do total</span>
              <span>{item.count} {item.count === 1 ? 'ativo' : 'ativos'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetTypeDistribution;
