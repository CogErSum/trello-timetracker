import { useState } from 'react';
import { api } from '../services/api';
import { refreshTrelloBadge, postTrelloComment, formatDurationComment } from '../services/trello';

interface ManualEntryFormProps {
  memberId: string;
  cardId: string;
  onSuccess: () => void;
}

export function ManualEntryForm({ memberId, cardId, onSuccess }: ManualEntryFormProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(todayStr);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    if (h === 0 && m === 0) return;
    setLoading(true);
    try {
      await api.records.create(memberId, {
        cardId,
        durationMin: h * 60 + m,
        date,
        comment: comment || undefined,
      });
      refreshTrelloBadge();
      const durSec = (h * 60 + m) * 60;
      const text = formatDurationComment(durSec, 'logged');
      const posted = await postTrelloComment(cardId, text);
      if (!posted) api.timers.logComment(cardId, text).catch(() => {});
      onSuccess();
    } catch {
      alert('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = (Number(hours) || 0) > 0 || (Number(minutes) || 0) > 0;

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
          max={todayStr} className="tt-date" />

        <div className="tt-manual-dur">
          <input type="number" min="0" max="23" value={hours}
            onChange={(e) => setHours(e.target.value)} />
          <span>h</span>
          <input type="number" min="0" max="59" value={minutes}
            onChange={(e) => setMinutes(e.target.value)} />
          <span>m</span>
        </div>

        <button type="submit" disabled={loading || !canSubmit} className="tt-btn tt-btn-add">
          + Add
        </button>
      </div>

      <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Comment (optional)" className="tt-comment" />
    </form>
  );
}
