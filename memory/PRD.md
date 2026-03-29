# Future Trade - Product Requirements Document

## Last Updated: March 29, 2026

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)". Features include real-time crypto trading, in-house "Web5 Hacker theme" mining page (1 calorie burned = 1 FTC), mining subscription tiers, "Raw Materials Global Trading" (Whey Protein, Creatine, etc.) traded using FTC, and an Admin Panel to approve mining subscriptions.

## Core Features

### 1. Real-Time Trading Dashboard ✅
- Candlestick chart with real-time price fluctuations
- **BLOCKCHAIN TRADE LEDGER** - Every trade recorded with TX hash, block number, confirmations
- **Place Order** - Fully functional BUY/SELL with balance validation ✅

### 2. FTC Mining System ✅
- **2026 EXCLUSIVE SUBSCRIPTION PLANS** - 12 plans from $50 to $5000 ✅
- **PERSISTENT MINING** ✅ (March 29, 2026)
  - Mining NEVER stops - continues even if user closes page, refreshes, changes section
  - Mining sessions stored in database
  - Only stops when subscription expires
  - Frontend syncs with backend every 2 seconds
- **SUBSCRIPTION-BASED BOOST** ✅ (March 29, 2026)
  - 13 tiers (0-12) with different boost configurations:
    - Tier 0 (Free): 0.001 rate, 5s boost, 1.5x multiplier
    - Tier 6 (Ultra): 0.008 rate, 20s boost, 3.0x multiplier
    - Tier 12 (GOD MODE): 0.030 rate, 120s boost, 10.0x multiplier
- **REAL-TIME VISUAL ANIMATION FIX** ✅ (March 29, 2026 - Session 2)
  - Fixed stale closure issue in setInterval mining animation
  - Added useRef hooks (isBoostedRef, boostConfigRef) that sync with state
  - UI animation updates every 100ms smoothly
  - Boost tap works - shows countdown and increased speed
  - All testing passed: 9/9 features verified by testing agent

### 3. Admin Control Panel ✅
**Credentials**: FITRUDRAH / 786786 / 0000
- **ADMIN SEND FTC** ✅ - Send FTC to any user from admin wallet (no fee)
- **FEE COLLECTION WALLET** ✅ - Collects all transaction fees

### 4. Transaction System ✅
- **User→Admin**: Fees from all trades
- **User→User**: Send FTC with fee (0.01%-15% based on amount)
- **Admin→User**: Send FTC (no fee)
- **Global Blockchain Ledger**: All transactions visible

### 5. Header Navigation ✅
- Mining | Plans | Wallet | Ledger | Admin buttons
- User Profile with name and balance

## Mining APIs (NEW - March 29)
- `POST /api/mining/start-session` - Start persistent mining
- `POST /api/mining/sync-session` - Sync mining progress
- `POST /api/mining/activate-boost` - Activate speed boost
- `GET /api/mining/session` - Get current session status

## Boost Config Per Tier
| Tier | Plan | Mining Rate | Boost Duration | Multiplier | Cooldown | Daily Limit |
|------|------|-------------|----------------|------------|----------|-------------|
| 0 | Free | 0.001/s | 5s | 1.5x | 60s | 100 FTC |
| 6 | Ultra | 0.008/s | 20s | 3.0x | 25s | 5000 FTC |
| 12 | GOD | 0.030/s | 120s | 10.0x | 0s | Unlimited |

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion
- Backend: FastAPI, MongoDB
- External: CoinGecko, Resend

## Upcoming Tasks
- **P1**: WebSockets (replace polling)
- **P3**: Code refactoring
