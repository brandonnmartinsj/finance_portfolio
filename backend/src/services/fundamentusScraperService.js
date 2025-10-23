import axios from 'axios';
import * as cheerio from 'cheerio';

const FUNDAMENTUS_BASE_URL = 'https://fundamentus.com.br';

class FundamentusScraperService {
  static convertToNumber(value) {
    if (!value || value === '-') return null;

    const cleanValue = value
      .replace(/\./g, '')
      .replace(',', '.')
      .replace('%', '')
      .trim();

    const number = parseFloat(cleanValue);
    return isNaN(number) ? null : number;
  }

  static normalizeValue(value) {
    if (!value || value === '-') return null;

    value = value.trim();

    const multipliers = {
      'bi': 1_000_000_000,
      'mi': 1_000_000,
      'mil': 1_000
    };

    for (const [suffix, multiplier] of Object.entries(multipliers)) {
      if (value.toLowerCase().includes(suffix)) {
        const numValue = this.convertToNumber(value.replace(/[^\d,.-]/g, ''));
        return numValue ? numValue * multiplier : null;
      }
    }

    const cleanValue = value.replace(/\./g, '').replace(',', '.').replace('%', '').trim();
    const number = parseFloat(cleanValue);
    return isNaN(number) ? null : number;
  }

  static extractTableData($, table) {
    const data = {};

    table.find('tr').each((_, row) => {
      const cells = $(row).find('td');

      for (let i = 0; i < cells.length; i += 2) {
        if (i + 1 >= cells.length) break;

        const labelCell = $(cells[i]);
        const valueCell = $(cells[i + 1]);

        const labelSpan = labelCell.find('span.txt');
        const valueSpan = valueCell.find('span.txt');

        const label = (labelSpan.length > 0 ? labelSpan.text() : labelCell.text()).trim().replace('?', '');
        const value = (valueSpan.length > 0 ? valueSpan.text() : valueCell.text()).trim();

        if (label && value && label !== 'Oscilações' && label !== 'Oscila��es') {
          data[label] = value;
        }
      }
    });

    return data;
  }

  static parseCompanyInfo($) {
    const data = {};
    const allData = {};

    $('table.w728').first().find('tr').each((_, row) => {
      const cells = $(row).find('td');

      for (let i = 0; i < cells.length; i += 2) {
        const labelCell = $(cells[i]);
        const valueCell = $(cells[i + 1]);

        const label = labelCell.find('span.txt').text().trim();
        const valueSpan = valueCell.find('span.txt');
        const value = valueSpan.text().trim();
        const link = valueCell.find('a');

        if (label && value) {
          allData[label] = link.length > 0 ? link.text().trim() : value;
        }
      }
    });

    return {
      name: allData['Empresa'] || null,
      type: allData['Tipo'] || null,
      sector: allData['Setor'] || null,
      subsector: allData['Subsetor'] || null
    };
  }

  static parseQuoteData($, rawData) {
    return {
      current: this.normalizeValue(rawData['Cotação'] || rawData['Cota��o']),
      date: rawData['Data últ cot'] || rawData['Data �lt cot'] || null,
      week52High: this.normalizeValue(rawData['Max 52 sem']),
      week52Low: this.normalizeValue(rawData['Min 52 sem'])
    };
  }

  static parsePerformance($, rawData) {
    return {
      day: this.convertToNumber(rawData['Dia']),
      month: this.convertToNumber(rawData['Mês'] || rawData['M�s']),
      month30: this.convertToNumber(rawData['30 dias']),
      year: this.convertToNumber(rawData['12 meses']),
      year2020: this.convertToNumber(rawData['2020']),
      year2021: this.convertToNumber(rawData['2021']),
      year2022: this.convertToNumber(rawData['2022']),
      year2023: this.convertToNumber(rawData['2023']),
      year2024: this.convertToNumber(rawData['2024']),
      year2025: this.convertToNumber(rawData['2025'])
    };
  }

