import React, { useState, useEffect } from 'react';
import apiClient from './api/client';
import { User, Todo } from './types';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const { user } = await apiClient.getCurrentUser();
        setUser(user);
        await loadTodos();
      }
    } catch (error) {
      console.error('Auth-Fehler:', error);
      apiClient.logout();
    } finally {
      setLoading(false);
    }
  };

  const loadTodos = async () => {
    try {
      const { todos } = await apiClient.getTodos();
      setTodos(todos);
    } catch (error) {
      console.error('Fehler beim Laden der Todos:', error);
      setError('Fehler beim Laden der Todos');
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      const { user } = await apiClient.login(credentials);
      setUser(user);
      await loadTodos();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login-Fehler');
    }
  };

  const handleRegister = async (userData: { email: string; password: string; name?: string }) => {
    try {
      setError(null);
      const { user } = await apiClient.register(userData);
      setUser(user);
      await loadTodos();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registrierungs-Fehler');
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
    setTodos([]);
  };

  const handleCreateTodo = async (todoData: { title: string; description?: string }) => {
    try {
      const { todo } = await apiClient.createTodo(todoData);
      setTodos([todo, ...todos]);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Erstellen des Todos');
    }
  };

  const handleUpdateTodo = async (id: number, updates: Partial<Todo>) => {
    try {
      const { todo } = await apiClient.updateTodo(id, updates);
      setTodos(todos.map(t => t.id === id ? todo : t));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Aktualisieren des Todos');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await apiClient.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Löschen des Todos');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Lädt...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <h1>ToDo App</h1>
          {error && <div className="error">{error}</div>}
          {showRegister ? (
            <div>
              <RegisterForm onRegister={handleRegister} />
              <p>
                Bereits registriert?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => {
                    setShowRegister(false);
                    setError(null);
                  }}
                >
                  Anmelden
                </button>
              </p>
            </div>
          ) : (
            <div>
              <LoginForm onLogin={handleLogin} />
              <p>
                Noch kein Konto?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => {
                    setShowRegister(true);
                    setError(null);
                  }}
                >
                  Registrieren
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ToDo App</h1>
        <div className="user-info">
          <span>Willkommen, {user.name || user.email}!</span>
          <button onClick={handleLogout} className="logout-button">
            Abmelden
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error">{error}</div>}
        
        <div className="todo-section">
          <TodoForm onCreateTodo={handleCreateTodo} />
          <TodoList 
            todos={todos}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
