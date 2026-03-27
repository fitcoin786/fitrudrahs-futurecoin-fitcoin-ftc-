# Future Trade - Product Requirements Document

## Last Updated: March 2026

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)".

## Core Features

### 1. Real-Time Trading Dashboard ✅
- Candlestick chart with real-time price fluctuations
- **BLOCKCHAIN TRADE LEDGER** - Every trade recorded with TX hash, block number, confirmations

### 2. FTC Mining System ✅
- Free Trial + 6 Paid Plans
- **UPGRADE FUNCTIONALITY** - Users can submit upgrade requests
- **REAL-TIME ACTIVATION** - Subscription activates immediately after admin approval

### 3. Admin Control Panel ✅
**Credentials**: FITRUDRAH / 786786 / 0000
- Approve/Reject subscriptions and upgrades
- View TX hashes for verification

### 4. Sports Nutrition Trading ✅
- 12 products with real-time prices
- Blockchain-verified transaction ledger

### 5. AI-ML Trading Analysis ✅
- Trading signals, confidence %, risk level

## Subscription & Admin Approval Flow (March 2026) ✅

### Complete Flow:
1. **User Submits** → Request created with status `pending`
2. **Pending State** → User sees "Awaiting admin activation" with Refresh button
3. **Auto-Polling** → Frontend polls every 10 seconds when pending
4. **Admin Approves** → Status changes to `active` immediately
5. **Real-Time Update** → User sees toast "🎉 Your subscription has been ACTIVATED!"
6. **Mining Available** → User can start mining immediately

### Features:
- ✅ TX hash saved with subscription request
- ✅ Admin sees TX hash for verification
- ✅ Auto-polling for pending subscriptions (10 second interval)
- ✅ Manual "Refresh Status" button
- ✅ Toast notification when activated
- ✅ Immediate status update after admin approval

## What's Complete
1. ✅ Subscription submission with TX hash
2. ✅ Admin approval process
3. ✅ Real-time activation (immediate status update)
4. ✅ Auto-polling for pending subscriptions
5. ✅ Refresh Status button
6. ✅ Activation toast notification
7. ✅ Blockchain Trade Ledger
8. ✅ Upgrade flow with TX hash

## Pending Work
- P1: Real "Place Order" backend logic
- P1: AI Suggestions UI fix
- P2: Send/Receive/Exchange feature

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- External APIs: CoinGecko, Resend
