import React, { useState, useEffect } from 'react';
import { dividendService } from '../../services/api';
import DividendAnalysis from '../analytics/DividendAnalysis';
import WidgetContainer from './WidgetContainer';

const DividendAnalysisWidget = ({ onRemove }) => {
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [monthlyRes, yearlyRes] = await Promise.all([
        dividendService.getMonthly(),
        dividendService.getYearly()
      ]);
      setMonthly(monthlyRes.data);
      setYearly(yearlyRes.data);
    } catch (error) {
      console.error('Error loading dividend analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetContainer title="Análise de Dividendos" onRemove={onRemove}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ marginTop: '-20px' }}>
          <DividendAnalysis monthly={monthly} yearly={yearly} />
        </div>
      )}
    </WidgetContainer>
  );
};

export default DividendAnalysisWidget;
