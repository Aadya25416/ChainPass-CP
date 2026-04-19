import { useState } from 'react'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import { useContractRead, useContractWrite } from '../hooks/useContract'
import StatusMessage from './StatusMessage'

// ─── Event Preview (auto-loads on eventId change) ─────────────────────────────

function EventPreview({ eventId }) {
  const { data: event, isLoading, error } = useContractRead(
    'getEvent',
    [BigInt(eventId ?? 0)],
    { query: { enabled: eventId !== null && !isNaN(eventId) } },
  )

  if (isLoading) return <p className="status status-info">Loading event info…</p>
  if (error || (event && !event.exists))
    return eventId !== null
      ? <p className="status status-error">Event not found.</p>
      : null

  if (!event) return null

  return (
    <div className="preview-box">
      <div className="preview-row">
        <span>Organiser</span>
        <span className="mono sm">{event.organiser}</span>
      </div>
      <div className="preview-row">
        <span>Ticket Price</span>
        <span><strong>{formatEther(event.ticketPrice)} ETH</strong></span>
      </div>
      <div className="preview-row">
        <span>Available</span>
        <span>{(event.maxSupply - event.totalMinted).toString()} of {event.maxSupply.toString()}</span>
      </div>
    </div>
  )
}

// ─── Buy Ticket ───────────────────────────────────────────────────────────────

function BuyTicketSection() {
  const [eventInput, setEventInput] = useState('')
  const [ethValue, setEthValue] = useState('')

  const eventId = eventInput !== '' ? parseInt(eventInput, 10) : null
  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()

  const handleBuy = () => {
    const valueWei = BigInt(Math.round(parseFloat(ethValue) * 1e18))
    write('buyTicket', [BigInt(eventId)], valueWei)
  }

  const busy = isPending || isConfirming

  return (
    <div>
      <h3 className="subsection-title">Buy Ticket</h3>
      <div className="input-row">
        <input
          id="buy-event-id"
          className="input"
          type="number"
          min="0"
          placeholder="Event ID"
          value={eventInput}
          onChange={(e) => setEventInput(e.target.value)}
        />
        <input
          id="buy-eth-value"
          className="input"
          type="number"
          step="0.001"
          min="0"
          placeholder="Value (ETH)"
          value={ethValue}
          onChange={(e) => setEthValue(e.target.value)}
        />
        <button
          id="btn-buy-ticket"
          className="btn btn-primary"
          onClick={handleBuy}
          disabled={eventId === null || !ethValue || busy}
        >
          {busy ? 'Buying…' : 'Buy Ticket'}
        </button>
        {(isConfirmed || error) && (
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
        )}
      </div>

      <EventPreview eventId={eventId} />

      <StatusMessage
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={error}
      />
    </div>
  )
}

// ─── Transfer Ticket ──────────────────────────────────────────────────────────

function TransferTicketSection() {
  const [tokenId, setTokenId] = useState('')
  const [toAddress, setToAddress] = useState('')

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  return (
    <div>
      <h3 className="subsection-title">Transfer Ticket</h3>
      <div className="input-row">
        <input
          id="transfer-token-id"
          className="input"
          type="number"
          min="0"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          id="transfer-to-address"
          className="input"
          placeholder="Recipient address (0x…)"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
        <button
          id="btn-transfer-ticket"
          className="btn btn-secondary"
          onClick={() => write('transferTicket', [BigInt(tokenId), toAddress])}
          disabled={!tokenId || !toAddress || busy}
        >
          {busy ? 'Transferring…' : 'Transfer'}
        </button>
        {(isConfirmed || error) && (
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
        )}
      </div>
      <StatusMessage
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={error}
      />
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BuyTicket() {
  const { isConnected } = useAccount()

  if (!isConnected)
    return <p className="connect-prompt">Connect your wallet to buy or transfer tickets.</p>

  return (
    <div className="section-content">
      <BuyTicketSection />
      <div className="section-divider" />
      <TransferTicketSection />
    </div>
  )
}
