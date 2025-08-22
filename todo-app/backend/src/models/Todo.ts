import db from '../db/database';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoWithLabels, TodoWithCategories, Label, Category } from '../types';

export class TodoModel {
  static create = (userId: number, todoData: CreateTodoRequest): TodoWithCategories => {
    const { title, description, status = 'open', priority = 0, due_date, category_ids = [], recurrence_pattern } = todoData;

    const nowUtc = new Date().toISOString();
    const utcTimestamp = nowUtc.replace('T', ' ').replace('Z', '');
    
    const stmt = db.prepare(`
      INSERT INTO todos (user_id, title, description, status, priority, due_date, created_at, updated_at, recurrence_pattern, is_recurring_instance, occurrence_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Convert recurrence pattern to JSON string
    const recurrenceJson = recurrence_pattern ? JSON.stringify(recurrence_pattern) : null;
    const isRecurringInstance = 0; // New todos are always original tasks
    const occurrenceCount = 0;

    const result = stmt.run(
      userId, 
      title, 
      description || null, 
      status, 
      priority, 
      due_date || null, 
      utcTimestamp, 
      utcTimestamp,
      recurrenceJson,
      isRecurringInstance,
      occurrenceCount
    );
    
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

  static createNextRecurringInstance = (parentTodo: Todo): TodoWithCategories | null => {
    if (!parentTodo.recurrence_pattern) return null;

    const pattern = JSON.parse(parentTodo.recurrence_pattern);
    const nextDueDate = this.calculateNextDueDate(parentTodo.due_date, pattern, parentTodo.occurrence_count || 0);
    
    if (!nextDueDate) return null; // End of recurrence

    const nowUtc = new Date().toISOString();
    const utcTimestamp = nowUtc.replace('T', ' ').replace('Z', '');

    const stmt = db.prepare(`
      INSERT INTO todos (user_id, title, description, status, priority, due_date, created_at, updated_at, recurrence_pattern, parent_task_id, is_recurring_instance, occurrence_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const nextOccurrenceCount = (parentTodo.occurrence_count || 0) + 1;

    const result = stmt.run(
      parentTodo.user_id,
      parentTodo.title,
      parentTodo.description,
      'open', // New instances always start as open
      parentTodo.priority,
      nextDueDate,
      utcTimestamp,
      utcTimestamp,
      parentTodo.recurrence_pattern,
      parentTodo.parent_task_id || parentTodo.id, // Reference to original task
      1, // is_recurring_instance = true
      nextOccurrenceCount
    );

    const todoId = result.lastInsertRowid as number;

    // Copy category relationships from parent
    const parentCategories = this.getTodoCategories(parentTodo.id);
    if (parentCategories.length > 0) {
      this.updateTodoCategories(todoId, parentCategories.map(c => c.id));
    }

    return this.findByIdWithCategories(todoId)!;
  };

  static calculateNextDueDate = (currentDueDate: string | null, pattern: any, occurrenceCount: number): string | null => {
    if (!currentDueDate) return null;

    const currentDate = new Date(currentDueDate);
    let nextDate = new Date(currentDate);

    // Check end conditions
    if (pattern.endType === 'occurrences' && pattern.maxOccurrences && occurrenceCount >= pattern.maxOccurrences) {
      return null;
    }
    if (pattern.endType === 'date' && pattern.endDate && currentDate >= new Date(pattern.endDate)) {
      return null;
    }

    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
      
      case 'weekly':
        if (pattern.weekdays && pattern.weekdays.length > 0) {
          // Find next weekday in the pattern
          const currentWeekday = currentDate.getDay();
          const sortedWeekdays = [...pattern.weekdays].sort((a, b) => a - b);
          
          let nextWeekday = sortedWeekdays.find(day => day > currentWeekday);
          let weeksToAdd = 0;
          
          if (!nextWeekday) {
            // Go to next week
            nextWeekday = sortedWeekdays[0];
            weeksToAdd = pattern.interval;
          }
          
          const daysToAdd = (nextWeekday - currentWeekday + 7) % 7 || 7 * weeksToAdd;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          nextDate.setDate(nextDate.getDate() + 7 * pattern.interval);
        }
        break;
      
      case 'monthly':
        if (pattern.monthDay > 0) {
          // Specific day of month
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          nextDate.setDate(pattern.monthDay);
        } else {
          // Nth weekday of month
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          const targetWeekday = pattern.monthWeekday;
          const targetWeek = pattern.monthWeek;
          
          // Calculate the nth occurrence of weekday in the month
          const firstDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
          const firstWeekday = firstDay.getDay();
          const daysToFirstTarget = (targetWeekday - firstWeekday + 7) % 7;
          const targetDate = 1 + daysToFirstTarget + (targetWeek - 1) * 7;
          
          nextDate.setDate(targetDate);
        }
        break;
      
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
      
      default:
        return null;
    }

    return nextDate.toISOString();
  };

  static handleRecurringTaskCompletion = (todoId: number, userId: number): TodoWithCategories | null => {
    const todo = this.findById(todoId);
    if (!todo || todo.user_id !== userId) return null;

    // Mark current instance as completed
    this.update(todoId, userId, { status: 'completed' });

    // If this is a recurring task, create next instance
    if (todo.recurrence_pattern && !todo.is_recurring_instance) {
      // This is the original recurring task
      return this.createNextRecurringInstance(todo);
    } else if (todo.is_recurring_instance && todo.parent_task_id) {
      // This is an instance, check parent for pattern
      const parentTodo = this.findById(todo.parent_task_id);
      if (parentTodo && parentTodo.recurrence_pattern) {
        return this.createNextRecurringInstance({
          ...parentTodo,
          due_date: todo.due_date,
          occurrence_count: todo.occurrence_count
        });
      }
    }

    return null;
  };
}
