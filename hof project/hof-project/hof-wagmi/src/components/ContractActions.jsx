import { useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { formatEther } from 'viem'
import { contractAddress, abi } from '../abi'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(ts) {
  if (!ts) return '—'
  return new Date(Number(ts) * 1000).toLocaleString()
}

function StatusMessage({ hash, isPending, isConfirming, isConfirmed, error }) {
  if (error) return <p className="status error">{error.shortMessage || error.message}</p>
  if (isPending) return <p className="status info">Waiting for MetaMask…</p>
  if (isConfirming) return <p className="status info">Transaction submitted. Confirming…</p>
  if (isConfirmed) return <p className="status success">✓ Confirmed! Tx: {hash?.slice(0, 10)}…</p>
  return null
}

// ─── Read: Platform Stats ────────────────────────────────────────────────────

function PlatformStats() {
  const { data: totalEvents } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getTotalEvents',
  })

  const { data: totalTickets } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getTotalTicketsMinted',
  })

  return (
    <section className="card">
      <h2 className="section-title">Platform Stats</h2>
      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">Total Events</span>
          <span className="stat-value">{totalEvents?.toString() ?? '—'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Tickets Minted</span>
          <span className="stat-value">{totalTickets?.toString() ?? '—'}</span>
        </div>
      </div>
    </section>
  )
}

// ─── Read: Event Lookup ──────────────────────────────────────────────────────

function EventLookup() {
  const [inputId, setInputId] = useState('')
  const [eventId, setEventId] = useState(null)

  const { data: event, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getEvent',       // ← swap function name here if needed
    args: [BigInt(eventId ?? 0)],
    query: { enabled: eventId !== null },
  })

  function handleLookup() {
    const parsed = parseInt(inputId, 10)
    if (!isNaN(parsed)) setEventId(parsed)
  }

  return (
    <section className="card">
      <h2 className="section-title">Event Lookup</h2>
      <div className="input-row">
        <input
          id="input-event-id"
          type="number"
          className="input"
          placeholder="Event ID"
          min="0"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button id="btn-lookup-event" className="btn btn-secondary" onClick={handleLookup}>
          Lookup
        </button>
      </div>

      {isLoading && <p className="status info">Loading…</p>}
      {error && <p className="status error">{error.shortMessage || 'Event not found'}</p>}

      {event && event.exists && (
        <table className="data-table">
          <tbody>
            <tr><td>Event ID</td><td>{event.eventId.toString()}</td></tr>
            <tr><td>Organiser</td><td className="mono">{event.organiser}</td></tr>
            <tr><td>Ticket Price</td><td>{formatEther(event.ticketPrice)} ETH</td></tr>
            <tr><td>Supply</td><td>{event.totalMinted.toString()} / {event.maxSupply.toString()}</td></tr>
            <tr><td>Sale Start</td><td>{formatTimestamp(event.saleStartTime)}</td></tr>
            <tr><td>Sale End</td><td>{formatTimestamp(event.saleEndTime)}</td></tr>
            <tr><td>Event Start</td><td>{formatTimestamp(event.eventStartTime)}</td></tr>
            <tr><td>Event End</td><td>{formatTimestamp(event.eventEndTime)}</td></tr>
          </tbody>
        </table>
      )}
      {event && !event.exists && <p className="status error">Event does not exist.</p>}
    </section>
  )
}

// ─── Write: Buy Ticket ───────────────────────────────────────────────────────

function BuyTicket() {
  const [inputId, setInputId] = useState('')
  const [inputEth, setInputEth] = useState('')

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  function handleBuy() {
    const eventId = parseInt(inputId, 10)
    const valueWei = BigInt(Math.floor(parseFloat(inputEth) * 1e18))

    writeContract({
      address: contractAddress,
      abi,
      functionName: 'buyTicket',   // ← swap function name here if needed
      args: [BigInt(eventId)],
      value: valueWei,
    })
  }

  return (
    <section className="card">
      <h2 className="section-title">Buy Ticket</h2>
      <div className="input-row">
        <input
          id="input-buy-event-id"
          type="number"
          className="input"
          placeholder="Event ID"
          min="0"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <input
          id="input-buy-eth"
          type="number"
          className="input"
          placeholder="Value (ETH)"
          step="0.001"
          min="0"
          value={inputEth}
          onChange={(e) => setInputEth(e.target.value)}
        />
        <button
          id="btn-buy-ticket"
          className="btn btn-primary"
          onClick={handleBuy}
          disabled={isPending || isConfirming || !inputId || !inputEth}
        >
          {isPending || isConfirming ? 'Processing…' : 'Buy Ticket'}
        </button>
        {(isConfirmed || writeError) && (
          <button className="btn btn-outline" onClick={reset}>Reset</button>
        )}
      </div>
      <StatusMessage
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={writeError}
      />
    </section>
  )
}

// ─── Read: My Tickets ────────────────────────────────────────────────────────

function MyTickets() {
  const { address } = useAccount()

  const { data: tokenIds, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getWalletTickets',   // ← swap function name here if needed
    args: [address],
    query: { enabled: !!address },
  })

  return (
    <section className="card">
      <h2 className="section-title">My Tickets</h2>
      {isLoading && <p className="status info">Loading…</p>}
      {error && <p className="status error">{error.shortMessage || error.message}</p>}
      {tokenIds && tokenIds.length === 0 && (
        <p className="empty-state">No tickets found for this wallet.</p>
      )}
      {tokenIds && tokenIds.length > 0 && (
        <div className="token-list">
          {tokenIds.map((id) => (
            <span key={id.toString()} className="token-badge">
              #{id.toString()}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Root Export ─────────────────────────────────────────────────────────────

export default function ContractActions() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <p className="connect-prompt">Connect your wallet to interact with the contract.</p>
    )
  }

  return (
    <div className="contract-actions">
      <PlatformStats />
      <EventLookup />
      <BuyTicket />
      <MyTickets />
    </div>
  )
}
