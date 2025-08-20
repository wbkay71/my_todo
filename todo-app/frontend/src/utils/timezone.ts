import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';

const BERLIN_TIMEZONE = 'Europe/Berlin';

/**
 * Frontend Timezone Utilities für Deutschland/Berlin
 */

/**
 * Formatiert ein UTC-Datum für die Anzeige in Berlin-Zeit
 */
export const formatDateForDisplay = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'dd.MM.yyyy HH:mm', { locale: de });
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return utcDateString;
  }
};

/**
 * Formatiert ein UTC-Datum für die Anzeige (nur Datum)
 */
export const formatDateOnlyForDisplay = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'dd.MM.yyyy', { locale: de });
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return utcDateString;
  }
};

/**
 * Formatiert ein UTC-Datum für die Anzeige (nur Zeit)
 */
export const formatTimeForDisplay = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'HH:mm', { locale: de });
  } catch (error) {
    console.error('Fehler beim Formatieren der Zeit:', error);
    return utcDateString;
  }
};

/**
 * Formatiert ein UTC-Datum relativ (z.B. "vor 2 Stunden")
 */
export const formatRelativeTime = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const date = parseISO(utcDateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min.`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `vor ${diffInHours} Std.`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `vor ${diffInDays} Tag${diffInDays === 1 ? '' : 'en'}`;
    
    // Für ältere Daten zeige das formatierte Datum
    return formatDateOnlyForDisplay(utcDateString);
  } catch (error) {
    console.error('Fehler beim Formatieren der relativen Zeit:', error);
    return formatDateForDisplay(utcDateString);
  }
};

/**
 * Formatiert ein Datum für Input-Felder (YYYY-MM-DD)
 */
export const formatDateForInput = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, BERLIN_TIMEZONE, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Fehler beim Formatieren für Input:', error);
    return '';
  }
};

/**
 * Konvertiert ein lokales Datum (aus Input) zu UTC für das Backend
 */
export const convertLocalDateToUTC = (localDateString: string): string => {
  if (!localDateString) return '';
  
  try {
    // Interpretiere als Berlin-Zeit
    const date = new Date(localDateString + 'T00:00:00');
    return date.toISOString();
  } catch (error) {
    console.error('Fehler beim Konvertieren zu UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * Prüft ob ein Datum heute ist (in Berlin-Zeit)
 */
export const isToday = (utcDateString: string): boolean => {
  if (!utcDateString) return false;
  
  try {
    const date = parseISO(utcDateString);
    const today = new Date();
    const dateInBerlin = formatInTimeZone(date, BERLIN_TIMEZONE, 'yyyy-MM-dd');
    const todayInBerlin = formatInTimeZone(today, BERLIN_TIMEZONE, 'yyyy-MM-dd');
    
    return dateInBerlin === todayInBerlin;
  } catch {
    return false;
  }
};

/**
 * Prüft ob ein Datum gestern war (in Berlin-Zeit)
 */
export const isYesterday = (utcDateString: string): boolean => {
  if (!utcDateString) return false;
  
  try {
    const date = parseISO(utcDateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateInBerlin = formatInTimeZone(date, BERLIN_TIMEZONE, 'yyyy-MM-dd');
    const yesterdayInBerlin = formatInTimeZone(yesterday, BERLIN_TIMEZONE, 'yyyy-MM-dd');
    
    return dateInBerlin === yesterdayInBerlin;
  } catch {
    return false;
  }
};

/**
 * Formatiert ein Datum smart (heute/gestern/Datum)
 */
export const formatSmartDate = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  if (isToday(utcDateString)) {
    return `Heute, ${formatTimeForDisplay(utcDateString)}`;
  }
  
  if (isYesterday(utcDateString)) {
    return `Gestern, ${formatTimeForDisplay(utcDateString)}`;
  }
  
  return formatDateForDisplay(utcDateString);
};

export default {
  formatDateForDisplay,
  formatDateOnlyForDisplay,
  formatTimeForDisplay,
  formatRelativeTime,
  formatDateForInput,
  convertLocalDateToUTC,
  formatSmartDate,
  isToday,
  isYesterday,
  BERLIN_TIMEZONE
};
