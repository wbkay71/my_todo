import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Todo,
  CreateUserRequest,
  LoginRequest,
  CreateTodoRequest,
  UpdateTodoRequest,
  AuthResponse,
  TodosResponse,
  TodoResponse,
  ApiError
} from '../types';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request-Interceptor für Auth-Token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response-Interceptor für Error-Handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token ungültig oder abgelaufen
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token-Management
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('token');
  }

  // Auth-Endpoints
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    this.setToken(response.data.token);
    return response.data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/auth/me');
    return response.data;
  }

  // Todo-Endpoints
  async getTodos(params?: {
    status?: Todo['status'];
    priority?: number;
    include_labels?: boolean;
  }): Promise<TodosResponse> {
    const response: AxiosResponse<TodosResponse> = await this.api.get('/todos', { params });
    return response.data;
  }

  async getTodo(id: number): Promise<TodoResponse> {
    const response: AxiosResponse<TodoResponse> = await this.api.get(`/todos/${id}`);
    return response.data;
  }

  async createTodo(todoData: CreateTodoRequest): Promise<TodoResponse> {
    const response: AxiosResponse<TodoResponse> = await this.api.post('/todos', todoData);
    return response.data;
  }

  async updateTodo(id: number, todoData: UpdateTodoRequest): Promise<TodoResponse> {
    const response: AxiosResponse<TodoResponse> = await this.api.patch(`/todos/${id}`, todoData);
    return response.data;
  }

  async deleteTodo(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/todos/${id}`);
    return response.data;
  }

  // Utility-Methoden
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Singleton-Instance
export const apiClient = new ApiClient();
export default apiClient;
