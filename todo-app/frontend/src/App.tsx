import { useState, useEffect } from 'react';
import apiClient from './api/client';
import { User, TodoWithCategories, Category } from './types';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import CategoryManagement from './components/CategoryManagement';
import Dashboard, { TodoFilter } from './components/Dashboard';
import FloatingActionButton from './components/FloatingActionButton';
import Calendar from './components/Calendar';
import DailyDigest from './components/DailyDigest';
import { isOverdue, isToday } from './utils/timezone';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<TodoWithCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'todos' | 'categories' | 'calendar' | 'digest'>('todos');
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('all');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const { user } = await apiClient.getCurrentUser();
        setUser(user);
        await Promise.all([loadTodos(), loadCategories()]);
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

  const loadCategories = async () => {
    try {
      const { categories } = await apiClient.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    }
  };

  const handleLogin = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
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
    setError(null);
    console.log('Benutzer erfolgreich abgemeldet');
  };

  const handleLogoutAndForget = () => {
    // E-Mail auch vergessen (für anderen Benutzer)
    localStorage.removeItem('lastEmail');
    handleLogout();
  };

  const handleCreateTodo = async (todoData: { title: string; description?: string; due_date?: string; priority?: number; category_ids?: number[] }) => {
    try {
      const { todo } = await apiClient.createTodo(todoData);
      setTodos([todo, ...todos]);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Erstellen des Todos');
    }
  };

  const handleUpdateTodo = async (id: number, updates: Partial<TodoWithCategories>) => {
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

  const handleCategoryUpdated = () => {
    // Refresh todos and categories to get updated information
    Promise.all([loadTodos(), loadCategories()]);
  };

  const handleFilterChange = (filter: TodoFilter) => {
    setTodoFilter(filter);
    
    // Scroll zum Filter-Indikator oder TodoList nach kurzer Verzögerung
    setTimeout(() => {
      // Zuerst versuchen zum Filter-Indikator zu scrollen (falls vorhanden)
      const filterIndicator = document.querySelector('.filter-indicator');
      if (filterIndicator && filter !== 'all') {
        filterIndicator.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback zur TodoList
        const todoListElement = document.querySelector('.todo-list');
        if (todoListElement) {
          todoListElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
    }, 150); // Etwas länger warten, damit Filter-Indikator geladen ist
  };

  const getFilteredTodos = (): TodoWithCategories[] => {
    if (todoFilter === 'all') {
      return todos;
    }

    return todos.filter(todo => {
      switch (todoFilter) {
        case 'open':
          return todo.status === 'open';
        case 'in_progress':
          return todo.status === 'in_progress';
        case 'completed_today':
          return todo.status === 'completed' && isToday(todo.updated_at);
        case 'overdue':
          return todo.due_date && isOverdue(todo.due_date) && todo.status !== 'completed';
        case 'this_week':
          if (!todo.due_date) return false;
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Sonntag
          const dueDate = new Date(todo.due_date);
          return dueDate >= startOfWeek && dueDate <= endOfWeek;
        default:
          // Category filter
          if (typeof todoFilter === 'object' && todoFilter.category) {
            return todo.categories?.some(cat => cat.id === todoFilter.category) || false;
          }
          return true;
      }
    });
  };

  const getFilterDisplayName = (): string => {
    switch (todoFilter) {
      case 'all': return 'Alle';
      case 'open': return 'Offen';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed_today': return 'Heute erledigt';
      case 'overdue': return 'Überfällig';
      case 'this_week': return 'Diese Woche';
      default:
        if (typeof todoFilter === 'object' && todoFilter.category) {
          const category = categories.find(cat => cat.id === todoFilter.category);
          return category ? `Kategorie: ${category.name}` : 'Unbekannte Kategorie';
        }
        return 'Alle';
    }
  };

  const filteredTodos = getFilteredTodos();

  const handleNavigateToDashboard = () => {
    // Zuerst zum todos Tab wechseln falls nötig
    if (activeTab !== 'todos') {
      setActiveTab('todos');
    }
    
    // Filter zurücksetzen für vollständige Dashboard-Ansicht
    setTodoFilter('all');
    
    // Direktes Scroll zum Dashboard
    setTimeout(() => {
      const dashboardElement = document.querySelector('.dashboard');
      if (dashboardElement) {
        dashboardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback: Scroll zum Anfang der Seite
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, activeTab !== 'todos' ? 300 : 100);
  };

  const handleNavigateToNewTodo = () => {
    // Zuerst zum todos Tab wechseln falls nötig
    if (activeTab !== 'todos') {
      setActiveTab('todos');
    }
    
    // Filter zurücksetzen
    setTodoFilter('all');
    
    // Zum TodoForm scrollen und Focus setzen
    setTimeout(() => {
      const todoFormElement = document.querySelector('.todo-form');
      if (todoFormElement) {
        todoFormElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        // Auto-Focus auf das Titel-Input-Feld
        setTimeout(() => {
          const titleInput = document.querySelector('.todo-form input[type="text"]') as HTMLInputElement;
          if (titleInput) {
            titleInput.focus();
            titleInput.select(); // Selektiert den gesamten Text falls vorhanden
            
            // Kleine visuelle Hervorhebung
            titleInput.style.transition = 'box-shadow 0.3s ease';
            titleInput.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.3)';
            setTimeout(() => {
              titleInput.style.boxShadow = '';
            }, 1500);
          }
        }, 500); // Warten bis Scroll fertig ist
      }
    }, activeTab !== 'todos' ? 300 : 100);
  };

  const handleNavigateToCategories = () => {
    // Zum Kategorien-Tab wechseln
    setActiveTab('categories');
    
    // Kurz warten und dann zum Category Management scrollen
    setTimeout(() => {
      const categoryManagement = document.querySelector('.category-management');
      if (categoryManagement) {
        categoryManagement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback: Scroll zum Anfang der Seite
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
  };

    const handleNavigateToCalendar = () => {
    // Zum Kalender-Tab wechseln
    setActiveTab('calendar');
    
    // Kurz warten und dann zum Calendar scrollen
    setTimeout(() => {
      const calendarContainer = document.querySelector('.calendar-container');
      if (calendarContainer) {
        calendarContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Fallback: Scroll zum Anfang der Seite
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
  };

  const handleNavigateToDigest = () => {
    // Zum Daily Digest-Tab wechseln
    setActiveTab('digest');
    
    // Kurz warten und dann zum Daily Digest scrollen
    setTimeout(() => {
      const digestContainer = document.querySelector('.daily-digest');
      if (digestContainer) {
        digestContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Fallback: Scroll zum Anfang der Seite
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
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
          <div className="user-details">
            <span className="user-greeting">Willkommen!</span>
            <span className="user-name">{user.name || user.email}</span>
            {apiClient.getTokenInfo().isPersistent && (
              <span className="session-indicator">🔐 Dauerhaft angemeldet</span>
            )}
          </div>
          <div className="logout-dropdown">
            <button onClick={handleLogout} className="logout-button" title="Abmelden">
              Abmelden
            </button>
            <button onClick={handleLogoutAndForget} className="logout-forget-button" title="Abmelden und E-Mail vergessen">
              Anderer Benutzer
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          📝 Todos ({todos.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Kategorien
        </button>
        <button 
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Kalender
        </button>
        <button 
          className={`tab-button ${activeTab === 'digest' ? 'active' : ''}`}
          onClick={() => setActiveTab('digest')}
        >
          🎯 Daily Digest
        </button>
      </nav>

      <main className="app-main">
        {error && <div className="error">{error}</div>}
        
        {activeTab === 'todos' ? (
          <div className="todo-section">
            <Dashboard 
              todos={todos} 
              categories={categories} 
              onFilterChange={handleFilterChange}
            />
            <TodoForm onCreateTodo={handleCreateTodo} />
            
            {/* Filter indicator */}
            {todoFilter !== 'all' && (
              <div className="filter-indicator">
                <span className="filter-text">
                  Filter aktiv: <strong>{getFilterDisplayName()}</strong>
                </span>
                <button 
                  className="clear-filter-btn"
                  onClick={() => setTodoFilter('all')}
                >
                  Alle anzeigen
                </button>
              </div>
            )}
            
            <TodoList 
              todos={filteredTodos}
              onUpdateTodo={handleUpdateTodo}
              onDeleteTodo={handleDeleteTodo}
              onNavigateToCategories={handleNavigateToCategories}
              onNavigateToCalendar={handleNavigateToCalendar}
            />
          </div>
        ) : activeTab === 'categories' ? (
          <CategoryManagement 
            onCategoryUpdated={handleCategoryUpdated}
            onFilterChange={handleFilterChange}
            onSwitchToTodos={() => setActiveTab('todos')}
          />
        ) : activeTab === 'calendar' ? (
          <Calendar
            todos={todos}
            categories={categories}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
            onNavigateToTodos={() => setActiveTab('todos')}
          />
        ) : (
          <DailyDigest
            todos={todos}
            categories={categories}
          />
        )}
      </main>
      
      {/* Floating Action Button - nur anzeigen wenn eingeloggt */}
      {user && (
        <FloatingActionButton
          onNavigateToDashboard={handleNavigateToDashboard}
          onNavigateToNewTodo={handleNavigateToNewTodo}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToCategories={handleNavigateToCategories}
          onNavigateToDigest={handleNavigateToDigest}
        />
      )}
    </div>
  );
}

export default App;
