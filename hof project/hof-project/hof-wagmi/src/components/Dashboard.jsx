import { useState } from 'react'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import { useContractRead } from '../hooks/useContract'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(Number(ts) * 1000).toLocaleString()
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? '—'}</span>
    </div>
  )
}

// ─── Event Detail Table ───────────────────────────────────────────────────────

function EventDetail({ event }) {
  if (!event || !event.exists) return null
  return (
    <div className="preview-box">
      <div className="preview-row"><span>Event ID</span><span>#{event.eventId.toString()}</span></div>
      <div className="preview-row"><span>Organiser</span><span className="mono sm">{event.organiser}</span></div>
      <div className="preview-row"><span>Ticket Price</span><span><strong>{formatEther(event.ticketPrice)} ETH</strong></span></div>
      <div className="preview-row"><span>Tickets Sold</span><span>{event.totalMinted.toString()} / {event.maxSupply.toString()}</span></div>
      <div className="preview-row"><span>Sale Window</span><span>{formatTs(event.saleStartTime)} → {formatTs(event.saleEndTime)}</span></div>
      <div className="preview-row"><span>Event Window</span><span>{formatTs(event.eventStartTime)} → {formatTs(event.eventEndTime)}</span></div>
      <div className="preview-row"><span>Organiser Stake</span><span>{formatEther(event.organiserStake)} ETH</span></div>
      <div className="preview-row"><span>Stake Settled</span><span>{event.stakeReturned ? 'Yes' : 'No'}</span></div>
    </div>
  )
}

// ─── Event Lookup ─────────────────────────────────────────────────────────────

function EventLookup() {
  const [inputId, setInputId] = useState('')
  const [eventId, setEventId] = useState(null)

  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useContractRead('getEvent', [BigInt(eventId ?? 0)], {
    query: { enabled: eventId !== null },
  })

  const handleLookup = () => {
    const parsed = parseInt(inputId, 10)
    if (!isNaN(parsed)) setEventId(parsed)
  }

  return (
    <div>
      <h3 className="subsection-title">Event Lookup</h3>
      <div className="input-row">
        <input
          id="lookup-event-id"
          className="input"
          type="number"
          min="0"
          placeholder="Event ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
        />
        <button id="btn-lookup" className="btn btn-secondary" onClick={handleLookup}>
          Lookup
        </button>
        {eventId !== null && (
          <button className="btn btn-ghost" onClick={refetch}>↻ Refresh</button>
        )}
      </div>
      {isLoading && <p className="status status-info">Loading event…</p>}
      {error && <p className="status status-error">Event not found or error fetching.</p>}
      {event && !event.exists && <p className="status status-error">Event #{eventId} does not exist.</p>}
      {event && event.exists && <EventDetail event={event} />}
    </div>
  )
}

// ─── My Tickets ────────────────────────────────────────────────────────────────

function MyTickets() {
  const { address } = useAccount()

  const { data: tokenIds, isLoading } = useContractRead(
    'getWalletTickets',
    [address],
    { query: { enabled: !!address } },
  )

  if (isLoading) return <p className="status status-info">Loading tickets…</p>

  if (!tokenIds || tokenIds.length === 0)
    return <p className="empty-state">No tickets in this wallet.</p>

  return (
    <div className="token-grid">
      {tokenIds.map((id) => (
        <div key={id.toString()} className="token-card">
          <span className="token-icon">🎫</span>
          <span className="token-id">#{id.toString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Dashboard Root ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { isConnected } = useAccount()

  const { data: totalEvents } = useContractRead('getTotalEvents', [])
  const { data: totalTickets } = useContractRead('getTotalTicketsMinted', [])

  return (
    <div className="section-content">
      {/* Platform Stats */}
      <div className="stats-row">
        <StatCard label="Total Events" value={totalEvents?.toString()} />
        <StatCard label="Total Tickets Minted" value={totalTickets?.toString()} />
        <StatCard label="Network" value="Sepolia" />
      </div>

      <div className="section-divider" />

      {/* Event Lookup */}
      <EventLookup />

      {/* My Tickets (wallet-gated) */}
      {isConnected && (
        <>
          <div className="section-divider" />
          <h3 className="subsection-title">My Tickets</h3>
          <MyTickets />
        </>
      )}

      {!isConnected && (
        <p className="connect-prompt" style={{ marginTop: '24px' }}>
          Connect your wallet to see your tickets.
        </p>
      )}
    </div>
  )
}
