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

  useEffect(() => {
    fetchRecords();
  }, [cardId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.records.list(memberId, { cardId }) as TimeRecord[];
      setRecords(data);
      setTotalSec(data.reduce((sum, r) => sum + r.duration_sec, 0));
    } catch (error) {
      console.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return <div className="card-history">Loading...</div>;
  }

  return (
    <div className="card-history">
      <h3>Time Tracking History</h3>

      <div className="total-time">
        Total: {formatDuration(totalSec)}
      </div>

      {records.length === 0 ? (
        <p className="empty-state">No time tracked yet.</p>
      ) : (
        <table className="records-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{formatDate(record.created_at)}</td>
                <td>{formatDuration(record.duration_sec)}</td>
                <td>{record.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
