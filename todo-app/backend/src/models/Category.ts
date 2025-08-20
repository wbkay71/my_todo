import db from '../db/database';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export class CategoryModel {
  static create = (userId: number, categoryData: CreateCategoryRequest): Category => {
    const { name, color = '#3498db' } = categoryData;

    const stmt = db.prepare(`
      INSERT INTO categories (name, color, user_id)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(name, color, userId);
    
    return this.findById(result.lastInsertRowid as number)!;
  };

  static findById = (id: number): Category | null => {
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
    return stmt.get(id) as Category | null;
  };

  static findByUserId = (userId: number): Category[] => {
    const stmt = db.prepare(`
      SELECT * FROM categories 
      WHERE user_id = ? 
      ORDER BY name ASC
    `);
    return stmt.all(userId) as Category[];
  };

  static findByUserIdAndName = (userId: number, name: string): Category | null => {
    const stmt = db.prepare(`
      SELECT * FROM categories 
      WHERE user_id = ? AND LOWER(name) = LOWER(?)
    `);
    return stmt.get(userId, name) as Category | null;
  };

  static update = (id: number, userId: number, categoryData: UpdateCategoryRequest): Category | null => {
    // Prüfe ob Category dem User gehört
    const existingCategory = this.findById(id);
    if (!existingCategory || existingCategory.user_id !== userId) {
      return null;
    }

    const { name, color } = categoryData;
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }

    if (updates.length === 0) {
      return existingCategory;
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE categories 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  };

  static delete = (id: number, userId: number): boolean => {
    // Prüfe ob Category dem User gehört
    const existingCategory = this.findById(id);
    if (!existingCategory || existingCategory.user_id !== userId) {
      return false;
    }

    // Lösche Category (Todos werden auf NULL gesetzt durch ON DELETE SET NULL)
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  };

  static getUsageCount = (categoryId: number): number => {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM todo_categories 
      WHERE category_id = ?
    `);
    const result = stmt.get(categoryId) as { count: number };
    return result.count;
  };

  static getCategoriesWithUsage = (userId: number): (Category & { usage_count: number })[] => {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        COUNT(tc.todo_id) as usage_count
      FROM categories c
      LEFT JOIN todo_categories tc ON c.id = tc.category_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return stmt.all(userId) as (Category & { usage_count: number })[];
  };

  static getDefaultColors = (): string[] => {
    return [
      '#3498db', // Blue
      '#e74c3c', // Red
      '#2ecc71', // Green
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#1abc9c', // Turquoise
      '#e67e22', // Carrot
      '#34495e', // Wet Asphalt
      '#e91e63', // Pink
      '#ff9800', // Amber
      '#795548', // Brown
      '#607d8b'  // Blue Grey
    ];
  };
}
