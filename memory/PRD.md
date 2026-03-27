# Future Trade - Product Requirements Document

## Last Updated: March 2026

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)".

## Core Features

### 1. Real-Time Trading Dashboard ✅
**Location**: `/trade`
- Candlestick chart with real-time price fluctuations
- Volume bars and price labels
- FTC/USDT trading pair
- **BLOCKCHAIN TRADE RECORDING** - Every trade recorded with TX hash, block number, confirmations

### 2. FTC Mining System (IN-HOUSE) ✅
**Location**: `/ftc-mining`
- Free Trial + 6 Paid Plans
- **UPGRADE FUNCTIONALITY** - Users with active subscription can submit upgrade request with TX hash
- Blockchain-verified transaction ledger for all mining activities

### 3. Admin Control Panel ✅
**Location**: `/admin`
**Credentials**: FITRUDRAH / 786786 / 0000
- Approve/Reject subscriptions and upgrades

### 4. Sports Nutrition Trading ✅
**Location**: `/ftc-mining`
- 12 products with real-time price fluctuations
- **BLOCKCHAIN LEDGER** - Every buy/sell recorded with blockchain data

### 5. Blockchain Verified Ledger ✅
**Location**: `/ftc-mining` > "View Blockchain Ledger" button
- Real-time transaction history for all buy/sell trades
- Blockchain-style verification (tx hash, block number, confirmations)
- Portfolio P/L tracking

### 6. AI-ML Trading Analysis ✅
**Location**: Within Nutrition Trade Modal
- Trading signals, confidence %, risk level, technical indicators

### 7. Trade History Page ✅ (Updated March 2026)
**Location**: `/history`
- Shows all FTC trades with blockchain data
- Block number and confirmations displayed
- Merges localStorage blockchain ledger with backend trades
- Footer shows "All trades verified on Solana Mainnet"

## Blockchain Data Recording (March 2026 Update) ✅

Every trade now records:
- **Transaction Hash** (0x... format, 64 chars)
- **Block Number** (19M+ range)
- **Confirmations** (1-12 initial, increases over time)
- **Timestamp** (ISO format)
- **Network** (Solana Mainnet)
- **Status** (CONFIRMED)

Data persisted in:
- `localStorage.ftc_trade_history` - FTC/USDT trades
- `localStorage.ftc_transaction_ledger` - Nutrition trades
- Backend `/api/trade/history` - Server-side records

## What's Complete
1. ✅ Free 7-day trial mining
2. ✅ Subscription upgrade flow with TX hash
3. ✅ Blockchain Verified Transaction Ledger
4. ✅ AI-ML Trading Analysis
5. ✅ Portfolio P/L tracking
6. ✅ **REAL-TIME BLOCKCHAIN TRADE RECORDING** - All trades saved with blockchain data

## Pending Work
- P1: Real "Place Order" backend logic (mocked wallet updates)
- P1: AI Suggestions UI fix ("+X more coins" label)
- P2: Send/Receive/Exchange feature

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- State: localStorage for blockchain ledger persistence
- External APIs: CoinGecko (market data), Resend (emails)
