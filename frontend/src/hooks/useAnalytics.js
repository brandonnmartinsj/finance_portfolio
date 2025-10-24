import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ANALYTICS_KEYS = {
  portfolioEvolution: 'portfolioEvolution',
  assetDistribution: 'assetDistribution',
  assetTypeDistribution: 'assetTypeDistribution',
  topPerformers: 'topPerformers',
  portfolioMetrics: 'portfolioMetrics',
  sectorDistribution: 'sectorDistribution',
  dividendAnalysis: 'dividendAnalysis',
  riskMetrics: 'riskMetrics',
};

export const usePortfolioEvolution = (filters = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.portfolioEvolution, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      const queryString = params.toString();
      const url = queryString ? `/analytics/portfolio-evolution?${queryString}` : '/analytics/portfolio-evolution';
      const response = await api.get(url);
      return response.data;
    },
  });
};

export const useAssetDistribution = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.assetDistribution],
    queryFn: async () => {
      const response = await api.get('/analytics/asset-distribution');
      return response.data;
    },
  });
};

export const useAssetTypeDistribution = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.assetTypeDistribution],
    queryFn: async () => {
      const response = await api.get('/analytics/asset-type-distribution');
      return response.data;
    },
  });
};

export const useTopPerformers = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.topPerformers],
    queryFn: async () => {
      const response = await api.get('/analytics/top-performers');
      return response.data;
    },
  });
};

export const usePortfolioMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.portfolioMetrics],
    queryFn: async () => {
      const response = await api.get('/analytics/portfolio-metrics');
      return response.data;
    },
  });
};

export const useSectorDistribution = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.sectorDistribution],
    queryFn: async () => {
      const response = await api.get('/analytics/sector-distribution');
      return response.data;
    },
  });
};

export const useDividendAnalysis = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.dividendAnalysis],
    queryFn: async () => {
      const response = await api.get('/analytics/dividend-analysis');
      return response.data;
    },
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEYS.riskMetrics],
    queryFn: async () => {
      const response = await api.get('/analytics/risk-metrics');
      return response.data;
    },
  });
};

export const useAnalyticsData = (filters = {}) => {
  const portfolioEvolution = usePortfolioEvolution(filters);
  const assetDistribution = useAssetDistribution();
  const assetTypeDistribution = useAssetTypeDistribution();
  const topPerformers = useTopPerformers();
  const metrics = usePortfolioMetrics();
  const sectorDistribution = useSectorDistribution();
  const dividendAnalysis = useDividendAnalysis();
  const riskMetrics = useRiskMetrics();

  const isLoading =
    portfolioEvolution.isLoading ||
    assetDistribution.isLoading ||
    assetTypeDistribution.isLoading ||
    topPerformers.isLoading ||
    metrics.isLoading ||
    sectorDistribution.isLoading ||
    dividendAnalysis.isLoading ||
    riskMetrics.isLoading;

  const error =
    portfolioEvolution.error ||
    assetDistribution.error ||
    assetTypeDistribution.error ||
    topPerformers.error ||
    metrics.error ||
    sectorDistribution.error ||
    dividendAnalysis.error ||
    riskMetrics.error;

  const refetch = () => {
    portfolioEvolution.refetch();
    assetDistribution.refetch();
    assetTypeDistribution.refetch();
    topPerformers.refetch();
    metrics.refetch();
    sectorDistribution.refetch();
    dividendAnalysis.refetch();
    riskMetrics.refetch();
  };

  return {
    portfolioEvolution: portfolioEvolution.data || [],
    assetDistribution: assetDistribution.data || [],
    assetTypeDistribution: assetTypeDistribution.data || [],
    topPerformers: topPerformers.data || [],
    metrics: metrics.data || null,
    sectorDistribution: sectorDistribution.data || [],
    dividendAnalysis: dividendAnalysis.data || null,
    riskMetrics: riskMetrics.data || null,
    isLoading,
    error,
    refetch,
  };
};
