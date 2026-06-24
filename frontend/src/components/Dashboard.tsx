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
    created_at: string;
  }>;
}

interface Filters {
  dateFrom: string;
  dateTo: string;
  cardId: string;
}

export function Dashboard({ memberId }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: '',
    dateTo: '',
    cardId: '',
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const result = await api.dashboard.get(memberId) as DashboardData;
      setData(result);
    } catch {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="dashboard loading">Loading</div>;
  }

  if (!data) {
    return <div className="dashboard">Failed to load dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

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

      <div className="filters">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          placeholder="From"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          placeholder="To"
        />
        <input
          type="text"
          value={filters.cardId}
          onChange={(e) => setFilters({ ...filters, cardId: e.target.value })}
          placeholder="Card ID"
        />
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
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div>{formatDate(record.created_at)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{formatTime(record.created_at)}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatDuration(record.duration_sec)}</td>
                  <td style={{ color: record.comment ? 'var(--gray-700)' : 'var(--gray-300)' }}>
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
