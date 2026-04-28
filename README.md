<div align="center">
  <img src="./public/nero_pay_to_message_logo.png" alt="Nero Pay-to-Message Logo" width="250" />
</div>

# Pay-to-Message - Nero Chain

Pay-to-Message is an EVM-powered decentralized application built with React, Vite, and Solidity. It lets a wallet owner set a price for incoming messages, send paid messages on the Nero Testnet, and inspect their inbox state, earnings, and message details through a sleek browser UI.

## What It Does

- Connects to MetaMask on the Nero Testnet.
- Lets a recipient set a per-message rate in Wei.
- Sends messages only when the attached native NERO payment meets the configured rate.
- Tracks message content, sender, recipient, payment, read status, and timestamp in a Solidity smart contract.
- Shows inbox, message lookup, rate, and earnings readouts from the contract.

## Project Structure

```text
.
├── src/                     # React app UI
├── lib/ethers.js            # Ethers.js contract helpers
├── contracts/               # Hardhat smart contract workspace
│   └── PayToMessage.sol     # Pay-to-message Solidity logic
├── scripts/
│   └── deploy.js            # Hardhat deployment script
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MetaMask browser extension
- A Nero Testnet account with testnet NERO for gas fees and payments

## Getting Started

1. Install frontend and blockchain dependencies:

```bash
npm install
```

2. Compile the Solidity smart contract:

```bash
npm run compile
```

3. Configure your `.env` file with a testnet wallet:

```bash
PRIVATE_KEY=your_private_key
```

4. Start the development app:

```bash
npm run dev
```

5. Open the local Vite URL shown in the terminal.

## Available Scripts

- `npm run dev` starts the development server.
- `npm run compile` compiles the Hardhat smart contracts.
- `npm run deploy` deploys the contract to the Nero Testnet.
- `npm run build` creates a production bundle.
- `npm run preview` serves the production build locally.

## How The App Works

The frontend in [src/App.jsx](src/App.jsx) has two main views:

- A landing page that explains the product and links to the app.
- An app dashboard where you can connect MetaMask, set a message rate, send a message, and inspect inbox data.

The helper functions in [lib/ethers.js](lib/ethers.js) connect the UI to the deployed Solidity contract at the configured contract address on Nero Testnet. The contract in [contracts/PayToMessage.sol](contracts/PayToMessage.sol) stores messages and enforces EVM payment rules.

## Contract Notes

The contract supports these actions:

- `setRate` stores the minimum payment for a recipient.
- `sendMessage` validates the `msg.value` payment, stores the message, and updates inbox and earnings data.
- `readMessage` marks a message as read (only callable by the recipient).
- `getMessage`, `listInbox`, `messageRates`, and `earnings` read contract state.

## Configuration

The app is currently wired to the Nero Testnet and uses the contract address defined in [lib/ethers.js](lib/ethers.js). If you deploy a new contract, update that value before running the app.

## Notes

- Message payments are tracked as native NERO value inside the contract.
- MetaMask must be unlocked and allowed access before write actions will work.
- The app expects the Nero Testnet network settings when signing and submitting transactions.

## Learn More

- [Nero Chain](https://nerochain.io)
- [Solidity Docs](https://soliditylang.org)
- [Ethers.js](https://docs.ethers.org/v6/)
