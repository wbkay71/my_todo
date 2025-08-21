import React, { useState } from 'react';
import { TodoWithCategories, Category } from '../types';
import { isOverdue, isToday } from '../utils/timezone';

interface MiniCalendarProps {
  todos: TodoWithCategories[];
  categories: Category[];
  onDateFilter: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  todos: TodoWithCategories[];
  isOverdue: boolean;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ todos, categories, onDateFilter }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const today = new Date();
  
  // Helper functions
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
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

  // Generate calendar days for current month
  const generateCalendarDays = (): CalendarDay[] => {
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
      const dayTodos = getTodosForDate(date);
      const hasOverdueTodos = dayTodos.some(todo => 
        todo.due_date && isOverdue(todo.due_date) && todo.status !== 'completed'
      );
      
      days.push({
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date.toISOString()),
        todos: dayTodos,
        isOverdue: hasOverdueTodos
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigation functions
  const navigatePrevious = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get unique category colors for a day
  const getCategoryDots = (dayTodos: TodoWithCategories[]): string[] => {
    const colors = new Set<string>();
    dayTodos.forEach(todo => {
      if (todo.categories && todo.categories.length > 0) {
        colors.add(todo.categories[0].color);
      } else {
        colors.add('#95a5a6'); // Default gray for uncategorized
      }
    });
    return Array.from(colors).slice(0, 3); // Max 3 dots
  };

  // Get month name in German
  const getMonthName = (): string => {
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // Get next deadline info
  const getNextDeadline = () => {
    const now = new Date();
    const upcomingTodos = todos
      .filter(todo => 
        todo.due_date && 
        new Date(todo.due_date) > now && 
        todo.status !== 'completed'
      )
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    if (upcomingTodos.length === 0) return null;

    const nextTodo = upcomingTodos[0];
    const deadline = new Date(nextTodo.due_date!);
    const hoursUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    return {
      todo: nextTodo,
      hoursUntil
    };
  };

  // Get busy days for current week
  const getBusyDaysThisWeek = () => {
    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as first day
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const busyDays: { day: string; count: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayTodos = getTodosForDate(date);
      
      if (dayTodos.length >= 2) { // Consider 2+ todos as "busy"
        busyDays.push({
          day: weekDays[i],
          count: dayTodos.length
        });
      }
    }

    return busyDays;
  };

  const nextDeadline = getNextDeadline();
  const busyDays = getBusyDaysThisWeek();

  return (
    <div className="mini-calendar-widget">
      <div className="mini-calendar-header">
        <h3 className="mini-calendar-title">📅 Monatsübersicht</h3>
        <div className="mini-calendar-nav">
          <button className="mini-nav-btn" onClick={navigatePrevious}>‹</button>
          <span className="mini-month-name">{getMonthName()}</span>
          <button className="mini-nav-btn" onClick={navigateNext}>›</button>
        </div>
      </div>

      <div className="mini-calendar-grid">
        {/* Weekday headers */}
        <div className="mini-weekdays">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="mini-weekday">{day}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="mini-days">
          {calendarDays.map((day, index) => {
            const categoryDots = getCategoryDots(day.todos);
            const isHovered = hoveredDay && isSameDay(day.date, hoveredDay);
            
            return (
              <div
                key={index}
                className={`mini-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isOverdue ? 'overdue' : ''}`}
                onClick={() => onDateFilter(day.date)}
                onMouseEnter={() => setHoveredDay(day.date)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <span className="mini-day-number">{day.date.getDate()}</span>
                
                {/* Task count badge */}
                {day.todos.length > 0 && (
                  <span className="task-count-badge">{day.todos.length}</span>
                )}
                
                {/* Category dots */}
                <div className="category-dots">
                  {categoryDots.map((color, i) => (
                    <div 
                      key={i}
                      className="category-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Hover preview */}
                {isHovered && day.todos.length > 0 && (
                  <div className="hover-preview">
                    {day.todos.slice(0, 3).map(todo => (
                      <div key={todo.id} className="preview-todo">
                        {todo.title}
                      </div>
                    ))}
                    {day.todos.length > 3 && (
                      <div className="preview-more">+{day.todos.length - 3} weitere</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mini-calendar-stats">
        {nextDeadline && (
          <div className="next-deadline">
            <strong>Nächste Deadline:</strong> {nextDeadline.todo.title} in {nextDeadline.hoursUntil} Stunden
          </div>
        )}
        
        {busyDays.length > 0 && (
          <div className="busy-days">
            <strong>Busy days this week:</strong> {busyDays.map(day => `${day.day} (${day.count})`).join(', ')}
          </div>
        )}
        
        {!nextDeadline && busyDays.length === 0 && (
          <div className="no-deadlines">
            Keine anstehenden Deadlines diese Woche 🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCalendar;
