import { RecurrencePattern } from '../types';

export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  const { type, interval, weekdays, endType, endDate, maxOccurrences } = pattern;

  let frequencyText = '';
  
  switch (type) {
    case 'daily':
      frequencyText = interval === 1 ? 'täglich' : `alle ${interval} Tage`;
      break;
    
    case 'weekly':
      if (interval === 1) {
        if (weekdays && weekdays.length > 0) {
          const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
          const selectedDays = weekdays.map(day => dayNames[day]).join(', ');
          frequencyText = `wöchentlich (${selectedDays})`;
        } else {
          frequencyText = 'wöchentlich';
        }
      } else {
        frequencyText = `alle ${interval} Wochen`;
      }
      break;
    
    case 'monthly':
      if (interval === 1) {
        frequencyText = 'monatlich';
      } else {
        frequencyText = `alle ${interval} Monate`;
      }
      break;
    
    case 'yearly':
      frequencyText = interval === 1 ? 'jährlich' : `alle ${interval} Jahre`;
      break;
  }

  // Add end information if applicable
  let endText = '';
  if (endType === 'date' && endDate) {
    const endDateFormatted = new Date(endDate).toLocaleDateString('de-DE');
    endText = ` (bis ${endDateFormatted})`;
  } else if (endType === 'occurrences' && maxOccurrences) {
    endText = ` (${maxOccurrences}x)`;
  }

  return `Wiederholt sich ${frequencyText}${endText}`;
}

export function getRecurrenceIcon(pattern: RecurrencePattern): string {
  switch (pattern.type) {
    case 'daily':
      return '🔄';
    case 'weekly':
      return '📅';
    case 'monthly':
      return '🗓️';
    case 'yearly':
      return '🎂';
    default:
      return '🔄';
  }
}

export function isRecurringTodo(todo: any): boolean {
  return !!(todo.recurrence_pattern || todo.parent_task_id || todo.is_recurring_instance);
}

export function parseRecurrencePattern(recurrencePatternJson: string | null): RecurrencePattern | null {
  if (!recurrencePatternJson) return null;
  
  try {
    return JSON.parse(recurrencePatternJson) as RecurrencePattern;
  } catch (error) {
    console.error('Error parsing recurrence pattern:', error);
    return null;
  }
}

export function getNextOccurrenceDate(todo: any): string | null {
  if (!todo.recurrence_pattern || !todo.due_date) return null;
  
  const pattern = parseRecurrencePattern(todo.recurrence_pattern);
  if (!pattern) return null;
  
  const currentDate = new Date(todo.due_date);
  let nextDate = new Date(currentDate);
  
  switch (pattern.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + pattern.interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + pattern.interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
      break;
  }
  
  return nextDate.toLocaleDateString('de-DE');
}

