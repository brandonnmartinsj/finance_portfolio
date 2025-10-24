import axios from 'axios';

const AWESOMEAPI_BASE_URL = 'https://economia.awesomeapi.com.br/json/last';

class CurrencyService {
  async getExchangeRate(from = 'USD', to = 'BRL') {
    try {
      const pair = `${from}-${to}`;
      const response = await axios.get(`${AWESOMEAPI_BASE_URL}/${pair}`);

      const key = pair.replace('-', '');
      const data = response.data[key];

      if (!data) {
        throw new Error(`Exchange rate not found for ${pair}`);
      }

      return {
        from,
        to,
        rate: parseFloat(data.bid),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        timestamp: data.create_date
      };
    } catch (error) {
      console.error('Error fetching exchange rate:', error.message);

      if (from === 'USD' && to === 'BRL') {
        console.warn('Using fallback exchange rate: 5.00');
        return {
          from,
          to,
          rate: 5.00,
          high: 5.00,
          low: 5.00,
          timestamp: new Date().toISOString(),
          fallback: true
        };
      }

      throw error;
    }
  }

  convertCurrency(amount, exchangeRate) {
    return amount * exchangeRate;
  }

  async convertToReais(amount, currency = 'BRL') {
    if (currency === 'BRL') {
      return {
        originalAmount: amount,
        originalCurrency: currency,
        convertedAmount: amount,
        exchangeRate: 1.0
      };
    }

    const rateInfo = await this.getExchangeRate(currency, 'BRL');

    return {
      originalAmount: amount,
      originalCurrency: currency,
      convertedAmount: this.convertCurrency(amount, rateInfo.rate),
      exchangeRate: rateInfo.rate,
      rateInfo
    };
  }
}

export default new CurrencyService();
