import React, { useState } from 'react';
import { exportToCSV } from '../utils/exportData';

const ExportButton = ({ data, type = 'analytics', disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format) => {
    setIsExporting(true);

    try {
      if (format === 'csv') {
        exportDataAsCSV();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportDataAsCSV = () => {
    if (!data) {
      alert('Não há dados para exportar');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];

    if (type === 'analytics') {
      const { portfolioEvolution, assetDistribution, topPerformers, metrics } = data;

      if (portfolioEvolution?.length > 0) {
        const evolutionData = portfolioEvolution.map(item => ({
          'Data': item.date,
          'Investido': item.invested,
          'Valor Atual': item.currentValue,
          'Lucro/Prejuízo': item.profitLoss,
          'Rentabilidade %': ((item.profitLoss / item.invested) * 100).toFixed(2)
        }));
        exportToCSV(evolutionData, `evolucao_patrimonial_${timestamp}.csv`);
      }

      if (assetDistribution?.length > 0) {
        const distributionData = assetDistribution.map(item => ({
          'Ativo': item.ticker,
          'Tipo': item.type,
          'Quantidade': item.quantity,
          'Valor Atual': item.value,
          'Total Investido': item.invested,
          'Percentual do Portfolio': ((item.value / assetDistribution.reduce((sum, a) => sum + a.value, 0)) * 100).toFixed(2)
        }));
        exportToCSV(distributionData, `distribuicao_ativos_${timestamp}.csv`);
      }

      if (topPerformers?.length > 0) {
        const performersData = topPerformers.map(item => ({
          'Ativo': item.ticker,
          'Tipo': item.type,
          'Quantidade': item.quantity,
          'Investido': item.invested,
          'Valor Atual': item.currentValue,
          'Lucro/Prejuízo': item.profitLoss,
          'Rentabilidade %': item.percentGain
        }));
        exportToCSV(performersData, `performance_ativos_${timestamp}.csv`);
      }
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isExporting}
        style={{
          padding: '10px 20px',
          backgroundColor: disabled ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.backgroundColor = '#1d4ed8';
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.currentTarget.style.backgroundColor = '#2563eb';
        }}
      >
        <span>📊</span>
        <span>{isExporting ? 'Exportando...' : 'Exportar Dados'}</span>
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          <button
            onClick={() => handleExport('csv')}
            style={{
              width: '100%',
              padding: '12px 16px',
              textAlign: 'left',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>📄</span>
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>Exportar CSV</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Todos os dados analíticos
              </div>
            </div>
          </button>
        </div>
      )}

      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default ExportButton;
