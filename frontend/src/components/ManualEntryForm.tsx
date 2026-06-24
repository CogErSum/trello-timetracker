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
    } catch (error) {
      alert('Failed to add time record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="manual-entry-form">
      <h3>Add Time Manually</h3>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-group">
        <label>Duration</label>
        <div className="duration-input">
          <input
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          <span>h</span>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
          <span>m</span>
        </div>
      </div>

      <div className="form-group">
        <label>Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you work on?"
        />
      </div>

      <button type="submit" disabled={loading || (hours === 0 && minutes === 0)}>
        {loading ? 'Adding...' : 'Add Time'}
      </button>
    </form>
  );
}
