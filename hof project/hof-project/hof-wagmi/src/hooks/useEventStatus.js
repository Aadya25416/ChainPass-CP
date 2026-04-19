import { useMemo } from 'react'
import { useBlockTime } from './useBlockTime'

/**
 * useEventStatus(eventEndTime)
 *
 * Derives whether an event has ended by comparing the CHAIN'S block timestamp
 * against the event's on-chain end time.
 *
 * @param {bigint | number | null} eventEndTime  — event.eventEndTime from contract
 * @returns {{
 *   hasEnded:    boolean | null,   null = still loading chain time
 *   blockTime:   number  | null,   latest block timestamp in Unix seconds
 *   blockNumber: number  | null,
 *   isLoading:   boolean,
 *   refresh:     () => Promise<number | null>   imperative re-fetch
 * }}
 *
 * SAFETY CONTRACT:
 *   hasEnded === null  → loading, treat as NOT ended (show locked UI)
 *   hasEnded === false → event still active    (locked)
 *   hasEnded === true  → event confirmed ended (unlocked)
 *
 * The refresh() function returns the FRESH block timestamp so callers can
 * perform a synchronous guard AFTER the await resolves.
 */
export function useEventStatus(eventEndTime) {
  const { blockTime, blockNumber, isLoading, error, refresh } = useBlockTime()

  const endTimeSec = eventEndTime !== null && eventEndTime !== undefined
    ? Number(eventEndTime)
    : null

  // Tri-state: null (unknown) | false (not ended) | true (ended)
  const hasEnded = useMemo(() => {
    if (blockTime === null || endTimeSec === null) return null
    return blockTime > endTimeSec
  }, [blockTime, endTimeSec])

  return { hasEnded, blockTime, blockNumber, endTimeSec, isLoading, error, refresh }
}
