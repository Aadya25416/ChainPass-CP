/**
 * Pure formatting utilities — no time-checking logic here.
 * For event-ended gating use useEventStatus (useBlockTime-backed).
 */

/**
 * Human-readable date + time from a Unix BigInt/number timestamp.
 * e.g. "19 Apr 2025, 09:30 PM"
 */
export function formatTs(ts) {
  if (ts === undefined || ts === null) return '—'
  const n = Number(ts)
  if (!n) return '—'
  return new Date(n * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Returns a rough countdown string relative to Date.now().
 * Used only for DISPLAY (the countdown label on the card).
 * Security decisions use useEventStatus / useBlockTime instead.
 */
export function timeUntil(ts) {
  if (!ts) return '—'
  const diff = Number(ts) - Math.floor(Date.now() / 1000)
  if (diff <= 0) return 'Ended'
  const d = Math.floor(diff / 86400)
  const h = Math.floor((diff % 86400) / 3600)
  const m = Math.floor((diff % 3600) / 60)
  if (d > 0) return `${d}d ${h}h remaining`
  if (h > 0) return `${h}h ${m}m remaining`
  return `${m}m remaining`
}
