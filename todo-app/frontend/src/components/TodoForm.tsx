import React, { useState } from 'react';
import MultiCategorySelector from './MultiCategorySelector';

interface TodoFormProps {
  onCreateTodo: (todoData: { title: string; description?: string; due_date?: string; priority?: number; category_ids?: number[] }) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onCreateTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(0);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const handleCategoryChange = (newCategoryIds: number[]) => {
    setCategoryIds(newCategoryIds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      const todoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined, // HTML5 Date gibt bereits YYYY-MM-DD zurück
        priority,
        category_ids: categoryIds.length > 0 ? categoryIds : undefined
      };
      
      onCreateTodo(todoData);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(0);
      setCategoryIds([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h3>Neues Todo erstellen</h3>
      <div className="form-group">
        <label htmlFor="title">Titel:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Was möchten Sie erledigen?"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Beschreibung (optional):</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Weitere Details..."
          rows={3}
        />
      </div>
      <div className="form-group">
        <label htmlFor="dueDate">Fälligkeitsdatum (optional):</label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
                    <div className="form-group">
                <label htmlFor="categories">Kategorien (optional):</label>
                <MultiCategorySelector
                  selectedCategoryIds={categoryIds}
                  onCategoryChange={handleCategoryChange}
                  showCreateOption={true}
                />
              </div>
      <div className="form-group">
        <label htmlFor="priority">Priorität: {priority}</label>
        <input
          type="range"
          id="priority"
          min="0"
          max="10"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value))}
          className="priority-slider"
        />
        <div className="priority-labels">
          <span>Niedrig (0)</span>
          <span>Hoch (10)</span>
        </div>
      </div>
      <button type="submit" className="submit-button">
        Todo hinzufügen
      </button>
    </form>
  );
};

export default TodoForm;
