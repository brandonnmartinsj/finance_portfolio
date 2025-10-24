import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import PortfolioEvolution from '../analytics/PortfolioEvolution';
import WidgetContainer from './WidgetContainer';

const PortfolioEvolutionWidget = ({ onRemove }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getPortfolioEvolution();
      setData(response.data);
    } catch (error) {
      console.error('Error loading portfolio evolution:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetContainer title="Evolução Patrimonial" onRemove={onRemove}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ marginTop: '-20px' }}>
          <PortfolioEvolution data={data} />
        </div>
      )}
    </WidgetContainer>
  );
};

export default PortfolioEvolutionWidget;
