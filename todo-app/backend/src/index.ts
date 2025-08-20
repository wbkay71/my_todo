import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/database';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import categoryRoutes from './routes/categories';

// Lade Umgebungsvariablen
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite und CRA
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request-Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routen
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'ToDo API Server läuft!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      todos: '/api/todos',
      categories: '/api/categories',
      health: '/health'
    }
  });
});

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route nicht gefunden',
    path: req.originalUrl,
    method: req.method
  });
});

// Globaler Error Handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unbehandelter Fehler:', error);
  
  res.status(500).json({
    error: 'Interner Server-Fehler',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Etwas ist schief gelaufen'
  });
});

// Initialisiere Datenbank und starte Server
const startServer = async (): Promise<void> => {
  try {
    console.log('Initialisiere Datenbank...');
    initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`🌐 API verfügbar unter: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`📝 Todo Endpoints: http://localhost:${PORT}/api/todos`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Entwicklungsmodus aktiv');
      }
    });
  } catch (error) {
    console.error('❌ Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server wird heruntergefahren...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server wird heruntergefahren...');
  process.exit(0);
});

// Unbehandelte Promise Rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unbehandelte Promise Rejection:', reason);
  console.error('Promise:', promise);
});

// Unbehandelte Exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Unbehandelte Exception:', error);
  process.exit(1);
});

// Starte den Server
startServer();

export default app;
