import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface CardHistoryProps {
  memberId: string;
  cardId: string;
}

interface TimeRecord {
  id: string;
  trello_card_id: string;
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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return <div className="loading" style={{ height: 40, fontSize: 11 }}>Loading</div>;
  }

  return (
    <div className="card-history">
      <button className={`collapse-toggle ${expanded ? 'open' : ''}`} onClick={() => setExpanded(!expanded)}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        History ({records.length}) · {formatDuration(totalSec)}
      </button>

      {expanded && records.length > 0 && (
        <table className="records-table" style={{ marginTop: 6 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{formatDate(record.created_at)}</td>
                <td style={{ fontWeight: 500 }}>{formatDuration(record.duration_sec)}</td>
                <td style={{ color: record.comment ? 'var(--gray-600)' : 'var(--gray-300)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {record.comment || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
