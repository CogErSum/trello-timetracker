import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  maxDate?: string;
}

const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DatePicker({ value, onChange, placeholder = 'Select date', maxDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDateStr = maxDate || formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDay = (day: number) => {
    const dateStr = formatDate(viewYear, viewMonth, day);
    if (dateStr <= maxDateStr) {
      onChange(dateStr);
      setOpen(false);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const displayValue = parsed
    ? `${parsed.getDate()} ${MONTHS_RU[parsed.getMonth()]} ${parsed.getFullYear()}`
    : '';

  return (
    <div className="dp-root" ref={ref}>
      <div className="dp-input" onClick={() => setOpen(!open)}>
        <svg className="dp-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span className={displayValue ? 'dp-value' : 'dp-placeholder'}>{displayValue || placeholder}</span>
        {displayValue && <span className="dp-clear" onClick={clear}>×</span>}
      </div>

      {open && (
        <div className="dp-dropdown">
          <div className="dp-header">
            <button className="dp-nav" onClick={prevMonth}>‹</button>
            <span className="dp-title">{MONTHS_RU[viewMonth]} {viewYear}</span>
            <button className="dp-nav" onClick={nextMonth}>›</button>
          </div>

          <div className="dp-weekdays">
            {DAYS_RU.map((d) => <span key={d} className="dp-weekday">{d}</span>)}
          </div>

          <div className="dp-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} className="dp-day dp-day-empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const isDisabled = dateStr > maxDateStr;

              return (
                <button
                  key={day}
                  className={`dp-day ${isSelected ? 'dp-day-selected' : ''} ${isToday ? 'dp-day-today' : ''} ${isDisabled ? 'dp-day-disabled' : ''}`}
                  onClick={() => selectDay(day)}
                  disabled={isDisabled}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
