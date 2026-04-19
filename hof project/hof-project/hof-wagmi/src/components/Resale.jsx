import { useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { useContractRead, useContractWrite } from '../hooks/useContract'
import StatusMessage from './StatusMessage'

// ─── List for Resale ──────────────────────────────────────────────────────────

function ListForResale() {
  const [tokenId, setTokenId] = useState('')
  const [price, setPrice] = useState('')

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  return (
    <div>
      <h3 className="subsection-title">List Ticket for Resale</h3>
      <div className="input-row">
        <input
          id="resale-list-token"
          className="input"
          type="number"
          min="0"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          id="resale-list-price"
          className="input"
          type="number"
          step="0.001"
          min="0"
          placeholder="Resale Price (ETH)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button
          id="btn-list-resale"
          className="btn btn-primary"
          onClick={() => write('listForResale', [BigInt(tokenId), parseEther(price)])}
          disabled={!tokenId || !price || busy}
        >
          {busy ? 'Listing…' : 'List for Resale'}
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

// ─── Buy Resale Ticket ────────────────────────────────────────────────────────

function BuyResaleListing() {
  const [tokenInput, setTokenInput] = useState('')
  const tokenId = tokenInput !== '' ? parseInt(tokenInput, 10) : null

  const { data: listing } = useContractRead(
    'resaleListings',
    [BigInt(tokenId ?? 0)],
    { query: { enabled: tokenId !== null } },
  )

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  const handleBuy = () => {
    write('buyResaleTicket', [BigInt(tokenId)], listing.resalePrice)
  }

  return (
    <div>
      <h3 className="subsection-title">Buy Resale Ticket</h3>
      <div className="input-row">
        <input
          id="resale-buy-token"
          className="input"
          type="number"
          min="0"
          placeholder="Token ID"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
        />
        <button
          id="btn-buy-resale"
          className="btn btn-primary"
          onClick={handleBuy}
          disabled={!tokenId || !listing?.active || busy}
        >
          {busy ? 'Buying…' : 'Buy Resale Ticket'}
        </button>
        {(isConfirmed || error) && (
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
        )}
      </div>

      {listing && (
        <div className="preview-box">
          <div className="preview-row">
            <span>Status</span>
            <span className={listing.active ? 'badge badge-green' : 'badge badge-red'}>
              {listing.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="preview-row">
            <span>Seller</span>
            <span className="mono sm">{listing.seller}</span>
          </div>
          <div className="preview-row">
            <span>Resale Price</span>
            <span><strong>{formatEther(listing.resalePrice)} ETH</strong></span>
          </div>
        </div>
      )}

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

// ─── Cancel Resale Listing ────────────────────────────────────────────────────

function CancelResaleListing() {
  const [tokenId, setTokenId] = useState('')

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  return (
    <div>
      <h3 className="subsection-title">Cancel Resale Listing</h3>
      <div className="input-row">
        <input
          id="resale-cancel-token"
          className="input"
          type="number"
          min="0"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button
          id="btn-cancel-resale"
          className="btn btn-danger"
          onClick={() => write('cancelResaleListing', [BigInt(tokenId)])}
          disabled={!tokenId || busy}
        >
          {busy ? 'Cancelling…' : 'Cancel Listing'}
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

export default function Resale() {
  const { isConnected } = useAccount()

  if (!isConnected)
    return <p className="connect-prompt">Connect your wallet to access the resale market.</p>

  return (
    <div className="section-content">
      <ListForResale />
      <div className="section-divider" />
      <BuyResaleListing />
      <div className="section-divider" />
      <CancelResaleListing />
    </div>
  )
}
