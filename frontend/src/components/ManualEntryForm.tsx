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
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const durationMin = hours * 60 + minutes;
      await api.records.create(memberId, {
        cardId,
        durationMin,
        date,
        comment: comment || undefined,
      });
      onSuccess();
      setHours(0);
      setMinutes(0);
      setComment('');
      setShowForm(false);
    } catch {
      alert('Failed to add time record');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button className="collapse-toggle" onClick={() => setShowForm(true)} style={{ color: 'var(--primary)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add time manually
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="manual-entry-form">
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: '0 0 auto' }}>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} style={{ width: 120 }} />
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: '0 0 auto' }}>
          <label>Duration</label>
          <div className="duration-input">
            <input type="number" min="0" max="23" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            <span>h</span>
            <input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
            <span>m</span>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 100 }}>
          <label>Note</label>
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="optional" />
        </div>
        <button type="submit" disabled={loading || (hours === 0 && minutes === 0)} style={{ padding: '6px 12px', fontSize: 12 }}>
          {loading ? '...' : 'Add'}
        </button>
        <button type="button" onClick={() => setShowForm(false)} style={{ padding: '6px 10px', fontSize: 12, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
          ×
        </button>
      </div>
    </form>
  );
}
