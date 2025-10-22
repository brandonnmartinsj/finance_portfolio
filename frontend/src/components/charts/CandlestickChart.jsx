import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

function CandlestickChart({ data, currency = 'BRL' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        Nenhum dado disponível para exibir
      </div>
    );
  }

  const CustomCandlestick = (props) => {
    const { x, y, width, height, payload } = props;

    if (!payload || payload.open === 0) return null;

    const isGreen = payload.close >= payload.open;
    const color = isGreen ? '#16a34a' : '#dc2626';
    const fillColor = isGreen ? '#22c55e' : '#ef4444';

    const high = y;
    const low = y + height;
    const open = y + (payload.open - payload.high) / (payload.low - payload.high) * height;
    const close = y + (payload.close - payload.high) / (payload.low - payload.high) * height;

    const bodyTop = Math.min(open, close);
    const bodyHeight = Math.abs(close - open);
    const wickX = x + width / 2;

    return (
      <g>
        {/* Pavio (wick) */}
        <line
          x1={wickX}
          y1={high}
          x2={wickX}
          y2={low}
          stroke={color}
          strokeWidth={1}
        />
        {/* Corpo da vela */}
        <rect
          x={x}
          y={bodyTop}
          width={width}
          height={bodyHeight || 1}
          fill={fillColor}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      const isGreen = data.close >= data.open;

      return (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {formatDate(data.date, 'dd/MM/yyyy HH:mm')}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Abertura:</strong> {formatCurrency(data.open, currency)}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Máxima:</strong> {formatCurrency(data.high, currency)}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Mínima:</strong> {formatCurrency(data.low, currency)}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Fechamento:</strong>{' '}
            <span style={{ color: isGreen ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
              {formatCurrency(data.close, currency)}
            </span>
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
            <strong>Variação:</strong>{' '}
            <span style={{ color: isGreen ? '#16a34a' : '#dc2626' }}>
              {isGreen ? '+' : ''}
              {formatCurrency(data.close - data.open, currency)} (
              {((data.close - data.open) / data.open * 100).toFixed(2)}%)
            </span>
          </p>
        </div>
      );
    }

    return null;
  };

  const formattedData = data.map((item) => ({
    ...item,
    timestamp: item.date
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value, 'dd/MM')}
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(value) => formatCurrency(value, currency)}
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="high"
          shape={<CustomCandlestick />}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default CandlestickChart;
