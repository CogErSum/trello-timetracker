export function refreshTrelloBadge() {
  try {
    const t = (window as any).TrelloPowerUp?.iframe();
    if (t?.card) {
      t.card().refresh();
    }
  } catch {
    // Not running inside Trello iframe, skip
  }
}
