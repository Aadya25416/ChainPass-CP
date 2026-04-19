import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { useContractWrite } from '../hooks/useContract'
import { useEventStatus } from '../hooks/useEventStatus'
import StatusMessage from './StatusMessage'

export default function CheckoutModal({ event, meta, onClose }) {
  const { address, isConnected } = useAccount()
  const { blockTime } = useEventStatus(event.eventEndTime)
  const now = blockTime ?? Math.floor(Date.now() / 1000)
  const isEnded = now > Number(event.eventEndTime)

  const { write, hash, isPending, isConfirming, isConfirmed, error, reset } = useContractWrite()
  const busy = isPending || isConfirming

  const ticketPriceEth = formatEther(event.ticketPrice)
  
  function handleBuyTicket() {
    write('buyTicket', [BigInt(event.eventId)], event.ticketPrice)
  }

  // Format Dates
  const dateObj = new Date(Number(event.eventStartTime) * 1000)
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

  // Outside click handler to close modal naturally
  function handleOverlayClick(e) {
    if (e.target.className === 'modal-overlay') onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="modal-content" style={{
         width: '100%', maxWidth: isEnded ? '600px' : '900px', maxHeight: '90vh', overflowY: 'auto',
         background: 'max(var(--c-bg), #0f131f)', borderRadius: '16px', border: '1px solid var(--c-border-deep)',
         boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, color: 'white', 
          cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s'
        }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>
          ✕
        </button>

        <div className="event-detail-layout" style={{ padding: '32px', display: 'flex', gap: '40px', flexDirection: isEnded ? 'column' : 'row' }}>
           <div className="event-info-col" style={{ flex: isEnded ? '1' : '0 0 50%' }}>
              <div className="event-banner-large" style={{
                  height: 200, borderRadius: 12, background: 'linear-gradient(135deg, #2d1655, #081121)',
                  padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  marginBottom: 24, position: 'relative', overflow: 'hidden'
              }}>
                 {/* Decorative background overlay */}
                 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url(https://www.transparenttextures.com/patterns/cubes.png)', opacity: 0.2 }} />
                 <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="status-pill" style={{
                       background: 'rgba(0,0,0,0.4)', color: '#00e5ff', width: 'fit-content', padding: '4px 10px', 
                       borderRadius: 12, fontSize: 10, fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em'
                    }}>
                       {isEnded ? 'ARCHIVED EVENT' : 'LIVE PERFORMANCE'}
                    </div>
                    <h1 className="hero-title" style={{fontSize: 28, margin: 0, fontWeight: 800, color: '#fff'}}>{meta?.name || `Event #${event.eventId.toString()}`}</h1>
                 </div>
              </div>
              
              <div className="stats-row" style={{display: 'flex', gap: 24, marginBottom: 28}}>
                 <div className="stat-item">
                    <span className="stat-label" style={{fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Date</span>
                    <div className="stat-val" style={{fontSize: 13, fontWeight: 700, marginTop: 4}}>{dateStr}</div>
                 </div>
                 <div className="stat-item">
                    <span className="stat-label" style={{fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Venue</span>
                    <div className="stat-val" style={{fontSize: 13, fontWeight: 700, marginTop: 4}}>{meta?.venue || 'TBA'}</div>
                 </div>
                 <div className="stat-item">
                    <span className="stat-label" style={{fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Time</span>
                    <div className="stat-val" style={{fontSize: 13, fontWeight: 700, marginTop: 4}}>{timeStr}</div>
                 </div>
                 <div className="stat-item">
                    <span className="stat-label" style={{fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Rating</span>
                    <div className="stat-val" style={{fontSize: 13, fontWeight: 700, marginTop: 4}}>All Ages</div>
                 </div>
              </div>

              <div>
                 <h2 style={{display:'flex', alignItems:'center', gap: 8, fontSize: 16, marginBottom: 12, color: '#fff'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    About this event
                 </h2>
                 <p className="muted-text" style={{lineHeight: 1.6, fontSize: 13, opacity: 0.8}}>
                   Step into a multi-sensory journey where blockchain meets live events. Experience seamless ticket transfer and immediate global verification via the blockchain. Witness the future of entertainment in the heart of the Kinetic Vault.
                 </p>
              </div>

              <div className="panel" style={{marginTop: 24, background: 'var(--c-surface-raised)', padding: 20, borderRadius: 12}}>
                 <h3 style={{fontSize: 11, textTransform:'uppercase', color:'var(--c-text-2)', letterSpacing: 1, marginBottom: 16}}>Event Details</h3>
                 <div className="detail-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                    <div style={{display:'flex', flexDirection:'column', gap:4}}>
                       <span className="muted-text" style={{fontSize: 11}}>Organiser</span>
                       <span style={{fontWeight:600, fontSize:12}}>{event.organiser.slice(0,8)}...{event.organiser.slice(-6)}</span>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:4}}>
                       <span className="muted-text" style={{fontSize: 11}}>Blockchain</span>
                       <span style={{fontWeight:600, fontSize:12}}>Ethereum Sepolia</span>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:4}}>
                       <span className="muted-text" style={{fontSize: 11}}>Max Supply</span>
                       <span style={{fontWeight:600, fontSize:12}}>{event.maxSupply.toString()} Tickets</span>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:4}}>
                       <span className="muted-text" style={{fontSize: 11}}>Language</span>
                       <span style={{fontWeight:600, fontSize:12}}>English</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Remove checkout completely if ended */}
           {!isEnded && (
           <div className="checkout-col" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="panel" style={{background: 'var(--c-surface-raised)', padding: 20, borderRadius: 12}}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
                    <h3 style={{fontSize: 14, margin:0, fontWeight: 700}}>Select Ticket Type</h3>
                    <span style={{fontSize: 10, opacity: 0.5}}>Prices in ETH</span>
                 </div>

                 <div className="ticket-type-card selected" style={{ border: '1px solid var(--c-primary)', background: 'rgba(229,51,75,0.05)', padding: 16, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <div style={{fontWeight: 700, fontSize: 13}}>General Admission</div>
                       <div style={{fontSize: 11, opacity: 0.6, marginTop: 4}}>Standard entry pass</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                       <div style={{fontWeight: 700, fontSize: 13}}>{ticketPriceEth} ETH</div>
                       <div style={{fontSize: 11, opacity: 0.6, marginTop: 4}}>- 1 +</div>
                    </div>
                 </div>
              </div>

              <div className="panel" style={{background: 'var(--c-surface-raised)', padding: 24, borderRadius: 12}}>
                 <h3 style={{fontSize: 10, textTransform:'uppercase', color:'var(--c-text-2)', letterSpacing: 1, marginBottom: 20}}>Price Summary</h3>
                 <div className="summary-row" style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 12, opacity: 0.8}}>
                    <span>General Admission x 1</span>
                    <span>{ticketPriceEth} ETH</span>
                 </div>
                 <div className="summary-row" style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 12, opacity: 0.8}}>
                    <span>Service Fee</span>
                    <span>0.000 ETH</span>
                 </div>
                 <div className="summary-row" style={{display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 12, opacity: 0.8}}>
                    <span>Gas Estimate</span>
                    <span>0.001 ETH</span>
                 </div>
                 
                 <div style={{height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0'}} />

                 <div className="summary-total" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div style={{fontWeight: 700, fontSize: 14}}>Total Amount</div>
                    <div style={{textAlign: 'right'}}>
                       <div style={{fontWeight: 800, fontSize: 20}}>{ticketPriceEth} ETH</div>
                       <div style={{fontSize: 10, color: '#888', marginTop: 4}}>Approx. ₹{Math.floor(Number(ticketPriceEth)*300000).toLocaleString('en-IN')}</div>
                    </div>
                 </div>

                 <button 
                    type="button"
                    className="btn btn-primary"
                    style={{width: '100%', marginTop: 24, padding: '14px', fontSize: 14, borderRadius: 8, filter: isConfirmed ? 'hue-rotate(90deg)' : 'none'}}
                    disabled={!isConnected || busy || Number(event.maxSupply) === Number(event.totalMinted)}
                    onClick={handleBuyTicket}
                 >
                    {isPending ? 'Confirm in MetaMask...' : isConfirming ? 'Waiting for receipt...' : isConfirmed ? 'Purchased!' : 'Confirm Transaction ⚡'}
                 </button>
                 
                 <p className="muted-text" style={{textAlign:'center', fontSize: 9, marginTop: 16, opacity: 0.5}}>
                    By confirming, you agree to the Terms of Service and recognize this is a blockchain-based transaction.
                 </p>
                 
                 {!isConnected && <p style={{textAlign:'center', fontSize: 12, color: 'var(--c-warning)', marginTop: 12}}>Connect MetaMask to purchase.</p>}
                 {Number(event.maxSupply) > 0 && Number(event.maxSupply) === Number(event.totalMinted) && <p style={{textAlign:'center', fontSize: 12, color: 'var(--c-error)', marginTop: 12}}>SOLD OUT.</p>}
              </div>

              <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap: 8, padding: '12px 16px', background: 'var(--c-surface-raised)', borderRadius: 8}}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d2b4" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                 <span style={{fontSize: 10, fontWeight: 700, color:'#00d2b4', letterSpacing: 1}}>SECURED BY KINETIC VAULT PROTOCOLS</span>
              </div>

              <div style={{marginTop: 8}}>
                 <StatusMessage hash={hash} isPending={isPending} isConfirming={isConfirming} isConfirmed={isConfirmed} error={error} />
              </div>

           </div>
           )}
        </div>
      </div>
    </div>
  )
}
