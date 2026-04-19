import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { formatEther, parseEther } from 'viem'
import './App.css'
import { chainPassAddress, sepoliaChainId } from './lib/chainPass'
import { chainPassAbi } from './lib/chainPassAbi'

type EventData = {
  eventId: bigint
  organiser: `0x${string}`
  ticketPrice: bigint
  maxSupply: bigint
  totalMinted: bigint
  saleStartTime: bigint
  saleEndTime: bigint
  eventStartTime: bigint
  eventEndTime: bigint
  organiserStake: bigint
  stakeReturned: boolean
  exists: boolean
}

function toUnixSeconds(value: string): bigint {
  if (!value) return 0n
  return BigInt(Math.floor(new Date(value).getTime() / 1000))
}

function formatUnix(ts: bigint | number): string {
  const n = typeof ts === 'bigint' ? Number(ts) : ts
  if (!n) return '-'
  return new Date(n * 1000).toLocaleString()
}

function App() {
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient({ chainId: sepoliaChainId })
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: txHash, error: writeError, isPending: isWritePending, writeContract } =
    useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const [lookupEventId, setLookupEventId] = useState('1')

  const [createName, setCreateName] = useState('')
  const [createVenue, setCreateVenue] = useState('')
  const [createPriceEth, setCreatePriceEth] = useState('0.001')
  const [createSupply, setCreateSupply] = useState('100')
  const [createSaleStart, setCreateSaleStart] = useState('')
  const [createSaleEnd, setCreateSaleEnd] = useState('')
  const [createEventStart, setCreateEventStart] = useState('')
  const [createEventEnd, setCreateEventEnd] = useState('')
  const [createStakeEth, setCreateStakeEth] = useState('0.01')

  const [buyEventId, setBuyEventId] = useState('1')
  const [buyPriceEth, setBuyPriceEth] = useState('0.001')

  const [listTokenId, setListTokenId] = useState('1')
  const [listPriceEth, setListPriceEth] = useState('0.001')
  const [buyResaleTokenId, setBuyResaleTokenId] = useState('1')
  const [buyResalePriceEth, setBuyResalePriceEth] = useState('0.001')
  const [cancelTokenId, setCancelTokenId] = useState('1')

  const [reviewEventId, setReviewEventId] = useState('1')
  const [reviewContentHash, setReviewContentHash] = useState('ipfs://')
  const [winnerEventId, setWinnerEventId] = useState('1')

  const totalEvents = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getTotalEvents',
    query: { refetchInterval: 10000 },
  })

  const totalMinted = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getTotalTicketsMinted',
    query: { refetchInterval: 10000 },
  })

  const eventDetails = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getEvent',
    args: [lookupEventId ? BigInt(lookupEventId) : 0n],
    query: { enabled: Boolean(lookupEventId) },
  })

  const walletTickets = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getWalletTickets',
    args: [address!],
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  })

  const eventData = useMemo(() => {
    return eventDetails.data as EventData | undefined
  }, [eventDetails.data])

  const txState = useMemo(() => {
    if (isWritePending) return 'Waiting for wallet signature...'
    if (isConfirming) return 'Transaction submitted. Waiting for confirmation...'
    if (isConfirmed && txHash) return `Confirmed: ${txHash}`
    if (writeError) return `Error: ${writeError.message}`
    return 'No pending transaction.'
  }, [isWritePending, isConfirming, isConfirmed, txHash, writeError])

  const wrongChain = isConnected && chainId !== sepoliaChainId

  const onCreateEvent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'createEvent',
      args: [
        {
          name: createName,
          venue: createVenue,
          ticketPrice: parseEther(createPriceEth),
          maxSupply: BigInt(createSupply),
          saleStartTime: toUnixSeconds(createSaleStart),
          saleEndTime: toUnixSeconds(createSaleEnd),
          eventStartTime: toUnixSeconds(createEventStart),
          eventEndTime: toUnixSeconds(createEventEnd),
        },
      ],
      value: parseEther(createStakeEth),
    })
  }

  const onBuyTicket = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const eventId = BigInt(buyEventId)
    const ticketPrice = parseEther(buyPriceEth)

    try {
      if (!publicClient) {
        throw new Error('Public client unavailable. Please reconnect wallet and retry.')
      }

      const event = (await publicClient.readContract({
        address: chainPassAddress,
        abi: chainPassAbi,
        functionName: 'getEvent',
        args: [eventId],
      })) as EventData

      const now = Math.floor(Date.now() / 1000)

      if (!event.exists) {
        throw new Error('Event does not exist.')
      }

      if (now < Number(event.saleStartTime) || now >= Number(event.saleEndTime)) {
        throw new Error('Sale is not open for this event. Use an active sale window.')
      }

      if (ticketPrice < event.ticketPrice) {
        throw new Error(`Insufficient ETH. Minimum required is ${formatEther(event.ticketPrice)} ETH.`)
      }

      if (event.totalMinted >= event.maxSupply) {
        throw new Error('Event is sold out.')
      }

      if (!address) {
        throw new Error('Connect wallet before buying a ticket.')
      }

      const ticketsBoughtForEvent = (await publicClient.readContract({
        address: chainPassAddress,
        abi: chainPassAbi,
        functionName: 'ticketsBought',
        args: [eventId, address],
      })) as bigint

      if (ticketsBoughtForEvent >= 2n) {
        throw new Error('Max 2 tickets per wallet reached for this event.')
      }

      console.log('[buyTicket] Pre-flight passed, sending transaction...', {
        eventId: eventId.toString(),
        now,
        saleStartTime: event.saleStartTime.toString(),
        saleEndTime: event.saleEndTime.toString(),
        totalMinted: event.totalMinted.toString(),
        maxSupply: event.maxSupply.toString(),
        ticketsBoughtForEvent: ticketsBoughtForEvent.toString(),
        eventTicketPriceWei: event.ticketPrice.toString(),
        ticketPriceWei: ticketPrice.toString(),
      })

      writeContract({
        address: chainPassAddress,
        abi: chainPassAbi,
        functionName: 'buyTicket',
        args: [eventId],
        value: ticketPrice,
      })

      console.log('[buyTicket] Transaction submitted via wallet.')
    } catch (error) {
      console.error('[buyTicket] Pre-flight validation or submission failed', error)
    }
  }

  const onListResale = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'listForResale',
      args: [BigInt(listTokenId), parseEther(listPriceEth)],
    })
  }

  const onBuyResale = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'buyResaleTicket',
      args: [BigInt(buyResaleTokenId)],
      value: parseEther(buyResalePriceEth),
    })
  }

  const onCancelResale = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'cancelResaleListing',
      args: [BigInt(cancelTokenId)],
    })
  }

  const onSubmitReview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'submitReview',
      args: [BigInt(reviewEventId), reviewContentHash],
    })
  }

  const onPickWinner = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'requestReviewDropWinner',
      args: [BigInt(winnerEventId)],
    })
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Sepolia dApp</p>
        <h1>ChainPass Control Desk</h1>
        <p>
          Contract: <span>{chainPassAddress}</span>
        </p>
        <div className="stats">
          <article>
            <h3>Total Events</h3>
            <p>{totalEvents.data ? totalEvents.data.toString() : '0'}</p>
          </article>
          <article>
            <h3>Total Tickets Minted</h3>
            <p>{totalMinted.data ? totalMinted.data.toString() : '0'}</p>
          </article>
          <article>
            <h3>Wallet</h3>
            <p>{isConnected ? address : 'Not connected'}</p>
          </article>
        </div>
      </header>

      <section className="panel">
        <h2>Wallet</h2>
        <div className="wallet-actions">
          {!isConnected &&
            connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isConnecting}
              >
                Connect {connector.name}
              </button>
            ))}
          {isConnected && <button onClick={() => disconnect()}>Disconnect</button>}
        </div>
        {wrongChain && <p className="warn">Switch wallet network to Sepolia.</p>}
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Lookup Event</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              eventDetails.refetch()
            }}
          >
            <label>
              Event ID
              <input
                value={lookupEventId}
                onChange={(e) => setLookupEventId(e.target.value)}
                type="number"
                min="1"
              />
            </label>
            <button type="submit">Refresh Event</button>
          </form>
          {eventData && (
            <div className="detail-block">
              <p>Organiser: {eventData.organiser}</p>
              <p>Ticket Price: {formatEther(eventData.ticketPrice)} ETH</p>
              <p>Minted: {eventData.totalMinted.toString()} / {eventData.maxSupply.toString()}</p>
              <p>Sale Start: {formatUnix(eventData.saleStartTime)}</p>
              <p>Sale End: {formatUnix(eventData.saleEndTime)}</p>
              <p>Event Start: {formatUnix(eventData.eventStartTime)}</p>
              <p>Event End: {formatUnix(eventData.eventEndTime)}</p>
              <p>Stake: {formatEther(eventData.organiserStake)} ETH</p>
              <p>Stake Returned: {eventData.stakeReturned ? 'Yes' : 'No'}</p>
            </div>
          )}
        </article>

        <article className="panel">
          <h2>Create Event</h2>
          <form onSubmit={onCreateEvent}>
            <label>
              Name
              <input value={createName} onChange={(e) => setCreateName(e.target.value)} required />
            </label>
            <label>
              Venue
              <input value={createVenue} onChange={(e) => setCreateVenue(e.target.value)} required />
            </label>
            <label>
              Ticket Price (ETH)
              <input value={createPriceEth} onChange={(e) => setCreatePriceEth(e.target.value)} required />
            </label>
            <label>
              Max Supply
              <input value={createSupply} onChange={(e) => setCreateSupply(e.target.value)} type="number" min="1" required />
            </label>
            <label>
              Sale Start
              <input value={createSaleStart} onChange={(e) => setCreateSaleStart(e.target.value)} type="datetime-local" required />
            </label>
            <label>
              Sale End
              <input value={createSaleEnd} onChange={(e) => setCreateSaleEnd(e.target.value)} type="datetime-local" required />
            </label>
            <label>
              Event Start
              <input value={createEventStart} onChange={(e) => setCreateEventStart(e.target.value)} type="datetime-local" required />
            </label>
            <label>
              Event End
              <input value={createEventEnd} onChange={(e) => setCreateEventEnd(e.target.value)} type="datetime-local" required />
            </label>
            <label>
              Stake ETH
              <input value={createStakeEth} onChange={(e) => setCreateStakeEth(e.target.value)} required />
            </label>
            <button type="submit">Create Event</button>
          </form>
        </article>

        <article className="panel">
          <h2>Primary Ticket</h2>
          <form onSubmit={onBuyTicket}>
            <label>
              Event ID
              <input value={buyEventId} onChange={(e) => setBuyEventId(e.target.value)} type="number" min="1" required />
            </label>
            <label>
              ETH to Send
              <input value={buyPriceEth} onChange={(e) => setBuyPriceEth(e.target.value)} required />
            </label>
            <button type="submit">Buy Ticket</button>
          </form>
        </article>

        <article className="panel">
          <h2>Resale</h2>
          <form onSubmit={onListResale}>
            <label>
              Token ID
              <input value={listTokenId} onChange={(e) => setListTokenId(e.target.value)} type="number" min="1" required />
            </label>
            <label>
              Resale Price (ETH)
              <input value={listPriceEth} onChange={(e) => setListPriceEth(e.target.value)} required />
            </label>
            <button type="submit">List For Resale</button>
          </form>

          <form onSubmit={onBuyResale}>
            <label>
              Token ID
              <input
                value={buyResaleTokenId}
                onChange={(e) => setBuyResaleTokenId(e.target.value)}
                type="number"
                min="1"
                required
              />
            </label>
            <label>
              ETH to Send
              <input value={buyResalePriceEth} onChange={(e) => setBuyResalePriceEth(e.target.value)} required />
            </label>
            <button type="submit">Buy Resale Ticket</button>
          </form>

          <form onSubmit={onCancelResale}>
            <label>
              Cancel Token ID
              <input value={cancelTokenId} onChange={(e) => setCancelTokenId(e.target.value)} type="number" min="1" required />
            </label>
            <button type="submit">Cancel Listing</button>
          </form>
        </article>

        <article className="panel">
          <h2>Review + VRF Winner</h2>
          <form onSubmit={onSubmitReview}>
            <label>
              Event ID
              <input value={reviewEventId} onChange={(e) => setReviewEventId(e.target.value)} type="number" min="1" required />
            </label>
            <label>
              Review Content Hash
              <input
                value={reviewContentHash}
                onChange={(e) => setReviewContentHash(e.target.value)}
                placeholder="ipfs://..."
                required
              />
            </label>
            <button type="submit">Submit Review</button>
          </form>

          <form onSubmit={onPickWinner}>
            <label>
              Event ID
              <input value={winnerEventId} onChange={(e) => setWinnerEventId(e.target.value)} type="number" min="1" required />
            </label>
            <button type="submit">Request VRF Winner</button>
          </form>
        </article>

        <article className="panel">
          <h2>My Ticket IDs</h2>
          {!address && <p>Connect wallet to load tickets.</p>}
          {address && (
            <div className="detail-block">
              {(walletTickets.data || []).length === 0 && <p>No tickets found.</p>}
              {(walletTickets.data || []).map((id) => (
                <p key={id.toString()}>Token #{id.toString()}</p>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel tx-panel">
        <h2>Transaction Status</h2>
        <p>{txState}</p>
      </section>
    </div>
  )
}

export default App
