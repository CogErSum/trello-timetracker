import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface DashboardProps {
  memberId: string;
}

interface DashboardData {
  today_sec: number;
  week_sec: number;
  month_sec: number;
  recent_records: Array<{
    id: string;
    trello_card_id: string;
    duration_sec: number;
    comment: string | null;
    record_date: string | null;
    created_at: string;
  }>;
}

export function Dashboard({ memberId }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardNames, setCardNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const result = await api.dashboard.get(memberId) as DashboardData;
      setData(result);

      const cardIds = [...new Set(result.recent_records.map(r => r.trello_card_id))];
      if (cardIds.length > 0) {
        try {
          const names = await api.boards.cardNames(cardIds) as Record<string, string>;
          setCardNames(names);
        } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const formatDate = (r: { record_date: string | null; created_at: string }) => {
    const d = r.record_date || r.created_at;
    return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return <div className="dashboard loading">Loading</div>;
  }

  if (!data) {
    return <div className="dashboard">Failed to load dashboard</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Today</h3>
          <p className="stat-value">{formatDuration(data.today_sec)}</p>
        </div>
        <div className="stat-card">
          <h3>This Week</h3>
          <p className="stat-value">{formatDuration(data.week_sec)}</p>
        </div>
        <div className="stat-card">
          <h3>This Month</h3>
          <p className="stat-value">{formatDuration(data.month_sec)}</p>
        </div>
      </div>

      <div className="recent-records">
        <h2>Recent Activity</h2>
        {data.recent_records.length === 0 ? (
          <p className="empty-state">No records yet. Start tracking time on a card!</p>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Duration</th>
                <th>Card</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_records.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record)}</td>
                  <td style={{ fontWeight: 600 }}>{formatDuration(record.duration_sec)}</td>
                  <td style={{ color: 'var(--tmst)', fontWeight: 500 }}>
                    {cardNames[record.trello_card_id] || record.trello_card_id.slice(0, 8) + '...'}
                  </td>
                  <td style={{ color: record.comment ? 'var(--tmst-text)' : '#ccc', fontStyle: record.comment ? 'normal' : 'italic' }}>
                    {record.comment || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
