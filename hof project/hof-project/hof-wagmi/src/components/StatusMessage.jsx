/**
 * Shared transaction status banner.
 * Renders nothing when there is no active state.
 */
export default function StatusMessage({ hash, isPending, isConfirming, isConfirmed, error }) {
  if (error)
    return (
      <p className="status status-error">
        {error.shortMessage || error.message}
      </p>
    )
  if (isPending)
    return <p className="status status-info">Waiting for wallet approval…</p>
  if (isConfirming)
    return <p className="status status-info">Transaction submitted — confirming on-chain…</p>
  if (isConfirmed)
    return (
      <p className="status status-success">
        ✓ Confirmed!&nbsp;
        <span className="mono">{hash?.slice(0, 14)}…</span>
      </p>
    )
  return null
}
