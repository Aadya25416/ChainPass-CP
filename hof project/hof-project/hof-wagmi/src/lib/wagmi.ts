import { createConfig, http, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

const userRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL?.trim()

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [metaMask(), injected()],
  transports: {
    [sepolia.id]: userRpcUrl 
      ? http(userRpcUrl) 
      : fallback([
          http('https://ethereum-sepolia.gateway.tenderly.co'),
          http('https://sepolia.drpc.org'),
          http('https://rpc.sepolia.org'),
          http('https://ethereum-sepolia-rpc.publicnode.com')
        ]),
  },
})
