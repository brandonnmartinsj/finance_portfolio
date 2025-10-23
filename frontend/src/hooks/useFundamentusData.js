import { useState, useEffect } from 'react';
import { marketService } from '../services/api';

export const useFundamentusData = (ticker) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await marketService.getFundamentusData(ticker);
        setData(response.data);
      } catch (err) {
        console.error(`Error fetching Fundamentus data for ${ticker}:`, err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  return { data, loading, error };
};

export default useFundamentusData;
