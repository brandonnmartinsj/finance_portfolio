import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketService } from '../services/api';
import { useFundamentusData } from '../hooks/useFundamentusData';
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
  const [showFundamentusData, setShowFundamentusData] = useState(false);

  const [selectedRange, setSelectedRange] = useState('1mo');
  const [selectedInterval, setSelectedInterval] = useState('1d');

  const { data: fundamentusData, loading: fundamentusLoading, error: fundamentusError } =
    useFundamentusData(showFundamentusData ? ticker : null);

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
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setShowFundamentusData(!showFundamentusData)}
            style={{
              padding: '10px 20px',
              backgroundColor: showFundamentusData ? '#6b7280' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showFundamentusData ? 'Ocultar' : 'Ver'} Análise Fundamentalista Completa (Fundamentus)
          </button>
        </div>
      </div>

      {/* Dados do Fundamentus */}
      {showFundamentusData && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Análise Fundamentalista Detalhada</h2>

          {fundamentusLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Carregando dados do Fundamentus...
            </div>
          )}

          {fundamentusError && (
            <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '6px', color: '#dc2626' }}>
              <strong>Erro ao carregar dados:</strong> {fundamentusError}
            </div>
          )}

          {fundamentusData && (
            <div>
              {/* Indicadores de Valuation */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#1f2937' }}>Indicadores de Valuation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>P/L</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.valuation.priceToEarnings?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>P/VP</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.valuation.priceToBook?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>EV/EBIT</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.valuation.evToEBIT?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>EV/EBITDA</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.valuation.evToEBITDA?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicadores de Rentabilidade */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#1f2937' }}>Indicadores de Rentabilidade</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>ROE</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.profitability.roe ? `${fundamentusData.profitability.roe.toFixed(2)}%` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>ROA</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.profitability.roa ? `${fundamentusData.profitability.roa.toFixed(2)}%` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>ROIC</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.profitability.roic ? `${fundamentusData.profitability.roic.toFixed(2)}%` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Margem Líquida</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.profitability.netMargin ? `${fundamentusData.profitability.netMargin.toFixed(2)}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Balanço Patrimonial */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#1f2937' }}>Balanço Patrimonial</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Ativo Total</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.balanceSheet.totalAssets
                        ? (fundamentusData.balanceSheet.totalAssets / 1_000_000_000).toFixed(2) + 'B'
                        : 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Dívida Bruta</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.balanceSheet.grossDebt
                        ? (fundamentusData.balanceSheet.grossDebt / 1_000_000_000).toFixed(2) + 'B'
                        : 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Dívida Líquida</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.balanceSheet.netDebt
                        ? (fundamentusData.balanceSheet.netDebt / 1_000_000_000).toFixed(2) + 'B'
                        : 'N/A'}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Patrimônio Líquido</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                      {fundamentusData.balanceSheet.equity
                        ? (fundamentusData.balanceSheet.equity / 1_000_000_000).toFixed(2) + 'B'
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dividendos */}
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#1f2937' }}>Dividendos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Dividend Yield</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                      {fundamentusData.dividends.dividendYield
                        ? `${fundamentusData.dividends.dividendYield.toFixed(2)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                <small style={{ color: '#1e40af' }}>
                  Fonte: Fundamentus • Atualizado em {new Date(fundamentusData.metadata.scrapedAt).toLocaleString('pt-BR')}
                </small>
              </div>
            </div>
          )}
        </div>
      )}

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
