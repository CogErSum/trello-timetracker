import { TimerButton } from './components/TimerButton'
import { CardHistory } from './components/CardHistory'
import { Dashboard } from './components/Dashboard'
import { ManualEntryForm } from './components/ManualEntryForm'
import { ExportButton } from './components/ExportButton'
import { EstimateForm } from './components/EstimateForm'

function App() {
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view') || 'dashboard'
  const cardId = params.get('cardId') || ''
  const memberId = params.get('memberId') || 'test-user-1'

  if (view === 'card-timer' && cardId) {
    return (
      <div className="app card-timer-view">
        <div className="tt-row">
          <TimerButton memberId={memberId} cardId={cardId} />
          <EstimateForm memberId={memberId} cardId={cardId} />
        </div>
        <ManualEntryForm
          memberId={memberId}
          cardId={cardId}
          onSuccess={() => window.location.reload()}
        />
        <CardHistory memberId={memberId} cardId={cardId} />
      </div>
    )
  }

  if (view === 'card-history' && cardId) {
    return (
      <div className="app card-timer-view">
        <div className="tt-brand">
          <div className="tt-brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <span className="tt-brand-text">TeamSight</span>
        </div>
        <TimerButton memberId={memberId} cardId={cardId} />
        <EstimateForm memberId={memberId} cardId={cardId} />
        <ManualEntryForm
          memberId={memberId}
          cardId={cardId}
          onSuccess={() => window.location.reload()}
        />
        <CardHistory memberId={memberId} cardId={cardId} />
      </div>
    )
  }

  return (
    <div className="app">
      <h1>TeamSight Tracker</h1>
      <ExportButton memberId={memberId} />
      <Dashboard memberId={memberId} />
    </div>
  )
}

export default App
