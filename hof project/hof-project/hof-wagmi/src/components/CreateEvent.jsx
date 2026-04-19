import { useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { useContractWrite } from '../hooks/useContract'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const initialForm = {
  name: '',
  venue: '',
  ticketPrice: '',
  maxSupply: '',
  saleStartTime: '',
  saleEndTime: '',
  eventStartTime: '',
  eventEndTime: '',
  cashbackPool: '', // mapped exactly to your original 'stakeEth'
}

function toUnixSeconds(value) {
  return BigInt(Math.floor(new Date(value).getTime() / 1000))
}

export default function CreateEvent() {
  const [form, setForm] = useState(initialForm)
  const { isConnected } = useAccount()

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } =
    useContractWrite()

  const isBusy = isPending || isConfirming

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const params = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      ticketPrice: parseEther(form.ticketPrice),
      maxSupply: BigInt(form.maxSupply),
      saleStartTime: toUnixSeconds(form.saleStartTime),
      saleEndTime: toUnixSeconds(form.saleEndTime),
      eventStartTime: toUnixSeconds(form.eventStartTime),
      eventEndTime: toUnixSeconds(form.eventEndTime),
    }

    // Pass cashbackPool directly to msg.value (your original stakeEth logic)
    write('createEvent', [params], parseEther(form.cashbackPool))
  }

  // Image input removed per user request

  return (
    <section className="panel" style={{ padding: '32px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Create Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAME</span>
          <input className="input" name="name" value={form.name} onChange={updateField} required />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VENUE</span>
          <input className="input" name="venue" value={form.venue} onChange={updateField} required />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TICKET PRICE (ETH)</span>
          <input
            className="input"
            name="ticketPrice"
            type="number"
            min="0"
            step="0.0001"
            value={form.ticketPrice}
            onChange={updateField}
            required
          />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MAX SUPPLY</span>
          <input
            className="input"
            name="maxSupply"
            type="number"
            min="1"
            step="1"
            value={form.maxSupply}
            onChange={updateField}
            required
          />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SALE START TIME</span>
          <input
            className="input"
            name="saleStartTime"
            type="datetime-local"
            value={form.saleStartTime}
            onChange={updateField}
            required
          />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SALE END TIME</span>
          <input
            className="input"
            name="saleEndTime"
            type="datetime-local"
            value={form.saleEndTime}
            onChange={updateField}
            required
          />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EVENT START TIME</span>
          <input
            className="input"
            name="eventStartTime"
            type="datetime-local"
            value={form.eventStartTime}
            onChange={updateField}
            required
          />
        </label>

        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EVENT END TIME</span>
          <input
            className="input"
            name="eventEndTime"
            type="datetime-local"
            value={form.eventEndTime}
            onChange={updateField}
            required
          />
        </label>



        <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="label" style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CASHBACK POOL (ETH)</span>
          <input
            className="input"
            name="cashbackPool"
            type="number"
            min="0"
            step="0.0001"
            value={form.cashbackPool}
            onChange={updateField}
            required
          />
        </label>

        <button type="submit" className="wallet-button" style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', width: '100%' }} disabled={!isConnected || isBusy}>
          {isPending ? 'Confirm in MetaMask...' : isConfirming ? 'Waiting for receipt...' : 'Create Event'}
        </button>
      </form>

      {!isConnected && <p className="muted-text" style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>Connect MetaMask before creating an event.</p>}
      
      <div style={{ marginTop: '16px' }}>
         {error && <p className="error-text" style={{fontSize: '13px'}}>{error.shortMessage || error.message}</p>}
         {hash && <p className="muted-text" style={{fontSize: '13px'}}>Transaction hash: {hash}</p>}
         {isConfirmed && <p className="success-text" style={{fontSize: '13px', color:'#00d2b4'}}>Event created successfully!</p>}
      </div>
    </section>
  )
}
