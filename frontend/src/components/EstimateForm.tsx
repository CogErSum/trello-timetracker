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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: '#fffbeb', borderRadius: 6, marginTop: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Est: {formatMin(estimate.estimated_min)}</span>
        {estimate.comment && <span style={{ color: 'var(--gray-400)' }}>· {estimate.comment}</span>}
        <span style={{ flex: 1 }} />
        <button className="collapse-toggle" onClick={() => setEditing(true)} style={{ padding: 0, fontSize: 11 }}>edit</button>
        <button className="collapse-toggle" onClick={handleDelete} disabled={loading} style={{ padding: 0, fontSize: 11, color: 'var(--danger)' }}>×</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6, alignItems: 'flex-end', padding: '6px 8px', background: '#fffbeb', borderRadius: 6, marginTop: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: 'var(--gray-500)', paddingBottom: 6 }}>Est:</span>
      <div className="duration-input" style={{ gap: 4 }}>
        <input type="number" min="0" max="999" value={hours} onChange={(e) => setHours(Number(e.target.value))} style={{ width: 44, padding: '4px 6px', fontSize: 12 }} />
        <span style={{ fontSize: 11 }}>h</span>
        <input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} style={{ width: 44, padding: '4px 6px', fontSize: 12 }} />
        <span style={{ fontSize: 11 }}>m</span>
      </div>
      <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="note" style={{ width: 80, padding: '4px 6px', fontSize: 11 }} />
      <button type="submit" disabled={loading || (hours === 0 && minutes === 0)} style={{ padding: '4px 10px', fontSize: 11 }}>
        {loading ? '...' : 'Save'}
      </button>
      {estimate && (
        <button type="button" onClick={() => { setEditing(false); fetchEstimate(); }} style={{ padding: '4px 8px', fontSize: 11, background: 'transparent', color: 'var(--gray-400)' }}>
          ×
        </button>
      )}
    </form>
  );
}
