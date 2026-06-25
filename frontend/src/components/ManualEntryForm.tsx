import { useState } from 'react';
import { api } from '../services/api';

interface ManualEntryFormProps {
  memberId: string;
  cardId: string;
  onSuccess: () => void;
}

export function ManualEntryForm({ memberId, cardId, onSuccess }: ManualEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hours === 0 && minutes === 0) return;
    setLoading(true);
    try {
      await api.records.create(memberId, {
        cardId,
        durationMin: hours * 60 + minutes,
        date,
        comment: comment || undefined,
      });
      onSuccess();
    } catch {
      alert('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="tt-manual-card">
      <div className="tt-manual-header">
        <div className="tt-manual-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <h4>Add Time Manually</h4>
      </div>

      <div className="tt-manual-row">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          max={today} className="tt-date" />

        <div className="tt-manual-dur">
          <input type="number" min="0" max="23" value={hours}
            onChange={(e) => setHours(Number(e.target.value))} />
          <span>h</span>
          <input type="number" min="0" max="59" value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))} />
          <span>m</span>
        </div>

        <button type="submit" disabled={loading || (hours === 0 && minutes === 0)} className="tt-btn tt-btn-add">
          + Add
        </button>
      </div>

      <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Comment (optional)" className="tt-comment" />
    </form>
  );
}
