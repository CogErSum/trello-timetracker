import { useState } from 'react';
import { api } from '../services/api';

interface EditRecordModalProps {
  memberId: string;
  recordId: string;
  initialDurationSec: number;
  initialComment: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditRecordModal({
  memberId,
  recordId,
  initialDurationSec,
  initialComment,
  onClose,
  onSuccess,
}: EditRecordModalProps) {
  const [hours, setHours] = useState(Math.floor(initialDurationSec / 3600));
  const [minutes, setMinutes] = useState(Math.floor((initialDurationSec % 3600) / 60));
  const [comment, setComment] = useState(initialComment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const durationMin = hours * 60 + minutes;
      await api.records.update(memberId, recordId, {
        durationMin,
        comment: comment || undefined,
      });
      onSuccess();
    } catch (error) {
      alert('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Time Record</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Duration</label>
            <div className="duration-input">
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
              <span>h</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
              <span>m</span>
            </div>
          </div>

          <div className="form-group">
            <label>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you work on?"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading || (hours === 0 && minutes === 0)}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
