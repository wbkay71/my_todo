import React, { useState } from 'react';

interface TodoFormProps {
  onCreateTodo: (todoData: { title: string; description?: string }) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onCreateTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      onCreateTodo({
        title: title.trim(),
        description: description.trim() || undefined
      });
      setTitle('');
      setDescription('');
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
      <button type="submit" className="submit-button">
        Todo hinzufügen
      </button>
    </form>
  );
};

export default TodoForm;
