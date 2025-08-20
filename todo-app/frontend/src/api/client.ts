import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Todo, 
  TodoWithCategories,
  Category,
  CreateUserRequest, 
  LoginRequest, 
  CreateTodoRequest, 
  UpdateTodoRequest,
  CreateCategoryRequest,
  AuthResponse, 
  TodosResponse, 
  TodoResponse,
  CategoriesResponse,
  CategoryResponse
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
    // Prüfe zuerst localStorage, dann sessionStorage
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private setToken(token: string, rememberMe: boolean = false): void {
    // Entferne Token aus beiden Speichern zuerst
    this.removeToken();
    
    // Speichere im entsprechenden Storage
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  }

  private removeToken(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  private getTokenStorage(): 'localStorage' | 'sessionStorage' | null {
    if (localStorage.getItem('token')) return 'localStorage';
    if (sessionStorage.getItem('token')) return 'sessionStorage';
    return null;
  }

  // Auth-Endpoints
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    this.setToken(response.data.token, false); // Registration defaults to session storage
    return response.data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    this.setToken(response.data.token, credentials.rememberMe || false);
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

  getTokenInfo(): { 
    hasToken: boolean; 
    storage: 'localStorage' | 'sessionStorage' | null;
    isPersistent: boolean;
  } {
    const storage = this.getTokenStorage();
    return {
      hasToken: !!this.getToken(),
      storage,
      isPersistent: storage === 'localStorage'
    };
  }

  // Category-Endpoints
  async getCategories(): Promise<CategoriesResponse> {
    const response: AxiosResponse<CategoriesResponse> = await this.api.get('/categories');
    return response.data;
  }

  async createCategory(categoryData: CreateCategoryRequest): Promise<CategoryResponse> {
    const response: AxiosResponse<CategoryResponse> = await this.api.post('/categories', categoryData);
    return response.data;
  }

  async updateCategory(id: number, categoryData: Partial<CreateCategoryRequest>): Promise<CategoryResponse> {
    const response: AxiosResponse<CategoryResponse> = await this.api.patch(`/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Singleton-Instance
export const apiClient = new ApiClient();
export default apiClient;
