import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatPercent } from '../../utils/formatters';
import Tooltip from '../Tooltip';

const RiskAndPerformance = ({ data, currency = 'BRL' }) => {
  if (!data || !data.concentration) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Sem dados de risco disponíveis</p>
      </div>
    );
  }

  const { concentration, volatility, benchmarks, sharpeRatio, portfolioReturn } = data;

  const benchmarkData = Object.entries(benchmarks).map(([key, value]) => ({
    name: value.portfolioReturn >= value.benchmarkReturn ? key : key,
    portfolio: value.portfolioReturn,
    benchmark: value.benchmarkReturn,
    alpha: value.alpha
  }));

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Risco & Performance Comparativa</h2>

      {/* Risk Metrics */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
          Métricas de Risco
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                Volatilidade
              </span>
              <Tooltip text="Mede a variação dos retornos do portfólio. Quanto maior, mais arriscado." />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
              {formatPercent(volatility)}
            </div>
            <div style={{ fontSize: '11px', color: '#78350f', marginTop: '4px' }}>
              {volatility < 10 ? 'Baixo risco' : volatility < 20 ? 'Risco moderado' : 'Alto risco'}
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>
                Concentração Top 5
              </span>
              <Tooltip text="Percentual do portfólio nos 5 maiores ativos. Acima de 50% indica concentração alta." />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
              {formatPercent(concentration.top5)}
            </div>
            <div style={{ fontSize: '11px', color: '#1e40af', marginTop: '4px' }}>
              {concentration.holdings} ativos no total
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f5f3ff', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '600' }}>
                Índice HHI
              </span>
              <Tooltip text="Índice Herfindahl-Hirschman. <1000: bem diversificado, 1000-1800: moderado, >1800: concentrado." />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5b21b6' }}>
              {concentration.herfindahlIndex}
            </div>
            <div style={{ fontSize: '11px', color: '#6d28d9', marginTop: '4px' }}>
              {concentration.interpretation}
            </div>
          </div>

          {sharpeRatio !== null && (
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                  Índice Sharpe
                </span>
                <Tooltip text="Retorno ajustado ao risco. >1.0 é bom, >2.0 é excelente. Compara o excesso de retorno com a volatilidade." />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                {sharpeRatio.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px' }}>
                {sharpeRatio < 0 ? 'Negativo' : sharpeRatio < 1 ? 'Adequado' : sharpeRatio < 2 ? 'Bom' : 'Excelente'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Comparação com Benchmarks
          <Tooltip text="Compare o retorno do seu portfólio com índices de mercado. Alpha positivo indica desempenho superior." />
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={benchmarkData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              style={{ fontSize: '12px' }}
            />
            <ChartTooltip
              formatter={(value) => `${value.toFixed(2)}%`}
            />
            <Legend />
            <Bar dataKey="portfolio" fill="#2563eb" name="Seu Portfólio" />
            <Bar dataKey="benchmark" fill="#9ca3af" name="Benchmark" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Benchmark Table */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
          Detalhes dos Benchmarks
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Índice</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Portfólio</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Benchmark</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Alpha</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Performance Relativa</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(benchmarks).map(([key, value], index) => (
                <tr
                  key={key}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: '600', color: '#1f2937' }}>{key}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#2563eb' }}>
                    {formatPercent(value.portfolioReturn)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                    {formatPercent(value.benchmarkReturn)}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: value.alpha >= 0 ? '#16a34a' : '#dc2626'
                  }}>
                    {value.alpha >= 0 ? '+' : ''}{formatPercent(value.alpha)}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    color: value.outperforming ? '#16a34a' : '#dc2626',
                    fontWeight: '500'
                  }}>
                    {value.outperforming ? '✓ Superando' : '✗ Abaixo'}
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

export default RiskAndPerformance;
