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
- Payment Methods: USDT, SOL, FTC
- Admin Wallet: `A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG`
- **AUTO-GENERATED FTC WALLET ADDRESS** ✅
- **HEADER NAVIGATION** ✅ (NEW - March 29)
  - Mining, Plans, Wallet, Ledger, Admin buttons
  - User Profile button (shows name and initial)
  - FTC Balance display

### 3. Admin Control Panel ✅
**Credentials**: FITRUDRAH / 786786 / 0000
- Approve/Reject subscriptions and upgrades
- View TX hashes for verification
- **ADMIN FEE COLLECTION WALLET** ✅
  - Wallet Address: `ADMIN_FTC_8x7K9mNpQ2rT5wYz3aB6cD4eF1gH0iJ`
  - **ADMIN SEND FTC** ✅ (NEW - March 29) - Send FTC to any user (no fee)
  - Shows total fees collected and transaction count
  - Admin transfer history display

### 4. Transaction Fee System ✅
**Price Band Based Fees:**
- 1-100 FTC: 0.01%
- 101-1,000 FTC: 0.05%
- Up to 1B+ FTC: 15%

### 5. User-to-User Send FTC ✅
- Send FTC via recipient's wallet address
- Real-time fee calculation
- Transfer history (sent/received)

### 6. Global Blockchain Ledger ✅ (ENHANCED - March 29)
- **ALL transactions from ALL users** visible globally
- **Transaction Types**: BUY, SELL, SEND, ADMIN_SEND
- **Wallet Addresses**: Shows sender/receiver for transfers
- **Fee Display**: Shows fee amount on each transaction
- **Double-tap for Details** ✅ - Full transaction details modal
  - TX Hash, Block Number, Confirmations
  - Sender/Receiver info with wallet addresses
  - Price info, timestamp
  - Network: Solana Mainnet
- **3-second Real-time Polling**
- Stats: volume_24h, buy_count, sell_count, send_count, admin_send_count

## APIs
- `POST /api/admin/send-ftc` - Admin sends FTC to user (NEW)
- `GET /api/admin/transfers` - Admin transfer history (NEW)
- `GET /api/global/ledger-details/{tx_id}` - Transaction details (NEW)
- `GET /api/nutrition/global-ledger` - Global ledger with enhanced stats

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- External APIs: CoinGecko, Resend (Email OTPs)

## Upcoming Tasks (P1-P3)
- **P1: WebSockets** - Replace polling with real-time push
- **P3: Backend Refactoring** - Split server.py (3300+ lines)
- **P3: Frontend Refactoring** - Extract FtcMining.js subcomponents
- **P3: Leaderboard UI** - Display top FTC traders globally
