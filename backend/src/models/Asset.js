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
      INSERT INTO assets (ticker, name, type, market, sector)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      asset.ticker,
      asset.name,
      asset.type,
      asset.market,
      asset.sector || null
    );
    return asset;
  }

  static update(ticker, asset) {
    const stmt = db.prepare(`
      UPDATE assets
      SET name = ?, type = ?, market = ?, sector = ?
      WHERE ticker = ?
    `);

    stmt.run(
      asset.name,
      asset.type,
      asset.market,
      asset.sector || null,
      ticker
    );
    return this.getByTicker(ticker);
  }

  static upsert(asset) {
    const existing = this.getByTicker(asset.ticker);
    if (existing) {
      return this.update(asset.ticker, asset);
    }
    return this.create(asset);
  }

  static updateSector(ticker, sector) {
    const stmt = db.prepare(`
      UPDATE assets
      SET sector = ?
      WHERE ticker = ?
    `);
    stmt.run(sector, ticker);
    return this.getByTicker(ticker);
  }

  static delete(ticker) {
    const stmt = db.prepare('DELETE FROM assets WHERE ticker = ?');
    return stmt.run(ticker);
  }
}

export default Asset;
