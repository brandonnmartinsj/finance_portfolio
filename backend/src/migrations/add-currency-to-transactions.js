import db from '../config/database.js';

console.log('Running migration: add-currency-to-transactions');

try {
  const tableInfo = db.prepare('PRAGMA table_info(transactions)').all();
  const hasCurrencyColumn = tableInfo.some(col => col.name === 'currency');
  const hasOriginalPriceColumn = tableInfo.some(col => col.name === 'original_price');
  const hasExchangeRateColumn = tableInfo.some(col => col.name === 'exchange_rate');

  if (!hasCurrencyColumn) {
    console.log('Adding currency column to transactions table...');
    db.exec(`ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'BRL'`);
    console.log('✅ Currency column added');
  } else {
    console.log('✅ Currency column already exists');
  }

  if (!hasOriginalPriceColumn) {
    console.log('Adding original_price column to transactions table...');
    db.exec(`ALTER TABLE transactions ADD COLUMN original_price REAL`);
    console.log('✅ Original_price column added');
  } else {
    console.log('✅ Original_price column already exists');
  }

  if (!hasExchangeRateColumn) {
    console.log('Adding exchange_rate column to transactions table...');
    db.exec(`ALTER TABLE transactions ADD COLUMN exchange_rate REAL`);
    console.log('✅ Exchange_rate column added');
  } else {
    console.log('✅ Exchange_rate column already exists');
  }

  console.log('✅ Migration completed successfully: currency support added to transactions table');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
