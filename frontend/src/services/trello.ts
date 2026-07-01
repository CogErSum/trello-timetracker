let cachedClient: any = null;
let clientChecked = false;

function getTrelloClient(): any {
  if (clientChecked) return cachedClient;
  clientChecked = true;

  try {
    if (typeof (window as any).TrelloPowerUp === 'undefined') return null;
    const t = (window as any).TrelloPowerUp.iframe();
    if (t && typeof t.post === 'function') {
      cachedClient = t;
      return cachedClient;
    }
  } catch {}

  return null;
}

export function refreshTrelloBadge() {
  const t = getTrelloClient();
  if (t) {
    try { t.card().refresh(); } catch {}
  }
}

export async function postTrelloComment(cardId: string, text: string): Promise<boolean> {
  const t = getTrelloClient();
  if (!t) return false;

  try {
    await t.post(`/1/cards/${cardId}/actions/comments`, { text }, { broadcast: false });
    return true;
  } catch (e) {
    console.warn('[TeamSight] t.post failed, falling back to backend', e);
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
