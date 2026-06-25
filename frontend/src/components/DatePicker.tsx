import { useState } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  maxDate?: string;
  compact?: boolean;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function DatePicker({ value, onChange, placeholder = 'Дата', maxDate, compact }: DatePickerProps) {
  const [focused, setFocused] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const display = parsed
    ? `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`
    : '';

  return (
    <div className={`dp-root ${compact ? 'dp-compact' : ''}`}>
      <input
        type="date"
        value={value}
        max={maxDate || today}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`dp-native ${focused ? 'dp-focused' : ''} ${value ? 'dp-has-value' : ''}`}
        placeholder={placeholder}
      />
      {value && (
        <span className="dp-clear" onClick={() => onChange('')}>×</span>
      )}
      <span className="dp-display">{display || placeholder}</span>
    </div>
  );
}
