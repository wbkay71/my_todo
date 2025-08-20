import React, { useState } from 'react';

interface FloatingActionButtonProps {
  onNavigateToDashboard: () => void;
  onNavigateToNewTodo: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onNavigateToDashboard,
  onNavigateToNewTodo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDashboardClick = () => {
    onNavigateToDashboard();
    setIsExpanded(false);
  };

  const handleNewTodoClick = () => {
    onNavigateToNewTodo();
    setIsExpanded(false);
  };

  return (
    <div className="fab-container">
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fab-backdrop" 
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Main FAB */}
      <div 
        className={`floating-action-button ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Main FAB Content */}
        <div className="fab-main">
          <span className="fab-icon">
            {isExpanded ? '✕' : '⚡'}
          </span>
        </div>
      </div>

      {/* Expanded Options */}
      {isExpanded && (
        <div className="fab-options">
          <div 
            className="fab-option dashboard-option"
            onClick={handleDashboardClick}
            title="Zum Dashboard springen"
          >
            <span className="fab-option-icon">📊</span>
            <span className="fab-option-label">Dashboard</span>
          </div>
          
          <div 
            className="fab-option newtodo-option"
            onClick={handleNewTodoClick}
            title="Neues Todo erstellen"
          >
            <span className="fab-option-icon">➕</span>
            <span className="fab-option-label">Neues Todo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
