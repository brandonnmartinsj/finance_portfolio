import React, { useState } from 'react';
import { useAnalyticsData } from '../hooks/useAnalytics';
import { dividendService } from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';
import PeriodFilter from '../components/PeriodFilter';
import ExportButton from '../components/ExportButton';
import PortfolioEvolution from '../components/analytics/PortfolioEvolution';
import AssetDistribution from '../components/analytics/AssetDistribution';
import AssetTypeDistribution from '../components/analytics/AssetTypeDistribution';
import SectorDistribution from '../components/analytics/SectorDistribution';
import DividendAnalysis from '../components/analytics/DividendAnalysis';
import RiskAndPerformance from '../components/analytics/RiskAndPerformance';
import TopPerformers from '../components/analytics/TopPerformers';
import { MetricsSkeleton, ChartSkeleton, TableSkeleton } from '../components/Skeleton';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [isSyncingDividends, setIsSyncingDividends] = useState(false);

  const { portfolioEvolution, assetDistribution, assetTypeDistribution, sectorDistribution, dividendAnalysis, riskMetrics, topPerformers, metrics, isLoading, error, refetch } = useAnalyticsData(dateFilter);

  const handlePeriodChange = (period, range) => {
    setSelectedPeriod(period);
    if (range) {
      setDateFilter(range);
    }
  };

  const handleSyncDividends = async () => {
    setIsSyncingDividends(true);
    try {
      const response = await dividendService.sync();
      console.log('Dividend sync result:', response.data);

      if (response.data.success) {
        alert(`Sincronização concluída!\n\n${response.data.message}\n\nAtivos processados: ${response.data.summary.tickersProcessed}\nDividendos sincronizados: ${response.data.summary.totalSynced}\nDividendos ignorados (duplicados): ${response.data.summary.totalSkipped}`);
        refetch();
      } else {
        alert('Erro ao sincronizar dividendos: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error syncing dividends:', error);
      alert('Erro ao sincronizar dividendos. Tente novamente.');
    } finally {
      setIsSyncingDividends(false);
    }
  };

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
          <h2>Erro ao carregar dados de análise</h2>
          <p style={{ color: '#6b7280', marginTop: '10px' }}>
            {error.message || 'Ocorreu um erro ao carregar os dados. Tente novamente.'}
          </p>
          <button
            onClick={refetch}
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
    <ErrorBoundary fallbackMessage="Erro ao carregar a análise do portfólio." onRetry={refetch}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Análise de Portfólio</h1>
            <p style={{ color: '#666' }}>Visualize a performance e distribuição dos seus investimentos</p>
          </div>
          <ExportButton
            data={{ portfolioEvolution, assetDistribution, sectorDistribution, topPerformers, metrics }}
            type="analytics"
            disabled={isLoading || !metrics}
          />
        </div>

        <PeriodFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />

        {/* Métricas Principais */}
        {isLoading ? (
          <MetricsSkeleton />
        ) : metrics ? (
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
        ) : null}

        {/* Gráficos de Análise */}
        {isLoading ? (
          <ChartSkeleton height={400} />
        ) : (
          <PortfolioEvolution data={portfolioEvolution} />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {isLoading ? (
            <>
              <ChartSkeleton height={400} />
              <ChartSkeleton height={400} />
            </>
          ) : (
            <>
              <AssetTypeDistribution data={assetTypeDistribution} />
              <AssetDistribution data={assetDistribution} />
            </>
          )}
        </div>

        {isLoading ? (
          <ChartSkeleton height={400} />
        ) : (
          <SectorDistribution data={sectorDistribution} />
        )}

        {isLoading ? (
          <ChartSkeleton height={400} />
        ) : (
          <DividendAnalysis
            data={dividendAnalysis}
            onSync={handleSyncDividends}
            isSyncing={isSyncingDividends}
          />
        )}

        {isLoading ? (
          <ChartSkeleton height={400} />
        ) : (
          <RiskAndPerformance data={riskMetrics} />
        )}

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <TopPerformers data={topPerformers} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
