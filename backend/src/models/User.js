import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static getAll() {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static getByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static async create(user) {
    const passwordHash = await this.hashPassword(user.password);

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      user.email.toLowerCase(),
      passwordHash,
      user.name
    );

    return this.getById(result.lastInsertRowid);
  }

  static async update(id, user) {
    const updates = [];
    const values = [];

    if (user.name) {
      updates.push('name = ?');
      values.push(user.name);
    }

    if (user.email) {
      updates.push('email = ?');
      values.push(user.email.toLowerCase());
    }

    if (user.password) {
      updates.push('password_hash = ?');
      values.push(await this.hashPassword(user.password));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }

  static async authenticate(email, password) {
    const user = this.getByEmail(email.toLowerCase());

    if (!user) {
      return null;
    }

    const isValid = await this.comparePassword(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default User;
