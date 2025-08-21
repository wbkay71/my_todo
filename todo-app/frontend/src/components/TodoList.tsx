import React from 'react';
import { TodoWithCategories } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: TodoWithCategories[];
  onUpdateTodo: (id: number, updates: Partial<TodoWithCategories>) => void;
  onDeleteTodo: (id: number) => void;
  onNavigateToCategories?: () => void;
  onNavigateToCalendar?: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdateTodo, onDeleteTodo, onNavigateToCategories, onNavigateToCalendar }) => {
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
                  onNavigateToCategories={onNavigateToCategories}
                  onNavigateToCalendar={onNavigateToCalendar}
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
