import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const db = new Database(join(dataDir, 'portfolio.db'));

console.log('Starting migration to add authentication...');

try {
  db.exec('PRAGMA foreign_keys = OFF;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ Users table created');

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    db.exec(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (1, 'default@example.com', 'temp', 'Default User');
    `);
    console.log('✓ Default user created (id=1)');
  }

  const checkColumn = db.prepare(`PRAGMA table_info(transactions)`).all();
  const hasUserId = checkColumn.some(col => col.name === 'user_id');

  if (!hasUserId) {
    db.exec('DROP TABLE IF EXISTS transactions_new;');

    db.exec(`
      CREATE TABLE transactions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL DEFAULT 1,
        type TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        ticker TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        fees REAL DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      INSERT INTO transactions_new (id, user_id, type, asset_type, ticker, quantity, price, date, fees, notes, created_at)
      SELECT id, 1, type, asset_type, ticker, quantity, price, date, fees, notes, created_at
      FROM transactions;

      DROP TABLE transactions;

      ALTER TABLE transactions_new RENAME TO transactions;

      CREATE INDEX idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX idx_transactions_ticker ON transactions(ticker);
      CREATE INDEX idx_transactions_date ON transactions(date);
    `);
    console.log('✓ Transactions table migrated with user_id');
  } else {
    console.log('✓ Transactions table already has user_id column');
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  console.log('✓ Indexes created');

  db.exec('PRAGMA foreign_keys = ON;');

  console.log('\n✅ Migration completed successfully!');
  console.log('\nNote: All existing transactions were assigned to user_id = 1');
  console.log('You should create a default user with id = 1 or reassign transactions as needed.');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
