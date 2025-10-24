import db from '../config/database.js';

class Transaction {
  static getAll(userId) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC');
    return stmt.all(userId);
  }

  static getById(id, userId) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  }

  static getByTicker(ticker, userId) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE ticker = ? AND user_id = ? ORDER BY date DESC');
    return stmt.all(ticker, userId);
  }

  static create(transaction, userId) {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, type, asset_type, ticker, quantity, price, date, fees, notes, currency, original_price, exchange_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      transaction.type,
      transaction.asset_type,
      transaction.ticker,
      transaction.quantity,
      transaction.price,
      transaction.date,
      transaction.fees || 0,
      transaction.notes || null,
      transaction.currency || 'BRL',
      transaction.original_price || transaction.price,
      transaction.exchange_rate || 1.0
    );

    return { id: result.lastInsertRowid, ...transaction, user_id: userId };
  }

  static update(id, transaction, userId) {
    const stmt = db.prepare(`
      UPDATE transactions
      SET type = ?, asset_type = ?, ticker = ?, quantity = ?, price = ?, date = ?, fees = ?, notes = ?, currency = ?, original_price = ?, exchange_rate = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      transaction.type,
      transaction.asset_type,
      transaction.ticker,
      transaction.quantity,
      transaction.price,
      transaction.date,
      transaction.fees || 0,
      transaction.notes || null,
      transaction.currency || 'BRL',
      transaction.original_price || transaction.price,
      transaction.exchange_rate || 1.0,
      id,
      userId
    );

    return this.getById(id, userId);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static getPortfolioSummary(userId) {
    const stmt = db.prepare(`
      SELECT
        ticker,
        asset_type,
        SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) as total_quantity,
        SUM(CASE WHEN type = 'BUY' THEN quantity * price ELSE -quantity * price END) as total_invested
      FROM transactions
      WHERE user_id = ?
      GROUP BY ticker, asset_type
      HAVING total_quantity > 0
    `);

    return stmt.all(userId);
  }
}

export default Transaction;
