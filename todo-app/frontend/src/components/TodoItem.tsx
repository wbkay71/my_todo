import React, { useState } from 'react';
import { TodoWithCategories } from '../types';
import { formatSmartDate, formatSmartDueDate, formatDateTimeForInput, isToday, isOverdue, getHoursUntilDue, convertLocalDateTimeToUTC, splitDateTime, combineDateTime } from '../utils/timezone';
import { isRecurringTodo, parseRecurrencePattern, formatRecurrencePattern, getRecurrenceIcon, getNextOccurrenceDate } from '../utils/recurrence';
import MultiCategorySelector from './MultiCategorySelector';
import TimeSelector from './TimeSelector';

interface TodoItemProps {
  todo: TodoWithCategories;
  onUpdateTodo: (id: number, updates: Partial<TodoWithCategories>) => void;
  onDeleteTodo: (id: number) => void;
  onNavigateToCategories?: () => void;
  onNavigateToCalendar?: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdateTodo, onDeleteTodo, onNavigateToCategories, onNavigateToCalendar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const editDateTime = todo.due_date ? formatDateTimeForInput(todo.due_date) : '';
  const { date: editDueDateOnly, time: editDueTimeOnly } = splitDateTime(editDateTime);
  const [editDueDate, setEditDueDate] = useState(editDueDateOnly);
  const [editDueTime, setEditDueTime] = useState(editDueTimeOnly);
  const [editCategoryIds, setEditCategoryIds] = useState<number[]>(
    todo.categories ? todo.categories.map(cat => cat.id) : []
  );

  const handleStatusChange = (newStatus: TodoWithCategories['status']) => {
    onUpdateTodo(todo.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority: number) => {
    onUpdateTodo(todo.id, { priority: newPriority });
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      const dueDateTimeString = combineDateTime(editDueDate, editDueTime);
      const updateData = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        due_date: dueDateTimeString ? convertLocalDateTimeToUTC(dueDateTimeString) : undefined,
        category_ids: editCategoryIds
      };
      
      console.log('Updating todo with data:', updateData); // Debug log
      
      onUpdateTodo(todo.id, updateData);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    const resetDateTime = todo.due_date ? formatDateTimeForInput(todo.due_date) : '';
    const { date: resetDate, time: resetTime } = splitDateTime(resetDateTime);
    setEditDueDate(resetDate);
    setEditDueTime(resetTime);
    setEditCategoryIds(todo.categories ? todo.categories.map(cat => cat.id) : []);
    setIsEditing(false);
  };

