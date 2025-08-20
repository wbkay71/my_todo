import db from '../db/database';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoWithLabels, TodoWithCategories, Label, Category } from '../types';

export class TodoModel {
  static create = (userId: number, todoData: CreateTodoRequest): TodoWithCategories => {
    const { title, description, status = 'open', priority = 0, due_date, category_ids = [] } = todoData;

    const nowUtc = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO todos (user_id, title, description, status, priority, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Verwende JavaScript UTC-Zeit statt SQLite-Funktion
    const utcTimestamp = nowUtc.replace('T', ' ').replace('Z', '');
    const result = stmt.run(userId, title, description || null, status, priority, due_date || null, utcTimestamp, utcTimestamp);
    
    const todoId = result.lastInsertRowid as number;
    
    // Add category relationships
    if (category_ids.length > 0) {
      this.updateTodoCategories(todoId, category_ids);
    }
    
    const createdTodo = this.findByIdWithCategories(todoId)!;
    
    return createdTodo;
  };

  static findById = (id: number): Todo | null => {
    const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
    return stmt.get(id) as Todo | null;
  };

  static findByIdWithCategories = (id: number): TodoWithCategories | null => {
    const todo = this.findById(id);
    if (!todo) return null;

    const categories = this.getTodoCategories(id);
    return { ...todo, categories };
  };

  static getTodoCategories = (todoId: number): Category[] => {
    const stmt = db.prepare(`
      SELECT c.* FROM categories c
      JOIN todo_categories tc ON c.id = tc.category_id
      WHERE tc.todo_id = ?
    `);
    return stmt.all(todoId) as Category[];
  };

  static updateTodoCategories = (todoId: number, categoryIds: number[]): void => {
    // Remove existing category relationships
    const deleteStmt = db.prepare('DELETE FROM todo_categories WHERE todo_id = ?');
    deleteStmt.run(todoId);

    // Add new category relationships
    if (categoryIds.length > 0) {
      const insertStmt = db.prepare('INSERT INTO todo_categories (todo_id, category_id) VALUES (?, ?)');
      const insertMany = db.transaction((categories: number[]) => {
        for (const categoryId of categories) {
          insertStmt.run(todoId, categoryId);
        }
      });
      insertMany(categoryIds);
    }
  };

  static findByUserId = (userId: number): TodoWithCategories[] => {
    const stmt = db.prepare(`
      SELECT * FROM todos 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    
    const todos = stmt.all(userId) as Todo[];
    const result = todos.map(todo => {
      const categories = this.getTodoCategories(todo.id);
      return { ...todo, categories };
    });
    
    return result;
  };

  static findByUserIdWithLabels = (userId: number): TodoWithLabels[] => {
    const stmt = db.prepare(`
      SELECT * FROM todos 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    
    const todos = stmt.all(userId) as Todo[];
    
    return todos.map(todo => {
      const labels = this.getLabelsForTodo(todo.id);
      return { ...todo, labels };
    });
  };



  static update = (id: number, userId: number, todoData: UpdateTodoRequest): TodoWithCategories | null => {
    // Prüfe ob Todo dem User gehört
    const existingTodo = this.findById(id);
    if (!existingTodo || existingTodo.user_id !== userId) {
      return null;
    }

    const { title, description, status, priority, due_date, category_ids } = todoData;
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(due_date);
    }
    if (updates.length === 0 && category_ids === undefined) {
      return this.findByIdWithCategories(id);
    }

    // Update category relationships if provided
    if (category_ids !== undefined) {
      this.updateTodoCategories(id, category_ids);
    }

    // Update todo fields if any
    if (updates.length > 0) {
      const nowUtc = new Date().toISOString();
      const utcTimestamp = nowUtc.replace('T', ' ').replace('Z', '');
      updates.push('updated_at = ?');
      values.push(utcTimestamp);
      values.push(id);

      const stmt = db.prepare(`
        UPDATE todos 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      stmt.run(...values);
    }

    return this.findByIdWithCategories(id);
  };

  static delete = (id: number, userId: number): boolean => {
    // Prüfe ob Todo dem User gehört
    const existingTodo = this.findById(id);
    if (!existingTodo || existingTodo.user_id !== userId) {
      return false;
    }

    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  };

  static getLabelsForTodo = (todoId: number): Label[] => {
    const stmt = db.prepare(`
      SELECT l.* FROM labels l
      JOIN todo_labels tl ON l.id = tl.label_id
      WHERE tl.todo_id = ?
    `);
    return stmt.all(todoId) as Label[];
  };

  static addLabelToTodo = (todoId: number, labelId: number): boolean => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO todo_labels (todo_id, label_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(todoId, labelId);
    return result.changes > 0;
  };

  static removeLabelFromTodo = (todoId: number, labelId: number): boolean => {
    const stmt = db.prepare(`
      DELETE FROM todo_labels 
      WHERE todo_id = ? AND label_id = ?
    `);
    const result = stmt.run(todoId, labelId);
    return result.changes > 0;
  };

  static findByStatus = (userId: number, status: Todo['status']): Todo[] => {
    const stmt = db.prepare(`
      SELECT * FROM todos 
      WHERE user_id = ? AND status = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(userId, status) as Todo[];
  };

  static findByPriority = (userId: number, minPriority: number): Todo[] => {
    const stmt = db.prepare(`
      SELECT * FROM todos 
      WHERE user_id = ? AND priority >= ?
      ORDER BY priority DESC, created_at DESC
    `);
    return stmt.all(userId, minPriority) as Todo[];
  };
}
