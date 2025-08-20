import { Router, Response } from 'express';
import { CategoryModel } from '../models/Category';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

const router = Router();

// Alle Routen benötigen Authentifizierung
router.use(authenticateToken);

// GET /api/categories - Alle Kategorien des authentifizierten Users abrufen
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { include_usage } = req.query;

    let categories;

    if (include_usage === 'true') {
      categories = CategoryModel.getCategoriesWithUsage(req.user.id);
    } else {
      categories = CategoryModel.findByUserId(req.user.id);
    }

    res.json({ categories });
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorien:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Abrufen der Kategorien' 
    });
  }
});

// GET /api/categories/:id - Einzelne Kategorie abrufen
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      res.status(400).json({ 
        error: 'Ungültige Kategorie-ID' 
      });
      return;
    }

    const category = CategoryModel.findById(categoryId);
    if (!category) {
      res.status(404).json({ 
        error: 'Kategorie nicht gefunden' 
      });
      return;
    }

    // Prüfe ob Kategorie dem User gehört
    if (category.user_id !== req.user.id) {
      res.status(403).json({ 
        error: 'Zugriff verweigert' 
      });
      return;
    }

    // Optional: Usage Count hinzufügen
    const usageCount = CategoryModel.getUsageCount(category.id);
    
    res.json({ 
      category: { ...category, usage_count: usageCount } 
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorie:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Abrufen der Kategorie' 
    });
  }
});

// POST /api/categories - Neue Kategorie erstellen
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { name, color }: CreateCategoryRequest = req.body;

    // Validierung
    if (!name || name.trim().length === 0) {
      res.status(400).json({ 
        error: 'Name ist erforderlich' 
      });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({ 
        error: 'Name darf maximal 100 Zeichen lang sein' 
      });
      return;
    }

    // Prüfe ob Name bereits existiert
    const existingCategory = CategoryModel.findByUserIdAndName(req.user.id, name.trim());
    if (existingCategory) {
      res.status(409).json({ 
        error: 'Eine Kategorie mit diesem Namen existiert bereits' 
      });
      return;
    }

    // Farbe validieren
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      res.status(400).json({ 
        error: 'Ungültiges Farbformat. Verwende #RRGGBB' 
      });
      return;
    }

    const newCategory = CategoryModel.create(req.user.id, {
      name: name.trim(),
      color
    });

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Fehler beim Erstellen der Kategorie:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Erstellen der Kategorie' 
    });
  }
});

// PATCH /api/categories/:id - Kategorie aktualisieren
router.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      res.status(400).json({ 
        error: 'Ungültige Kategorie-ID' 
      });
      return;
    }

    const { name, color }: UpdateCategoryRequest = req.body;

    // Validierung
    if (name !== undefined && (name.trim().length === 0 || name.length > 100)) {
      res.status(400).json({ 
        error: 'Name muss zwischen 1 und 100 Zeichen lang sein' 
      });
      return;
    }

    // Prüfe ob neuer Name bereits existiert (nur wenn Name geändert wird)
    if (name !== undefined) {
      const existingCategory = CategoryModel.findByUserIdAndName(req.user.id, name.trim());
      if (existingCategory && existingCategory.id !== categoryId) {
        res.status(409).json({ 
          error: 'Eine Kategorie mit diesem Namen existiert bereits' 
        });
        return;
      }
    }

    // Farbe validieren
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      res.status(400).json({ 
        error: 'Ungültiges Farbformat. Verwende #RRGGBB' 
      });
      return;
    }

    const updatedCategory = CategoryModel.update(categoryId, req.user.id, {
      name: name?.trim(),
      color
    });

    if (!updatedCategory) {
      res.status(404).json({ 
        error: 'Kategorie nicht gefunden oder Zugriff verweigert' 
      });
      return;
    }

    res.json({ category: updatedCategory });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Kategorie:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Aktualisieren der Kategorie' 
    });
  }
});

// DELETE /api/categories/:id - Kategorie löschen
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      res.status(400).json({ 
        error: 'Ungültige Kategorie-ID' 
      });
      return;
    }

    // Optional: Warnung wenn Kategorie verwendet wird
    const usageCount = CategoryModel.getUsageCount(categoryId);
    if (usageCount > 0 && req.query.force !== 'true') {
      res.status(409).json({ 
        error: `Kategorie wird von ${usageCount} Todo(s) verwendet. Fügen Sie ?force=true hinzu, um trotzdem zu löschen.`,
        usage_count: usageCount
      });
      return;
    }

    const deleted = CategoryModel.delete(categoryId, req.user.id);
    if (!deleted) {
      res.status(404).json({ 
        error: 'Kategorie nicht gefunden oder Zugriff verweigert' 
      });
      return;
    }

    res.json({ 
      message: 'Kategorie erfolgreich gelöscht',
      affected_todos: usageCount
    });
  } catch (error) {
    console.error('Fehler beim Löschen der Kategorie:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Löschen der Kategorie' 
    });
  }
});

// GET /api/categories/colors/defaults - Standard-Farben abrufen
router.get('/colors/defaults', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const defaultColors = CategoryModel.getDefaultColors();
    res.json({ colors: defaultColors });
  } catch (error) {
    console.error('Fehler beim Abrufen der Standard-Farben:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Abrufen der Standard-Farben' 
    });
  }
});

export default router;
