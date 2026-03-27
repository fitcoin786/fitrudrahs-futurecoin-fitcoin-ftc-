# Future Trade - Product Requirements Document

## Original Problem Statement
Build a full-stack trading application called "Future Trade" for cryptocurrency "Fitcoin (FTC)" with contract address `5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`. The application should be similar to professional platforms like Bitget or Binance.

## Core Features

### 1. User Authentication
- **Status**: ✅ Complete
- Registration with email, password, full name
- Login with JWT tokens
- Protected routes
- Forgot Password with OTP via Resend email
- Reset Password flow

### 2. Trading Dashboard
- **Status**: ✅ Complete
- Real-time FTC/USD price display
- Birdeye.so iframe for live chart
- Buy/Sell order panel
- Order book with bids/asks
- Wallet balance display (USD/FTC)
- 24h and 60min volume fluctuation

### 3. Market Overview (Top Gainers/Losers/Trending)
- **Status**: ✅ Complete
- Real-time data from CoinGecko API
- **Fitcoin (FTC) included in Top Losers** - Always #1 with contract address

### 4. Advanced Crypto Search
- **Status**: ✅ Complete
- Search 10,000+ cryptocurrencies via CoinGecko
- AI Recommendations: Bitcoin, Ethereum, Solana, Fitcoin

### 5. Claim FTC Credit Page (FCOIN Blockchain Integration)
- **Status**: ✅ Complete
- **CONNECTED TO REAL FCOIN BLOCKCHAIN API**
- Login with FitWallet credentials
- Real-time blockchain data display

### 6. Landing Page
- **Status**: ✅ Complete
- Hero section with FTC branding
- **"Sports Nutrition Trading - Coming Soon" section**

### 7. Sports Nutrition Trading Marketplace - LIVE MODE ⭐
- **Status**: ✅ Complete (Mar 27, 2026)
- **Route**: `/nutrition-trading`

#### Features Implemented:
- **Real Intro Video**: VID-20251012-WA00032.mp4 with mute/unmute
- **18 premium sports nutrition products** with crypto-style trading
- **10,000 FTC first-time login bonus** (one-time only)
- **20% FTC holder exclusive discount**
- **Trading Mechanics**:
  - 100 units max per product
  - When 50 units sold → TRADING OPEN
  - Price increases 25% for remaining units

#### 🔗 FitWallet Integration (NEW - Mar 27, 2026):
- **Connect FitWallet** button with email/password login
- **Real-time Mining Wallet balance** from FitWallet (solana-fitness.emergent.host)
- **LIVE badge** when FitWallet is connected
- **Transfer FTC**:
  - From FitWallet (Mining) → Nutrition Wallet
  - From Nutrition Wallet → FitWallet (for withdrawal)
- **Transfer disabled** until FitWallet is connected
- **Blockchain Ledger** display
- **FTC Explorer** link (Solscan)

#### Wallet Flow:
```
Mine FTC (solana-fitness.emergent.host)
    ↓
FitWallet (Mining Wallet) 
    ↓ (Transfer)
Nutrition Wallet (for trading)
    ↓ (Transfer back)
FitWallet (for withdrawal)
```

### 8. Portfolio
- **Status**: ✅ Basic UI Complete

### 9. Trade History
- **Status**: ✅ Basic UI Complete

### 10. Send/Receive Feature
- **Status**: ⚠️ Placeholder only

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── NutritionTrading.js  # FitWallet integration
│   │   │   ├── ClaimFtcCredit.js
│   │   │   └── ...
│   │   └── App.js
│   └── .env
└── memory/
    └── PRD.md
```

## External Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| CoinGecko API | Live crypto data | ✅ Active |
| Birdeye.so | Chart iframe | ✅ Active |
| **FitWallet API** | Mining wallet integration | ✅ **NEW** |
| FCOIN Blockchain API | Real blockchain ledger | ✅ Active |
| Solscan | Blockchain explorer | ✅ Active |
| Resend | Email OTPs | ✅ Active |

## Recent Changes (Mar 27, 2026)

### FitWallet Integration (MAJOR UPDATE)
1. **Connect FitWallet** button in wallet modal
2. **Real Mining Wallet balance** from solana-fitness.emergent.host
3. **LIVE badge** when connected
4. **Transfer FTC** between wallets (From/To FitWallet)
5. **Transfer disabled** until FitWallet connected
6. **FitWallet address** display with copy function
7. **Disconnect** button to unlink FitWallet

### Previous Updates
- Real intro video with mute/unmute
- LIVE MODE badges throughout
- Wallet modal with dual balance display

## Pending/Future Work

### P0 - Critical
- [x] Sports Nutrition Trading Marketplace ✅
- [x] Real Intro Video ✅
- [x] Wallet Integration ✅
- [x] FitWallet Connection ✅

### P1 - High Priority
- [ ] Real Place Order functionality (MongoDB balance updates)
- [ ] AI Suggestions UI improvement (+X more coins)
- [ ] Send/Receive/Exchange backend logic

### P2 - Medium Priority
- [ ] Portfolio watchlist feature
- [ ] Refactor server.py into modules
- [ ] Backend integration for Nutrition Trading (global inventory)

### P3 - Low Priority
- [ ] Replace Birdeye iframe with native chart
- [ ] Refactor ClaimFtcCredit.js

## Test Reports
- `/app/test_reports/iteration_1.json` - FCOIN blockchain tests
- `/app/test_reports/iteration_2.json` - Sports Nutrition Trading tests
- `/app/test_reports/iteration_3.json` - Video + Wallet modal tests
- `/app/test_reports/iteration_4.json` - **FitWallet integration tests (100% pass)**

## API Endpoints Used

### FitWallet API (solana-fitness.emergent.host)
- `POST /api/auth/login` - Connect FitWallet
- `GET /api/wallet/balance` - Get mining wallet balance
- `POST /api/blockchain/send` - Transfer FTC out
- `POST /api/blockchain/receive` - Transfer FTC in
- `GET /api/blockchain/ledger` - Get transaction history
