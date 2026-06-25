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
          <img src="/icons/logo.svg" alt="TeamSight" className="tt-brand-logo-img" />
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
      <div className="tt-brand">
        <img src="/icons/logo.svg" alt="TeamSight" className="tt-brand-logo-img" />
        <span className="tt-brand-text">TeamSight Tracker</span>
      </div>
      <ExportButton memberId={memberId} />
      <Dashboard memberId={memberId} />
    </div>
  )
}

export default App
