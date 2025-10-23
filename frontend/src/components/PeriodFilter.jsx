import React from 'react';
import { subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const PERIOD_OPTIONS = [
  { label: '1M', value: '1M', months: 1 },
  { label: '3M', value: '3M', months: 3 },
  { label: '6M', value: '6M', months: 6 },
  { label: '1A', value: '1Y', years: 1 },
  { label: 'Tudo', value: 'ALL' },
  { label: 'Custom', value: 'CUSTOM' },
];

const PeriodFilter = ({ selectedPeriod, onPeriodChange, customRange, onCustomRangeChange }) => {
  const handlePeriodClick = (period) => {
    if (period.value === 'CUSTOM') {
      onPeriodChange(period.value);
      return;
    }

    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (period.value === 'ALL') {
      startDate = null;
      endDate = null;
    } else if (period.months) {
      startDate = subMonths(now, period.months);
    } else if (period.years) {
      startDate = subYears(now, period.years);
    }

    onPeriodChange(period.value, { startDate, endDate });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#6b7280',
            marginRight: '10px',
          }}
        >
          Período:
        </span>

        {PERIOD_OPTIONS.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodClick(period)}
            style={{
              padding: '8px 16px',
              border: `1px solid ${selectedPeriod === period.value ? '#2563eb' : '#e5e7eb'}`,
              backgroundColor: selectedPeriod === period.value ? '#2563eb' : 'white',
              color: selectedPeriod === period.value ? 'white' : '#6b7280',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: selectedPeriod === period.value ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (selectedPeriod !== period.value) {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPeriod !== period.value) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      {selectedPeriod === 'CUSTOM' && (
        <div
          style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '5px',
                }}
              >
                Data Início
              </label>
              <input
                type="date"
                value={customRange?.startDate || ''}
                onChange={(e) =>
                  onCustomRangeChange({
                    ...customRange,
                    startDate: e.target.value,
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '5px',
                }}
              >
                Data Fim
              </label>
              <input
                type="date"
                value={customRange?.endDate || ''}
                onChange={(e) =>
                  onCustomRangeChange({
                    ...customRange,
                    endDate: e.target.value,
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  if (customRange?.startDate && customRange?.endDate) {
                    onPeriodChange('CUSTOM', {
                      startDate: new Date(customRange.startDate),
                      endDate: new Date(customRange.endDate),
                    });
                  }
                }}
                disabled={!customRange?.startDate || !customRange?.endDate}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: customRange?.startDate && customRange?.endDate ? 'pointer' : 'not-allowed',
                  opacity: customRange?.startDate && customRange?.endDate ? 1 : 0.5,
                  width: '100%',
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
