import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ExportButtonProps {
  memberId: string;
  cardId?: string;
}

interface Board {
  id: string;
  name: string;
}

export function ExportButton({ memberId, cardId }: ExportButtonProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchBoards();
  }, [memberId]);

  const fetchBoards = async () => {
    try {
      const data = await api.boards.list(memberId) as Board[];
      setBoards(data);
    } catch {
      console.error('Failed to fetch boards');
    }
  };

  const toggleBoard = (id: string) => {
    setSelectedBoards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedBoards.size === boards.length) {
      setSelectedBoards(new Set());
    } else {
      setSelectedBoards(new Set(boards.map((b) => b.id)));
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const url = api.export.download(memberId, format, {
      cardId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      boardIds: selectedBoards.size > 0 ? Array.from(selectedBoards) : undefined,
    });
    window.open(url, '_blank');
  };

  const hasFilters = selectedBoards.size > 0 || dateFrom || dateTo;
  const todayObj = new Date();
  const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  return (
    <div className="tt-export">
      <div className="tt-export-header">
        <div className="tt-manual-header-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <span className="tt-export-title">Export</span>
        <button className="tt-export-toggle" onClick={() => setShowFilters(!showFilters)}>
          Filters
          {hasFilters && <span className="tt-export-count">●</span>}
        </button>
      </div>

      {showFilters && (
        <div className="tt-filters-panel">
          <div className="tt-date-filters">
            <div className="tt-date-filter">
              <label>From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} max={today} className="tt-date" />
            </div>
            <div className="tt-date-filter">
              <label>To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} max={today} className="tt-date" />
            </div>
            {(dateFrom || dateTo) && (
              <button className="tt-filter-clear" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>
            )}
          </div>

          <div className="tt-boards-section">
            <label className="tt-board-item tt-board-all">
              <input type="checkbox" checked={selectedBoards.size === boards.length && boards.length > 0} onChange={selectAll} />
              <span>All boards</span>
            </label>
            {boards.map((board) => (
              <label key={board.id} className="tt-board-item">
                <input type="checkbox" checked={selectedBoards.has(board.id)} onChange={() => toggleBoard(board.id)} />
                <span>{board.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="tt-export-buttons">
        <button onClick={() => handleExport('csv')} className="tt-btn tt-btn-export">CSV</button>
        <button onClick={() => handleExport('xlsx')} className="tt-btn tt-btn-export">Excel</button>
      </div>
    </div>
  );
}
