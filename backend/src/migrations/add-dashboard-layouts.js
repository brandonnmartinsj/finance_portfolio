import db from '../config/database.js';

console.log('Running migration: add-dashboard-layouts');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      layout_config TEXT NOT NULL,
      theme TEXT DEFAULT 'light',
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_active ON dashboard_layouts(user_id, is_active);
  `);

  console.log('✅ Migration completed successfully: dashboard_layouts table created');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
