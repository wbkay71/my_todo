export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
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
