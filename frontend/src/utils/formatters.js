import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um valor monetário com base na moeda especificada
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Código da moeda (BRL, USD, EUR)
 * @returns {string} Valor formatado como moeda ou '-' se inválido
 */
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

/**
 * Formata um número com casas decimais
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Número formatado ou '-' se inválido
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formata um valor como percentual
 * @param {number} value - Valor a ser formatado (ex: 5.25 para 5.25%)
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Valor formatado com símbolo % ou '-' se inválido
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';

  const formatted = formatNumber(value, decimals);
  return `${formatted}%`;
};

/**
 * Formata uma data usando date-fns
 * @param {string|number|Date} date - Data a ser formatada (string, timestamp ou Date)
 * @param {string} formatString - Formato desejado (padrão: 'dd/MM/yyyy')
 * @returns {string} Data formatada ou '-' se inválida
 */
export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '-';

  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);

  return format(dateObj, formatString, { locale: ptBR });
};

/**
 * Formata volume usando abreviações (K, M, B)
 * @param {number} volume - Volume a ser formatado
 * @returns {string} Volume abreviado (ex: '1.5M', '2.3B') ou '-' se zero/inválido
 */
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

/**
 * Formata valor de mercado (market cap) usando mesma lógica de volume
 * @param {number} value - Valor de mercado
 * @returns {string} Valor abreviado (ex: '10.5B') ou '-' se zero/inválido
 */
export const formatMarketCap = (value) => {
  return formatVolume(value);
};

/**
 * Formata variação percentual com sinal positivo/negativo
 * @param {number} value - Valor da variação (ex: 5.25 ou -3.15)
 * @returns {string} Variação formatada com sinal (ex: '+5.25%', '-3.15%') ou '-' se inválido
 */
export const formatChangePercent = (value) => {
  if (value === null || value === undefined) return '-';

  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPercent(value)}`;
};