  static parseValuation($, rawData) {
    return {
      priceToEarnings: this.convertToNumber(rawData['P/L']),
      priceToBook: this.convertToNumber(rawData['P/VP']),
      priceSalesRatio: this.convertToNumber(rawData['PSR']),
      priceToAssets: this.convertToNumber(rawData['P/Ativos']),
      priceToWorkingCapital: this.convertToNumber(rawData['P/Cap. Giro']),
      priceToEBIT: this.convertToNumber(rawData['P/EBIT']),
      priceToNetCurrentAssets: this.convertToNumber(rawData['P/Ativ Circ Liq']),
      evToEBIT: this.convertToNumber(rawData['EV / EBIT']),
      evToEBITDA: this.convertToNumber(rawData['EV / EBITDA'])
    };
  }

  static parseProfitability($, rawData) {
    return {
      grossMargin: this.convertToNumber(rawData['Marg. Bruta']),
      ebitMargin: this.convertToNumber(rawData['Marg. EBIT']),
      netMargin: this.convertToNumber(rawData['Marg. Líquida'] || rawData['Marg. L�quida']),
      roe: this.convertToNumber(rawData['ROE']),
      roa: this.convertToNumber(rawData['EBIT / Ativo']),
      roic: this.convertToNumber(rawData['ROIC'])
    };
  }

  static parseDividends($, rawData) {
    return {
      dividendYield: this.convertToNumber(rawData['Div. Yield'] || rawData['Dividend Yield']),
      payout: this.convertToNumber(rawData['Payout'])
    };
  }

  static parseGrowth($, rawData) {
    return {
      revenue5y: this.convertToNumber(rawData['Cres. Rec (5a)'] || rawData['Cres. Rec. 5a'])
    };
  }

  static parseEfficiency($, rawData) {
    return {
      assetTurnover: this.convertToNumber(rawData['Giro Ativos'] || rawData['Giro Ativo']),
      currentRatio: this.convertToNumber(rawData['Liquidez Corr'] || rawData['Liquidez Corrente'])
    };
  }

  static parseBalanceSheet($, rawData) {
    return {
      totalAssets: this.normalizeValue(rawData['Ativo']),
      cash: this.normalizeValue(rawData['Disponibilidades']),
      currentAssets: this.normalizeValue(rawData['Ativo Circulante']),
      grossDebt: this.normalizeValue(rawData['Dív. Bruta'] || rawData['D�v. Bruta']),
      netDebt: this.normalizeValue(rawData['Dív. Líquida'] || rawData['D�v. L�quida']),
      equity: this.normalizeValue(rawData['Patrim. Líq'] || rawData['Patrim. L�q'])
    };
  }

  static parseIncomeStatementTable($) {
    const tables = $('table.w728');
    const result = {
      last12Months: { revenue: null, ebit: null, netIncome: null },
      last3Months: { revenue: null, ebit: null, netIncome: null }
    };

    tables.each((tableIndex, table) => {
      const header = $(table).find('tr').first().text();

      if (header.includes('Dados demonstrativos') || header.includes('resultados')) {
        const rows = $(table).find('tr');

        rows.each((rowIndex, row) => {
          const cells = $(row).find('td');

          if (rowIndex >= 2) {
            const label = $(cells[0]).find('span.txt').text().trim();

            if (label.includes('Receita')) {
              result.last12Months.revenue = this.normalizeValue(
                $(cells[1]).find('span.txt').text().trim()
              );
              if (cells[3]) {
                result.last3Months.revenue = this.normalizeValue(
                  $(cells[3]).find('span.txt').text().trim()
                );
              }
            }

            if (label === 'EBIT') {
              result.last12Months.ebit = this.normalizeValue(
                $(cells[1]).find('span.txt').text().trim()
              );
              if (cells[3]) {
                result.last3Months.ebit = this.normalizeValue(
                  $(cells[3]).find('span.txt').text().trim()
                );
              }
            }

            if (label.includes('Lucro')) {
              result.last12Months.netIncome = this.normalizeValue(
                $(cells[1]).find('span.txt').text().trim()
              );
              if (cells[3]) {
                result.last3Months.netIncome = this.normalizeValue(
                  $(cells[3]).find('span.txt').text().trim()
                );
              }
            }
          }
        });
      }
    });

    return result;
  }

  static parseIncomeStatement($, rawData) {
    return {
      last12Months: {
        revenue: this.normalizeValue(rawData['Receita Líquida'] || rawData['Receita L�quida']),
        ebit: this.normalizeValue(rawData['EBIT']),
        netIncome: this.normalizeValue(rawData['Lucro Líquido'] || rawData['Lucro L�quido'])
      },
      last3Months: {
        revenue: null,
        ebit: null,
        netIncome: null
      }
    };
  }

