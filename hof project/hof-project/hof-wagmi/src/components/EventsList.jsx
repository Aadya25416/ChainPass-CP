import { useContractRead } from '../hooks/useContract'
import { useEventLogs } from '../hooks/useEventLogs'
import EventCard from './EventCard'

// ─── Single Event Loader ──────────────────────────────────────────────────────

function SingleEvent({ eventId, eventMeta }) {
  const { data: event, isLoading } = useContractRead('getEvent', [BigInt(eventId)])

  if (isLoading) {
    return <div className="ec-skeleton" aria-busy="true" />
  }

  // Event IDs that don't exist yet are silently skipped
  if (!event?.exists) return null

  return (
    <EventCard
      event={event}
      meta={eventMeta[eventId.toString()]}
    />
  )
}

// ─── EventsList Root ──────────────────────────────────────────────────────────

export default function EventsList() {
  const { data: total, isLoading: loadingTotal } = useContractRead('getTotalEvents', [])
  const { eventMeta, isLoading: loadingMeta } = useEventLogs()

  if (loadingTotal) {
    return <p className="status status-info">Fetching events from contract…</p>
  }

  const count = total ? Number(total) : 0

  if (count === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 0' }}>
        No events have been created yet.
      </div>
    )
  }

  return (
    <div className="section-content">
      {loadingMeta && (
        <p className="status status-info" style={{ marginBottom: '16px' }}>
          Loading event names from chain logs…
        </p>
      )}

      <div className="events-grid-4">
        {/*
         * Contract events are 1-indexed: first createEvent() produces eventId = 1.
         * If your deployment uses 0-indexed IDs, change `i + 1` → `i`.
         */}
        {Array.from({ length: count }, (_, i) => (
          <SingleEvent
            key={i + 1}
            eventId={i + 1}
            eventMeta={eventMeta}
          />
        ))}
      </div>
    </div>
  )
}
