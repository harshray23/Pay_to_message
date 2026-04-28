# My Stellar App

Pay-To Message-Stellar-App
![Description of Image](./public/Screenshot%202026-04-08%20002715.png)

Contract Address- https://stellar.expert/explorer/testnet/contract/CCVVPZO3B4UYT6PDMSXZGTA57RLDJOR3MBNQ4IICJWTU3JD5H5OIHIRP


My Stellar App is a Soroban-powered pay-to-message demo built with React and Vite. It lets a wallet owner set a price for incoming messages, send paid messages on Stellar Testnet, and inspect inbox state, earnings, and message details through a browser UI.

## What It Does

- Connects to a Freighter wallet on Stellar Testnet.
- Lets a recipient set a per-message rate.
- Sends messages only when the attached payment meets the configured rate.
- Tracks message content, sender, recipient, payment, read status, and timestamp in Soroban contract storage.
- Shows inbox, message lookup, rate, and earnings readouts from the contract.

## Project Structure

```text
.
├── src/                     # React app UI
├── lib/stellar.js           # Stellar/Freighter contract helpers
├── contract/                # Soroban smart contract workspace
│   └── contracts/hello-world/
│       └── src/lib.rs       # Pay-to-message contract logic
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- Rust toolchain and Soroban CLI for contract work
- Freighter browser extension
- A Stellar Testnet account with a little XLM for fees

## Getting Started

1. Install frontend dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open the local Vite URL shown in the terminal.

## Available Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production bundle.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the workspace.

## How The App Works

The frontend in [src/App.jsx](src/App.jsx) has two main views:

- A landing page that explains the product and links to the app.
- An app dashboard where you can connect Freighter, set a message rate, send a message, and inspect inbox data.

The helper functions in [lib/stellar.js](lib/stellar.js) connect the UI to the Soroban contract at the configured contract ID on Testnet. The contract in [contract/contracts/hello-world/src/lib.rs](contract/contracts/hello-world/src/lib.rs) stores messages and enforces payment rules.

## Contract Notes

The contract supports these actions:

- `set_rate` stores the minimum payment for a recipient.
- `send_message` validates the payment, stores the message, and updates inbox and earnings data.
- `read_message` marks a message as read.
- `get_message`, `list_inbox`, `get_rate`, and `get_earnings` read contract state.

## Configuration

The app is currently wired to Testnet and uses the contract ID and demo address defined in [lib/stellar.js](lib/stellar.js). If you deploy a different contract, update those values before running the app.

## Notes

- Message payments are tracked as contract values rather than directly transferring XLM in the UI flow.
- Freighter must be unlocked and allowed access before write actions will work.
- The app expects Testnet network settings when signing and submitting transactions.

## Learn More

- [Stellar Developers](https://stellar.org/developers)
- [Soroban Docs](https://developers.stellar.org/docs/smart-contracts)
- [Freighter](https://freighter.app)
