import { useEffect, useState, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import { contractAddress, abi } from '../abi'

/**
 * The public RPC's eth_getLogs range is limited.
 * Set this to your contract's deployment block to avoid scanning from genesis.
 * Using 0n is safe but may be slow on public nodes; adjust if needed.
 */
const DEPLOY_FROM_BLOCK = BigInt(0)

/**
 * Fetches EventCreated event logs from the contract.
 * The on-chain Event struct does NOT store name/venue readable via getEvent(),
 * so we reconstruct the metadata from the emitted logs.
 *
 * Returns: { eventMeta: { [eventId: string]: { name, venue } }, isLoading, error }
 */
export function useEventLogs() {
  const publicClient = usePublicClient()
  const [eventMeta, setEventMeta] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchLogs = useCallback(async () => {
    if (!publicClient) return
    setIsLoading(true)
    setError(null)

    try {
      const logs = await publicClient.getContractEvents({
        address: contractAddress,
        abi,
        eventName: 'EventCreated',
        fromBlock: DEPLOY_FROM_BLOCK,
        toBlock: 'latest',
      })

      const meta = {}
      for (const log of logs) {
        const id = log.args.eventId?.toString()
        if (id !== undefined) {
          meta[id] = {
            name:  log.args.name  || `Event #${id}`,
            venue: log.args.venue || '—',
          }
        }
      }
      setEventMeta(meta)
    } catch (err) {
      // Non-fatal: we fall back to showing Event #ID if logs are unavailable
      console.warn('[useEventLogs] Could not fetch EventCreated logs:', err.message)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { eventMeta, isLoading, error, refetch: fetchLogs }
}
