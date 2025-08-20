import React, { useState, useEffect } from 'react';
import { Category, TodoWithCategories } from '../types';
import apiClient from '../api/client';

interface CategoryManagementProps {
  onCategoryUpdated?: () => void;
}

interface CategoryStats {
  [categoryId: number]: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ onCategoryUpdated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3498db');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3498db');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});

  useEffect(() => {
    loadCategories();
    loadTodoStats();
  }, []);

  const loadTodoStats = async () => {
    try {
      const { todos } = await apiClient.getTodos();
      const stats: CategoryStats = {};
      
      todos.forEach((todo: TodoWithCategories) => {
        if (todo.categories && todo.categories.length > 0) {
          todo.categories.forEach((category) => {
            if (!stats[category.id]) {
              stats[category.id] = {
                total: 0,
                open: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0
              };
            }
            
            stats[category.id].total++;
            
            switch (todo.status) {
              case 'open':
                stats[category.id].open++;
                break;
              case 'in_progress':
                stats[category.id].inProgress++;
                break;
              case 'completed':
                stats[category.id].completed++;
                break;
              case 'cancelled':
                stats[category.id].cancelled++;
                break;
            }
          });
        }
      });
      
      setCategoryStats(stats);
    } catch (error) {
      console.error('Fehler beim Laden der Todo-Statistiken:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setError(null);
      const { categories } = await apiClient.getCategories();
      setCategories(categories);
    } catch (error: any) {
      setError('Fehler beim Laden der Kategorien');
      console.error('Fehler beim Laden der Kategorien:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setError(null);
      const { category } = await apiClient.createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      setCategories([...categories, category]);
      setNewCategoryName('');
      setNewCategoryColor('#3498db');
      setShowCreateForm(false);
      loadTodoStats(); // Refresh stats
      onCategoryUpdated?.();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Erstellen der Kategorie');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('#3498db');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingId) return;

    try {
      setError(null);
      const { category } = await apiClient.updateCategory(editingId, {
        name: editName.trim(),
        color: editColor
      });
      
      setCategories(categories.map(c => c.id === editingId ? category : c));
      setEditingId(null);
      setEditName('');
      setEditColor('#3498db');
      loadTodoStats(); // Refresh stats
      onCategoryUpdated?.();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Aktualisieren der Kategorie');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Möchten Sie die Kategorie "${name}" wirklich löschen? Alle Todos mit dieser Kategorie werden ihre Zuordnung verlieren.`)) {
      return;
    }

    try {
      setError(null);
      await apiClient.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      loadTodoStats(); // Refresh stats
      onCategoryUpdated?.();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Fehler beim Löschen der Kategorie');
    }
  };

  const predefinedColors = [
    '#3498db', '#e74c3c', '#27ae60', '#f39c12',
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
    '#2ecc71', '#f1c40f', '#8e44ad', '#16a085'
  ];

  if (loading) {
    return (
      <div className="category-management">
        <div className="loading">Kategorien laden...</div>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="category-header">
        <h2>Kategorie-Verwaltung</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-category-btn"
        >
          {showCreateForm ? 'Abbrechen' : '+ Neue Kategorie'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Create Form */}
      {showCreateForm && (
        <div className="category-form-card">
          <h3>Neue Kategorie erstellen</h3>
          <form onSubmit={handleCreateCategory}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newName">Name:</label>
                <input
                  type="text"
                  id="newName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Kategorie-Name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="newColor">Farbe:</label>
                <div className="color-picker">
                  <input
                    type="color"
                    id="newColor"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="color-input"
                  />
                  <div className="color-presets">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-preset ${newCategoryColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategoryColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                Erstellen
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="cancel-btn"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>Keine Kategorien vorhanden.</p>
            <p>Erstellen Sie Ihre erste Kategorie, um Ihre Todos zu organisieren!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                {editingId === category.id ? (
                  /* Edit Mode */
                  <div className="category-edit">
                    <div className="form-group">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="edit-name-input"
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <div className="color-picker">
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="color-input"
                        />
                        <div className="color-presets">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`color-preset ${editColor === color ? 'active' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditColor(color)}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="edit-actions">
                      <button onClick={handleSaveEdit} className="save-btn">
                        Speichern
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="category-display">
                    <div className="category-info">
                      <span
                        className="category-badge large"
                        style={{ backgroundColor: category.color }}
                      >
                        🏷️ {category.name}
                      </span>
                      <div className="category-meta">
                        <small>Erstellt: {new Date(category.created_at).toLocaleDateString('de-DE')}</small>
                      </div>
                      
                      {/* Category Statistics */}
                      {categoryStats[category.id] && (
                        <div className="category-stats">
                          <div className="stats-summary">
                            <span className="total-todos">
                              📊 {categoryStats[category.id].total} Todos
                            </span>
                          </div>
                          <div className="stats-breakdown">
                            {categoryStats[category.id].open > 0 && (
                              <span className="stat-item open">
                                🔵 {categoryStats[category.id].open} offen
                              </span>
                            )}
                            {categoryStats[category.id].inProgress > 0 && (
                              <span className="stat-item in-progress">
                                🟡 {categoryStats[category.id].inProgress} in Bearbeitung
                              </span>
                            )}
                            {categoryStats[category.id].completed > 0 && (
                              <span className="stat-item completed">
                                🟢 {categoryStats[category.id].completed} erledigt
                              </span>
                            )}
                            {categoryStats[category.id].cancelled > 0 && (
                              <span className="stat-item cancelled">
                                ⚫ {categoryStats[category.id].cancelled} abgebrochen
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="category-actions">
                      <button
                        onClick={() => handleStartEdit(category)}
                        className="edit-btn"
                        title="Bearbeiten"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="delete-btn"
                        title="Löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
