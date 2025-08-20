import { Router, Response } from 'express';
import { TodoModel } from '../models/Todo';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest, CreateTodoRequest, UpdateTodoRequest } from '../types';

const router = Router();

// Alle Routen benötigen Authentifizierung
router.use(authenticateToken);

// GET /api/todos - Alle Todos des authentifizierten Users abrufen
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { status, priority, include_labels } = req.query;

    let todos;

    if (status && typeof status === 'string') {
      todos = TodoModel.findByStatus(req.user.id, status as any);
    } else if (priority && typeof priority === 'string') {
      const minPriority = parseInt(priority);
      if (!isNaN(minPriority)) {
        todos = TodoModel.findByPriority(req.user.id, minPriority);
      } else {
        todos = TodoModel.findByUserId(req.user.id);
      }
    } else if (include_labels === 'true') {
      todos = TodoModel.findByUserIdWithLabels(req.user.id);
    } else {
      todos = TodoModel.findByUserId(req.user.id);
    }

    res.json({ todos });
  } catch (error) {
    console.error('Fehler beim Abrufen der Todos:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Abrufen der Todos' 
    });
  }
});

// GET /api/todos/:id - Einzelnes Todo abrufen
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
      res.status(400).json({ 
        error: 'Ungültige Todo-ID' 
      });
      return;
    }

    const todo = TodoModel.findById(todoId);
    if (!todo) {
      res.status(404).json({ 
        error: 'Todo nicht gefunden' 
      });
      return;
    }

    // Prüfe ob Todo dem User gehört
    if (todo.user_id !== req.user.id) {
      res.status(403).json({ 
        error: 'Zugriff verweigert' 
      });
      return;
    }

    // Optional: Labels hinzufügen
    const labels = TodoModel.getLabelsForTodo(todo.id);
    
    res.json({ 
      todo: { ...todo, labels } 
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Todos:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Abrufen des Todos' 
    });
  }
});

// POST /api/todos - Neues Todo erstellen
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { title, description, status, priority, due_date }: CreateTodoRequest = req.body;

    // Validierung
    if (!title || title.trim().length === 0) {
      res.status(400).json({ 
        error: 'Titel ist erforderlich' 
      });
      return;
    }

    if (title.length > 255) {
      res.status(400).json({ 
        error: 'Titel darf maximal 255 Zeichen lang sein' 
      });
      return;
    }

    if (status && !['open', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ 
        error: 'Ungültiger Status' 
      });
      return;
    }

    if (priority !== undefined && (priority < 0 || priority > 10)) {
      res.status(400).json({ 
        error: 'Priorität muss zwischen 0 und 10 liegen' 
      });
      return;
    }

    // Datum validieren falls vorhanden
    if (due_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(due_date)) {
        res.status(400).json({ 
          error: 'Ungültiges Datumsformat. Verwende YYYY-MM-DD' 
        });
        return;
      }
    }

    const newTodo = TodoModel.create(req.user.id, {
      title: title.trim(),
      description: description?.trim(),
      status,
      priority,
      due_date
    });

    res.status(201).json({ todo: newTodo });
  } catch (error) {
    console.error('Fehler beim Erstellen des Todos:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Erstellen des Todos' 
    });
  }
});

// PATCH /api/todos/:id - Todo aktualisieren
router.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
      res.status(400).json({ 
        error: 'Ungültige Todo-ID' 
      });
      return;
    }

    const { title, description, status, priority, due_date }: UpdateTodoRequest = req.body;

    // Validierung
    if (title !== undefined && (title.trim().length === 0 || title.length > 255)) {
      res.status(400).json({ 
        error: 'Titel muss zwischen 1 und 255 Zeichen lang sein' 
      });
      return;
    }

    if (status && !['open', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ 
        error: 'Ungültiger Status' 
      });
      return;
    }

    if (priority !== undefined && (priority < 0 || priority > 10)) {
      res.status(400).json({ 
        error: 'Priorität muss zwischen 0 und 10 liegen' 
      });
      return;
    }

    if (due_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(due_date)) {
        res.status(400).json({ 
          error: 'Ungültiges Datumsformat. Verwende YYYY-MM-DD' 
        });
        return;
      }
    }

    const updatedTodo = TodoModel.update(todoId, req.user.id, {
      title: title?.trim(),
      description: description?.trim(),
      status,
      priority,
      due_date
    });

    if (!updatedTodo) {
      res.status(404).json({ 
        error: 'Todo nicht gefunden oder Zugriff verweigert' 
      });
      return;
    }

    res.json({ todo: updatedTodo });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Todos:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Aktualisieren des Todos' 
    });
  }
});

// DELETE /api/todos/:id - Todo löschen
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
      res.status(400).json({ 
        error: 'Ungültige Todo-ID' 
      });
      return;
    }

    const deleted = TodoModel.delete(todoId, req.user.id);
    if (!deleted) {
      res.status(404).json({ 
        error: 'Todo nicht gefunden oder Zugriff verweigert' 
      });
      return;
    }

    res.json({ 
      message: 'Todo erfolgreich gelöscht' 
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Todos:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Löschen des Todos' 
    });
  }
});

export default router;
