import db from '../db/database';
import { User, CreateUserRequest } from '../types';
import { convertDatesForDisplay } from '../utils/timezone';
import bcrypt from 'bcrypt';

export class UserModel {
  private static hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
  };

  static create = (userData: CreateUserRequest): User => {
    const { email, password, name } = userData;
    const passwordHash = this.hashPassword(password);

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(email, passwordHash, name || null);
    
    return this.findById(result.lastInsertRowid as number)!;
  };

  static findByEmail = (email: string): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | null;
    return user ? convertDatesForDisplay(user) : null;
  };

  static findById = (id: number): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | null;
    return user ? convertDatesForDisplay(user) : null;
  };

  static validatePassword = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
  };

  static update = (id: number, userData: Partial<CreateUserRequest>): User | null => {
    const { email, password, name } = userData;
    const updates: string[] = [];
    const values: any[] = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      updates.push('password_hash = ?');
      values.push(this.hashPassword(password));
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  };

  static delete = (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  };
}
