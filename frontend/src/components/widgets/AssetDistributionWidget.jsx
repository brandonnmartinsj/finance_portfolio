import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import AssetDistribution from '../analytics/AssetDistribution';
import WidgetContainer from './WidgetContainer';

const AssetDistributionWidget = ({ onRemove }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getAssetDistribution();
      setData(response.data);
    } catch (error) {
      console.error('Error loading asset distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetContainer title="Distribuição por Ativo" onRemove={onRemove}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ marginTop: '-20px' }}>
          <AssetDistribution data={data} />
        </div>
      )}
    </WidgetContainer>
  );
};

export default AssetDistributionWidget;
