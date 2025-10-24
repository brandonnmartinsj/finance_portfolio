import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#7c3aed', '#db2777', '#65a30d', '#f59e0b', '#ef4444'];

const SectorDistribution = ({ data, currency = 'BRL' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Sem dados de setores disponíveis</p>
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.map((item, index) => ({
    ...item,
    percentage: (item.value / totalValue) * 100,
    fill: COLORS[index % COLORS.length]
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
          {data.sector}
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Valor:</strong> {formatCurrency(data.value, currency)}
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Investido:</strong> {formatCurrency(data.invested, currency)}
        </p>
        <p style={{ margin: '4px 0', color: data.profitLoss >= 0 ? '#16a34a' : '#dc2626' }}>
          <strong>Lucro/Prejuízo:</strong> {formatCurrency(data.profitLoss, currency)} ({formatPercent(data.percentGain)})
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Ativos:</strong> {data.count}
        </p>
        <p style={{ margin: '4px 0', color: '#4b5563' }}>
          <strong>Percentual:</strong> {formatPercent(data.percentage)}
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
      <h2 style={{ marginBottom: '20px' }}>Distribuição por Setor Econômico</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={110}
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
                formatter={(value, entry) => `${entry.payload.sector}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Profitability by Sector */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
            Rentabilidade por Setor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="sector"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => `${value.toFixed(2)}%`}
                labelFormatter={(label) => `Setor: ${label}`}
              />
              <Bar dataKey="percentGain" name="Rentabilidade %">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.percentGain >= 0 ? '#16a34a' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Details Table */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
          Detalhes por Setor
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Setor</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Ativos</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Valor Atual</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Investido</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Lucro/Prejuízo</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Rentabilidade</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>% Portfólio</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((sector, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: sector.fill,
                        borderRadius: '2px'
                      }}
                    />
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{sector.sector}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>{sector.count}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                    {formatCurrency(sector.value, currency)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                    {formatCurrency(sector.invested, currency)}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: sector.profitLoss >= 0 ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {sector.profitLoss >= 0 ? '+' : ''}{formatCurrency(sector.profitLoss, currency)}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: sector.percentGain >= 0 ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {sector.percentGain >= 0 ? '+' : ''}{formatPercent(sector.percentGain)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                    {formatPercent(sector.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SectorDistribution;
