import { useState } from 'react';
import { api } from '../services/api';

interface DeleteRecordButtonProps {
  memberId: string;
  recordId: string;
  onSuccess: () => void;
}

export function DeleteRecordButton({ memberId, recordId, onSuccess }: DeleteRecordButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this time entry?')) {
      return;
    }

    setLoading(true);
    try {
      await api.records.delete(memberId, recordId);
      onSuccess();
    } catch (error) {
      alert('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="delete-button"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
