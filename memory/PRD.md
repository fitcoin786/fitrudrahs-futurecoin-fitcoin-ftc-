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
- Payment Methods: USDT, SOL, FTC
- Admin Wallet: `A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG`
- **UPGRADE FUNCTIONALITY** - Users can submit upgrade requests
- **REAL-TIME ACTIVATION** - Subscription activates immediately after admin approval
- **SUBSCRIPTION-BASED TOOLS** - Different features unlock based on plan tier ✅
- **AUTO-GENERATED FTC WALLET ADDRESS** ✅
  - Unique 44-char Solana-style address generated on registration
  - Users can view, copy, and edit their wallet address

### 3. Admin Control Panel ✅
**Credentials**: FITRUDRAH / 786786 / 0000
- Approve/Reject subscriptions and upgrades
- View TX hashes for verification
- **ADMIN FEE COLLECTION WALLET** ✅ (NEW - March 28, 2026)
  - Wallet Address: `ADMIN_FTC_8x7K9mNpQ2rT5wYz3aB6cD4eF1gH0iJ`
  - Shows total fees collected and transaction count
  - Edit wallet address functionality
  - Fee history display

### 4. Transaction Fee System ✅ (NEW - March 28, 2026)
**Price Band Based Fees:**
- 1-100 FTC: 0.01%
- 101-1,000 FTC: 0.05%
- 1,001-10,000 FTC: 0.1%
- 10,001-100,000 FTC: 0.5%
- 100,001-1,000,000 FTC: 1%
- 1,000,001-10,000,000 FTC: 2%
- 10,000,001-100,000,000 FTC: 5%
- 100,000,001-1,000,000,000 FTC: 10%
- 1,000,000,001+ FTC: 15%

### 5. User-to-User Send FTC ✅ (NEW - March 28, 2026)
- Send FTC to another user by wallet address
- Real-time fee calculation
- Transaction history (sent/received)
- Fee automatically collected in admin wallet

### 6. Sports Nutrition Trading ✅
- 40 products with **GLOBAL REAL-TIME PRICES** ✅
- **PRICE IMPACT MODEL** ✅ - BUY/SELL affects global price
- **AI-POWERED TRADING SIGNALS** ✅ - BUY/HOLD/SELL recommendations
- **GLOBAL BLOCKCHAIN LEDGER** ✅ - ALL transactions visible worldwide (3-second polling)
- **FEE COLLECTION** on all trades ✅

## New APIs Added (March 28, 2026)
- `GET /api/admin/wallet` - Returns admin wallet info and total fees
- `PUT /api/admin/wallet` - Update admin wallet address
- `GET /api/admin/fee-history` - Returns fee collection history
- `GET /api/fee-calculator?amount=X` - Calculate fee for amount
- `POST /api/wallet/send-ftc` - Send FTC to another user
- `GET /api/wallet/transfers` - Get user's transfer history

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- External APIs: CoinGecko, Resend (Email OTPs)

## Upcoming Tasks (P1-P3)
- **P1: WebSockets** - Replace polling with real-time push
- **P3: Backend Refactoring** - Split server.py (2700+ lines)
- **P3: Frontend Refactoring** - Extract FtcMining.js subcomponents
- **P3: Leaderboard UI** - Display top FTC traders globally
