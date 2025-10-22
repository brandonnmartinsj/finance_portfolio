import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(join(dataDir, 'portfolio.db'));

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    ticker TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    date TEXT NOT NULL,
    fees REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assets (
    ticker TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    market TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions(ticker);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
`);

export default db;
