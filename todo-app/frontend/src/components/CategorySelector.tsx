import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import apiClient from '../api/client';

interface CategorySelectorProps {
  selectedCategoryId?: number;
  onCategoryChange: (categoryId?: number) => void;
  showCreateOption?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategoryId, 
  onCategoryChange, 
  showCreateOption = false 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3498db');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { categories } = await apiClient.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const { category } = await apiClient.createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      setCategories([...categories, category]);
      setNewCategoryName('');
      setNewCategoryColor('#3498db');
      setShowCreateForm(false);
      onCategoryChange(category.id);
    } catch (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error);
    }
  };

  const handleCancelCreate = () => {
    setNewCategoryName('');
    setNewCategoryColor('#3498db');
    setShowCreateForm(false);
  };

  if (loading) {
    return <div className="category-selector-loading">Kategorien laden...</div>;
  }

  return (
    <div className="category-selector">
      <select
        value={selectedCategoryId || ''}
        onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)}
        className="category-select"
      >
        <option value="">Keine Kategorie</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
        {showCreateOption && (
          <option value="create" disabled style={{ fontStyle: 'italic' }}>
            + Neue Kategorie erstellen
          </option>
        )}
      </select>

      {showCreateOption && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="create-category-btn"
          title="Neue Kategorie erstellen"
        >
          +
        </button>
      )}

      {showCreateForm && (
        <div className="create-category-form">
          <form onSubmit={handleCreateCategory}>
            <div className="form-row">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Kategorie-Name"
                className="category-name-input"
                required
                autoFocus
              />
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="category-color-input"
                title="Kategorie-Farbe"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-category-btn">
                Erstellen
              </button>
              <button 
                type="button" 
                onClick={handleCancelCreate}
                className="cancel-category-btn"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kategorien mit Farben anzeigen */}
      {selectedCategoryId && (
        <div className="selected-category-preview">
          {(() => {
            const selectedCategory = categories.find(c => c.id === selectedCategoryId);
            if (selectedCategory) {
              return (
                <span 
                  className="category-badge"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  {selectedCategory.name}
                </span>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
