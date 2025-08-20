import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';

const BERLIN_TIMEZONE = 'Europe/Berlin';

/**
 * Frontend Timezone Utilities für Deutschland/Berlin
 */

/**
 * Konvertiert SQLite Datum zu ISO-8601 UTC Format
 * SQLite: "2025-08-20 08:27:54" → ISO: "2025-08-20T08:27:54Z"
 */
const normalizeToUTC = (dateString: string): string => {
  if (!dateString) return '';
  
  let normalized = dateString;
  
  // SQLite Format (mit Leerzeichen) zu ISO-8601 (mit T)
  if (normalized.includes(' ') && !normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T');
  }
  
  // UTC Marker hinzufügen falls nicht vorhanden
  if (!normalized.endsWith('Z') && !normalized.includes('+')) {
    normalized = normalized + 'Z';
  }
  
  return normalized;
};

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
    const dateToFormat = normalizeToUTC(utcDateString);
    const date = parseISO(dateToFormat);
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
    const dateToFormat = normalizeToUTC(utcDateString);
    const date = parseISO(dateToFormat);
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
 * Formatiert ein DateTime für Input-Felder (YYYY-MM-DDTHH:mm)
 */
export const formatDateTimeForInput = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const dateToFormat = normalizeToUTC(utcDateString);
    const date = parseISO(dateToFormat);
    return formatInTimeZone(date, BERLIN_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Fehler beim Formatieren für DateTime-Input:', error);
    return '';
  }
};

/**
 * Konvertiert ein lokales Datum (aus Input) zu UTC für das Backend
 */
export const convertLocalDateToUTC = (localDateString: string): string => {
  if (!localDateString) return '';
  
  try {
    // HTML5 Date-Input gibt YYYY-MM-DD zurück
    // Wir senden dieses Format direkt an das Backend
    return localDateString;
  } catch (error) {
    console.error('Fehler beim Konvertieren zu UTC:', error);
    return '';
  }
};

/**
 * Prüft ob ein Datum heute ist (in Berlin-Zeit)
 */
export const isToday = (utcDateString: string): boolean => {
  if (!utcDateString) return false;
  
  try {
    const dateToFormat = normalizeToUTC(utcDateString);
    const date = parseISO(dateToFormat);
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
  
  return formatDateOnlyForDisplay(utcDateString);
};

/**
 * Formatiert Due Date mit Zeit smart (z.B. "Morgen, 14:30 Uhr" oder "Heute in 2 Stunden")
 */
export const formatSmartDueDate = (utcDateString: string): string => {
  if (!utcDateString) return '';
  
  try {
    const dateToFormat = normalizeToUTC(utcDateString);
    const dueDate = parseISO(dateToFormat);
    const now = new Date();
    
    // Zeiten in Berlin-Timezone umrechnen
    const dueDateBerlin = new Date(dueDate.toLocaleString("en-US", {timeZone: BERLIN_TIMEZONE}));
    const nowBerlin = new Date(now.toLocaleString("en-US", {timeZone: BERLIN_TIMEZONE}));
    
    const diffInMinutes = Math.floor((dueDateBerlin.getTime() - nowBerlin.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    const timeStr = formatInTimeZone(dueDate, BERLIN_TIMEZONE, 'HH:mm', { locale: de });
    
    // Heute
    if (isToday(utcDateString)) {
      if (diffInMinutes <= 0) {
        return `Heute, ${timeStr} Uhr (überfällig)`;
      } else if (diffInMinutes < 60) {
        return `Heute in ${diffInMinutes} Min. (${timeStr} Uhr)`;
      } else if (diffInHours < 24) {
        return `Heute in ${diffInHours} Std. (${timeStr} Uhr)`;
      }
      return `Heute, ${timeStr} Uhr`;
    }
    
    // Gestern (überfällig)
    if (isYesterday(utcDateString)) {
      return `Gestern, ${timeStr} Uhr (überfällig)`;
    }
    
    // Morgen
    const tomorrow = new Date(nowBerlin);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatInTimeZone(tomorrow, BERLIN_TIMEZONE, 'yyyy-MM-dd');
    const dueDateStr = formatInTimeZone(dueDateBerlin, BERLIN_TIMEZONE, 'yyyy-MM-dd');
    
    if (dueDateStr === tomorrowStr) {
      return `Morgen, ${timeStr} Uhr`;
    }
    
    // Andere zukünftige Tage
    if (diffInDays > 0 && diffInDays <= 7) {
      const dayName = formatInTimeZone(dueDate, BERLIN_TIMEZONE, 'EEEE', { locale: de });
      return `${dayName}, ${timeStr} Uhr`;
    }
    
    // Weitere Zukunft oder Vergangenheit
    const dateStr = formatInTimeZone(dueDate, BERLIN_TIMEZONE, 'dd.MM.yyyy', { locale: de });
    if (diffInMinutes <= 0) {
      return `${dateStr}, ${timeStr} Uhr (überfällig)`;
    }
    
    return `${dateStr}, ${timeStr} Uhr`;
  } catch (error) {
    console.error('Fehler beim Formatieren des Smart Due Date:', error);
    return formatDateForDisplay(utcDateString);
  }
};

/**
 * Prüft ob ein Due Date überfällig ist
 */
export const isOverdue = (utcDateString: string): boolean => {
  if (!utcDateString) return false;
  
  try {
    const dateToFormat = normalizeToUTC(utcDateString);
    const dueDate = parseISO(dateToFormat);
    const now = new Date();
    
    return dueDate.getTime() < now.getTime();
  } catch {
    return false;
  }
};

/**
 * Berechnet Stunden bis zum Due Date
 */
export const getHoursUntilDue = (utcDateString: string): number => {
  if (!utcDateString) return 0;
  
  try {
    const dateToFormat = normalizeToUTC(utcDateString);
    const dueDate = parseISO(dateToFormat);
    const now = new Date();
    
    const diffInMilliseconds = dueDate.getTime() - now.getTime();
    return Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  } catch {
    return 0;
  }
};

/**
 * Konvertiert lokales DateTime zu UTC für Backend
 */
export const convertLocalDateTimeToUTC = (localDateTimeString: string): string => {
  if (!localDateTimeString) return '';
  
  try {
    // HTML5 datetime-local gibt "YYYY-MM-DDTHH:mm" zurück
    // Wir interpretieren das als Berlin-Zeit und konvertieren zu UTC
    const localDate = new Date(localDateTimeString);
    return localDate.toISOString();
  } catch (error) {
    console.error('Fehler beim Konvertieren DateTime zu UTC:', error);
    return '';
  }
};

export default {
  formatDateForDisplay,
  formatDateOnlyForDisplay,
  formatTimeForDisplay,
  formatRelativeTime,
  formatDateForInput,
  formatDateTimeForInput,
  convertLocalDateToUTC,
  convertLocalDateTimeToUTC,
  formatSmartDate,
  formatSmartDueDate,
  isToday,
  isYesterday,
  isOverdue,
  getHoursUntilDue,
  BERLIN_TIMEZONE
};
