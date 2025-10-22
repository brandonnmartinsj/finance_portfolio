import { useState, useEffect } from 'react';
import { marketService } from '../services/api';

export const useChartData = (ticker, range = '1mo', interval = '1d') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!ticker) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await marketService.getHistorical(ticker, range, interval);
        setData(response.data);
      } catch (err) {
        console.error('Erro ao carregar dados históricos:', err);
        setError('Erro ao carregar dados do gráfico');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, range, interval]);

  return { data, loading, error };
};
