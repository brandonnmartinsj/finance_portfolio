import db from '../config/database.js';

class Goal {
  static getAll(userId) {
    const stmt = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  }

  static getById(id, userId) {
    const stmt = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  }

  static getActive(userId) {
    const stmt = db.prepare('SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY created_at DESC');
    return stmt.all(userId, 'active');
  }

  static create(goal, userId) {
    const stmt = db.prepare(`
      INSERT INTO goals (user_id, title, description, type, target_amount, current_amount, target_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      goal.title,
      goal.description || null,
      goal.type,
      goal.target_amount,
      goal.current_amount || 0,
      goal.target_date || null,
      goal.status || 'active'
    );

    return this.getById(result.lastInsertRowid, userId);
  }

  static update(id, goal, userId) {
    const updates = [];
    const values = [];

    if (goal.title !== undefined) {
      updates.push('title = ?');
      values.push(goal.title);
    }

    if (goal.description !== undefined) {
      updates.push('description = ?');
      values.push(goal.description);
    }

    if (goal.type !== undefined) {
      updates.push('type = ?');
      values.push(goal.type);
    }

    if (goal.target_amount !== undefined) {
      updates.push('target_amount = ?');
      values.push(goal.target_amount);
    }

    if (goal.current_amount !== undefined) {
      updates.push('current_amount = ?');
      values.push(goal.current_amount);
    }

    if (goal.target_date !== undefined) {
      updates.push('target_date = ?');
      values.push(goal.target_date);
    }

    if (goal.status !== undefined) {
      updates.push('status = ?');
      values.push(goal.status);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const stmt = db.prepare(`
      UPDATE goals
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(...values);
    return this.getById(id, userId);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static updateProgress(id, currentAmount, userId) {
    const stmt = db.prepare(`
      UPDATE goals
      SET current_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(currentAmount, id, userId);
    return this.getById(id, userId);
  }
}

export default Goal;
