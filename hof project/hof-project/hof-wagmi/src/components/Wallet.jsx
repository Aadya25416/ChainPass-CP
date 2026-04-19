import { useAccount, useConnect, useDisconnect } from 'wagmi'

const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

export default function Wallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="wallet-bar">
        <span className="wallet-badge">
          <span className="wallet-dot" aria-hidden="true" />
          {shorten(address)}
        </span>
        <button
          id="btn-disconnect"
          className="btn btn-outline-sm"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <button
        id="btn-connect"
        className="btn btn-primary"
        onClick={() => {
          const targetConnector = connectors.find(c => c.id === 'injected' || c.id === 'metaMask') || connectors[0];
          if (targetConnector) connect({ connector: targetConnector });
        }}
        disabled={isPending}
      >
        {isPending ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error.shortMessage || error.message}</span>}
    </div>
  )
}
