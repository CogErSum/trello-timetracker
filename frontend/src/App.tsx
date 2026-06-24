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
      <div className="app">
        <h1>Time Tracker</h1>
        <TimerButton memberId={memberId} cardId={cardId} />
        <div style={{ marginTop: 24 }}>
          <EstimateForm memberId={memberId} cardId={cardId} />
        </div>
        <div style={{ marginTop: 24 }}>
          <ManualEntryForm
            memberId={memberId}
            cardId={cardId}
            onSuccess={() => window.location.reload()}
          />
        </div>
        <div style={{ marginTop: 24 }}>
          <CardHistory memberId={memberId} cardId={cardId} />
        </div>
      </div>
    )
  }

  if (view === 'card-history' && cardId) {
    return (
      <div className="app">
        <CardHistory memberId={memberId} cardId={cardId} />
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Trello Time Tracker</h1>
      <ExportButton memberId={memberId} />
      <Dashboard memberId={memberId} />
    </div>
  )
}

export default App
