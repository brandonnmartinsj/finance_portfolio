import db from '../config/database.js';

class Transaction {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY date DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    return stmt.get(id);
  }

  static getByTicker(ticker) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE ticker = ? ORDER BY date DESC');
    return stmt.all(ticker);
  }

  static create(transaction) {
    const stmt = db.prepare(`
      INSERT INTO transactions (type, asset_type, ticker, quantity, price, date, fees, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      transaction.type,
      transaction.asset_type,
      transaction.ticker,
      transaction.quantity,
      transaction.price,
      transaction.date,
      transaction.fees || 0,
      transaction.notes || null
    );

    return { id: result.lastInsertRowid, ...transaction };
  }

  static update(id, transaction) {
    const stmt = db.prepare(`
      UPDATE transactions
      SET type = ?, asset_type = ?, ticker = ?, quantity = ?, price = ?, date = ?, fees = ?, notes = ?
      WHERE id = ?
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
      id
    );

    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    return stmt.run(id);
  }

  static getPortfolioSummary() {
    const stmt = db.prepare(`
      SELECT
        ticker,
        asset_type,
        SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) as total_quantity,
        SUM(CASE WHEN type = 'BUY' THEN quantity * price ELSE -quantity * price END) as total_invested
      FROM transactions
      GROUP BY ticker, asset_type
      HAVING total_quantity > 0
    `);

    return stmt.all();
  }
}

export default Transaction;
