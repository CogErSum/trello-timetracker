import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface CardHistoryProps {
  memberId: string;
  cardId: string;
}

interface TimeRecord {
  id: string;
  trello_member_id: string;
  duration_sec: number;
  comment: string | null;
  created_at: string;
  record_date: string | null;
  member_name: string;
}

export function CardHistory({ memberId, cardId }: CardHistoryProps) {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSec, setTotalSec] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState(0);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [cardId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.records.list(memberId, { cardId }) as TimeRecord[];
      setRecords(data);
      setTotalSec(data.reduce((sum, r) => sum + r.duration_sec, 0));
    } catch {
      console.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const fmtDate = (r: TimeRecord) => {
    const d = r.record_date || r.created_at;
    return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  const startEdit = (record: TimeRecord) => {
    setEditingId(record.id);
    setEditHours(Math.floor(record.duration_sec / 3600));
    setEditMinutes(Math.floor((record.duration_sec % 3600) / 60));
    setEditComment(record.comment || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (recordId: string) => {
    setSaving(true);
    try {
      await api.records.update(memberId, recordId, {
        durationMin: editHours * 60 + editMinutes,
        comment: editComment || undefined,
      });
      setEditingId(null);
      await fetchRecords();
    } catch {
      alert('Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!confirm('Delete this record?')) return;
    setSaving(true);
    try {
      await api.records.delete(memberId, recordId);
      await fetchRecords();
    } catch {
      alert('Failed to delete record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="tt-loading">Loading...</div>;

  return (
    <div className="tt-history">
      <button className="tt-history-toggle" onClick={() => setExpanded(!expanded)}>
        <span className={`tt-history-arrow ${expanded ? 'open' : ''}`}>▸</span>
        History · {records.length} entries
        {totalSec > 0 && <span className="tt-history-summary">{fmt(totalSec)}</span>}
      </button>

      {expanded && records.length > 0 && (
        <div className="tt-history-list">
          {records.map((r) => (
            editingId === r.id ? (
              <div key={r.id} className="tt-history-edit">
                <div className="tt-history-edit-row">
                  <div className="tt-manual-dur">
                    <input type="number" min="0" max="23" value={editHours}
                      onChange={(e) => setEditHours(Number(e.target.value))} />
                    <span>h</span>
                    <input type="number" min="0" max="59" value={editMinutes}
                      onChange={(e) => setEditMinutes(Number(e.target.value))} />
                    <span>m</span>
                  </div>
                  <input type="text" value={editComment} onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Comment" className="tt-history-edit-comment" />
                </div>
                <div className="tt-history-edit-actions">
                  <button onClick={() => saveEdit(r.id)} disabled={saving} className="tt-history-btn-save">
                    {saving ? '...' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="tt-history-btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <div key={r.id} className="tt-history-item">
                <span className="tt-history-member">{r.member_name}</span>
                <span className="tt-history-date">{fmtDate(r)}</span>
                <span className="tt-history-dur">{fmt(r.duration_sec)}</span>
                {r.comment && <span className="tt-history-comment">{r.comment}</span>}
                {r.trello_member_id === memberId && (
                  <div className="tt-history-actions">
                    <button onClick={() => startEdit(r)} className="tt-history-action" title="Edit">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => deleteRecord(r.id)} className="tt-history-action tt-history-action-delete" title="Delete">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
