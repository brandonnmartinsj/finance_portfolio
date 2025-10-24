import db from '../config/database.js';

class DashboardLayout {
  static getAll(userId) {
    const stmt = db.prepare('SELECT * FROM dashboard_layouts WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  }

  static getById(id, userId) {
    const stmt = db.prepare('SELECT * FROM dashboard_layouts WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  }

  static getActive(userId) {
    const stmt = db.prepare('SELECT * FROM dashboard_layouts WHERE user_id = ? AND is_active = 1');
    return stmt.get(userId);
  }

  static create(layout, userId) {
    const stmt = db.prepare(`
      INSERT INTO dashboard_layouts (user_id, name, layout_config, theme, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      layout.name,
      JSON.stringify(layout.layoutConfig),
      layout.theme || 'light',
      layout.isActive ? 1 : 0
    );

    return this.getById(result.lastInsertRowid, userId);
  }

  static update(id, layout, userId) {
    const updates = [];
    const values = [];

    if (layout.name !== undefined) {
      updates.push('name = ?');
      values.push(layout.name);
    }

    if (layout.layoutConfig !== undefined) {
      updates.push('layout_config = ?');
      values.push(JSON.stringify(layout.layoutConfig));
    }

    if (layout.theme !== undefined) {
      updates.push('theme = ?');
      values.push(layout.theme);
    }

    if (layout.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(layout.isActive ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const stmt = db.prepare(`
      UPDATE dashboard_layouts
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(...values);
    return this.getById(id, userId);
  }

  static setActive(id, userId) {
    db.prepare('UPDATE dashboard_layouts SET is_active = 0 WHERE user_id = ?').run(userId);

    const stmt = db.prepare(`
      UPDATE dashboard_layouts
      SET is_active = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(id, userId);
    return this.getById(id, userId);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM dashboard_layouts WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}

export default DashboardLayout;
