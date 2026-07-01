import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { refreshTrelloBadge, postTrelloComment } from '../services/trello';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEstimate();
  }, [cardId]);

  const fetchEstimate = async () => {
    try {
      const data = await api.estimates.get(memberId, cardId) as Estimate;
      setEstimate(data);
      setHours(Math.floor(data.estimated_min / 60));
      setMinutes(data.estimated_min % 60);
    } catch {
      setEstimate(null);
      setHours(0);
      setMinutes(0);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const totalMin = hours * 60 + minutes;
      if (totalMin > 0) {
        await api.estimates.upsert(memberId, cardId, totalMin);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const durStr = h > 0 && m > 0 ? `${h}h ${m}m` : (h > 0 ? `${h}h` : `${m}m`);
        postTrelloComment(cardId, `[TeamSight] Estimate set: ${durStr}`);
      } else if (estimate) {
        await api.estimates.delete(memberId, cardId);
        postTrelloComment(cardId, '[TeamSight] Estimate removed');
      }
      refreshTrelloBadge();
      await fetchEstimate();
    } catch {
      alert('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const changed = estimate
    ? (hours * 60 + minutes) !== estimate.estimated_min
    : (hours > 0 || minutes > 0);

  return (
    <div className="tt-estimate-row">
      <span className="tt-estimate-badge">Estimate</span>
      <div className="tt-estimate-inputs">
        <input type="number" min="0" max="999" value={hours}
          onChange={(e) => setHours(Number(e.target.value))} />
        <span>h</span>
        <input type="number" min="0" max="59" value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))} />
        <span>m</span>
      </div>
      {changed && (
        <button onClick={handleSave} disabled={loading} className="tt-estimate-save">
          {loading ? '...' : 'Save'}
        </button>
      )}
    </div>
  );
}
