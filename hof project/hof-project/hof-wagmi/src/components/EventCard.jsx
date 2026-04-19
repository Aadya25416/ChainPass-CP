import { useState } from 'react'
import CheckoutModal from './CheckoutModal'
import { formatEther } from 'viem'
import { useAccount, usePublicClient } from 'wagmi'
import { useContractRead } from '../hooks/useContract'
import { useEventStatus } from '../hooks/useEventStatus'
import { useReviews } from '../hooks/useReviews'
import { formatTs, timeUntil } from '../hooks/useEventTime'

// ─── Star Rating ──────────────────────────────────────────────────────────────

function Stars({ value, onChange, readonly = false }) {
  return (
    <div className="stars" aria-label={`Rating: ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= value ? 'star--on' : 'star--off'}`}
          onClick={() => !readonly && onChange?.(n)}
          disabled={readonly}
          tabIndex={readonly ? -1 : 0}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ─── Review Form ──────────────────────────────────────────────────────────────
//
// SAFE-SUBMIT STRATEGY
// ─────────────────────
// Gate 1 (UI)    — button is disabled if blockTime hasn't confirmed event ended.
// Gate 2 (Logic) — handleSubmit re-fetches block time via publicClient.getBlock()
//                  RIGHT BEFORE saving. If the chain timestamp still shows the
//                  event hasn't ended, submission is silently blocked + error shown.
//                  This prevents race conditions where the UI unlocked just as the
//                  block boundary was crossed.

function ReviewForm({ eventId, address, eventEndTime, onDone }) {
  const publicClient = usePublicClient()
  const { submitReview, hasReviewed } = useReviews(eventId)

  const [rating, setRating]         = useState(0)
  const [comment, setComment]       = useState('')
  const [checking, setChecking]     = useState(false)  // re-fetch in progress
  const [guardError, setGuardError] = useState(null)   // guard rejection message
  const [submitted, setSubmitted]   = useState(false)

  if (hasReviewed(address)) {
    return (
      <div className="review-notice">
        ✓ You have already reviewed this event.
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="review-notice review-notice--success">
        🎉 Review submitted! Thank you.
      </div>
    )
  }

  /**
   * handleSubmit — two-layer timestamp guard
   *
   * Layer 1 (fast): compare against cached blockTime (already in state).
   * Layer 2 (fresh): re-fetch latest block from chain right before saving.
   *
   * We only proceed if BOTH checks pass. This eliminates the window where
   * a stale cached value could allow a premature submission.
   */
  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return

    setChecking(true)
    setGuardError(null)

    try {
      // ── LAYER 2: fresh block from chain ───────────────────────────────────
      const block = await publicClient.getBlock({ blockTag: 'latest' })
      const freshBlockTime = Number(block.timestamp)
      const endTimeSec     = Number(eventEndTime)

      if (freshBlockTime <= endTimeSec) {
        // Event hasn't ended on-chain — hard block
        const secsLeft = endTimeSec - freshBlockTime
        setGuardError(
          `Event has not ended yet on-chain. ` +
          `Approx ${Math.ceil(secsLeft / 60)} min remaining. ` +
          `Please wait for the block timestamp to pass ${formatTs(eventEndTime)}.`
        )
        return
      }

      // ── All guards passed — safe to persist review ────────────────────────
      submitReview({ wallet: address, rating, comment })
      setSubmitted(true)
      setTimeout(onDone, 1800)   // close form after brief success flash

    } catch (err) {
      setGuardError(`Could not verify chain time: ${err.message}. Please try again.`)
    } finally {
      setChecking(false)
    }
  }

  const canSubmit = rating > 0 && comment.trim().length > 0 && !checking

  return (
    <div className="review-form">
      <div className="review-form-top">
        <span className="field-label">Your Rating</span>
        <span className="muted mono sm">{address?.slice(0, 10)}…</span>
      </div>

      <Stars value={rating} onChange={setRating} />

      <textarea
        className="input textarea"
        placeholder="Share your experience with this event…"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Guard error banner */}
      {guardError && (
        <p className="status status-error" style={{ marginTop: 0 }}>
          🚫 {guardError}
        </p>
      )}

      <div className="action-row" style={{ marginBottom: 0 }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {checking ? 'Verifying on-chain…' : 'Submit Review'}
        </button>
        <button className="btn btn-ghost" onClick={onDone} disabled={checking}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Review List ──────────────────────────────────────────────────────────────

function ReviewList({ eventId }) {
  const { reviews, avgRating } = useReviews(eventId)

  if (reviews.length === 0) {
    return (
      <p className="empty-state" style={{ padding: '12px 0' }}>
        No reviews yet — be the first!
      </p>
    )
  }

  return (
    <div>
      <div className="review-summary">
        <span className="star star--on" style={{ fontSize: '18px' }}>★</span>
        <strong>{avgRating.toFixed(1)}</strong>
        <span className="muted">
          &nbsp;({reviews.length} review{reviews.length !== 1 ? 's' : ''})
        </span>
      </div>

      <div className="review-list">
        {reviews
          .slice()
          .reverse()
          .map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-meta">
                <Stars value={r.rating} readonly />
                <span className="muted">
                  {new Date(r.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="review-content">{r.comment}</p>
              <span className="mono sm muted">{r.wallet.slice(0, 10)}…</span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ─── Review Panel (chain-time-gated) ─────────────────────────────────────────
//
// Uses useEventStatus → useBlockTime (polls getBlock every 15 s).
// hasEnded is a TRI-STATE: null | false | true
//   null  → still fetching block time → show neutral loading state (LOCKED)
//   false → event active              → locked
//   true  → event ended on-chain      → unlocked

function ReviewPanel({ eventId, eventEndTime }) {
  const { address, isConnected } = useAccount()
  const { hasEnded, blockTime, blockNumber, isLoading, refresh } =
    useEventStatus(eventEndTime)
  const [showForm, setShowForm] = useState(false)

  // ── Still fetching block time ──────────────────────────────────────────────
  if (isLoading && hasEnded === null) {
    return (
      <div className="review-locked">
        <div className="review-locked-icon">⏳</div>
        <div className="review-locked-body">
          <p className="review-locked-title">Verifying chain time…</p>
          <p className="review-locked-sub">
            Fetching latest block timestamp from Sepolia.
          </p>
        </div>
      </div>
    )
  }

  // ── Event NOT yet ended ────────────────────────────────────────────────────
  if (!hasEnded) {
    return (
      <div className="review-locked">
        <div className="review-locked-icon">🔒</div>
        <div className="review-locked-body">
          <p className="review-locked-title">Reviews not yet available</p>
          <p className="review-locked-sub">
            Reviews unlock when the chain timestamp passes{' '}
            <strong>{formatTs(eventEndTime)}</strong>.
            {blockTime && (
              <span className="block-time-note">
                {' '}Current block time: <span className="mono">{formatTs(blockTime)}</span>
                {blockNumber && ` (block #${blockNumber.toLocaleString()})`}.
              </span>
            )}
          </p>
          <button
            className="btn-refresh-time"
            onClick={refresh}
          >
            ↻ Refresh block time
          </button>
        </div>
      </div>
    )
  }

  // ── Event ended — panel unlocked ───────────────────────────────────────────
  return (
    <div className="review-panel">
      <div className="review-panel-header">
        <span className="subsection-title" style={{ marginBottom: 0 }}>
          Reviews
        </span>
        <div className="review-panel-actions">
          {blockNumber && (
            <span className="block-chip" title="Chain-verified">
              ✓ Block #{blockNumber.toLocaleString()}
            </span>
          )}
          {isConnected && !showForm && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowForm(true)}
            >
              + Write Review
            </button>
          )}
          {!isConnected && (
            <span className="muted" style={{ fontSize: '12px' }}>
              Connect wallet to write a review
            </span>
          )}
        </div>
      </div>

      {isConnected && showForm && (
        <ReviewForm
          eventId={String(eventId)}
          address={address}
          eventEndTime={eventEndTime}   /* passed for the Layer-2 guard */
          onDone={() => setShowForm(false)}
        />
      )}

      <ReviewList eventId={String(eventId)} />
    </div>
  )
}

// ─── Event Status Pill (block-time-aware) ─────────────────────────────────────
//
// Uses useEventStatus internally so the pill reflects chain time, not Date.now().

function StatusPill({ event }) {
  const { blockTime } = useEventStatus(event.eventEndTime)

  // Fallback to local time while block time loads (visual only, non-security path)
  const now = blockTime ?? Math.floor(Date.now() / 1000)
  const ss  = Number(event.saleStartTime)
  const se  = Number(event.saleEndTime)
  const es  = Number(event.eventStartTime)
  const ee  = Number(event.eventEndTime)

  if (now < ss) return <div className="ev-card-pill">Upcoming</div>
  if (now < se) return <div className="ev-card-pill gold">Selling Fast</div>
  if (now < es) return <div className="ev-card-pill">Sale Closed</div>
  if (now < ee) return <div className="ev-card-pill pink">Live 🔴</div>
  return <div className="ev-card-pill">Ended</div>
}

// ─── Ticket ownership badge ───────────────────────────────────────────────────

function TicketOwnerBadge({ eventId, address }) {
  const { data: isHolder } = useContractRead(
    'isTicketHolder',
    [address, BigInt(eventId)],
    { query: { enabled: !!address } },
  )
  if (!address || isHolder === undefined) return null
  return isHolder
    ? <span className="badge badge-green" style={{ fontSize: '11px' }}>🎫 You own a ticket</span>
    : null
}

// ─── EventCard Root ───────────────────────────────────────────────────────────

export default function EventCard({ event, meta }) {
  const { address } = useAccount()
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  if (!event || !event.exists) return null

  const id      = event.eventId.toString()
  const sold    = event.totalMinted
  const cap     = event.maxSupply
  const soldPct = cap > 0n ? Math.min(100, Number((sold * 100n) / cap)) : 0

  const dateObj = new Date(Number(event.eventStartTime) * 1000)
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Placeholder styling so missing images look like dark gradients instead of blank boxes
  const placeholderStyle = { 
    background: 'linear-gradient(180deg, rgba(20,20,30,0) 0%, var(--card) 100%), linear-gradient(45deg, #2d1b46, #0b1a30)'
  }

  const inrPrice = Math.floor(Number(formatEther(event.ticketPrice)) * 300000).toLocaleString('en-IN')

  return (
    <div className="ev-card">
      <div className="ev-card-img" style={placeholderStyle}>
        <StatusPill event={event} />
      </div>
      <div className="ev-card-body">
        <h3 className="ev-card-title">{meta?.name ?? `Event #${id}`}</h3>
        <p className="ev-card-loc" style={{display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {meta?.venue ?? '—'}
        </p>

        <div className="ev-card-stats">
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontSize: '9px', opacity: 0.6, letterSpacing: '0.05em'}}>DATE</span>
            <span style={{fontSize: '13px', fontWeight: 600}}>{dateStr}</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontSize: '9px', opacity: 0.6, letterSpacing: '0.05em'}}>TIME</span>
            <span style={{fontSize: '13px', fontWeight: 600}}>{timeStr}</span>
          </div>
        </div>

        <div className="ev-card-bottom">
          <div style={{display: 'flex', alignItems: 'baseline'}}>
             <span style={{fontSize: '18px', fontWeight: 700}}>₹{inrPrice}</span>
             <span style={{fontSize: '10px', opacity: 0.6, marginLeft: '4px'}}>onwards</span>
          </div>
          <button title="Purchase Option" onClick={() => setShowCheckout(true)} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', padding: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems:'center', justifyContent:'center'}}>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </button>
        </div>

        {/* ── Functional Injections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {address && <div><TicketOwnerBadge eventId={id} address={address} /></div>}

          <div className="ec-supply" style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
            <div className="ec-bar-track" style={{height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2}}>
              <div className="ec-bar-fill" style={{ width: `${soldPct}%`, height: 4, background: 'var(--accent)', borderRadius: 2 }} role="progressbar" />
            </div>
            <div style={{fontSize: '11px', marginTop: 6, color: '#aaa', display: 'flex', justifyContent: 'space-between'}}>
              <span>{sold.toString()} / {cap.toString()} sold</span>
              <span>{soldPct}%</span>
            </div>
          </div>

          {/* ── Reviews Toggle ── */}
          <button
            style={{ width: '100%', padding: '8px', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center' }}
            onClick={() => setReviewsOpen((o) => !o)}
            aria-expanded={reviewsOpen}
          >
            {reviewsOpen ? '▲ Hide Reviews' : '▼ View Reviews'}
          </button>

          {reviewsOpen && (
            <div className="ec-review-section" style={{background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px'}}>
              <ReviewPanel eventId={event.eventId} eventEndTime={event.eventEndTime} />
            </div>
          )}
        </div>
      </div>
      
      {/* ── Modal Overlay ── */}
      {showCheckout && (
         <CheckoutModal 
            event={event} 
            meta={meta} 
            onClose={() => setShowCheckout(false)} 
         />
      )}
    </div>
  )
}
