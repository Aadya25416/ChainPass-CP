import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'

/**
 * Fetches and tracks the latest block timestamp directly from the chain.
 *
 * WHY: Date.now() can mismatch chain time by minutes, causing:
 *   - Premature review unlocks (frontend unlocks before contract allows)
 *   - Transactions sent too early → guaranteed reverts
 *
 * This hook polls every POLL_INTERVAL_MS so it self-corrects as new
 * blocks arrive. An explicit `refresh()` is also exposed for imperative
 * use (e.g., right before a submission).
 */

const POLL_INTERVAL_MS = 15_000 // ≈ one Sepolia block period

export function useBlockTime() {
  const publicClient = usePublicClient()

  const [blockTime, setBlockTime]     = useState(null)   // Unix seconds (number)
  const [blockNumber, setBlockNumber] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState(null)

  const fetchBlock = useCallback(async () => {
    if (!publicClient) return null          // no client yet — skip silently

    setIsLoading(true)
    setError(null)

    try {
      const block = await publicClient.getBlock({ blockTag: 'latest' })
      const ts = Number(block.timestamp)    // BigInt → number (safe for Unix ts)
      setBlockTime(ts)
      setBlockNumber(Number(block.number))
      return ts
    } catch (err) {
      console.warn('[useBlockTime] getBlock failed:', err.message)
      setError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  // Initial fetch + periodic refresh
  useEffect(() => {
    fetchBlock()
    const id = setInterval(fetchBlock, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchBlock])

  return {
    blockTime,    // current chain timestamp in Unix seconds (null while loading)
    blockNumber,  // latest block number (null while loading)
    isLoading,
    error,
    /**
     * refresh() — call this imperatively for the double-check gate.
     * Returns the fresh timestamp (number | null).
     */
    refresh: fetchBlock,
  }
}
