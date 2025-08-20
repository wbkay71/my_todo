import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Category } from '../types';

interface MultiCategorySelectorProps {
  selectedCategoryIds: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  showCreateOption?: boolean;
}

const MultiCategorySelector: React.FC<MultiCategorySelectorProps> = ({
  selectedCategoryIds,
  onCategoryChange,
  showCreateOption = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3498db');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { categories: fetchedCategories } = await apiClient.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    const isCurrentlySelected = selectedCategoryIds.includes(categoryId);
    const newSelectedIds = isCurrentlySelected
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    onCategoryChange(newSelectedIds);
  };

  const handleCreateCategory = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (!newCategoryName.trim()) {
      return;
    }

    try {
      const { category } = await apiClient.createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      setCategories([...categories, category]);
      setNewCategoryName('');
      setNewCategoryColor('#3498db');
      setShowCreateForm(false);
      
      // Auto-select newly created category
      const newSelectedIds = [...selectedCategoryIds, category.id];
      onCategoryChange(newSelectedIds);
    } catch (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error);
    }
  };

  const handleCancelCreate = () => {
    setNewCategoryName('');
    setNewCategoryColor('#3498db');
    setShowCreateForm(false);
  };

  const predefinedColors = [
    '#3498db', '#e74c3c', '#27ae60', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#c0392b', '#2ecc71', '#d35400', '#7f8c8d'
  ];

  if (loading) {
    return <div className="multi-category-selector-loading">Kategorien laden...</div>;
  }

  return (
    <div className="multi-category-selector">
      {/* Existing Categories Section */}
      {categories.length > 0 && (
        <div className="existing-categories-section">
          <h4 className="section-title">Vorhandene Kategorien:</h4>
          <div className="category-checkboxes">
            {categories.map((category) => (
              <label 
                key={category.id} 
                className="category-checkbox"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3rem',
                  padding: '1rem 1.5rem',
                  minHeight: '4rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  style={{
                    margin: '0',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <span
                  className="category-badge-checkbox"
                  style={{ 
                    backgroundColor: category.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 1rem',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  🏷️ {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Create Category Section */}
      {showCreateOption && (
        <>
          {categories.length > 0 && <div className="section-divider"></div>}
          
          <div className="create-category-section">
          <h4 className="section-title">Neue Kategorie erstellen:</h4>
          {!showCreateForm ? (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="add-category-btn"
            >
              + Kategorie hinzufügen
            </button>
          ) : (
            <div className="inline-create-form">
              <div className="create-category-form">
                <div className="inline-form-row">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Neue Kategorie eingeben..."
                    className="inline-category-name-input"
                    required
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategory(e as any);
                      }
                    }}
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="inline-category-color-input"
                    title="Kategorie-Farbe"
                  />
                </div>
                <div className="color-presets">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-preset ${newCategoryColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                      title={color}
                    >
                      {newCategoryColor === color && <span className="checkmark">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="inline-form-actions">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="save-inline-btn"
                    disabled={!newCategoryName.trim()}
                  >
                    Erstellen
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="cancel-inline-btn"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </>
      )}

      {/* Selected Categories Preview */}
      {selectedCategoryIds.length > 0 && (
        <div className="selected-categories-preview">
          <span className="preview-label">Ausgewählt:</span>
          <div className="selected-badges">
            {selectedCategoryIds.map((id) => {
              const category = categories.find((cat) => cat.id === id);
              return category ? (
                <span
                  key={id}
                  className="selected-category-badge"
                  style={{ backgroundColor: category.color }}
                >
                  🏷️ {category.name}
                  <button
                    type="button"
                    className="remove-category-btn"
                    onClick={() => handleCategoryToggle(id)}
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCategorySelector;