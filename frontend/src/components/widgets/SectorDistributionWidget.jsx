import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/api';
import SectorDistribution from '../analytics/SectorDistribution';
import WidgetContainer from './WidgetContainer';

const SectorDistributionWidget = ({ onRemove }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading sector distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetContainer title="Distribuição por Setor" onRemove={onRemove}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ marginTop: '-20px' }}>
          <SectorDistribution summary={summary} />
        </div>
      )}
    </WidgetContainer>
  );
};

export default SectorDistributionWidget;
