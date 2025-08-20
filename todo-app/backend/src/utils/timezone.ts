import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const BERLIN_TIMEZONE = 'Europe/Berlin';
const UTC_TIMEZONE = 'UTC';

/**
 * Timezone Utility Functions
 * 
 * Alle Daten werden in der Datenbank als UTC gespeichert,
 * aber für die Anzeige in Europe/Berlin konvertiert.
 */

/**
 * Konvertiert ein UTC-Datum in Berlin-Zeit für die Anzeige
 */
export const formatDateForDisplay = (utcDateString: string): string => {
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return utcDateString;
  }
};

/**
 * Formatiert ein UTC-Datum für die Anzeige (nur Datum)
 */
export const formatDateOnlyForDisplay = (utcDateString: string): string => {
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return utcDateString;
  }
};

/**
 * Formatiert ein UTC-Datum für die Anzeige (nur Zeit)
 */
export const formatTimeForDisplay = (utcDateString: string): string => {
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'HH:mm:ss');
  } catch (error) {
    console.error('Fehler beim Formatieren der Zeit:', error);
    return utcDateString;
  }
};

/**
 * Formatiert ein UTC-Datum für die Anzeige (deutsches Format)
 */
export const formatDateTimeGerman = (utcDateString: string): string => {
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'dd.MM.yyyy HH:mm');
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return utcDateString;
  }
};

/**
 * Konvertiert Berlin-Zeit in UTC für die Speicherung
 * Input: '2024-01-15 14:30' (Berlin Zeit)
 * Output: ISO UTC String
 */
export const convertBerlinToUTC = (berlinDateString: string): string => {
  try {
    // Füge Timezone-Info hinzu wenn nicht vorhanden
    const dateWithTz = berlinDateString.includes('T') 
      ? berlinDateString 
      : `${berlinDateString}:00`;
    
    const date = new Date(dateWithTz + (berlinDateString.includes('+') ? '' : ' Europe/Berlin'));
    return date.toISOString();
  } catch (error) {
    console.error('Fehler beim Konvertieren nach UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * Aktuelle Zeit in UTC
 */
export const getCurrentUTC = (): string => {
  return new Date().toISOString();
};

/**
 * Aktuelle Zeit in Berlin
 */
export const getCurrentBerlin = (): string => {
  const now = new Date();
  return formatInTimeZone(now, BERLIN_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * Validiert ein Datum
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Erstellt ein erweiterten Datum-Objekt mit Timezone-Informationen
 */
export const createDateInfo = (utcDateString: string) => {
  if (!utcDateString) return null;
  
  try {
    const date = parseISO(utcDateString);
    
    return {
      utc: utcDateString,
      berlin: formatDateForDisplay(utcDateString),
      berlinDate: formatDateOnlyForDisplay(utcDateString),
      berlinTime: formatTimeForDisplay(utcDateString),
      german: formatDateTimeGerman(utcDateString),
      timestamp: date.getTime()
    };
  } catch (error) {
    console.error('Fehler beim Erstellen der Datums-Info:', error);
    return null;
  }
};

/**
 * Middleware-Funktion um Datum-Felder in Objekten zu konvertieren
 */
export const convertDatesForDisplay = <T extends Record<string, any>>(
  obj: T, 
  dateFields: (keyof T)[] = ['created_at', 'updated_at', 'due_date']
): T => {
  const result = { ...obj };
  
  dateFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      const dateInfo = createDateInfo(result[field] as string);
      if (dateInfo) {
        // Ersetze das ursprüngliche Feld mit Berlin-Zeit für die Anzeige
        result[field] = dateInfo.berlin as T[keyof T];
        // Füge zusätzliche Felder hinzu
        (result as any)[`${String(field)}_utc`] = dateInfo.utc;
        (result as any)[`${String(field)}_german`] = dateInfo.german;
      }
    }
  });
  
  return result;
};

export default {
  formatDateForDisplay,
  formatDateOnlyForDisplay,
  formatTimeForDisplay,
  formatDateTimeGerman,
  convertBerlinToUTC,
  getCurrentUTC,
  getCurrentBerlin,
  isValidDate,
  createDateInfo,
  convertDatesForDisplay,
  BERLIN_TIMEZONE,
  UTC_TIMEZONE
};
