import axios from 'axios';

class MarketDataService {
  // Brapi - API para mercado brasileiro
  static async getBrazilianStockPrice(ticker) {
    try {
      const response = await axios.get(`https://brapi.dev/api/quote/${ticker}?token=demo`);
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

  // Yahoo Finance - API para mercado americano e outros
  static async getStockPrice(ticker) {
    try {
      // Usando uma API alternativa gratuita do Yahoo Finance
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
        {
          params: {
            interval: '1d',
            range: '1d'
          }
        }
      );

      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0];
        const price = result.meta.regularMarketPrice;
        const previousClose = result.meta.previousClose;
        const change = ((price - previousClose) / previousClose) * 100;

        return {
          ticker: ticker,
          price: price,
          change: change,
          currency: result.meta.currency,
          source: 'yahoo'
        };
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar cotação de ${ticker} no Yahoo Finance:`, error.message);
      return null;
    }
  }

  // Método unificado que tenta Brapi primeiro (para ações brasileiras) e depois Yahoo
  static async getQuote(ticker) {
    // Se terminar com .SA, é ação brasileira
    if (ticker.endsWith('.SA')) {
      const brapiData = await this.getBrazilianStockPrice(ticker);
      if (brapiData) return brapiData;
    }

    // Tenta Yahoo Finance
    return await this.getStockPrice(ticker);
  }

  // Buscar cotações de múltiplos ativos
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

  // Dados do Tesouro Direto (mock - idealmente usar API do Tesouro)
  static async getTesouroDiretoRates() {
    // Aqui você pode integrar com a API oficial do Tesouro Direto
    // Por enquanto, retornando dados mock
    return [
      { name: 'Tesouro Selic 2029', ticker: 'SELIC-2029', rate: 6.5, price: 1000.00 },
      { name: 'Tesouro IPCA+ 2035', ticker: 'IPCA-2035', rate: 6.2, price: 950.00 },
      { name: 'Tesouro Prefixado 2027', ticker: 'PRE-2027', rate: 10.5, price: 890.00 }
    ];
  }
}

export default MarketDataService;
