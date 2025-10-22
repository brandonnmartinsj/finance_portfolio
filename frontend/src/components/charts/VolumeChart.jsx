import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, formatVolume } from '../../utils/formatters';

function VolumeChart({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;

      return (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '13px' }}>
            {formatDate(data.date, 'dd/MM/yyyy')}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Volume:</strong> {formatVolume(data.volume)}
          </p>
        </div>
      );
    }

    return null;
  };

  const formattedData = data.map((item) => ({
    ...item,
    volumeColor: item.close >= item.open ? '#22c55e' : '#ef4444'
  }));

  const CustomBar = (props) => {
    const { fill, x, y, width, height, payload } = props;
    const barColor = payload.close >= payload.open ? '#22c55e' : '#ef4444';

    return <rect x={x} y={y} width={width} height={height} fill={barColor} />;
  };

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value, 'dd/MM')}
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          tickFormatter={(value) => formatVolume(value)}
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="volume"
          shape={<CustomBar />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default VolumeChart;
