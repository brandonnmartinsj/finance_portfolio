import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import PortfolioEvolution from '../components/analytics/PortfolioEvolution';
import AssetDistribution from '../components/analytics/AssetDistribution';
import AssetTypeDistribution from '../components/analytics/AssetTypeDistribution';
import TopPerformers from '../components/analytics/TopPerformers';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [portfolioEvolution, setPortfolioEvolution] = useState([]);
  const [assetDistribution, setAssetDistribution] = useState([]);
  const [assetTypeDistribution, setAssetTypeDistribution] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [evolution, assetDist, typeDist, performers, metricsData] = await Promise.all([
        analyticsService.getPortfolioEvolution(),
        analyticsService.getAssetDistribution(),
        analyticsService.getAssetTypeDistribution(),
        analyticsService.getTopPerformers(),
        analyticsService.getPortfolioMetrics()
      ]);

      setPortfolioEvolution(evolution.data);
      setAssetDistribution(assetDist.data);
      setAssetTypeDistribution(typeDist.data);
      setTopPerformers(performers.data);
      setMetrics(metricsData.data);
    } catch (err) {
      console.error('Erro ao carregar análises:', err);
      setError('Erro ao carregar dados de análise. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div>Carregando análises...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
          <h2>{error}</h2>
          <button
            onClick={loadAnalyticsData}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Análise de Portfólio</h1>
        <p style={{ color: '#666' }}>Visualize a performance e distribuição dos seus investimentos</p>
      </div>

      {/* Métricas Principais */}
      {metrics && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '5px', fontWeight: '600' }}>
                Total Investido
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                {metrics.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '5px', fontWeight: '600' }}>
                Valor Atual
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                {metrics.currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            <div style={{
              padding: '15px',
              backgroundColor: metrics.totalProfitLoss >= 0 ? '#f0fdf4' : '#fef2f2',
              borderRadius: '8px',
              borderLeft: `4px solid ${metrics.totalProfitLoss >= 0 ? '#16a34a' : '#dc2626'}`
            }}>
              <div style={{
                fontSize: '12px',
                color: metrics.totalProfitLoss >= 0 ? '#15803d' : '#b91c1c',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Lucro/Prejuízo
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: metrics.totalProfitLoss >= 0 ? '#166534' : '#991b1b'
              }}>
                {metrics.totalProfitLoss >= 0 ? '+' : ''}
                {metrics.totalProfitLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: metrics.totalProfitLoss >= 0 ? '#16a34a' : '#dc2626',
                marginTop: '5px'
              }}>
                {metrics.percentGain >= 0 ? '+' : ''}{metrics.percentGain.toFixed(2)}%
              </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#f5f3ff', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ fontSize: '12px', color: '#6d28d9', marginBottom: '5px', fontWeight: '600' }}>
                Ativos no Portfólio
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5b21b6' }}>
                {metrics.assetCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos de Análise */}
      <PortfolioEvolution data={portfolioEvolution} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <AssetTypeDistribution data={assetTypeDistribution} />
        <AssetDistribution data={assetDistribution} />
      </div>

      <TopPerformers data={topPerformers} />
    </div>
  );
};

export default Analytics;
