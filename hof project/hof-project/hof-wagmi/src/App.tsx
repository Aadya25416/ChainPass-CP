import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Wallet from './components/Wallet'
import Dashboard from './components/Dashboard'
import EventsList from './components/EventsList'
import CreateEvent from './components/CreateEvent'
import BuyTicket from './components/BuyTicket'
import Resale from './components/Resale'
import Review from './components/Review'

import IntroAnimation from './components/IntroAnimation.tsx'
import HeroSection from './components/HeroSection.tsx'
import GateEntry from './components/GateEntry'
import VRFPanel from './components/VRFPanel'
import ReviewDropPanel from './components/ReviewDropPanel'

import './App.css'
import eventsData from './events-data.json'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'events',    label: 'Events' },
  { id: 'buy',       label: 'Tickets' },
  { id: 'resale',    label: 'Marketplace' },
  { id: 'reviews',   label: 'Reviews' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('Landing')
  const [introDone, setIntroDone] = useState(false)

  const renderContent = () => {
    if (activeTab === 'Landing') {
      return (
        <div className="tailwind-scope dark">
          <main className="relative min-h-screen w-full bg-background text-foreground">
            <HeroSection onExplore={() => setActiveTab('events')} />
            <AnimatePresence>
              {!introDone && <IntroAnimation onComplete={() => setIntroDone(true)} />}
            </AnimatePresence>
          </main>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="hp-trending-header">
               <div>
                  <div className="hp-trending-eyebrow">LIVE NOW</div>
                  <h2 className="hp-trending-title" style={{margin:0}}>Trending Events</h2>
               </div>
               <div className="hp-trending-link" onClick={() => setActiveTab('events')}>View All Events &rarr;</div>
            </div>

            <div className="hp-trending-grid">
              {eventsData.map((event) => {
                const getCategoryStyles = (categoryId) => {
                  switch (categoryId) {
                    case 1: return { badge: 'MUSIC', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }
                    case 2: return { badge: 'SPORTS', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }
                    case 3: return { badge: 'ART', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
                    default: return { badge: 'EVENT', background: 'linear-gradient(135deg, #6b7280, #374151)' }
                  }
                };
                const { badge, background } = getCategoryStyles(event.categoryId);
                
                return (
                  <div key={event.id} className="hp-event-card">
                    <div className="hp-event-card-img" style={{background}}>
                      <div className="hp-event-card-badge">{badge}</div>
                    </div>
                    <div className="hp-event-card-body">
                      <div className="hp-event-card-title">{event.title}</div>
                      <div className="hp-event-card-meta">📍 {event.location} &nbsp;·&nbsp; {event.date}</div>
                      <div className="hp-event-card-footer">
                        <span className="hp-event-card-price">{event.price}</span>
                        <button className="hp-event-card-btn" onClick={() => setActiveTab('buy')}>Buy Ticket</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-header" style={{marginTop: '60px', borderTop:'1px solid var(--border)', paddingTop:'40px'}}>
              <span className="eyebrow">Executive Overview</span>
              <h1>Protocol Dashboard</h1>
              <p className="subtitle">Monitor real-time event performance and cryptographic asset distribution across the Kinetic Vault.</p>
            </div>
            <div className="panel-grid">
              <Dashboard />
              <GateEntry />
              <VRFPanel />
            </div>
          </>
        )
      case 'events':
        return (
          <>
            <div className="events-top-search">
               <div className="et-search-bar">
                  <svg className="et-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search events, venues, or artists..." style={{background:'transparent', border:'none', width:'100%', color:'#fff', outline:'none'}} />
               </div>
               <button className="et-list-btn" onClick={() => setActiveTab('create')}>List Your Event</button>
            </div>

            <div className="events-top-banner">
               <div className="events-banner-pill">LIMITED ACCESS</div>
               <h1 className="events-banner-title">Unlock Exclusive<br/><span>Global Beats</span></h1>
               <p className="events-banner-desc">Experience the next generation of live entertainment with secure, blockchain-backed digital collectibles.</p>
               <div className="events-banner-bg"></div>
            </div>

            {/* WRAPPING ORIGINAL EVENTS LIST HERE! */}
            <EventsList />
          </>
        )
      case 'reviews':
        return (
          <div className="my-tickets-container">
            <div className="my-tickets-layout">
              {/* WRAPPING ORIGINAL REVIEW PANEL HERE! */}
              <Review />
              <ReviewDropPanel />
            </div>

            <div className="digital-souvenirs">
              <div className="ds-header">
                <div>
                   <h2>Digital Souvenirs</h2>
                   <p className="muted-text">Unlock these by completing your review profile.</p>
                </div>
                <button className="btn-analytics" style={{color: '#00e5ff', display:'flex', alignItems:'center', gap: 6}}>View Gallery &rarr;</button>
              </div>
              <div className="ds-gallery"></div>
            </div>

            <div className="nft-locker-section">
               <div className="nft-locker-header">
                  <div>
                     <h1 className="nft-locker-title">NFT Locker</h1>
                     <p className="nft-locker-subtitle">Verified ownership of your digital souvenirs and access passes.</p>
                  </div>
                  <div className="nft-locker-stats">
                     <div className="nft-stat-box">
                        <div className="nft-stat-val">12</div>
                        <div className="nft-stat-label">TOTAL ASSETS</div>
                     </div>
                     <div className="nft-stat-box">
                        <div className="nft-stat-val pink">3</div>
                        <div className="nft-stat-label">LIVE PASSES</div>
                     </div>
                  </div>
               </div>

               <div className="nft-filters-row">
                  <div className="nft-pills">
                     <button className="nft-pill-btn active">All Tickets</button>
                     <button className="nft-pill-btn">Upcoming</button>
                     <button className="nft-pill-btn">Live Events</button>
                     <button className="nft-pill-btn">Attended</button>
                  </div>
                  <div className="nft-search">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                     <input type="text" placeholder="Search collection..." />
                  </div>
               </div>

               <div className="nft-grid"></div>

               <div className="kinetic-banner">
                  <div className="kinetic-left">
                     <div className="kinetic-pill">PLATINUM COLLECTION</div>
                     <h2 className="kinetic-title">The Kinetic Vault<br/><span>Signature Artifacts</span></h2>
                     <p className="kinetic-desc">Your attended events aren't just memories; they're tradeable assets. Level up your profile by collecting rare event participation badges.</p>
                     <div className="kinetic-actions">
                        <button className="kinetic-btn-1" onClick={() => setActiveTab('resale')}>Explore Marketplace</button>
                        <button className="kinetic-btn-2">View Leaderboard</button>
                     </div>
                  </div>
                  <div className="kinetic-graphic"></div>
               </div>
            </div>
          </div>
        )
      case 'resale':
        return (
          <>
            <div className="rm-hero">
               <div className="rm-hero-left">
                  <div className="rm-protected-pill">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                     PROTECTED ZONE
                  </div>
                  <h1 className="rm-hero-title">Fair Resale Market</h1>
                  <p className="rm-hero-desc">Welcome to the Sovereign Secondary Market. To prevent scalping and ensure fair access, all ticket resales are strictly capped at <strong>110% of the original price</strong>. Secure, kinetic, and verified on-chain.</p>
               </div>
               <div className="rm-rule-box">
                  <div className="rm-rule-header">
                     PROTOCOL RULE
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                  <div className="rm-rule-value">Max 110%</div>
                  <div className="rm-rule-sub">Price Cap Enforced On-Chain</div>
                  <div className="rm-rule-footer">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                     Organiser receives 5% royalties automatically
                  </div>
               </div>
            </div>

            <div className="rm-grid"></div>

            <div className="section-header" style={{marginTop: '20px', borderTop:'1px solid var(--border)', paddingTop:'40px'}}>
               <span className="eyebrow">YOUR LISTINGS</span>
               <h1>Create Secondary Listing</h1>
               <p className="subtitle">Select one of your existing digital souvenirs to authenticate and list securely on-chain.</p>
            </div>
            <div className="panel-grid">
               {/* WRAPPING ORIGINAL RESALE PANEL HERE! */}
               <Resale />
            </div>

            <div className="rm-footer">
               <div className="rm-footer-logo">ChainPass</div>
               <div className="rm-footer-links">
                  <div className="rm-footer-link">SMART CONTRACTS</div>
                  <div className="rm-footer-link">TRANSPARENCY REPORT</div>
                  <div className="rm-footer-link">TERMS OF ENTRY</div>
                  <div className="rm-footer-link">SUPPORT</div>
               </div>
               <div className="rm-footer-copy">© 2026 CHAINPASS. SECURE. KINETIC. SOVEREIGN.</div>
            </div>
          </>
        )
      case 'create':
        return (
          <>
            <div className="section-header">
              <h1>Launch New Event</h1>
              <p className="subtitle">Draft a new event in the vault and configure digital souvenirs.</p>
            </div>
            <div className="panel-grid single-col">
              <CreateEvent />
            </div>
          </>
        )
      case 'buy':
        return (
          <>
            <div className="section-header">
              <h1>Buy Tickets</h1>
            </div>
            <div className="panel-grid">
              <BuyTicket />
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (activeTab === 'Landing') {
     return renderContent();
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">ChainPass</div>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-icon">⚡</div>
          <div className="profile-text">
            <div className="profile-name">Aura Protocol</div>
            <div className="profile-sub">KINETIC VAULT</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-actions">
          <button className="create-event-btn" onClick={() => setActiveTab('create')}>
            + Create Event
          </button>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </button>
          <button className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Support
          </button>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="topbar-left">
             <div className="mobile-logo logo">ChainPass</div>
             <div className="topbar-links">
                {TABS.map(tab => (
                  <button key={tab.id} className={`topbar-link ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                    {tab.label}
                  </button>
                ))}
             </div>
          </div>
          <div className="topbar-right">
             <Wallet />
          </div>
        </header>

        <div className="scroll-area">
          <div className="content-container">
            {renderContent()}
          </div>
        </div>
      </section>
    </main>
  )
}