  // Removed old formatDate function - using timezone utilities now

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return '#ff4444';
    if (priority >= 5) return '#ffaa00';
    if (priority >= 3) return '#ffdd00';
    return '#44aa44';
  };



  return (
    <div className={`todo-item todo-${todo.status}`} data-todo-id={todo.id}>
      <div className="todo-header">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title-input"
            autoFocus
          />
        ) : (
          <h4 className="todo-title">
            {isRecurringTodo(todo) && (
              <span className="title-recurring-icon" title="Wiederkehrende Aufgabe">
                🔄
              </span>
            )}
            {todo.title}
          </h4>
        )}
        
        <div className="todo-priority">
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(todo.priority) }}
          >
            {todo.priority}
          </span>
        </div>
      </div>

      {/* Categories - always visible when present */}
      {todo.categories && todo.categories.length > 0 && (
        <div className="todo-categories">
          <div className="categories-display">
            {todo.categories.map((category) => (
              <span
                key={category.id}
                className="category-badge clickable-badge"
                style={{ backgroundColor: category.color }}
                onClick={onNavigateToCategories}
                title={`Zur Kategorienverwaltung springen (${category.name})`}
              >
                🏷️ {category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Task Indicator */}
      {isRecurringTodo(todo) && (
        <div className="todo-recurrence">
          <div className="recurrence-display">
            {(() => {
              const pattern = parseRecurrencePattern(todo.recurrence_pattern || null);
              
              if (pattern) {
                // This is the original recurring task
                const icon = getRecurrenceIcon(pattern);
                const description = formatRecurrencePattern(pattern);
                const nextDate = getNextOccurrenceDate(todo);
                
                return (
                  <span className="recurrence-badge original-recurring" title={description}>
                    {icon} {description}
                    {nextDate && <span className="next-occurrence"> (nächste: {nextDate})</span>}
                  </span>
                );
              } else if (todo.is_recurring_instance) {
                // This is an instance of a recurring task
                return (
                  <span className="recurrence-badge recurring-instance" title="Teil einer wiederkehrenden Aufgabe">
                    🔄 Wiederkehrende Aufgabe
                    {todo.occurrence_count && (
                      <span className="occurrence-count"> (#{todo.occurrence_count})</span>
                    )}
                  </span>
                );
              }
              
              return null;
            })()}
          </div>
        </div>
      )}



      {(todo.description || isEditing) && (
        <div className="todo-description">
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="edit-description-input"
              rows={2}
              placeholder="Beschreibung..."
            />
          ) : (
            <p>{todo.description}</p>
          )}
        </div>
      )}

      {(todo.due_date || isEditing) && (
        <div className="todo-due-date">
          {isEditing ? (
            <TimeSelector
              date={editDueDate}
              time={editDueTime}
              onDateChange={setEditDueDate}
              onTimeChange={setEditDueTime}
              label="Fälligkeitsdatum mit Uhrzeit"
              id={`dueDateTime-${todo.id}`}
            />
          ) : todo.due_date && (
            <div 
              className={`due-date-display clickable-deadline ${isOverdue(todo.due_date) ? 'due-overdue' : isToday(todo.due_date) ? 'due-today' : ''}`}
              onClick={onNavigateToCalendar}
              title="Zum Kalender springen"
            >
              📅 {formatSmartDueDate(todo.due_date)}
              {getHoursUntilDue(todo.due_date) > 0 && getHoursUntilDue(todo.due_date) <= 24 && (
                <span className="due-hours-indicator">
                  {getHoursUntilDue(todo.due_date) === 1 ? 'in 1 Stunde' : `in ${getHoursUntilDue(todo.due_date)} Stunden`}
                </span>
              )}
            </div>
          )}
        </div>
      )}



      <div className="todo-controls">
        <div className="status-controls">
          <select
            value={todo.status}
            onChange={(e) => handleStatusChange(e.target.value as TodoWithCategory['status'])}
            className="status-select"
          >
            <option value="open">Offen</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="completed">Abgeschlossen</option>
            <option value="cancelled">Abgebrochen</option>
          </select>
        </div>

        <div className="priority-controls">
          <label>Priorität:</label>
          <input
            type="range"
            min="0"
            max="10"
            value={todo.priority}
            onChange={(e) => handlePriorityChange(parseInt(e.target.value))}
            className="priority-slider"
          />
          <span>{todo.priority}</span>
        </div>

        <div className="action-buttons">
          {isEditing ? (
            <>
              <button onClick={handleSaveEdit} className="save-button">
                Speichern
              </button>
              <button onClick={handleCancelEdit} className="cancel-button">
                Abbrechen
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="edit-button">
                Bearbeiten
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Todo wirklich löschen?')) {
                    onDeleteTodo(todo.id);
                  }
                }}
                className="delete-button"
              >
                Löschen
              </button>
            </>
          )}
        </div>
      </div>

      {/* Categories editor - at the bottom in edit mode */}
      {isEditing && (
        <div className="todo-categories-edit" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ecf0f1' }}>
          <label htmlFor={`categories-${todo.id}`} style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            Kategorien (optional):
          </label>
          <MultiCategorySelector
            selectedCategoryIds={editCategoryIds}
            onCategoryChange={setEditCategoryIds}
            showCreateOption={true}
          />
        </div>
      )}

      <div className="todo-meta">
        <small>
          Erstellt: {formatSmartDate(todo.created_at)}
          {todo.updated_at !== todo.created_at && (
            <span> • Aktualisiert: {formatSmartDate(todo.updated_at)}</span>
          )}
        </small>
      </div>
    </div>
  );
};

export default TodoItem;
