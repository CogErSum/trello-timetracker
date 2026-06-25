import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  maxDate?: string;
  compact?: boolean;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function fmt(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }

export function DatePicker({ value, onChange, placeholder = 'Дата', maxDate, compact }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [vy, setVy] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [vm, setVm] = useState(parsed?.getMonth() ?? new Date().getMonth());

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const today = new Date();
  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());
  const maxStr = maxDate || todayStr;

  const prev = () => vm === 0 ? (setVm(11), setVy(vy - 1)) : setVm(vm - 1);
  const next = () => vm === 11 ? (setVm(0), setVy(vy + 1)) : setVm(vm + 1);

  const select = (d: number) => {
    const s = fmt(vy, vm, d);
    if (s <= maxStr) { onChange(s); setOpen(false); }
  };

  const display = parsed ? `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}` : '';
  const dim = daysInMonth(vy, vm);
  const fd = firstDay(vy, vm);

  return (
    <div className={`dp-root ${compact ? 'dp-compact' : ''}`} ref={ref}>
      <div className="dp-input" onClick={() => setOpen(!open)}>
        <span className={display ? 'dp-val' : 'dp-ph'}>{display || placeholder}</span>
        {display && <span className="dp-x" onClick={(e) => { e.stopPropagation(); onChange(''); }}>×</span>}
      </div>
      {open && (
        <div className="dp-cal">
          <div className="dp-head">
            <button className="dp-arw" onClick={prev}>‹</button>
            <span className="dp-ym">{MONTHS[vm]} {vy}</span>
            <button className="dp-arw" onClick={next}>›</button>
          </div>
          <div className="dp-wk">{DAYS.map(d => <span key={d}>{d}</span>)}</div>
          <div className="dp-g">
            {Array.from({ length: fd }).map((_, i) => <span key={`e${i}`} className="dp-d dp-e" />)}
            {Array.from({ length: dim }).map((_, i) => {
              const d = i + 1;
              const s = fmt(vy, vm, d);
              return (
                <button key={d} className={`dp-d ${s === value ? 'dp-sel' : ''} ${s === todayStr ? 'dp-tod' : ''} ${s > maxStr ? 'dp-dis' : ''}`}
                  onClick={() => select(d)} disabled={s > maxStr}>{d}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
