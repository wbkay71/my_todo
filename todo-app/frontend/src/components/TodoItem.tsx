import React, { useState } from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onUpdateTodo: (id: number, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdateTodo, onDeleteTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleStatusChange = (newStatus: Todo['status']) => {
    onUpdateTodo(todo.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority: number) => {
    onUpdateTodo(todo.id, { priority: newPriority });
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdateTodo(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

      <div className="todo-controls">
        <div className="status-controls">
          <select
            value={todo.status}
            onChange={(e) => handleStatusChange(e.target.value as Todo['status'])}
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

      <div className="todo-meta">
        <small>
          Erstellt: {formatDate(todo.created_at)}
          {todo.updated_at !== todo.created_at && (
            <span> • Aktualisiert: {formatDate(todo.updated_at)}</span>
          )}
        </small>
      </div>
    </div>
  );
};

export default TodoItem;
