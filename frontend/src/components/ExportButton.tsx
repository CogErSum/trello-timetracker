import { api } from '../services/api';

interface ExportButtonProps {
  memberId: string;
  cardId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function ExportButton({ memberId, cardId, dateFrom, dateTo }: ExportButtonProps) {
  const handleExport = (format: 'csv' | 'xlsx') => {
    const url = api.export.download(memberId, format, {
      cardId,
      dateFrom,
      dateTo,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="export-buttons">
      <button onClick={() => handleExport('csv')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        CSV
      </button>
      <button onClick={() => handleExport('xlsx')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <path d="M8 13h2"/>
          <path d="M8 17h2"/>
          <path d="M14 13h2"/>
          <path d="M14 17h2"/>
        </svg>
        Excel
      </button>
    </div>
  );
}
