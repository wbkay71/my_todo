import React, { useState, useEffect } from 'react';
import { TodoWithCategories, Category } from '../types';

interface CalendarProps {
  todos: TodoWithCategories[];
  categories: Category[];
  onUpdateTodo: (id: number, updates: Partial<TodoWithCategories>) => void;
  onDeleteTodo: (id: number) => void;
  onNavigateToTodos?: () => void;
}

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  todos: TodoWithCategories[];
}

const Calendar: React.FC<CalendarProps> = ({ todos, categories, onUpdateTodo, onDeleteTodo, onNavigateToTodos }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [draggedTodo, setDraggedTodo] = useState<TodoWithCategories | null>(null);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);

  const today = new Date();
  
  // Helper functions for date manipulation
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
  };

  // Get todos for a specific date
  const getTodosForDate = (date: Date): TodoWithCategories[] => {
    return todos.filter(todo => {
      if (!todo.due_date) return false;
      const todoDate = parseDate(todo.due_date.split('T')[0]);
      return isSameDay(date, todoDate);
    });
  };

  // Generate calendar days for month view
  const generateMonthDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get first day of week (Monday = 1, Sunday = 0)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure complete calendar grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(current);
      days.push({
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isSameDay(date, today),
        todos: getTodosForDate(date)
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Generate calendar days for week view
  const generateWeekDays = (): CalendarDay[] => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as first day
    startOfWeek.setDate(currentDate.getDate() - diff);
    
    const days: CalendarDay[] = [];
    const current = new Date(startOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        todos: getTodosForDate(date)
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = viewMode === 'month' ? generateMonthDays() : generateWeekDays();

  // Navigation functions
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, todo: TodoWithCategories) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    
    if (draggedTodo) {
      // Update todo's due date
      const newDueDate = formatDate(targetDate);
      const currentTime = draggedTodo.due_date ? draggedTodo.due_date.split('T')[1] : '12:00:00.000Z';
      const updatedDueDate = `${newDueDate}T${currentTime}`;
      
      onUpdateTodo(draggedTodo.id, { due_date: updatedDueDate });
      setDraggedTodo(null);
    }
  };

  // Get formatted month/year header
  const getHeaderText = (): string => {
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(currentDate.getDate() - diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
      }
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="nav-button" onClick={navigatePrevious}>
            ←
          </button>
          <h2 className="calendar-title">{getHeaderText()}</h2>
          <button className="nav-button" onClick={navigateNext}>
            →
          </button>
        </div>
        
        <div className="calendar-controls">
          <button 
            className="today-button"
            onClick={goToToday}
          >
            Heute
          </button>
          
          <div className="view-toggle">
            <button 
              className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Woche
            </button>
            <button 
              className={`toggle-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Monat
            </button>
          </div>
        </div>
      </div>

      <div className={`calendar-grid ${viewMode}`}>
        {/* Day headers */}
        <div className="calendar-weekdays">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => setSelectedDay(day.date)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.date)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              
              <div className="day-todos">
                {day.todos.slice(0, 3).map(todo => {
                  const category = todo.categories?.[0];
                  const backgroundColor = category?.color || '#95a5a6';
                  
                  return (
                    <div
                      key={todo.id}
                      className="todo-bar"
                      style={{ backgroundColor }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, todo)}
                      title={`${todo.title}${category ? ` (${category.name})` : ''}`}
                    >
                      <span className="todo-title">{todo.title}</span>
                    </div>
                  );
                })}
                
                {day.todos.length > 3 && (
                  <div className="more-todos">
                    +{day.todos.length - 3} weitere
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <div className="day-detail-modal" onClick={() => setSelectedDay(null)}>
          <div className="day-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="day-detail-header">
              <h3>
                {selectedDay.toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedDay(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="day-todos-list">
              {getTodosForDate(selectedDay).length === 0 ? (
                <p className="no-todos">Keine Todos für diesen Tag</p>
              ) : (
                getTodosForDate(selectedDay).map(todo => {
                  const category = todo.categories?.[0];
                  return (
                    <div key={todo.id} className="todo-item-detail">
                      <div className="todo-info">
                        <div className="todo-title-detail">{todo.title}</div>
                        {todo.description && (
                          <div className="todo-description-detail">{todo.description}</div>
                        )}
                        <div className="todo-meta-detail">
                          <span className={`status-badge ${todo.status}`}>
                            {todo.status === 'open' ? 'Offen' : 
                             todo.status === 'in_progress' ? 'In Bearbeitung' :
                             todo.status === 'completed' ? 'Abgeschlossen' : 'Abgebrochen'}
                          </span>
                          <span className="priority-badge-detail" style={{ backgroundColor: '#95a5a6' }}>
                            Priorität: {todo.priority}
                          </span>
                          {category && (
                            <span 
                              className="category-badge-detail"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="todo-quick-actions">
                        {todo.status !== 'completed' && (
                          <button
                            className="quick-action-btn complete-btn"
                            onClick={() => onUpdateTodo(todo.id, { status: 'completed' })}
                            title="Als erledigt markieren"
                          >
                            ✓
                          </button>
                        )}
                        
                        {todo.status === 'open' && (
                          <button
                            className="quick-action-btn progress-btn"
                            onClick={() => onUpdateTodo(todo.id, { status: 'in_progress' })}
                            title="In Bearbeitung setzen"
                          >
                            ⚡
                          </button>
                        )}
                        
                        {todo.status === 'completed' && (
                          <button
                            className="quick-action-btn reopen-btn"
                            onClick={() => onUpdateTodo(todo.id, { status: 'open' })}
                            title="Wieder öffnen"
                          >
                            ↻
                          </button>
                        )}
                        
                        <button
                          className="quick-action-btn edit-btn"
                          onClick={() => {
                            setSelectedDay(null);
                            if (onNavigateToTodos) {
                              onNavigateToTodos();
                              // Small delay to allow navigation to complete
                              setTimeout(() => {
                                // Scroll to the specific todo item
                                const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`);
                                if (todoElement) {
                                  todoElement.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'center' 
                                  });
                                  // Trigger edit mode if possible
                                  const editButton = todoElement.querySelector('.edit-button') as HTMLButtonElement;
                                  if (editButton) {
                                    setTimeout(() => editButton.click(), 300);
                                  }
                                }
                              }, 300);
                            }
                          }}
                          title="Im Todo-Bereich bearbeiten"
                        >
                          ✏️
                        </button>
                        
                        <button
                          className="quick-action-btn delete-btn"
                          onClick={() => {
                            if (window.confirm(`Todo "${todo.title}" wirklich löschen?`)) {
                              onDeleteTodo(todo.id);
                            }
                          }}
                          title="Todo löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
