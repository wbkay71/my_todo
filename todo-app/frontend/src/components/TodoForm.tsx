import React, { useState } from 'react';
import MultiCategorySelector from './MultiCategorySelector';
import TimeSelector from './TimeSelector';
import { convertLocalDateTimeToUTC, splitDateTime, combineDateTime } from '../utils/timezone';
import { RecurrencePattern } from '../types';

interface TodoFormProps {
  onCreateTodo: (todoData: { title: string; description?: string; due_date?: string; priority?: number; category_ids?: number[]; recurrence_pattern?: RecurrencePattern }) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onCreateTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState(0);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  
  // Recurring task states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [monthDay, setMonthDay] = useState(1);
  const [monthWeek, setMonthWeek] = useState(1);
  const [monthWeekday, setMonthWeekday] = useState(1);
  const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>('never');
  const [endDate, setEndDate] = useState('');
  const [maxOccurrences, setMaxOccurrences] = useState(1);

  const handleCategoryChange = (newCategoryIds: number[]) => {
    setCategoryIds(newCategoryIds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      const dueDateTimeString = combineDateTime(dueDate, dueTime);
      
      // Build recurrence pattern if recurring
      let recurrencePattern: RecurrencePattern | undefined = undefined;
      if (isRecurring) {
        recurrencePattern = {
          type: recurrenceType,
          interval: recurrenceInterval,
          endType,
          endDate: endType === 'date' ? endDate : undefined,
          maxOccurrences: endType === 'occurrences' ? maxOccurrences : undefined
        };
        
        // Add type-specific fields
        if (recurrenceType === 'weekly') {
          recurrencePattern.weekdays = weekdays.length > 0 ? weekdays : [new Date().getDay()];
        } else if (recurrenceType === 'monthly') {
          recurrencePattern.monthDay = monthDay;
          recurrencePattern.monthWeek = monthWeek;
          recurrencePattern.monthWeekday = monthWeekday;
        }
      }
      
      const todoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDateTimeString ? convertLocalDateTimeToUTC(dueDateTimeString) : undefined,
        priority,
        category_ids: categoryIds.length > 0 ? categoryIds : undefined,
        recurrence_pattern: recurrencePattern
      };
      
      onCreateTodo(todoData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('');
      setPriority(0);
      setCategoryIds([]);
      setIsRecurring(false);
      setRecurrenceType('daily');
      setRecurrenceInterval(1);
      setWeekdays([]);
      setMonthDay(1);
      setMonthWeek(1);
      setMonthWeekday(1);
      setEndType('never');
      setEndDate('');
      setMaxOccurrences(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h3>Neues Todo erstellen</h3>
      <div className="form-group">
        <label htmlFor="title">Titel:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Was möchten Sie erledigen?"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Beschreibung (optional):</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Weitere Details..."
          rows={3}
        />
      </div>
      <div className="form-group">
        <TimeSelector
          date={dueDate}
          time={dueTime}
          onDateChange={setDueDate}
          onTimeChange={setDueTime}
          label="Fälligkeitsdatum mit Uhrzeit (optional)"
          id="dueDateTime"
        />
      </div>
                    <div className="form-group">
                <label htmlFor="categories">Kategorien (optional):</label>
                <MultiCategorySelector
                  selectedCategoryIds={categoryIds}
                  onCategoryChange={handleCategoryChange}
                  showCreateOption={true}
                />
              </div>
      <div className="form-group">
        <label htmlFor="priority">Priorität: {priority}</label>
        <input
          type="range"
          id="priority"
          min="0"
          max="10"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value))}
          className="priority-slider"
        />
        <div className="priority-labels">
          <span>Niedrig (0)</span>
          <span>Hoch (10)</span>
        </div>
      </div>
      
      {/* Recurring Tasks Section */}
      <div className="recurring-section">
        <div className="recurring-header">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="checkbox-text">🔄 Wiederkehrende Aufgabe</span>
          </label>
        </div>
        
