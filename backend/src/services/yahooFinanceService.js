import axios from 'axios';

const YAHOO_FINANCE_API_BASE = 'https://query1.finance.yahoo.com';
const YAHOO_FINANCE_API_V2 = 'https://query2.finance.yahoo.com';

class YahooFinanceService {
  static async makeRequest(url, params = {}) {
    try {
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`Yahoo Finance request failed: ${error.message}`);
      throw error;
    }
  }

  static async getQuote(ticker) {
    try {
      const url = `${YAHOO_FINANCE_API_BASE}/v8/finance/chart/${ticker}`;
      const data = await this.makeRequest(url, {
        interval: '1d',
        range: '1d'
      });

      if (data?.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = ((price - previousClose) / previousClose) * 100;

        return {
          ticker,
          price,
          previousClose,
          change,
          changePercent: change,
          currency: meta.currency,
          marketState: meta.marketState,
          exchangeName: meta.exchangeName,
          instrumentType: meta.instrumentType,
          timezone: meta.timezone,
          source: 'yahoo'
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error.message);
      return null;
    }
  }

  static async getQuoteSummary(ticker, modules = ['summaryDetail', 'assetProfile', 'defaultKeyStatistics', 'financialData']) {
    try {
      const url = `${YAHOO_FINANCE_API_BASE}/v10/finance/quoteSummary/${ticker}`;
      const data = await this.makeRequest(url, {
        modules: modules.join(',')
      });

      if (data?.quoteSummary?.result?.[0]) {
        return data.quoteSummary.result[0];
      }

      return null;
    } catch (error) {
      console.error(`Error fetching quote summary for ${ticker}:`, error.message);
      return null;
    }
  }

  static async getFundamentalData(ticker) {
    try {
      const summary = await this.getQuoteSummary(ticker, [
        'assetProfile',
        'summaryDetail',
        'defaultKeyStatistics',
        'financialData',
        'price'
      ]);

      if (!summary) return null;

      const profile = summary.assetProfile || {};
      const summaryDetail = summary.summaryDetail || {};
      const keyStats = summary.defaultKeyStatistics || {};
      const financial = summary.financialData || {};
      const priceInfo = summary.price || {};

      return {
        ticker,
        companyInfo: {
          name: priceInfo.longName || priceInfo.shortName || ticker,
          sector: profile.sector || 'N/A',
          industry: profile.industry || 'N/A',
          description: profile.longBusinessSummary || '',
          website: profile.website || '',
          employees: profile.fullTimeEmployees || 0,
          address: profile.address1 || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          phone: profile.phone || ''
        },
        valuation: {
          marketCap: priceInfo.marketCap?.raw || 0,
          enterpriseValue: keyStats.enterpriseValue?.raw || 0,
          priceToBook: keyStats.priceToBook?.raw || null,
          priceToSales: priceInfo.priceToSalesTrailing12Months?.raw || null,
          priceEarnings: priceInfo.trailingPE?.raw || null,
          forwardPE: priceInfo.forwardPE?.raw || null,
          pegRatio: keyStats.pegRatio?.raw || null,
          evToRevenue: keyStats.enterpriseToRevenue?.raw || null,
          evToEbitda: keyStats.enterpriseToEbitda?.raw || null
        },
        profitability: {
          profitMargin: financial.profitMargins?.raw || null,
          operatingMargin: financial.operatingMargins?.raw || null,
          returnOnAssets: financial.returnOnAssets?.raw || null,
          returnOnEquity: financial.returnOnEquity?.raw || null,
          revenue: financial.totalRevenue?.raw || 0,
          revenuePerShare: financial.revenuePerShare?.raw || null,
          grossProfit: financial.grossProfits?.raw || 0,
          ebitda: financial.ebitda?.raw || 0
        },
        dividends: {
          dividendRate: summaryDetail.dividendRate?.raw || 0,
          dividendYield: summaryDetail.dividendYield?.raw || 0,
          exDividendDate: summaryDetail.exDividendDate?.fmt || null,
          payoutRatio: summaryDetail.payoutRatio?.raw || null,
          fiveYearAvgDividendYield: summaryDetail.fiveYearAvgDividendYield?.raw || null,
          trailingAnnualDividendRate: summaryDetail.trailingAnnualDividendRate?.raw || 0,
          trailingAnnualDividendYield: summaryDetail.trailingAnnualDividendYield?.raw || 0
        },
        priceStats: {
          currentPrice: priceInfo.regularMarketPrice?.raw || 0,
          previousClose: priceInfo.regularMarketPreviousClose?.raw || 0,
          open: priceInfo.regularMarketOpen?.raw || 0,
          dayLow: priceInfo.regularMarketDayLow?.raw || 0,
          dayHigh: priceInfo.regularMarketDayHigh?.raw || 0,
          fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow?.raw || 0,
          fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh?.raw || 0,
          fiftyDayAverage: summaryDetail.fiftyDayAverage?.raw || 0,
          twoHundredDayAverage: summaryDetail.twoHundredDayAverage?.raw || 0,
          volume: priceInfo.regularMarketVolume?.raw || 0,
          averageVolume: summaryDetail.averageVolume?.raw || 0,
          averageVolume10days: summaryDetail.averageVolume10days?.raw || 0
        },
        shares: {
          sharesOutstanding: keyStats.sharesOutstanding?.raw || 0,
          floatShares: keyStats.floatShares?.raw || 0,
          sharesShort: keyStats.sharesShort?.raw || 0,
          shortRatio: keyStats.shortRatio?.raw || 0,
          shortPercentOfFloat: keyStats.shortPercentOfFloat?.raw || 0,
          heldPercentInsiders: keyStats.heldPercentInsiders?.raw || 0,
          heldPercentInstitutions: keyStats.heldPercentInstitutions?.raw || 0
        },
        perShare: {
          earningsPerShare: keyStats.trailingEps?.raw || null,
          forwardEps: financial.currentPrice?.raw || null,
          bookValue: keyStats.bookValue?.raw || null,
          revenuePerShare: financial.revenuePerShare?.raw || null
        },
        currency: priceInfo.currency || 'USD',
        exchange: priceInfo.exchange || priceInfo.exchangeName || 'N/A',
        quoteType: priceInfo.quoteType || 'EQUITY',
        source: 'yahoo'
      };
    } catch (error) {
      console.error(`Error fetching fundamental data for ${ticker}:`, error.message);
      return null;
    }
  }

  static async getHistoricalData(ticker, range = '1mo', interval = '1d') {
    try {
      const url = `${YAHOO_FINANCE_API_BASE}/v8/finance/chart/${ticker}`;
      const data = await this.makeRequest(url, { range, interval });

      if (data?.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0] || {};

        const historicalData = timestamps.map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          timestamp,
          open: quote.open?.[index] || null,
          high: quote.high?.[index] || null,
          low: quote.low?.[index] || null,
          close: quote.close?.[index] || null,
          volume: quote.volume?.[index] || 0
        }));

        return {
          ticker,
          range,
          interval,
          currency: result.meta.currency,
          data: historicalData,
          source: 'yahoo'
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching historical data for ${ticker}:`, error.message);
      return null;
    }
  }

  static async getDividendHistory(ticker, range = '5y') {
    try {
      const url = `${YAHOO_FINANCE_API_BASE}/v8/finance/chart/${ticker}`;
      const data = await this.makeRequest(url, {
        range,
        interval: '1d',
        events: 'div'
      });

      if (data?.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const events = result.events?.dividends || {};

        const dividends = Object.values(events).map(div => ({
          date: new Date(div.date * 1000).toISOString().split('T')[0],
          timestamp: div.date,
          amount: div.amount,
          type: 'DIVIDEND'
        }));

        return {
          ticker,
          dividends: dividends.sort((a, b) => b.timestamp - a.timestamp),
          source: 'yahoo'
        };
      }

      return { ticker, dividends: [], source: 'yahoo' };
    } catch (error) {
      console.error(`Error fetching dividend history for ${ticker}:`, error.message);
      return { ticker, dividends: [], source: 'yahoo', error: error.message };
    }
  }

  static async getSplitHistory(ticker, range = '5y') {
    try {
      const url = `${YAHOO_FINANCE_API_BASE}/v8/finance/chart/${ticker}`;
      const data = await this.makeRequest(url, {
        range,
        interval: '1d',
        events: 'split'
      });

      if (data?.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const events = result.events?.splits || {};

        const splits = Object.values(events).map(split => ({
          date: new Date(split.date * 1000).toISOString().split('T')[0],
          timestamp: split.date,
          numerator: split.numerator,
          denominator: split.denominator,
          splitRatio: `${split.numerator}:${split.denominator}`
        }));

        return {
          ticker,
          splits: splits.sort((a, b) => b.timestamp - a.timestamp),
          source: 'yahoo'
        };
      }

      return { ticker, splits: [], source: 'yahoo' };
    } catch (error) {
      console.error(`Error fetching split history for ${ticker}:`, error.message);
      return { ticker, splits: [], source: 'yahoo', error: error.message };
    }
  }

  static async searchSymbol(query) {
    try {
      const url = `${YAHOO_FINANCE_API_BASE}/v1/finance/search`;
      const data = await this.makeRequest(url, {
        q: query,
        quotesCount: 10,
        newsCount: 0
      });

      if (data?.quotes) {
        return data.quotes.map(quote => ({
          symbol: quote.symbol,
          shortname: quote.shortname || quote.longname,
          longname: quote.longname,
          type: quote.quoteType,
          exchange: quote.exchange,
          sector: quote.sector,
          industry: quote.industry,
          score: quote.score
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error searching for ${query}:`, error.message);
      return [];
    }
  }
}

export default YahooFinanceService;
