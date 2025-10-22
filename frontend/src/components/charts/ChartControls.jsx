import React from 'react';

function ChartControls({ selectedRange, selectedInterval, onRangeChange, onIntervalChange }) {
  const ranges = [
    { value: '1d', label: '1D' },
    { value: '5d', label: '5D' },
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1A' },
    { value: '5y', label: '5A' }
  ];

  const intervals = [
    { value: '1h', label: '1h' },
    { value: '1d', label: '1D' },
    { value: '1wk', label: '1S' },
    { value: '1mo', label: '1M' }
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <div>
        <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '10px' }}>
          Período:
        </label>
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={selectedRange === range.value ? 'btn btn-primary' : 'btn'}
            style={{
              marginRight: '5px',
              padding: '5px 12px',
              fontSize: '12px',
              minWidth: '45px'
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div>
        <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '10px' }}>
          Intervalo:
        </label>
        {intervals.map((interval) => (
          <button
            key={interval.value}
            onClick={() => onIntervalChange(interval.value)}
            className={selectedInterval === interval.value ? 'btn btn-primary' : 'btn'}
            style={{
              marginRight: '5px',
              padding: '5px 12px',
              fontSize: '12px',
              minWidth: '45px'
            }}
          >
            {interval.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChartControls;
