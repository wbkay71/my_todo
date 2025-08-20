import db from '../db/database';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoWithLabels, TodoWithCategory, Label, Category } from '../types';

export class TodoModel {
  static create = (userId: number, todoData: CreateTodoRequest): Todo => {
    const { title, description, status = 'open', priority = 0, due_date, category_id } = todoData;

    const nowUtc = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO todos (user_id, title, description, status, priority, due_date, category_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Verwende JavaScript UTC-Zeit statt SQLite-Funktion
    const utcTimestamp = nowUtc.replace('T', ' ').replace('Z', '');
    const result = stmt.run(userId, title, description || null, status, priority, due_date || null, category_id || null, utcTimestamp, utcTimestamp);
    
    const createdTodo = this.findById(result.lastInsertRowid as number)!;
    
    return createdTodo;
  };

  static findById = (id: number): Todo | null => {
    const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
    return stmt.get(id) as Todo | null;
  };

  static findByUserId = (userId: number): Todo[] => {
    const stmt = db.prepare(`
      SELECT * FROM todos 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(userId) as Todo[];
  };

  static findByUserIdWithLabels = (userId: number): TodoWithLabels[] => {
    const todos = this.findByUserId(userId);
    
    return todos.map(todo => {
      const labels = this.getLabelsForTodo(todo.id);
      return { ...todo, labels };
    });
  };

  static findByUserIdWithCategory = (userId: number): TodoWithCategory[] => {
    const stmt = db.prepare(`
      SELECT 
        t.*,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.user_id as category_user_id,
        c.created_at as category_created_at
      FROM todos t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC
    `);
    
    const rows = stmt.all(userId) as any[];
    
          return rows.map(row => {
      const todo: TodoWithCategory = {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        due_date: row.due_date,
        category_id: row.category_id,
        created_at: row.created_at,
        updated_at: row.updated_at
      };

      if (row.category_id) {
        todo.category = {
          id: row.category_id,
          name: row.category_name,
          color: row.category_color,
          user_id: row.category_user_id,
          created_at: row.category_created_at
        };
      }

      return todo;
    });
  };

  static update = (id: number, userId: number, todoData: UpdateTodoRequest): Todo | null => {
    // Prüfe ob Todo dem User gehört
    const existingTodo = this.findById(id);
    if (!existingTodo || existingTodo.user_id !== userId) {
      return null;
    }

    const { title, description, status, priority, due_date, category_id } = todoData;
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
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
    }

    if (updates.length === 0) {
      return existingTodo;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE todos 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
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
