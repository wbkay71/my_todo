import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken, authenticateToken } from '../middleware/auth';
import { CreateUserRequest, LoginRequest, AuthResponse, AuthenticatedRequest } from '../types';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: CreateUserRequest = req.body;

    // Validierung
    if (!email || !password) {
      res.status(400).json({ 
        error: 'E-Mail und Passwort sind erforderlich' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ 
        error: 'Passwort muss mindestens 6 Zeichen lang sein' 
      });
      return;
    }

    // Email-Format validieren (einfache Validierung)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        error: 'Ungültiges E-Mail-Format' 
      });
      return;
    }

    // Prüfe ob User bereits existiert
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ 
        error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits' 
      });
      return;
    }

    // Erstelle neuen User
    const newUser = UserModel.create({ email, password, name });
    const token = generateToken({ id: newUser.id, email: newUser.email });

    const response: AuthResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.created_at
      },
      token
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registrierungs-Fehler:', error);
    res.status(500).json({ 
      error: 'Server-Fehler bei der Registrierung' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validierung
    if (!email || !password) {
      res.status(400).json({ 
        error: 'E-Mail und Passwort sind erforderlich' 
      });
      return;
    }

    // Finde User
    const user = UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ 
        error: 'Ungültige Anmeldedaten' 
      });
      return;
    }

    // Validiere Passwort
    const isValidPassword = UserModel.validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ 
        error: 'Ungültige Anmeldedaten' 
      });
      return;
    }

    // Generiere Token
    const token = generateToken({ id: user.id, email: user.email });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    };

    res.json(response);
  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Login' 
    });
  }
});

// GET /api/auth/me - Geschützte Route
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const user = UserModel.findById(req.user.id);
    if (!user) {
      res.status(404).json({ 
        error: 'Benutzer nicht gefunden' 
      });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Me-Route-Fehler:', error);
    res.status(500).json({ 
      error: 'Server-Fehler beim Abrufen der Benutzerdaten' 
    });
  }
});

export default router;
