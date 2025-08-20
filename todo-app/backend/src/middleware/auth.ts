import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload } from '../types';
import { UserModel } from '../models/User';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'Zugriff verweigert. Kein Token bereitgestellt.' 
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET ist nicht gesetzt!');
      res.status(500).json({ 
        error: 'Server-Konfigurationsfehler' 
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Verifiziere dass der User noch existiert
    const user = UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ 
        error: 'Ungültiges Token. Benutzer nicht gefunden.' 
      });
      return;
    }

    // Füge User-Informationen zum Request hinzu
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth-Middleware-Fehler:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Ungültiges Token' 
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token abgelaufen' 
      });
      return;
    }

    res.status(500).json({ 
      error: 'Server-Fehler bei der Authentifizierung' 
    });
  }
};

export const generateToken = (user: { id: number; email: string }): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET ist nicht gesetzt!');
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email
  };

  return jwt.sign(payload, jwtSecret, { 
    expiresIn: '24h' 
  });
};
