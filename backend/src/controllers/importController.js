import PDFParserService from '../services/pdfParserService.js';
import Transaction from '../models/Transaction.js';
import Asset from '../models/Asset.js';

/**
 * Faz upload e parse do PDF, retorna preview das transações
 */
export const uploadAndParsePDF = async (req, res) => {
  try {
    console.log('📄 Upload PDF request received');
    console.log('Headers:', req.headers);
    console.log('Has file?', !!req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    if (req.file.mimetype !== 'application/pdf') {
      console.error('❌ Invalid mimetype:', req.file.mimetype);
      return res.status(400).json({ error: 'Apenas arquivos PDF são aceitos' });
    }

    console.log('✅ PDF file validated, parsing...');
    const buffer = req.file.buffer;
    const result = await PDFParserService.parseGenericPDF(buffer);
    console.log('Parse result:', result);

    if (!result.success || result.transactions.length === 0) {
      console.error('❌ No transactions found or parse failed');
      return res.status(400).json({
        error: 'Nenhuma transação encontrada no PDF',
        details: result.warning
      });
    }

    console.log('✅ Transactions found:', result.transactions.length);

    const validation = PDFParserService.validateTransactions(result.transactions);

    res.json({
      success: true,
      transactions: result.transactions,
      summary: result.summary,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      }
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({
      error: 'Erro ao processar arquivo',
      details: error.message
    });
  }
};

/**
 * Importa transações validadas para o banco de dados
 */
export const importTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    const userId = req.user.id;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Nenhuma transação para importar' });
    }

    const validation = PDFParserService.validateTransactions(transactions);

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Transações inválidas',
        errors: validation.errors
      });
    }

    const imported = [];
    const errors = [];

    for (const tx of transactions) {
      try {
        // Criar/atualizar asset se necessário
        let asset = Asset.getByTicker(tx.ticker);
        if (!asset) {
          Asset.create({
            ticker: tx.ticker,
            name: tx.ticker,
            type: tx.asset_type,
            market: 'BR'
          });
        }

        // Criar transação
        const transaction = Transaction.create({
          type: tx.type,
          asset_type: tx.asset_type,
          ticker: tx.ticker,
          quantity: tx.quantity,
          price: tx.price,
          date: tx.date,
          fees: tx.fees || 0,
          notes: tx.notes || 'Importado de PDF'
        }, userId);

        imported.push(transaction);
      } catch (error) {
        errors.push({
          transaction: tx,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      imported: {
        count: imported.length,
        transactions: imported
      },
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: transactions.length,
        success: imported.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Error importing transactions:', error);
    res.status(500).json({
      error: 'Erro ao importar transações',
      details: error.message
    });
  }
};

/**
 * Importa CSV de transações
 */
export const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return res.status(400).json({ error: 'Arquivo CSV vazio ou inválido' });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const transactions = [];

    // Mapear headers para campos esperados
    const fieldMap = {
      'data': 'date',
      'date': 'date',
      'ticker': 'ticker',
      'ativo': 'ticker',
      'tipo': 'type',
      'type': 'type',
      'quantidade': 'quantity',
      'quantity': 'quantity',
      'qtd': 'quantity',
      'preço': 'price',
      'preco': 'price',
      'price': 'price',
      'taxas': 'fees',
      'fees': 'fees',
      'taxa': 'fees'
    };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const tx = {};

      headers.forEach((header, index) => {
        const field = fieldMap[header];
        if (field) {
          tx[field] = values[index];
        }
      });

      // Conversões e validações
      if (tx.date && tx.ticker && tx.quantity && tx.price) {
        transactions.push({
          date: tx.date,
          ticker: tx.ticker.toUpperCase(),
          type: tx.type === 'VENDA' || tx.type === 'SELL' || tx.type === 'V' ? 'SELL' : 'BUY',
          quantity: parseFloat(tx.quantity),
          price: parseFloat(tx.price.replace(',', '.')),
          fees: tx.fees ? parseFloat(tx.fees.replace(',', '.')) : 0,
          asset_type: PDFParserService.detectAssetType(tx.ticker),
          notes: 'Importado de CSV'
        });
      }
    }

    if (transactions.length === 0) {
      return res.status(400).json({ error: 'Nenhuma transação válida encontrada no CSV' });
    }

    const validation = PDFParserService.validateTransactions(transactions);

    res.json({
      success: true,
      transactions,
      summary: {
        total: transactions.length,
        buys: transactions.filter(t => t.type === 'BUY').length,
        sells: transactions.filter(t => t.type === 'SELL').length
      },
      validation
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({
      error: 'Erro ao processar CSV',
      details: error.message
    });
  }
};
