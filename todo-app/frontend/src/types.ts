export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  weekdays?: number[]; // 0=Sunday, 1=Monday, etc. for weekly recurrence
  monthDay?: number; // day of month (1-31) for monthly
  monthWeek?: number; // which week of month (1-4) for monthly
  monthWeekday?: number; // which weekday in that week for monthly
  endType: 'never' | 'date' | 'occurrences';
  endDate?: string;
  maxOccurrences?: number;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  // Recurring task fields
  recurrence_pattern?: RecurrencePattern;
  parent_task_id?: number;
  is_recurring_instance?: boolean;
  occurrence_count?: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  user_id: number;
  created_at: string;
}

export interface TodoWithCategories extends Todo {
  categories?: Category[];
}

export interface Label {
  id: number;
  name: string;
}

export interface TodoWithLabels extends Todo {
  labels?: Label[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  status?: Todo['status'];
  priority?: number;
  due_date?: string;
  category_ids?: number[];
  recurrence_pattern?: RecurrencePattern;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: Todo['status'];
  priority?: number;
  due_date?: string;
  category_ids?: number[];
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}

export interface TodosResponse {
  todos: TodoWithCategories[];
}

export interface TodoResponse {
  todo: TodoWithCategories;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}
