import db from '../config/database.js';

class Asset {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM assets ORDER BY ticker');
    return stmt.all();
  }

  static getByTicker(ticker) {
    const stmt = db.prepare('SELECT * FROM assets WHERE ticker = ?');
    return stmt.get(ticker);
  }

  static create(asset) {
    const stmt = db.prepare(`
      INSERT INTO assets (ticker, name, type, market)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(asset.ticker, asset.name, asset.type, asset.market);
    return asset;
  }

  static update(ticker, asset) {
    const stmt = db.prepare(`
      UPDATE assets
      SET name = ?, type = ?, market = ?
      WHERE ticker = ?
    `);

    stmt.run(asset.name, asset.type, asset.market, ticker);
    return this.getByTicker(ticker);
  }

  static delete(ticker) {
    const stmt = db.prepare('DELETE FROM assets WHERE ticker = ?');
    return stmt.run(ticker);
  }
}

export default Asset;
