import db from '../db/database';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoWithLabels, Label } from '../types';

export class TodoModel {
  static create = (userId: number, todoData: CreateTodoRequest): Todo => {
    const { title, description, status = 'open', priority = 0, due_date } = todoData;

    const stmt = db.prepare(`
      INSERT INTO todos (user_id, title, description, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(userId, title, description || null, status, priority, due_date || null);
    
    return this.findById(result.lastInsertRowid as number)!;
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

  static update = (id: number, userId: number, todoData: UpdateTodoRequest): Todo | null => {
    // Prüfe ob Todo dem User gehört
    const existingTodo = this.findById(id);
    if (!existingTodo || existingTodo.user_id !== userId) {
      return null;
    }

    const { title, description, status, priority, due_date } = todoData;
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
