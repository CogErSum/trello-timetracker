import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface EstimateFormProps {
  memberId: string;
  cardId: string;
}

interface Estimate {
  id: string;
  estimated_min: number;
  comment: string | null;
}

export function EstimateForm({ memberId, cardId }: EstimateFormProps) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchEstimate();
  }, [cardId]);

  const fetchEstimate = async () => {
    try {
      const data = await api.estimates.get(memberId, cardId) as Estimate;
      setEstimate(data);
      setHours(Math.floor(data.estimated_min / 60));
      setMinutes(data.estimated_min % 60);
      setComment(data.comment || '');
    } catch {
      setEstimate(null);
      setHours(0);
      setMinutes(0);
      setComment('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalMin = hours * 60 + minutes;
      await api.estimates.upsert(memberId, cardId, totalMin, comment || undefined);
      await fetchEstimate();
      setEditing(false);
    } catch {
      alert('Failed to save estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove estimate?')) return;
    setLoading(true);
    try {
      await api.estimates.delete(memberId, cardId);
      setEstimate(null);
      setHours(0);
      setMinutes(0);
      setComment('');
      setEditing(false);
    } catch {
      alert('Failed to delete estimate');
    } finally {
      setLoading(false);
    }
  };

  const formatMin = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  if (estimate && !editing) {
    return (
      <div className="manual-entry-form" style={{ borderLeft: '3px solid var(--warning)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>Time Estimate</h3>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>
              {formatMin(estimate.estimated_min)}
            </div>
            {estimate.comment && (
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                {estimate.comment}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setEditing(true)}
              style={{ padding: '6px 12px', fontSize: 12, background: 'var(--gray-100)', color: 'var(--gray-600)' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{ padding: '6px 12px', fontSize: 12, background: 'var(--gray-100)', color: 'var(--danger)' }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="manual-entry-form" style={{ borderLeft: '3px solid var(--warning)' }}>
      <h3>{estimate ? 'Edit Estimate' : 'Set Time Estimate'}</h3>

      <div className="form-group">
        <label>Estimated Duration</label>
        <div className="duration-input">
          <input
            type="number"
            min="0"
            max="999"
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
        <label>Note (optional)</label>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. rough estimate for review"
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading || (hours === 0 && minutes === 0)}>
          {loading ? 'Saving...' : 'Save Estimate'}
        </button>
        {estimate && (
          <button
            type="button"
            onClick={() => { setEditing(false); fetchEstimate(); }}
            style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
