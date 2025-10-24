import db from '../config/database.js';

class Dividend {
  static getAll(userId) {
    const stmt = db.prepare('SELECT * FROM dividends WHERE user_id = ? ORDER BY payment_date DESC');
    return stmt.all(userId);
  }

  static getById(id, userId) {
    const stmt = db.prepare('SELECT * FROM dividends WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  }

  static getByTicker(ticker, userId) {
    const stmt = db.prepare('SELECT * FROM dividends WHERE ticker = ? AND user_id = ? ORDER BY payment_date DESC');
    return stmt.all(ticker, userId);
  }

  static getByDateRange(userId, startDate, endDate) {
    const stmt = db.prepare(`
      SELECT * FROM dividends
      WHERE user_id = ?
        AND payment_date >= ?
        AND payment_date <= ?
      ORDER BY payment_date DESC
    `);
    return stmt.all(userId, startDate, endDate);
  }

  static create(dividend, userId) {
    const stmt = db.prepare(`
      INSERT INTO dividends (user_id, ticker, type, amount, payment_date, ex_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      dividend.ticker,
      dividend.type,
      dividend.amount,
      dividend.payment_date,
      dividend.ex_date || null,
      dividend.notes || null
    );

    return { id: result.lastInsertRowid, ...dividend, user_id: userId };
  }

  static update(id, dividend, userId) {
    const stmt = db.prepare(`
      UPDATE dividends
      SET ticker = ?, type = ?, amount = ?, payment_date = ?, ex_date = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      dividend.ticker,
      dividend.type,
      dividend.amount,
      dividend.payment_date,
      dividend.ex_date || null,
      dividend.notes || null,
      id,
      userId
    );

    return this.getById(id, userId);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM dividends WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static getSummaryByTicker(userId) {
    const stmt = db.prepare(`
      SELECT
        ticker,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        MIN(payment_date) as first_payment,
        MAX(payment_date) as last_payment
      FROM dividends
      WHERE user_id = ?
      GROUP BY ticker
      ORDER BY total_amount DESC
    `);

    return stmt.all(userId);
  }

  static getMonthlyTotal(userId, year = null) {
    let query = `
      SELECT
        strftime('%Y', payment_date) as year,
        strftime('%m', payment_date) as month,
        SUM(amount) as total
      FROM dividends
      WHERE user_id = ?
    `;

    const params = [userId];

    if (year) {
      query += ` AND strftime('%Y', payment_date) = ?`;
      params.push(year.toString());
    }

    query += `
      GROUP BY strftime('%Y-%m', payment_date)
      ORDER BY payment_date ASC
    `;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getYearlyTotal(userId) {
    const stmt = db.prepare(`
      SELECT
        strftime('%Y', payment_date) as year,
        SUM(amount) as total,
        COUNT(*) as payment_count
      FROM dividends
      WHERE user_id = ?
      GROUP BY strftime('%Y', payment_date)
      ORDER BY year DESC
    `);

    return stmt.all(userId);
  }
}

export default Dividend;
