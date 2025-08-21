import React from 'react';
import { TodoWithCategories, Category } from '../types';
import { isOverdue, isToday } from '../utils/timezone';
import MiniCalendar from './MiniCalendar';

interface DashboardProps {
  todos: TodoWithCategories[];
  categories: Category[];
  onFilterChange?: (filter: TodoFilter) => void;
}

export type TodoFilter = 
  | 'all'
  | 'open' 
  | 'in_progress'
  | 'completed_today'
  | 'overdue'
  | 'this_week'
  | { category: number };

interface StatusCounts {
  open: number;
  inProgress: number;
  doneToday: number;
  overdue: number;
  thisWeek: number;
}

interface CategoryStats {
  [categoryId: number]: {
    name: string;
    color: string;
    count: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ todos, categories, onFilterChange }) => {
  // Status-Zähler berechnen
  const getStatusCounts = (): StatusCounts => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sonntag

    const counts: StatusCounts = {
      open: 0,
      inProgress: 0,
      doneToday: 0,
      overdue: 0,
      thisWeek: 0
    };

    todos.forEach(todo => {
      // Status zählen
      if (todo.status === 'open') counts.open++;
      if (todo.status === 'in_progress') counts.inProgress++;
      
      // Heute erledigt
      if (todo.status === 'completed' && isToday(todo.updated_at)) {
        counts.doneToday++;
      }

      // Überfällig
      if (todo.due_date && isOverdue(todo.due_date) && todo.status !== 'completed') {
        counts.overdue++;
      }

      // Diese Woche (alle Todos mit due_date diese Woche)
      if (todo.due_date) {
        const dueDate = new Date(todo.due_date);
        if (dueDate >= startOfWeek && dueDate <= endOfWeek) {
          counts.thisWeek++;
        }
      }
    });

    return counts;
  };

  // Kategorie-Statistiken berechnen
  const getCategoryStats = (): CategoryStats => {
    const stats: CategoryStats = {};

    // Initialisiere alle Kategorien
    categories.forEach(category => {
      stats[category.id] = {
        name: category.name,
        color: category.color,
        count: 0
      };
    });

    // Zähle Todos pro Kategorie (nur offene und in Bearbeitung)
    todos.forEach(todo => {
      if (todo.status === 'open' || todo.status === 'in_progress') {
        if (todo.categories && todo.categories.length > 0) {
          todo.categories.forEach(category => {
            if (stats[category.id]) {
              stats[category.id].count++;
            }
          });
        }
      }
    });

    return stats;
  };

  const statusCounts = getStatusCounts();
  const categoryStats = getCategoryStats();

  // Sortiere Kategorien nach Anzahl (für bessere Darstellung)
  const sortedCategories = Object.values(categoryStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Zeige nur Top 8 Kategorien

  const maxCategoryCount = Math.max(...sortedCategories.map(cat => cat.count), 1);

  const handleStatusClick = (filter: TodoFilter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    if (onFilterChange) {
      onFilterChange({ category: categoryId });
    }
  };

  const handleDateFilter = (date: Date) => {
    // Filter todos for specific date - we'll implement this as a special filter
    if (onFilterChange) {
      // For now, we'll just go to 'all' and let the parent handle date filtering
      // In a full implementation, we'd extend TodoFilter to include date ranges
      onFilterChange('all');
      
      // Scroll to todo list after short delay
      setTimeout(() => {
        const todoListElement = document.querySelector('.todo-list');
        if (todoListElement) {
          todoListElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 150);
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">📊 Dashboard</h2>
      
      {/* Status Overview Cards */}
      <div className="status-overview">
        <div 
          className="status-card open clickable" 
          onClick={() => handleStatusClick('open')}
          title="Klicken um offene Aufgaben anzuzeigen"
        >
          <div className="status-icon">📋</div>
          <div className="status-info">
            <span className="status-number">{statusCounts.open}</span>
            <span className="status-label">Offen</span>
          </div>
        </div>

        <div 
          className="status-card in-progress clickable"
          onClick={() => handleStatusClick('in_progress')}
          title="Klicken um Aufgaben in Bearbeitung anzuzeigen"
        >
          <div className="status-icon">⚡</div>
          <div className="status-info">
            <span className="status-number">{statusCounts.inProgress}</span>
            <span className="status-label">In Bearbeitung</span>
          </div>
        </div>

        <div 
          className="status-card completed clickable"
          onClick={() => handleStatusClick('completed_today')}
          title="Klicken um heute erledigte Aufgaben anzuzeigen"
        >
          <div className="status-icon">✅</div>
          <div className="status-info">
            <span className="status-number">{statusCounts.doneToday}</span>
            <span className="status-label">Heute erledigt</span>
          </div>
        </div>

        <div 
          className="status-card overdue clickable"
          onClick={() => handleStatusClick('overdue')}
          title="Klicken um überfällige Aufgaben anzuzeigen"
        >
          <div className="status-icon">⚠️</div>
          <div className="status-info">
            <span className="status-number">{statusCounts.overdue}</span>
            <span className="status-label">Überfällig</span>
          </div>
        </div>

        <div 
          className="status-card this-week clickable"
          onClick={() => handleStatusClick('this_week')}
          title="Klicken um Aufgaben dieser Woche anzuzeigen"
        >
          <div className="status-icon">📅</div>
          <div className="status-info">
            <span className="status-number">{statusCounts.thisWeek}</span>
            <span className="status-label">Diese Woche</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-content">
        {/* Category Breakdown */}
        {sortedCategories.length > 0 && (
          <div className="category-breakdown">
            <h3 className="section-title">Aktive Aufgaben nach Kategorien</h3>
            <div className="category-bars">
              {sortedCategories.map(category => {
                const categoryId = categories.find(c => c.name === category.name)?.id;
                return (
                  <div 
                    key={category.name} 
                    className="category-bar-item clickable"
                    onClick={() => categoryId && handleCategoryClick(categoryId)}
                    title={`Klicken um Aufgaben in Kategorie "${category.name}" anzuzeigen`}
                  >
                    <div className="category-info">
                      <span 
                        className="category-color-indicator"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      <span className="category-name">{category.name}</span>
                      <span className="category-count">{category.count}</span>
                    </div>
                    <div className="category-bar-container">
                      <div 
                        className="category-bar-fill"
                        style={{ 
                          width: `${(category.count / maxCategoryCount) * 100}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {sortedCategories.every(cat => cat.count === 0) && (
              <p className="no-data">Keine aktiven Aufgaben in Kategorien</p>
            )}
          </div>
        )}

        {/* Mini Calendar Widget */}
        <div className="mini-calendar-section">
          <MiniCalendar 
            todos={todos}
            categories={categories}
            onDateFilter={handleDateFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
