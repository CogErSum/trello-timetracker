function getTrelloClient(): any {
  try {
    const t = (window as any).TrelloPowerUp?.iframe();
    if (t && typeof t.post === 'function') return t;
  } catch {}

  try {
    const t = (window as any).TrelloPowerUp;
    if (t && typeof t.iframe === 'function') {
      const client = t.iframe();
      if (client && typeof client.post === 'function') return client;
    }
  } catch {}

  return null;
}

export function refreshTrelloBadge() {
  const t = getTrelloClient();
  if (t && typeof t.card === 'function') {
    try { t.card().refresh(); } catch {}
  }
}

export async function postTrelloComment(cardId: string, text: string): Promise<boolean> {
  const t = getTrelloClient();
  if (!t) return false;

  try {
    await t.post(`/1/cards/${cardId}/actions/comments`, { text }, { broadcast: false });
    return true;
  } catch {
    return false;
  }
}

export function formatDurationComment(durationSec: number, action: string): string {
  const h = Math.floor(durationSec / 3600);
  const m = Math.floor((durationSec % 3600) / 60);
  let durStr: string;
  if (h > 0 && m > 0) durStr = `${h}h ${m}m`;
  else if (h > 0) durStr = `${h}h`;
  else durStr = `${m}m`;
  return `[TeamSight] +${durStr} ${action}`;
}
