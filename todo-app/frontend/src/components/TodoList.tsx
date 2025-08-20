import React from 'react';
import { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdateTodo: (id: number, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdateTodo, onDeleteTodo }) => {
  if (todos.length === 0) {
    return (
      <div className="todo-list">
        <h3>Ihre Todos</h3>
        <p className="empty-message">Keine Todos vorhanden. Erstellen Sie Ihr erstes Todo!</p>
      </div>
    );
  }

  // Gruppiere Todos nach Status
  const groupedTodos = {
    open: todos.filter(todo => todo.status === 'open'),
    in_progress: todos.filter(todo => todo.status === 'in_progress'),
    completed: todos.filter(todo => todo.status === 'completed'),
    cancelled: todos.filter(todo => todo.status === 'cancelled')
  };

  const statusLabels = {
    open: 'Offen',
    in_progress: 'In Bearbeitung',
    completed: 'Abgeschlossen',
    cancelled: 'Abgebrochen'
  };

  return (
    <div className="todo-list">
      <h3>Ihre Todos ({todos.length})</h3>
      
      {Object.entries(groupedTodos).map(([status, statusTodos]) => {
        if (statusTodos.length === 0) return null;
        
        return (
          <div key={status} className={`todo-group todo-group-${status}`}>
            <h4>{statusLabels[status as keyof typeof statusLabels]} ({statusTodos.length})</h4>
            <div className="todo-items">
              {statusTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdateTodo={onUpdateTodo}
                  onDeleteTodo={onDeleteTodo}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TodoList;
