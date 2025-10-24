import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import TopPerformers from '../analytics/TopPerformers';
import WidgetContainer from './WidgetContainer';

const TopPerformersWidget = ({ onRemove }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getTopPerformers();
      setData(response.data);
    } catch (error) {
      console.error('Error loading top performers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetContainer title="Melhores e Piores" onRemove={onRemove}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ marginTop: '-20px' }}>
          <TopPerformers data={data} />
        </div>
      )}
    </WidgetContainer>
  );
};

export default TopPerformersWidget;
