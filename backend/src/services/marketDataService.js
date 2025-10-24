import axios from 'axios';
import YahooFinanceService from './yahooFinanceService.js';

class MarketDataService {
  /**
   * Busca cotação de ações brasileiras na API Brapi
   * @param {string} ticker - Código do ativo (ex: PETR4.SA)
   * @returns {Promise<Object|null>} Dados da cotação ou null se não encontrado
   */
  static async getBrazilianStockPrice(ticker) {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';
      const response = await axios.get(`https://brapi.dev/api/quote/${ticker}?token=${brapiToken}`);
      if (response.data && response.data.results && response.data.results.length > 0) {
        const stock = response.data.results[0];
        return {
          ticker: stock.symbol,
          price: stock.regularMarketPrice,
          change: stock.regularMarketChangePercent,
          currency: stock.currency,
          source: 'brapi'
        };
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar cotação de ${ticker} na Brapi:`, error.message);
      return null;
    }
  }

  /**
   * Busca cotação de ações internacionais no Yahoo Finance
   * @param {string} ticker - Código do ativo (ex: AAPL, GOOGL)
   * @returns {Promise<Object|null>} Dados da cotação ou null se não encontrado
   */
  static async getStockPrice(ticker) {
    return await YahooFinanceService.getQuote(ticker);
  }

  /**
   * Busca cotação de um ativo usando a fonte apropriada
   * Tenta Brapi primeiro para ações brasileiras (.SA), depois Yahoo Finance
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object|null>} Dados da cotação ou null se não encontrado
   */
  static async getQuote(ticker) {
    // Se terminar com .SA, é ação brasileira
    if (ticker.endsWith('.SA')) {
      const brapiData = await this.getBrazilianStockPrice(ticker);
      if (brapiData) return brapiData;
    }

    // Tenta Yahoo Finance
    return await this.getStockPrice(ticker);
  }

  /**
   * Busca cotações de múltiplos ativos em paralelo
   * @param {string[]} tickers - Array com códigos dos ativos
   * @returns {Promise<Object[]>} Array com cotações (inclui erros quando não encontrado)
   */
  static async getMultipleQuotes(tickers) {
    const promises = tickers.map(ticker => this.getQuote(ticker));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
      return {
        ticker: tickers[index],
        error: 'Não foi possível obter cotação',
        price: null
      };
    });
  }

  /**
   * Retorna taxas do Tesouro Direto
   * @todo Integrar com API oficial do Tesouro Direto
   * @returns {Promise<Object[]>} Array com dados dos títulos (mock data)
   */
  static async getTesouroDiretoRates() {
    // Aqui você pode integrar com a API oficial do Tesouro Direto
    // Por enquanto, retornando dados mock
    return [
      { name: 'Tesouro Selic 2029', ticker: 'SELIC-2029', rate: 6.5, price: 1000.00 },
      { name: 'Tesouro IPCA+ 2035', ticker: 'IPCA-2035', rate: 6.2, price: 950.00 },
      { name: 'Tesouro Prefixado 2027', ticker: 'PRE-2027', rate: 10.5, price: 890.00 }
    ];
  }

  /**
   * Busca dados fundamentalistas completos de um ativo
   * Inclui informações da empresa, setor, métricas financeiras
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object|null>} Dados fundamentalistas ou null se não encontrado
   */
  static async getFundamentalData(ticker) {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';

      if (ticker.endsWith('.SA')) {
        const brapiTicker = ticker.replace('.SA', '');
        const response = await axios.get(
          `https://brapi.dev/api/quote/${brapiTicker}`,
          {
            params: {
              token: brapiToken,
              modules: 'summaryProfile'
            }
          }
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          return {
            ticker: data.symbol,
            companyInfo: {
              name: data.longName || data.shortName,
              sector: data.summaryProfile?.sector || 'N/A',
              industry: data.summaryProfile?.industry || 'N/A',
              description: data.summaryProfile?.longBusinessSummary || '',
              website: data.summaryProfile?.website || '',
              employees: data.summaryProfile?.fullTimeEmployees || 0,
              address: data.summaryProfile?.address1 || '',
              city: data.summaryProfile?.city || '',
              state: data.summaryProfile?.state || '',
              country: data.summaryProfile?.country || '',
              logoUrl: data.logourl || `https://icons.brapi.dev/icons/${data.symbol}.svg`
            },
            metrics: {
              priceEarnings: data.priceEarnings || null,
              earningsPerShare: data.earningsPerShare || null,
              marketCap: data.marketCap || 0,
              regularMarketPrice: data.regularMarketPrice || 0,
              currency: data.currency || 'BRL'
            },
            source: 'brapi'
          };
        }
      } else {
        return await YahooFinanceService.getFundamentalData(ticker);
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar dados fundamentalistas de ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Busca dados históricos de preço para gráficos
   * @param {string} ticker - Código do ativo
   * @param {string} range - Período (ex: '1mo', '3mo', '1y')
   * @param {string} interval - Intervalo (ex: '1d', '1wk')
   * @returns {Promise<Object|null>} Dados históricos OHLC ou null se não encontrado
   */
  static async getHistoricalData(ticker, range = '1mo', interval = '1d') {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';

      if (ticker.endsWith('.SA')) {
        // Brapi usa ticker sem o .SA
        const brapiTicker = ticker.replace('.SA', '');
        const response = await axios.get(
          `https://brapi.dev/api/quote/${brapiTicker}`,
          {
            params: {
              token: brapiToken,
              range,
              interval
            }
          }
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          return {
            ticker: data.symbol,
            range: data.usedRange || range,
            interval: data.usedInterval || interval,
            currency: data.currency,
            data: data.historicalDataPrice || [],
            validRanges: data.validRanges || [],
            validIntervals: data.validIntervals || [],
            source: 'brapi'
          };
        }
      } else {
        return await YahooFinanceService.getHistoricalData(ticker, range, interval);
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar dados históricos de ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Retorna histórico de dividendos de um ativo
   * @param {string} ticker - Código do ativo
   * @param {string} range - Período para buscar dividendos (padrão: 5y)
   * @returns {Promise<Object>} Objeto com histórico de dividendos
   */
  static async getDividendHistory(ticker, range = '5y') {
    try {
      if (ticker.endsWith('.SA')) {
        // Para ativos brasileiros, dados mockados (implementar Fundamentus posteriormente)
        const mockDividends = {
          'PETR4.SA': [
            { date: '2024-09-15', amount: 1.25, type: 'JCP' },
            { date: '2024-06-15', amount: 1.10, type: 'DIVIDENDO' },
            { date: '2024-03-15', amount: 1.15, type: 'JCP' },
            { date: '2023-12-15', amount: 1.30, type: 'DIVIDENDO' },
            { date: '2023-09-15', amount: 1.20, type: 'JCP' }
          ],
          'VALE3.SA': [
            { date: '2024-09-01', amount: 2.50, type: 'DIVIDENDO' },
            { date: '2024-06-01', amount: 2.30, type: 'DIVIDENDO' },
            { date: '2024-03-01', amount: 2.40, type: 'DIVIDENDO' },
            { date: '2023-12-01', amount: 2.60, type: 'DIVIDENDO' }
          ]
        };

        return {
          ticker,
          dividends: mockDividends[ticker] || [],
          source: 'mock',
          note: 'Dados de demonstração. Use Fundamentus para dados reais.'
        };
      } else {
        return await YahooFinanceService.getDividendHistory(ticker, range);
      }
    } catch (error) {
      console.error(`Erro ao buscar dividendos de ${ticker}:`, error.message);
      return { ticker, dividends: [], source: 'error' };
    }
  }

  /**
   * Busca estatísticas de preço de um ativo
   * Inclui máxima/mínima 52 semanas, volume, variação
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object|null>} Estatísticas de preço ou null se não encontrado
   */
  static async getPriceStatistics(ticker) {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';

      if (ticker.endsWith('.SA')) {
        const brapiTicker = ticker.replace('.SA', '');
        const response = await axios.get(
          `https://brapi.dev/api/quote/${brapiTicker}`,
          {
            params: {
              token: brapiToken
            }
          }
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          return {
            ticker: data.symbol,
            currentPrice: data.regularMarketPrice || 0,
            currency: data.currency || 'BRL',
            fiftyTwoWeek: {
              high: data.fiftyTwoWeekHigh || 0,
              low: data.fiftyTwoWeekLow || 0,
              range: data.fiftyTwoWeekRange || ''
            },
            regularMarket: {
              dayHigh: data.regularMarketDayHigh || 0,
              dayLow: data.regularMarketDayLow || 0,
              dayRange: data.regularMarketDayRange || '',
              change: data.regularMarketChange || 0,
              changePercent: data.regularMarketChangePercent || 0,
              volume: data.regularMarketVolume || 0,
              previousClose: data.regularMarketPreviousClose || 0,
              open: data.regularMarketOpen || 0
            },
            source: 'brapi'
          };
        }
      } else {
        const fundamental = await YahooFinanceService.getFundamentalData(ticker);
        if (fundamental && fundamental.priceStats) {
          return {
            ticker,
            currentPrice: fundamental.priceStats.currentPrice,
            currency: fundamental.currency,
            fiftyTwoWeek: {
              high: fundamental.priceStats.fiftyTwoWeekHigh,
              low: fundamental.priceStats.fiftyTwoWeekLow,
              range: `${fundamental.priceStats.fiftyTwoWeekLow} - ${fundamental.priceStats.fiftyTwoWeekHigh}`
            },
            regularMarket: {
              dayHigh: fundamental.priceStats.dayHigh,
              dayLow: fundamental.priceStats.dayLow,
              dayRange: `${fundamental.priceStats.dayLow} - ${fundamental.priceStats.dayHigh}`,
              change: fundamental.priceStats.currentPrice - fundamental.priceStats.previousClose,
              changePercent: ((fundamental.priceStats.currentPrice - fundamental.priceStats.previousClose) / fundamental.priceStats.previousClose) * 100,
              volume: fundamental.priceStats.volume,
              previousClose: fundamental.priceStats.previousClose,
              open: fundamental.priceStats.open
            },
            source: 'yahoo'
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas de ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Busca símbolos por termo de pesquisa
   * @param {string} query - Termo de busca (nome da empresa ou ticker)
   * @returns {Promise<Array>} Array de símbolos encontrados
   */
  static async searchSymbol(query) {
    return await YahooFinanceService.searchSymbol(query);
  }

  /**
   * Busca histórico de splits (desdobramentos) de ações
   * @param {string} ticker - Código do ativo
   * @param {string} range - Período (padrão: 5y)
   * @returns {Promise<Object>} Objeto com histórico de splits
   */
  static async getSplitHistory(ticker, range = '5y') {
    if (!ticker.endsWith('.SA')) {
      return await YahooFinanceService.getSplitHistory(ticker, range);
    }
    return { ticker, splits: [], source: 'not_available' };
  }
}

export default MarketDataService;
