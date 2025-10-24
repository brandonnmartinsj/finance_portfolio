import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const DividendAnalysis = ({ data, currency = 'BRL' }) => {
  if (!data || !data.summary) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Sem dados de dividendos disponíveis</p>
        <small>Registre seus dividendos para acompanhar sua renda passiva</small>
      </div>
    );
  }

  const { summary, monthlyData, yearlyData, dividendsByTicker } = data;

  const MonthlyTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthName = monthNames[parseInt(data.month) - 1];

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1f2937' }}>
          {monthName}/{data.year}
        </p>
        <p style={{ margin: '4px 0', color: '#16a34a' }}>
          <strong>Total:</strong> {formatCurrency(data.total, currency)}
        </p>
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Análise de Dividendos</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '5px', fontWeight: '600' }}>
            Total Recebido
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
            {formatCurrency(summary.totalReceived, currency)}
          </div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '5px', fontWeight: '600' }}>
            Média Mensal
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
            {formatCurrency(summary.avgMonthly, currency)}
          </div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '5px', fontWeight: '600' }}>
            Yield Anualizado
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
            {formatPercent(summary.annualizedYield)}
          </div>
          <div style={{ fontSize: '11px', color: '#78350f', marginTop: '4px' }}>
            Sobre {formatCurrency(summary.portfolioValue, currency)}
          </div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#f5f3ff', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '12px', color: '#6d28d9', marginBottom: '5px', fontWeight: '600' }}>
            Crescimento YoY
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: summary.yearOverYearGrowth >= 0 ? '#166534' : '#991b1b'
          }}>
            {summary.yearOverYearGrowth >= 0 ? '+' : ''}{formatPercent(summary.yearOverYearGrowth)}
          </div>
          <div style={{ fontSize: '11px', color: '#5b21b6', marginTop: '4px' }}>
            {formatCurrency(summary.currentYearTotal, currency)} em {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      {monthlyData && monthlyData.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
            Dividendos Mensais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => {
                  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  return monthNames[parseInt(value) - 1];
                }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, currency)}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Bar dataKey="total" fill="#16a34a" name="Dividendos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Yearly Trend */}
      {yearlyData && yearlyData.length > 1 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
            Evolução Anual
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" style={{ fontSize: '12px' }} />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, currency)}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value, currency)}
                labelFormatter={(label) => `Ano: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#16a34a"
                strokeWidth={2}
                name="Total Anual"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dividends by Ticker */}
      {dividendsByTicker && dividendsByTicker.length > 0 && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
            Dividendos por Ativo
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Ativo</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Pagamentos</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Média</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Yield %</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Último Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {dividendsByTicker.map((ticker, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: '600', color: '#1f2937' }}>{ticker.ticker}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>{ticker.payment_count}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                      {formatCurrency(ticker.total_amount, currency)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                      {formatCurrency(ticker.avg_amount, currency)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#2563eb' }}>
                      {formatPercent(ticker.yieldPercentage)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px' }}>
                      {new Date(ticker.last_payment).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DividendAnalysis;
