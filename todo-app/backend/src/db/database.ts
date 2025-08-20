import Database, { Database as DatabaseType } from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './database.sqlite';
const schemaPath = path.join(__dirname, 'schema.sql');

// Erstelle Datenbankverbindung
const db: DatabaseType = new Database(dbPath);

// Aktiviere Foreign Key Constraints
db.pragma('foreign_keys = ON');

// Funktion zum Initialisieren der Datenbank
export const initializeDatabase = (): void => {
  try {
    // Prüfe ob Tabellen bereits existieren
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    if (tables.length === 0) {
      console.log('Initialisiere Datenbank...');
      
      // Lese und führe Schema aus
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      
      console.log('Datenbank erfolgreich initialisiert.');
    }
  } catch (error) {
    console.error('Fehler beim Initialisieren der Datenbank:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Schließe Datenbankverbindung...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Schließe Datenbankverbindung...');
  db.close();
  process.exit(0);
});

export default db;
