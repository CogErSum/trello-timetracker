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
        Export CSV
      </button>
      <button onClick={() => handleExport('xlsx')}>
        Export Excel
      </button>
    </div>
  );
}
