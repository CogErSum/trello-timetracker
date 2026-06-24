import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface CardHistoryProps {
  memberId: string;
  cardId: string;
}

interface TimeRecord {
  id: string;
  duration_sec: number;
  comment: string | null;
  created_at: string;
}

export function CardHistory({ memberId, cardId }: CardHistoryProps) {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSec, setTotalSec] = useState(0);
  const [expanded, setExpanded] = useState(false);

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

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });

  if (loading) return <div className="tt-loading">Loading...</div>;

  return (
    <div className="tt-history">
      <button className="tt-history-toggle" onClick={() => setExpanded(!expanded)}>
        <span className={`tt-history-arrow ${expanded ? 'open' : ''}`}>▸</span>
        History · {records.length} entries · {fmt(totalSec)}
      </button>

      {expanded && records.length > 0 && (
        <div className="tt-history-list">
          {records.map((r) => (
            <div key={r.id} className="tt-history-item">
              <span className="tt-history-date">{fmtDate(r.created_at)}</span>
              <span className="tt-history-dur">{fmt(r.duration_sec)}</span>
              {r.comment && <span className="tt-history-comment">{r.comment}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
