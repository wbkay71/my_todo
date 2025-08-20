import React from 'react';

interface TimeSelectorProps {
  date?: string;
  time?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  label?: string;
  id?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  date = '',
  time = '',
  onDateChange,
  onTimeChange,
  label = 'Datum und Uhrzeit',
  id = 'datetime'
}) => {
  // Generiere alle 15-Minuten-Schritte für einen Tag
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="time-selector">
      <label htmlFor={id}>{label}:</label>
      <div className="datetime-inputs">
        <input
          type="date"
          id={`${id}-date`}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="date-input"
        />
        <select
          id={`${id}-time`}
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="time-input"
        >
          <option value="">Uhrzeit wählen...</option>
          {timeOptions.map((timeOption) => (
            <option key={timeOption} value={timeOption}>
              {timeOption} Uhr
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimeSelector;