        {isRecurring && (
          <div className="recurring-options">
            {/* Frequency Selection */}
            <div className="form-group">
              <label>Häufigkeit:</label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as any)}
                className="recurrence-select"
              >
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </div>
            
            {/* Interval */}
            <div className="form-group">
              <label>Intervall:</label>
              <div className="interval-container">
                <span>Alle</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                  className="interval-input"
                />
                <span>
                  {recurrenceType === 'daily' ? 'Tage' :
                   recurrenceType === 'weekly' ? 'Wochen' :
                   recurrenceType === 'monthly' ? 'Monate' : 'Jahre'}
                </span>
              </div>
            </div>
            
            {/* Weekly Options */}
            {recurrenceType === 'weekly' && (
              <div className="form-group">
                <label>Wochentage:</label>
                <div className="weekdays-grid">
                  {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day, index) => (
                    <label key={index} className="weekday-label">
                      <input
                        type="checkbox"
                        checked={weekdays.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWeekdays([...weekdays, index]);
                          } else {
                            setWeekdays(weekdays.filter(d => d !== index));
                          }
                        }}
                      />
                      <span className="weekday-text">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Monthly Options */}
            {recurrenceType === 'monthly' && (
              <div className="form-group">
                <label>Monatlicher Rhythmus:</label>
                <div className="monthly-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="monthlyType"
                      checked={monthDay > 0}
                      onChange={() => setMonthDay(1)}
                    />
                    <span>Am</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthDay}
                      onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                      className="month-day-input"
                    />
                    <span>. des Monats</span>
                  </label>
                  
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="monthlyType"
                      checked={monthDay === 0}
                      onChange={() => setMonthDay(0)}
                    />
                    <span>Am</span>
                    <select
                      value={monthWeek}
                      onChange={(e) => setMonthWeek(parseInt(e.target.value))}
                      className="month-week-select"
                    >
                      <option value={1}>1.</option>
                      <option value={2}>2.</option>
                      <option value={3}>3.</option>
                      <option value={4}>4.</option>
                      <option value={-1}>letzten</option>
                    </select>
                    <select
                      value={monthWeekday}
                      onChange={(e) => setMonthWeekday(parseInt(e.target.value))}
                      className="month-weekday-select"
                    >
                      <option value={0}>Sonntag</option>
                      <option value={1}>Montag</option>
                      <option value={2}>Dienstag</option>
                      <option value={3}>Mittwoch</option>
                      <option value={4}>Donnerstag</option>
                      <option value={5}>Freitag</option>
                      <option value={6}>Samstag</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
            
            {/* End Options */}
            <div className="form-group">
              <label>Ende der Wiederholung:</label>
              <div className="end-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="endType"
                    value="never"
                    checked={endType === 'never'}
                    onChange={(e) => setEndType(e.target.value as any)}
                  />
                  <span>Endet nie</span>
                </label>
                
                <label className="radio-label">
                  <input
                    type="radio"
                    name="endType"
                    value="date"
                    checked={endType === 'date'}
                    onChange={(e) => setEndType(e.target.value as any)}
                  />
                  <span>Endet am:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={endType !== 'date'}
                    className="end-date-input"
                  />
                </label>
                
                <label className="radio-label">
                  <input
                    type="radio"
                    name="endType"
                    value="occurrences"
                    checked={endType === 'occurrences'}
                    onChange={(e) => setEndType(e.target.value as any)}
                  />
                  <span>Endet nach</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={maxOccurrences}
                    onChange={(e) => setMaxOccurrences(parseInt(e.target.value) || 1)}
                    disabled={endType !== 'occurrences'}
                    className="occurrences-input"
                  />
                  <span>Wiederholungen</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button type="submit" className="submit-button">
        Todo hinzufügen
      </button>
    </form>
  );
};

export default TodoForm;
