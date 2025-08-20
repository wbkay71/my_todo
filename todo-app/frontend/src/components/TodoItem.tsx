import React, { useState } from 'react';
import { TodoWithCategories } from '../types';
import { formatSmartDate, formatDateOnlyForDisplay, formatDateForInput, isToday } from '../utils/timezone';
import MultiCategorySelector from './MultiCategorySelector';

interface TodoItemProps {
  todo: TodoWithCategories;
  onUpdateTodo: (id: number, updates: Partial<TodoWithCategories>) => void;
  onDeleteTodo: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdateTodo, onDeleteTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? formatDateForInput(todo.due_date) : '');
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
      const updateData = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        due_date: editDueDate || undefined, // HTML5 Date gibt bereits YYYY-MM-DD zurück
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
    setEditDueDate(todo.due_date ? formatDateForInput(todo.due_date) : '');
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
    <div className={`todo-item todo-${todo.status}`}>
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
          <h4 className="todo-title">{todo.title}</h4>
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
                className="category-badge"
                style={{ backgroundColor: category.color }}
              >
                🏷️ {category.name}
              </span>
            ))}
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
            <>
              <label htmlFor={`dueDate-${todo.id}`}>Fälligkeitsdatum:</label>
              <input
                type="date"
                id={`dueDate-${todo.id}`}
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="edit-due-date-input"
              />
            </>
          ) : todo.due_date && (
            <div className={`due-date-display ${isToday(todo.due_date) ? 'due-today' : ''}`}>
              📅 Fällig: {formatDateOnlyForDisplay(todo.due_date)}
              {isToday(todo.due_date) && <span className="due-today-indicator">Heute!</span>}
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
