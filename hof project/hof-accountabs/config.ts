import { sepolia } from 'viem/chains'

/**
 * ChainPass AA config.
 *
 * Required .env values (set these in the app that imports this module):
 * - VITE_PIMLICO_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=...
 * - VITE_PIMLICO_PAYMASTER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=...
 * - VITE_CHAINPASS_CONTRACT_ADDRESS=0x...
 * - VITE_SEPOLIA_RPC_URL=https://...
 *
 * Paymaster funding note:
 * The paymaster is funded by the platform/developer in Pimlico dashboard.
 * Sponsorship is NOT automatic and will fail if sponsor balance is empty.
 * In production, sponsorship cost is typically recovered via app/platform fees.
 */
function requireEnv(name: string): string {
  const value = (import.meta.env[name] as string | undefined)?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const aaConfig = {
  chain: sepolia,
  chainId: sepolia.id,
  entryPointVersion: '0.7' as const,
  bundlerUrl: requireEnv('VITE_PIMLICO_BUNDLER_URL'),
  paymasterUrl: requireEnv('VITE_PIMLICO_PAYMASTER_URL'),
  rpcUrl: requireEnv('VITE_SEPOLIA_RPC_URL'),
  contractAddress: requireEnv('VITE_CHAINPASS_CONTRACT_ADDRESS') as `0x${string}`,
}

export const chainPassAbi = [
  {
    type: 'function',
    name: 'buyTicket',
    stateMutability: 'payable',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'createEvent',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'p',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'venue', type: 'string' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'maxSupply', type: 'uint256' },
          { name: 'saleStartTime', type: 'uint256' },
          { name: 'saleEndTime', type: 'uint256' },
          { name: 'eventStartTime', type: 'uint256' },
          { name: 'eventEndTime', type: 'uint256' },
        ],
      },
    ],
    outputs: [{ name: 'eventId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'listForResale',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'resalePrice', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'buyResaleTicket',
    stateMutability: 'payable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'cancelResaleListing',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'submitReview',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'contentHash', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'requestReviewDropWinner',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [],
  },
] as const
