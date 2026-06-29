import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { refreshTrelloBadge } from '../services/trello';

interface TimerButtonProps {
  memberId: string;
  cardId: string;
}

interface ActiveTimer {
  id: string;
  trello_card_id: string;
  started_at: string;
}

export function TimerButton({ memberId, cardId }: TimerButtonProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkActiveTimer();
    const syncInterval = setInterval(checkActiveTimer, 60000);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    if (!activeTimer) return;
    const interval = setInterval(() => {
      const start = new Date(activeTimer.started_at).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const checkActiveTimer = async () => {
    try {
      const timer = await api.timers.getActive(memberId) as ActiveTimer;
      setActiveTimer(timer && timer.trello_card_id === cardId ? timer : null);
    } catch {
      setActiveTimer(null);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await api.timers.start(memberId, cardId) as { timer: ActiveTimer };
      setActiveTimer(response.timer);
      refreshTrelloBadge();
    } catch {
      alert('Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.timers.stop(memberId);
      setActiveTimer(null);
      setElapsed(0);
      refreshTrelloBadge();
    } catch {
      alert('Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tt-timer-card">
      {activeTimer ? (
        <>
          <span className="tt-timer-display timer-active">{formatTime(elapsed)}</span>
          <button onClick={handleStop} disabled={loading} className="tt-btn tt-btn-stop">
            Stop
          </button>
        </>
      ) : (
        <>
          <span className="tt-timer-display idle">No active timer</span>
          <button onClick={handleStart} disabled={loading} className="tt-btn tt-btn-start">
            Start
          </button>
        </>
      )}
    </div>
  );
}
