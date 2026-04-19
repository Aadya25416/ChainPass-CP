import { useEffect, useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { abi as CONTRACT_ABI, contractAddress as CONTRACT_ADDRESS } from '../abi'

export default function ReviewDropPanel({ eventId = 1 }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  const { isConnected } = useAccount()

  const { data: eventData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEvent',
    args: [BigInt(eventId)],
  })

  // We are mapping the Enter Lottery button to requestReviewDropWinner
  const {
    data: hash,
    error,
    isPending,
    writeContract,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const hasEventEnded = eventData ? now >= Number(eventData.eventEndTime) : false

  function handleTriggerWinner() {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'requestReviewDropWinner',
      args: [BigInt(eventId)],
    })
  }

  return (
    <div>
        <div className="lottery-panel">
            <div className="lottery-header">
                <div className="lottery-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="4" rx="1" ry="1"></rect><line x1="12" y1="8" x2="12" y2="21"></line><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                </div>
                <div className="lottery-cb">
                    <div className="lottery-cb-val">20%</div>
                    <div style={{fontSize: 9, letterSpacing:1, color:'var(--text)'}}>CASHBACK POOL</div>
                </div>
            </div>

            <h2 className="lottery-title">ReviewDrop <span>Lottery</span></h2>
            <p className="lottery-desc">Every review submitted within 24h of event completion is automatically entered into our <strong>Vault Pool</strong>. One lucky attendee wins their full ticket price back.</p>

            <div className="lottery-row">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 6, verticalAlign:'middle'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Lottery Closes In:</span>
                <span>04h 22m 18s</span>
            </div>
            <div className="lottery-row">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 6, verticalAlign:'middle'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Total Entries:</span>
                <span>1,204</span>
            </div>

            <div className="lottery-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffb300" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" fill="none" stroke="#ffb300" strokeWidth="2"></circle><line x1="12" y1="16" x2="12" y2="12" stroke="#ffb300" strokeWidth="2"></line><line x1="12" y1="8" x2="12.01" y2="8" stroke="#ffb300" strokeWidth="2"></line></svg>
                <span>Submitting your review unlocks your entry. Winners are notified via Aura Protocol dashboard and rewards are sent to the connected wallet.</span>
            </div>

            <button 
                className="lottery-btn"
                disabled={!isConnected || isPending || isConfirming || !hasEventEnded}
                onClick={handleTriggerWinner}
            >
                {isPending ? 'Confirming...' : isConfirming ? 'Waiting...' : 'Enter Lottery (Post-Review)'}
            </button>
            
            {hash && <p className="muted-text" style={{marginTop: 16, fontSize: 11}}>Hash: {hash}</p>}
            {error && <p className="error-text" style={{marginTop: 16}}>{error.shortMessage || error.message}</p>}
            {isSuccess && <p className="success-text" style={{marginTop: 16, color:'#00d2b4'}}>Lottery draw entry confirmed on-chain!</p>}
        </div>

        <div className="winners-panel">
            <div className="winners-title">RECENT WINNERS</div>
            <div className="winner-row">
                <div className="winner-avatar" style={{background: 'url("https://i.pravatar.cc/100?img=33") center/cover'}}></div>
                <div className="winner-info">
                   <span className="winner-address">0x4k...92f1</span>
                   <span className="winner-amount">WON 0.45 ETH</span>
                </div>
            </div>
            <div className="winner-row">
                <div className="winner-avatar" style={{background: 'url("https://i.pravatar.cc/100?img=47") center/cover'}}></div>
                <div className="winner-info">
                   <span className="winner-address">0x2a...c0d4</span>
                   <span className="winner-amount">WON 0.82 ETH</span>
                </div>
            </div>
        </div>
    </div>
  )
}
