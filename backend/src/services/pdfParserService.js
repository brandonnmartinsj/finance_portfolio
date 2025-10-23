import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Serviço para parsing de PDFs de corretoras
 */
class PDFParserService {
  /**
   * Parse do PDF do sistema Bastter
   * Extrai transações de compra/venda de ações
   */
  static async parseBastterPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      const transactions = [];
      const lines = text.split('\n');

      // Padrões para identificar transações
      // Exemplo: "01/01/2024 PETR4 C 100 25.50 2550.00 5.00"
      const transactionPattern = /(\d{2}\/\d{2}\/\d{4})\s+([A-Z0-9]{4,6})\s+([CV])\s+(\d+(?:\.\d+)?)\s+(\d+(?:,\d+)?)\s+(\d+(?:,\d+)?)/;

      for (const line of lines) {
        const match = line.match(transactionPattern);

        if (match) {
          const [_, date, ticker, type, quantity, price, total] = match;

          transactions.push({
            date: this.convertDateFormat(date),
            ticker: ticker.trim(),
            type: type === 'C' ? 'BUY' : 'SELL',
            quantity: parseFloat(quantity.replace(',', '.')),
            price: parseFloat(price.replace(',', '.')),
            total: parseFloat(total.replace(',', '.')),
            asset_type: this.detectAssetType(ticker),
            fees: 0, // Será calculado posteriormente se houver info de taxas
            notes: `Importado de PDF Bastter`
          });
        }
      }

      // Tentar extrair taxas se houver seção específica
      const fees = this.extractFees(text);
      if (fees && transactions.length > 0) {
        const feePerTransaction = fees / transactions.length;
        transactions.forEach(tx => {
          tx.fees = parseFloat(feePerTransaction.toFixed(2));
        });
      }

      return {
        success: true,
        transactions,
        summary: {
          total: transactions.length,
          buys: transactions.filter(t => t.type === 'BUY').length,
          sells: transactions.filter(t => t.type === 'SELL').length
        }
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Erro ao processar PDF: ' + error.message);
    }
  }

  /**
   * Parser genérico que tenta identificar o formato automaticamente
   */
  static async parseGenericPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      // Tentar identificar o formato baseado em palavras-chave
      if (text.includes('BASTTER') || text.includes('Bastter')) {
        return await this.parseBastterPDF(buffer);
      }

      // Adicionar outros parsers de corretoras aqui
      // Clear, XP, Rico, BTG, etc.

      // Fallback: tentar extração genérica
      return this.parseGenericFormat(text);
    } catch (error) {
      throw new Error('Formato de PDF não reconhecido: ' + error.message);
    }
  }

  /**
   * Parser genérico para tentar extrair transações de qualquer formato
   */
  static parseGenericFormat(text) {
    const transactions = [];
    const lines = text.split('\n');

    // Padrões comuns em notas de corretagem
    const patterns = [
      // Formato: DD/MM/YYYY TICKER C/V QTD PREÇO
      /(\d{2}\/\d{2}\/\d{4})\s+([A-Z0-9]{4,6})\s+([CV])\s+(\d+)\s+(\d+[,\.]\d+)/,
      // Formato: TICKER DD/MM/YYYY C/V QTD PREÇO
      /([A-Z0-9]{4,6})\s+(\d{2}\/\d{2}\/\d{4})\s+([CV])\s+(\d+)\s+(\d+[,\.]\d+)/,
    ];

    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          let date, ticker, type, quantity, price;

          if (match[1].includes('/')) {
            [_, date, ticker, type, quantity, price] = match;
          } else {
            [_, ticker, date, type, quantity, price] = match;
          }

          transactions.push({
            date: this.convertDateFormat(date),
            ticker: ticker.trim(),
            type: type === 'C' ? 'BUY' : 'SELL',
            quantity: parseInt(quantity),
            price: parseFloat(price.replace(',', '.')),
            asset_type: this.detectAssetType(ticker),
            fees: 0,
            notes: 'Importado de PDF'
          });
          break;
        }
      }
    }

    return {
      success: transactions.length > 0,
      transactions,
      summary: {
        total: transactions.length,
        buys: transactions.filter(t => t.type === 'BUY').length,
        sells: transactions.filter(t => t.type === 'SELL').length
      },
      warning: transactions.length === 0 ? 'Nenhuma transação encontrada' : null
    };
  }

  /**
   * Converte data de DD/MM/YYYY para YYYY-MM-DD
   */
  static convertDateFormat(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  /**
   * Detecta tipo de ativo baseado no ticker
   */
  static detectAssetType(ticker) {
    // FIIs geralmente terminam com 11
    if (ticker.endsWith('11')) {
      return 'FII';
    }

    // Ações geralmente terminam com 3, 4, 5, 6, etc.
    if (/[3-9]$/.test(ticker)) {
      return 'STOCK';
    }

    // BDRs geralmente terminam com 34
    if (ticker.endsWith('34')) {
      return 'STOCK';
    }

    return 'STOCK'; // Default
  }

  /**
   * Extrai informações de taxas do texto
   */
  static extractFees(text) {
    // Procurar por padrões de taxas
    const patterns = [
      /Taxa.*?(\d+[,\.]\d+)/i,
      /Corretagem.*?(\d+[,\.]\d+)/i,
      /Emolumentos.*?(\d+[,\.]\d+)/i,
      /Total.*?taxas.*?(\d+[,\.]\d+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }

    return 0;
  }

  /**
   * Valida transações extraídas
   */
  static validateTransactions(transactions) {
    const errors = [];
    const warnings = [];

    transactions.forEach((tx, index) => {
      // Validações obrigatórias
      if (!tx.ticker) {
        errors.push(`Linha ${index + 1}: Ticker ausente`);
      }

      if (!tx.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
        errors.push(`Linha ${index + 1}: Data inválida`);
      }

      if (!tx.quantity || tx.quantity <= 0) {
        errors.push(`Linha ${index + 1}: Quantidade inválida`);
      }

      if (!tx.price || tx.price <= 0) {
        errors.push(`Linha ${index + 1}: Preço inválido`);
      }

      // Warnings
      if (tx.price > 10000) {
        warnings.push(`Linha ${index + 1}: Preço muito alto (${tx.price})`);
      }

      if (tx.quantity > 10000) {
        warnings.push(`Linha ${index + 1}: Quantidade muito alta (${tx.quantity})`);
      }
    });

    return { errors, warnings, isValid: errors.length === 0 };
  }
}

export default PDFParserService;
