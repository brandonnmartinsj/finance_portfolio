import Transaction from '../models/Transaction.js';
import Dividend from '../models/Dividend.js';
import FundamentusScraperService from './fundamentusScraperService.js';

class DividendSyncService {
  static parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  }

  static formatDateToISO(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  static async getTickersWithFirstTransactionDate(userId) {
    const transactions = Transaction.getAll(userId);

    const tickerMap = {};

    transactions.forEach(transaction => {
      const ticker = transaction.ticker;
      const transactionDate = new Date(transaction.date);

      if (!tickerMap[ticker] || transactionDate < tickerMap[ticker]) {
        tickerMap[ticker] = transactionDate;
      }
    });

    return Object.entries(tickerMap).map(([ticker, firstDate]) => ({
      ticker,
      firstTransactionDate: firstDate
    }));
  }

  static async syncDividendsForTicker(userId, ticker, firstTransactionDate) {
    try {
      const cleanTicker = ticker.replace('.SA', '').toUpperCase();
      console.log(`Syncing dividends for ${cleanTicker} from ${firstTransactionDate.toISOString().split('T')[0]}...`);

      const dividendData = await FundamentusScraperService.getDividendsData(cleanTicker);

      if (!dividendData || !dividendData.dividends || dividendData.dividends.length === 0) {
        console.log(`No dividends found for ${cleanTicker}`);
        return { ticker: cleanTicker, synced: 0, skipped: 0, errors: 0 };
      }

      let synced = 0;
      let skipped = 0;
      let errors = 0;

      for (const dividend of dividendData.dividends) {
        try {
          const dividendDate = this.parseDate(dividend.date);

          if (dividendDate < firstTransactionDate) {
            continue;
          }

          const paymentDate = dividend.paymentDate && dividend.paymentDate !== '-'
            ? this.formatDateToISO(dividend.paymentDate)
            : this.formatDateToISO(dividend.date);

          const exDate = this.formatDateToISO(dividend.date);

          const existingDividends = Dividend.getByTicker(ticker, userId);
          const isDuplicate = existingDividends.some(
            existing => existing.payment_date === paymentDate && existing.ex_date === exDate
          );

          if (isDuplicate) {
            skipped++;
            continue;
          }

          Dividend.create({
            ticker,
            type: dividend.type || 'DIVIDEND',
            amount: dividend.value || 0,
            payment_date: paymentDate,
            ex_date: exDate,
            notes: `Synced from Fundamentus - ${dividend.perShares} shares`
          }, userId);

          synced++;
        } catch (error) {
          console.error(`Error processing dividend for ${cleanTicker}:`, error.message);
          errors++;
        }
      }

      console.log(`${cleanTicker}: synced ${synced}, skipped ${skipped}, errors ${errors}`);
      return { ticker: cleanTicker, synced, skipped, errors };
    } catch (error) {
      console.error(`Error syncing dividends for ${ticker}:`, error.message);
      return { ticker, synced: 0, skipped: 0, errors: 1, error: error.message };
    }
  }

  static async syncAllDividends(userId) {
    const tickers = await this.getTickersWithFirstTransactionDate(userId);

    if (tickers.length === 0) {
      return {
        success: true,
        message: 'No tickers found in portfolio',
        results: []
      };
    }

    const results = [];

    for (const { ticker, firstTransactionDate } of tickers) {
      const assetType = ticker.toUpperCase();

      if (assetType.includes('BTC') || assetType.includes('ETH') || ticker.includes('CRYPTO')) {
        console.log(`Skipping crypto asset: ${ticker}`);
        continue;
      }

      if (ticker.includes('CDB') || ticker.includes('LCI') || ticker.includes('LCA')) {
        console.log(`Skipping fixed income asset: ${ticker}`);
        continue;
      }

      const result = await this.syncDividendsForTicker(userId, ticker, firstTransactionDate);
      results.push(result);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    return {
      success: true,
      message: `Sync completed: ${totalSynced} dividends synced, ${totalSkipped} skipped, ${totalErrors} errors`,
      summary: {
        totalSynced,
        totalSkipped,
        totalErrors,
        tickersProcessed: results.length
      },
      results
    };
  }
}

export default DividendSyncService;
