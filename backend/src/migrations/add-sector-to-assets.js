import db from '../config/database.js';

console.log('Running migration: add-sector-to-assets');

try {
  const tableInfo = db.prepare('PRAGMA table_info(assets)').all();
  const hasSectorColumn = tableInfo.some(col => col.name === 'sector');

  if (!hasSectorColumn) {
    console.log('Adding sector column to assets table...');
    db.exec(`ALTER TABLE assets ADD COLUMN sector TEXT`);
    console.log('✅ Migration completed successfully: sector column added to assets table');
  } else {
    console.log('✅ Sector column already exists, skipping migration');
  }
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
