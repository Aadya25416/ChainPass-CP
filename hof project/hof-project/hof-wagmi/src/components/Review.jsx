import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useContractRead, useContractWrite } from '../hooks/useContract'
import StatusMessage from './StatusMessage'

// ─── View Reviews ─────────────────────────────────────────────────────────────

function ViewReviews() {
  const [inputId, setInputId] = useState('')
  const [eventId, setEventId] = useState(null)

  const { data: reviews, isLoading, error } = useContractRead(
    'getEventReviews',
    [BigInt(eventId ?? 0)],
    { query: { enabled: eventId !== null } },
  )

  return (
    <div>
      <h3 className="subsection-title">Event Reviews</h3>
      <div className="input-row">
        <input
          id="reviews-event-id"
          className="input"
          type="number"
          min="0"
          placeholder="Event ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setEventId(parseInt(inputId, 10))}
        />
        <button
          id="btn-load-reviews"
          className="btn btn-secondary"
          onClick={() => setEventId(parseInt(inputId, 10))}
        >
          Load Reviews
        </button>
      </div>

      {isLoading && <p className="status status-info">Loading reviews…</p>}
      {error && <p className="status status-error">Could not load reviews.</p>}
      {reviews?.length === 0 && (
        <p className="empty-state">No reviews submitted for this event yet.</p>
      )}

      {reviews && reviews.length > 0 && (
        <div className="review-list">
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-meta">
                <span className="mono sm">{r.reviewer.slice(0, 10)}…</span>
                <span className="muted">
                  {new Date(Number(r.submittedAt) * 1000).toLocaleDateString()}
                </span>
              </div>
              <p className="review-content">{r.contentHash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Submit Review ────────────────────────────────────────────────────────────

function SubmitReview() {
  const [eventId, setEventId] = useState('')
  const [contentHash, setContentHash] = useState('')

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  return (
    <div>
      <h3 className="subsection-title">Submit Review</h3>
      <div className="input-row">
        <input
          id="submit-review-event-id"
          className="input"
          type="number"
          min="0"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
        <input
          id="submit-review-hash"
          className="input"
          placeholder="Content hash (IPFS CID or text)"
          value={contentHash}
          onChange={(e) => setContentHash(e.target.value)}
        />
        <button
          id="btn-submit-review"
          className="btn btn-primary"
          onClick={() => write('submitReview', [BigInt(eventId), contentHash])}
          disabled={!eventId || !contentHash || busy}
        >
          {busy ? 'Submitting…' : 'Submit Review'}
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

// ─── Request Review Drop Winner (VRF) ─────────────────────────────────────────

function RequestDropWinner() {
  const [eventId, setEventId] = useState('')

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  return (
    <div>
      <h3 className="subsection-title">Request Review Drop Winner <span className="badge badge-blue">VRF</span></h3>
      <p className="field-hint" style={{ marginBottom: '10px' }}>
        Triggers Chainlink VRF to randomly select a reviewer for a cashback reward.
      </p>
      <div className="input-row">
        <input
          id="drop-winner-event-id"
          className="input"
          type="number"
          min="0"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
        <button
          id="btn-request-winner"
          className="btn btn-secondary"
          onClick={() => write('requestReviewDropWinner', [BigInt(eventId)])}
          disabled={!eventId || busy}
        >
          {busy ? 'Requesting…' : 'Request Winner'}
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

export default function Review() {
  const { isConnected } = useAccount()

  return (
    <div className="section-content">
      {/* Viewing reviews is open to everyone */}
      <ViewReviews />

      <div className="section-divider" />

      {isConnected ? (
        <>
          <SubmitReview />
          <div className="section-divider" />
          <RequestDropWinner />
        </>
      ) : (
        <p className="connect-prompt">Connect wallet to submit reviews or request drop winners.</p>
      )}
    </div>
  )
}
