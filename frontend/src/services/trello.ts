export function refreshTrelloBadge() {
  try {
    const t = (window as any).TrelloPowerUp?.iframe();
    if (t && typeof t.card === 'function') {
      t.card().refresh();
      return;
    }
  } catch {
    // Not inside Trello iframe
  }

  try {
    const t = (window as any).TrelloPowerUp;
    if (t && typeof t.iframe === 'function') {
      const client = t.iframe();
      if (client && typeof client.card === 'function') {
        client.card().refresh();
      }
    }
  } catch {
    // SDK not available
  }
}