  static parsePerShare($, rawData) {
    return {
      earnings: this.convertToNumber(rawData['LPA']),
      bookValue: this.convertToNumber(rawData['VPA'])
    };
  }

  static async getDividendsData(ticker) {
    try {
      const cleanTicker = ticker.replace('.SA', '').toUpperCase();
      const url = `${FUNDAMENTUS_BASE_URL}/proventos.php?papel=${cleanTicker}&tipo=2`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      const tables = $('table');

      if (tables.length === 0) {
        throw new Error('No dividend tables found');
      }

      const dividends = [];
      const yearlyTotals = [];

      tables.each((tableIdx, table) => {
        const headers = $(table).find('thead tr th, tr th');
        const isDetailTable = headers.length === 5;
        const isYearlyTable = headers.length === 2;

        if (isDetailTable) {
          $(table).find('tbody tr, tr').each((rowIdx, row) => {
            const cells = $(row).find('td');
            if (cells.length === 5) {
              const date = $(cells[0]).text().trim();
              const value = $(cells[1]).text().trim();
              const type = $(cells[2]).text().trim();
              const paymentDate = $(cells[3]).text().trim();
              const perShares = $(cells[4]).text().trim();

              if (date && date !== 'Data' && value) {
                dividends.push({
                  date,
                  value: this.convertToNumber(value),
                  type,
                  paymentDate: paymentDate === '-' ? null : paymentDate,
                  perShares: parseInt(perShares) || 1
                });
              }
            }
          });
        }

        if (isYearlyTable) {
          $(table).find('tbody tr, tr').each((rowIdx, row) => {
            const cells = $(row).find('td');
            if (cells.length === 2) {
              const year = $(cells[0]).text().trim();
              const value = $(cells[1]).text().trim();

              if (year && year !== 'Ano' && value) {
                yearlyTotals.push({
                  year: parseInt(year),
                  total: this.convertToNumber(value)
                });
              }
            }
          });
        }
      });

      return {
        ticker: cleanTicker,
        dividends: dividends.sort((a, b) => {
          const dateA = a.date.split('/').reverse().join('');
          const dateB = b.date.split('/').reverse().join('');
          return dateB.localeCompare(dateA);
        }),
        yearlyTotals: yearlyTotals.sort((a, b) => b.year - a.year),
        metadata: {
          source: 'fundamentus',
          scrapedAt: new Date().toISOString(),
          url
        }
      };
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout - Fundamentus may be slow or unavailable');
      }
      throw error;
    }
  }

  static async getDetailedData(ticker) {
    try {
      const cleanTicker = ticker.replace('.SA', '').toUpperCase();
      const url = `${FUNDAMENTUS_BASE_URL}/detalhes.php?papel=${cleanTicker}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);

      const errorMessage = $('.error, .erro').text();
      if (errorMessage && errorMessage.toLowerCase().includes('não encontrado')) {
        throw new Error(`Ticker ${cleanTicker} not found on Fundamentus`);
      }

      const tables = $('table.w728');
      if (tables.length === 0) {
        throw new Error('No data tables found - site structure may have changed');
      }

      const allData = {};
      tables.each((idx, table) => {
        const tableData = this.extractTableData($, $(table));
        Object.assign(allData, tableData);
      });

      const result = {
        ticker: cleanTicker,
        companyInfo: this.parseCompanyInfo($),
        quote: this.parseQuoteData($, allData),
        performance: this.parsePerformance($, allData),
        valuation: this.parseValuation($, allData),
        profitability: this.parseProfitability($, allData),
        dividends: this.parseDividends($, allData),
        growth: this.parseGrowth($, allData),
        efficiency: this.parseEfficiency($, allData),
        balanceSheet: this.parseBalanceSheet($, allData),
        incomeStatement: this.parseIncomeStatementTable($),
        perShare: this.parsePerShare($, allData),
        metadata: {
          source: 'fundamentus',
          scrapedAt: new Date().toISOString(),
          url
        }
      };

      return result;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout - Fundamentus may be slow or unavailable');
      }
      throw error;
    }
  }
}

export default FundamentusScraperService;
