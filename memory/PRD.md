# Future Trade - Product Requirements Document

## Last Updated: March 28, 2026

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)". Features include real-time crypto trading, in-house "Web5 Hacker theme" mining page (1 calorie burned = 1 FTC), mining subscription tiers, "Raw Materials Global Trading" (Whey Protein, Creatine, etc.) traded using FTC, and an Admin Panel to approve mining subscriptions.

## Core Features

### 1. Real-Time Trading Dashboard ✅
- Candlestick chart with real-time price fluctuations
- **BLOCKCHAIN TRADE LEDGER** - Every trade recorded with TX hash, block number, confirmations
- **Place Order** - Fully functional BUY/SELL with balance validation ✅

### 2. FTC Mining System ✅
- **2026 EXCLUSIVE SUBSCRIPTION PLANS** - 12 plans from $50 to $5000 ✅
  - Starter 2026 ($50), Basic 2026 ($100), Standard 2026 ($200)
  - Pro 2026 ($350), Elite 2026 ($500), Ultra 2026 ($750)
  - Mega 2026 ($1000), Supreme 2026 ($1500), Titan 2026 ($2000)
  - Legend 2026 ($3000), Immortal 2026 ($4000), GOD MODE 2026 ($5000)
- Payment Methods: USDT, SOL, FTC
- Admin Wallet: `A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG`
- **UPGRADE FUNCTIONALITY** - Users can submit upgrade requests
- **REAL-TIME ACTIVATION** - Subscription activates immediately after admin approval

### 3. Admin Control Panel ✅
**Credentials**: FITRUDRAH / 786786 / 0000
- Approve/Reject subscriptions and upgrades
- View TX hashes for verification

### 4. Sports Nutrition Trading ✅
- 30+ products with real-time prices
- Double-tap detailed view modal
- Blockchain-verified transaction ledger

### 5. AI-ML Trading Analysis ✅
- Trading signals, confidence %, risk level
- "+X more coins" UI for suggestions ✅

### 6. Global FTC State ✅
- FTC price and volume synced globally across all users
- Updates every 3 seconds

## Subscription & Admin Approval Flow ✅

### Complete Flow:
1. **User Submits** → Request created with status `pending`
2. **Pending State** → User sees "Awaiting admin activation" with Refresh button
3. **Auto-Polling** → Frontend polls every 10 seconds when pending
4. **Admin Approves** → Status changes to `active` immediately
5. **Real-Time Update** → User sees toast notification
6. **Mining Available** → User can start mining immediately

## What's Complete (March 2026)
1. ✅ 2026 Exclusive Subscription Plans (12 tiers, $50-$5000)
2. ✅ Payment modal with wallet addresses (USDT/SOL/FTC)
3. ✅ Place Order functionality (real balance updates)
4. ✅ AI Suggestions UI with "+X more coins"
5. ✅ Subscription submission with TX hash
6. ✅ Admin approval process
7. ✅ Real-time activation (immediate status update)
8. ✅ Auto-polling for pending subscriptions
9. ✅ Blockchain Trade Ledger
10. ✅ Upgrade flow with TX hash
11. ✅ Global FTC price/volume sync

## Upcoming Tasks
- P1: WebSockets for true real-time updates (replacing 10s polling)
- P2: Send/Receive/Exchange feature implementation
- P2: Smart Alerts system (price alerts, profit targets)

## Future/Backlog
- P3: Refactor Backend Monolith `server.py` (>2200 lines - split into routers)
- P3: Extract subcomponents from `FtcMining.js` (>2600 lines)
- P3: Leaderboard UI for top FTC traders

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- External APIs: CoinGecko, Resend (Email OTPs)

## Key API Endpoints
- `/api/mining/subscribe` - Handles both new and upgrade requests
- `/api/admin/activate-subscription` - Handles activation
- `/api/market/ftc-price` - Global FTC price sync
- `/api/trade` - Place orders (BUY/SELL)
- `/api/ai/suggestions` - AI trading recommendations
