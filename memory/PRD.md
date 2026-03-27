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
- New meditation Fitcoin logo

### 2. FTC Mining System (IN-HOUSE) ✅
**Location**: `/ftc-mining`
**Plans**:
- **FREE TRIAL** - 7 days, 100 FTC/day, no payment required, admin approval only
- Basic Miner - $5/1500 FTC, 500 FTC/day
- Standard Miner - $9/2500 FTC, 1000 FTC/day
- Pro Miner - $15/4000 FTC, 2000 FTC/day
- Elite Miner - $20/5500 FTC, 3000 FTC/day
- Ultra Miner - $30/8000 FTC, 5000 FTC/day
- Max Miner - $50/12000 FTC, 10000 FTC/day

**Features**:
- New meditation Fitcoin logo
- 5-second BOOST mode
- Transaction hash for paid plans
- Free trial needs only admin approval

### 3. Admin Control Panel ✅
**Location**: `/admin`
**Credentials**: FITRUDRAH / 786786 / 0000
- View FREE TRIAL requests (no hash needed)
- Approve/Reject subscriptions
- Shows "FREE TRIAL" badge for free requests

### 4. Sports Nutrition Trading ✅ (NEW)
**Location**: `/ftc-mining` (within Mining page)
- 12 raw material products with real-time price fluctuations
- Trade using mined FTC balance
- Live mini-charts on each product card

### 5. Blockchain Verified Ledger ✅ (NEW - March 2026)
**Location**: `/ftc-mining` > "View Blockchain Ledger" button
- Real-time transaction history for all buy/sell trades
- Blockchain-style verification (tx hash, block number, confirmations)
- Portfolio summary: Total Holdings, Total Invested, Unrealized P/L, Total Transactions
- Active Holdings section with per-product P/L tracking
- All data persists in localStorage

### 6. AI-ML Trading Analysis ✅ (NEW - March 2026)
**Location**: Within Nutrition Trade Modal
- Trading signals: STRONG BUY / BUY / HOLD / SELL / STRONG SELL
- Confidence percentage (65-95%)
- Risk assessment: LOW / MEDIUM / HIGH
- Technical indicators: RSI, MACD, Sentiment (Bullish/Bearish)
- Target price predictions

## What's Complete
1. ✅ Free 7-day trial mining option
2. ✅ Free trial first in plan list
3. ✅ No payment/transaction hash for free trial
4. ✅ Admin sees "FREE TRIAL" badge
5. ✅ New meditation Fitcoin logo everywhere
6. ✅ Candlestick trading chart
7. ✅ Sports Nutrition Trading with real-time prices
8. ✅ Blockchain Verified Transaction Ledger
9. ✅ AI-ML Trading Analysis panel
10. ✅ Portfolio P/L tracking with localStorage persistence
11. ✅ Product cards show user holdings with P/L

## Pending Work
- P1: Real "Place Order" backend logic (currently mocked)
- P1: AI Suggestions UI fix ("+X more coins" label)
- P2: Send/Receive/Exchange feature implementation

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- State: localStorage for portfolio/ledger persistence
- External APIs: CoinGecko (market data), Resend (emails)
