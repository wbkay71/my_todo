import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password_hash: string;
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

export interface Label {
  id: number;
  name: string;
}

export interface TodoLabel {
  todo_id: number;
  label_id: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  status?: Todo['status'];
  priority?: number;
  due_date?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: Todo['status'];
  priority?: number;
  due_date?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface TodoWithLabels extends Todo {
  labels?: Label[];
}
