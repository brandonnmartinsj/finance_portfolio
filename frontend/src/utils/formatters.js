import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value, currency = 'BRL') => {
  if (value === null || value === undefined) return '-';

  const currencyMap = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'en-US'
  };

  const locale = currencyMap[currency] || 'pt-BR';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';

  const formatted = formatNumber(value, decimals);
  return `${formatted}%`;
};

export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '-';

  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);

  return format(dateObj, formatString, { locale: ptBR });
};

export const formatVolume = (volume) => {
  if (!volume || volume === 0) return '-';

  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(2)}B`;
  }
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }

  return volume.toString();
};

export const formatMarketCap = (value) => {
  return formatVolume(value);
};

export const formatChangePercent = (value) => {
  if (value === null || value === undefined) return '-';

  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPercent(value)}`;
};
