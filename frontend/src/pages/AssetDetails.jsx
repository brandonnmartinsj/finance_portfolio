import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketService } from '../services/api';
import Breadcrumb from '../components/layout/Breadcrumb';
import ChartControls from '../components/charts/ChartControls';
import CandlestickChart from '../components/charts/CandlestickChart';
import VolumeChart from '../components/charts/VolumeChart';
import CompanyInfo from '../components/fundamental/CompanyInfo';
import FinancialMetrics from '../components/fundamental/FinancialMetrics';
import DividendHistory from '../components/fundamental/DividendHistory';
import PriceStatistics from '../components/fundamental/PriceStatistics';

function AssetDetails() {
  const { ticker } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fundamentals, setFundamentals] = useState(null);
  const [historical, setHistorical] = useState(null);
  const [dividends, setDividends] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const [selectedRange, setSelectedRange] = useState('1mo');
  const [selectedInterval, setSelectedInterval] = useState('1d');

  useEffect(() => {
    loadAssetData();
  }, [ticker]);

  useEffect(() => {
    loadHistoricalData();
  }, [ticker, selectedRange, selectedInterval]);

  const loadAssetData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [fundamentalsRes, dividendsRes, statisticsRes] = await Promise.all([
        marketService.getFundamentals(ticker),
        marketService.getDividends(ticker),
        marketService.getStatistics(ticker)
      ]);

      setFundamentals(fundamentalsRes.data);
      setDividends(dividendsRes.data);
      setStatistics(statisticsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados do ativo:', err);
      setError('Erro ao carregar informações do ativo. Verifique se o ticker está correto.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const historicalRes = await marketService.getHistorical(ticker, selectedRange, selectedInterval);
      setHistorical(historicalRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados históricos:', err);
    }
  };

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Carregando informações de {ticker}...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: ticker }
          ]}
        />
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
            <h2>{error}</h2>
            <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: ticker }
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      {/* Header do Ativo */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>
              {fundamentals?.companyInfo?.name || ticker}
            </h1>
            <p style={{ color: '#666', marginBottom: '10px' }}>{ticker}</p>
            {fundamentals?.companyInfo && (
              <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                <span>
                  <strong>Setor:</strong> {fundamentals.companyInfo.sector}
                </span>
                <span>
                  <strong>Indústria:</strong> {fundamentals.companyInfo.industry}
                </span>
              </div>
            )}
          </div>

          {statistics && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                {statistics.currentPrice?.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: statistics.currency
                })}
              </div>
              {statistics.regularMarket?.changePercent !== undefined && (
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: statistics.regularMarket.changePercent >= 0 ? '#16a34a' : '#dc2626'
                  }}
                >
                  {statistics.regularMarket.changePercent >= 0 ? '+' : ''}
                  {statistics.regularMarket.changePercent.toFixed(2)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Gráfico de Preços</h2>
        <ChartControls
          selectedRange={selectedRange}
          selectedInterval={selectedInterval}
          onRangeChange={handleRangeChange}
          onIntervalChange={handleIntervalChange}
        />

        {historical?.data && historical.data.length > 0 ? (
          <>
            <CandlestickChart
              data={historical.data}
              currency={historical.currency}
            />
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Volume</h3>
              <VolumeChart data={historical.data} />
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Carregando dados do gráfico...
          </p>
        )}
      </div>

      {/* Estatísticas de Preço */}
      {statistics && <PriceStatistics statistics={statistics} />}

      {/* Métricas Financeiras */}
      {fundamentals?.metrics && <FinancialMetrics metrics={fundamentals.metrics} />}

      {/* Histórico de Dividendos */}
      {dividends && (
        <DividendHistory
          dividends={dividends.dividends}
          currency={fundamentals?.metrics?.currency || 'BRL'}
        />
      )}

      {/* Informações da Empresa */}
      {fundamentals?.companyInfo && <CompanyInfo companyInfo={fundamentals.companyInfo} />}
    </div>
  );
}

export default AssetDetails;
