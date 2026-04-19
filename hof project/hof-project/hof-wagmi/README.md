# ChainPass Frontend (React + Wagmi)

Basic Sepolia frontend for your deployed ChainPass contract.

## Included

- Wallet connect and disconnect (MetaMask and injected wallets)
- Contract reads
  - getTotalEvents
  - getTotalTicketsMinted
  - getEvent
  - getWalletTickets
- Contract writes
  - createEvent
  - buyTicket
  - listForResale
  - buyResaleTicket
  - cancelResaleListing
  - submitReview
  - requestReviewDropWinner
- Transaction status tracking with wallet + chain confirmation feedback

## Contract Configuration

The contract defaults are already set in env:

- Address: 0x448C46b41c7230DD351805AF370B348F02610284
- Chain: Sepolia (11155111)

You can update these in `.env.local`.

## Environment Variables

Create `.env.local` (already generated):

```bash
VITE_CHAINPASS_CONTRACT_ADDRESS=0x448C46b41c7230DD351805AF370B348F02610284
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Optional for future IPFS upload integration
VITE_PINATA_JWT=
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

## Run

```bash
npm install
npm run dev
```

## Build Check

```bash
npm run build
```

## Notes

- Use Sepolia ETH in MetaMask.
- If MetaMask is on a different chain, the UI warns you to switch.
- For buyTicket and buyResaleTicket, send enough ETH to satisfy contract requirements.
