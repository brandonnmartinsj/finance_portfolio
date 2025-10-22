import { useState, useEffect } from 'react';
import { marketService } from '../services/api';

export const useAssetData = (ticker) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    fundamentals: null,
    dividends: null,
    statistics: null
  });

  useEffect(() => {
    if (!ticker) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [fundamentalsRes, dividendsRes, statisticsRes] = await Promise.all([
          marketService.getFundamentals(ticker),
          marketService.getDividends(ticker),
          marketService.getStatistics(ticker)
        ]);

        setData({
          fundamentals: fundamentalsRes.data,
          dividends: dividendsRes.data,
          statistics: statisticsRes.data
        });
      } catch (err) {
        console.error('Erro ao carregar dados do ativo:', err);
        setError('Erro ao carregar informações do ativo. Verifique se o ticker está correto.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker]);

  return { ...data, loading, error };
};
