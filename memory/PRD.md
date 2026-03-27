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
- Top Gainers tab with real crypto data
- Top Losers tab with real crypto data (Fitcoin first)
- Trending tab with top coins by market cap
- Clickable coins open details view

### 4. Advanced Crypto Search
- **Status**: ✅ Complete
- Search 10,000+ cryptocurrencies via CoinGecko
- **Fitcoin searchable by**: name, symbol (FTC), contract address
- AI Recommendations: Bitcoin, Ethereum, Solana, Fitcoin
- Detailed view on click with price, market cap, volume, blockchain info

### 5. Claim FTC Credit Page (FCOIN Blockchain Integration)
- **Status**: ✅ Complete
- **CONNECTED TO REAL FCOIN BLOCKCHAIN API**
- Login with FitWallet credentials
- Real-time blockchain data display
- Health-based FTC calculator
- Send/Exchange FTC functionality

### 6. Landing Page
- **Status**: ✅ Complete (Updated Mar 27, 2026)
- Hero section with FTC branding
- "Health Is Wealth" AI button
- "Mine Fitcoin" section
- **"Sports Nutrition Trading - Coming Soon" section**
- "Alpha Radar" section
- Photo links grid
- FiTOwlSiRinG section
- Special offers and FAQ

### 7. Sports Nutrition Trading Marketplace - LIVE MODE
- **Status**: ✅ Complete (Mar 27, 2026)
- **Route**: `/nutrition-trading`

#### Features Implemented:
- **Real Intro Video**: VID-20251012-WA00032.mp4 with mute/unmute control
- **18 premium sports nutrition products** with crypto-style trading
- **10,000 FTC first-time login bonus** (one-time only)
- **20% FTC holder exclusive discount** on all products
- **Trading Mechanics**:
  - 100 units max per product
  - When 50 units sold → TRADING OPEN (user-to-user selling unlocks)
  - Price increases 25% for remaining base units after 50 sold
  - Real-time price fluctuation for trading-open products
- **Category Filters**: Protein, Creatine, Pre-Workout, Vitamins, Gainer, Amino, Fat Burner, Recovery, Health Food, Ayurveda, Beauty
- **Grid/List view modes**, Search, Sort (Popular, Price, Rating, Sold)

#### Wallet Integration:
- **Wallet Modal** with dual balance display:
  - Nutrition Wallet (local FTC balance)
  - Mining Wallet (from FTC Mining App)
- **Wallet Address** generation with copy function
- **Transfer FTC** between Mining Wallet and Nutrition Wallet
- **FCOIN Blockchain Explorer** link (Solscan)
- **"Need More FTC?"** section linking to Mining App

#### Current Mode:
- **LIVE MODE** (uses localStorage for demo purposes)
- FTC balance stored in `localStorage.ftc_nutrition_balance`
- Holdings stored in `localStorage.ftc_nutrition_holdings`
- First-time bonus flag in `localStorage.ftc_nutrition_bonus_received`

### 8. Portfolio
- **Status**: ✅ Basic UI Complete
- Shows user wallet balances

### 9. Trade History
- **Status**: ✅ Basic UI Complete
- Shows user's past orders

### 10. Send/Receive Feature
- **Status**: ⚠️ Placeholder only
- UI exists but blockchain integration pending

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py        # FastAPI with async CoinGecko integration
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js       # Updated with Nutrition Coming Soon
│   │   │   ├── TradingDashboard.js
│   │   │   ├── MarketOverview.js
│   │   │   ├── CryptoSearch.js
│   │   │   ├── ClaimFtcCredit.js    # FCOIN blockchain integration
│   │   │   ├── NutritionTrading.js  # UPDATED: Video + Wallet integration
│   │   │   ├── Portfolio.js
│   │   │   ├── TradeHistory.js
│   │   │   └── SendReceive.js
│   │   └── App.js
│   └── .env
└── memory/
    └── PRD.md
```

## API Endpoints

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/auth/register` | POST | ✅ | User registration |
| `/api/auth/login` | POST | ✅ | User login |
| `/api/auth/me` | GET | ✅ | Get current user |
| `/api/auth/forgot-password` | POST | ✅ | Send OTP to email |
| `/api/auth/verify-otp` | POST | ✅ | Verify OTP code |
| `/api/auth/reset-password` | POST | ✅ | Reset password with OTP |
| `/api/auth/change-password` | POST | ✅ | Change password (logged-in) |
| `/api/wallet` | GET | ✅ | Get wallet balance |
| `/api/price/fitcoin` | GET | ✅ | Get FTC price |
| `/api/market/overview` | GET | ✅ | Get gainers/losers(+FTC)/trending |
| `/api/crypto/search` | GET | ✅ | Search cryptos + Fitcoin |
| `/api/crypto/details/{id}` | GET | ✅ | Get crypto details |
| `/api/trade` | POST | ✅ | Execute trade |
| `/api/trade/history` | GET | ✅ | Get trade history |
| `/api/orderbook` | GET | ✅ | Get order book |

## External Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| CoinGecko API | Live crypto data | ✅ Active |
| Birdeye.so | Chart iframe | ✅ Active |
| FCOIN Blockchain API | Real blockchain ledger | ✅ Active |
| Solscan | Blockchain explorer | ✅ Active |
| Resend | Email OTPs | ✅ Active |

## Recent Changes (Mar 27, 2026)

### Nutrition Trading - Major Update
1. **Real Intro Video** added with mute/unmute button
2. **LIVE MODE** badge throughout (header, banner, footer)
3. **Wallet Modal** with:
   - Dual balance display (Nutrition + Mining)
   - Wallet address with copy function
   - Transfer FTC functionality (From/To Mining)
   - Blockchain Ledger section
   - Mine FTC and FTC Explorer quick links
4. **Footer** updated with wallet button and contract address
5. **"Need More FTC?" section** linking to FTC Mining App

## Pending/Future Work

### P0 - Critical
- [x] Sports Nutrition Trading Marketplace ✅ DONE
- [x] Real Intro Video ✅ DONE
- [x] Wallet Integration ✅ DONE

### P1 - High Priority
- [ ] Real Place Order functionality (update balances in MongoDB)
- [ ] AI Suggestions UI improvement (+X more coins indicator)
- [ ] Send/Receive/Exchange backend logic

### P2 - Medium Priority
- [ ] Portfolio watchlist feature
- [ ] Refactor server.py into modules
- [ ] Backend integration for Nutrition Trading (global inventory)

### P3 - Low Priority
- [ ] Replace Birdeye iframe with native chart library
- [ ] Refactor ClaimFtcCredit.js (1100+ lines)

## Test Reports
- `/app/test_reports/iteration_1.json` - FCOIN blockchain integration tests
- `/app/test_reports/iteration_2.json` - Sports Nutrition Trading tests
- `/app/test_reports/iteration_3.json` - Video + Wallet modal tests (100% pass)

## Demo/MOCKED Features Note
The Sports Nutrition Trading feature uses **MOCKED** transfer functionality:
- FTC transfers are simulated locally (no actual blockchain transaction)
- FTC balance stored in localStorage
- Wallet address generated from user email
- For production, backend APIs needed for real transfers via FCOIN blockchain
