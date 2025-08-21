import React, { useState } from 'react';

interface FloatingActionButtonProps {
  onNavigateToDashboard: () => void;
  onNavigateToNewTodo: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToCategories: () => void;
  onNavigateToDigest: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onNavigateToDashboard,
  onNavigateToNewTodo,
  onNavigateToCalendar,
  onNavigateToCategories,
  onNavigateToDigest
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

  const handleCalendarClick = () => {
    onNavigateToCalendar();
    setIsExpanded(false);
  };

  const handleCategoriesClick = () => {
    onNavigateToCategories();
    setIsExpanded(false);
  };

  const handleDigestClick = () => {
    onNavigateToDigest();
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

          <div 
            className="fab-option calendar-option"
            onClick={handleCalendarClick}
            title="Zum Kalender springen"
          >
            <span className="fab-option-icon">📅</span>
            <span className="fab-option-label">Kalender</span>
          </div>

                    <div
            className="fab-option categories-option"
            onClick={handleCategoriesClick}
            title="Zur Kategorienverwaltung springen"
          >
            <span className="fab-option-icon">🏷️</span>
            <span className="fab-option-label">Kategorien</span>
          </div>
          <div
            className="fab-option digest-option"
            onClick={handleDigestClick}
            title="Zu Daily Digest springen"
          >
            <span className="fab-option-icon">🎯</span>
            <span className="fab-option-label">Daily Digest</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
