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
- **NEW: "Sports Nutrition Trading - Coming Soon" section**
- "Alpha Radar" section
- Photo links grid
- FiTOwlSiRinG section
- Special offers and FAQ

### 7. Sports Nutrition Trading Marketplace (NEW)
- **Status**: ✅ Complete (Mar 27, 2026)
- **Route**: `/nutrition-trading`
- 18 premium sports nutrition products
- Crypto-style trading mechanics
- **10,000 FTC first-time login bonus** (one-time only)
- **20% FTC holder exclusive discount**
- 100 units max per product
- When 50 units sold → TRADING OPEN (user-to-user selling unlocks)
- Price increases 25% for remaining base units after 50 sold
- Categories: Protein, Creatine, Pre-Workout, Vitamins, etc.
- Grid/List view modes
- Search and filter functionality
- Real-time price fluctuation for trading-open products
- **Demo Mode**: Uses localStorage for balances and holdings
- "Need More FTC?" section with mining redirect

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
│   │   │   ├── NutritionTrading.js  # NEW: Sports Nutrition Trading
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

## Recent Changes (Mar 27, 2026)

### Sports Nutrition Trading Marketplace (NEW FEATURE)
- Added `/nutrition-trading` route to App.js
- Created NutritionTrading.js with:
  - 18 hardcoded Nutrabay-style products
  - Intro modal with animated badges
  - FTC price ticker with real-time fluctuation
  - Category filtering (12 categories)
  - Search by product name/brand
  - Grid/List view toggle
  - Sort options (Popular, Price, Rating, Sold)
  - Trading mechanics: 
    - 100 units max per product
    - After 50 sold: TRADING OPEN badge, 25% price increase
    - Price fluctuation for open-trading products
  - Buy/Sell modals with quantity controls
  - "Need More FTC?" section linking to mining app
  - Footer with mining and home links

### Landing Page Updates
- Added "Sports Nutrition Trading - Coming Soon" section
- 10,000 FTC Bonus and 20% FTC Discount badges
- "Preview Nutrition Trading" button linking to /nutrition-trading

## Pending/Future Work

### P0 - Critical
- [x] Sports Nutrition Trading Marketplace ✅ DONE (Mar 27)

### P1 - High Priority
- [ ] AI Suggestions UI improvement (+X more coins indicator)
- [ ] Real Place Order functionality (update balances)
- [ ] Send/Receive/Exchange backend logic

### P2 - Medium Priority
- [ ] Intro video on landing page (proper video upload)
- [ ] Portfolio watchlist feature
- [ ] Refactor server.py into modules

### P3 - Low Priority
- [ ] Replace Birdeye iframe with native chart library
- [ ] Refactor ClaimFtcCredit.js (1100+ lines)
- [ ] Backend integration for Nutrition Trading (global inventory)

## Test Reports
- `/app/test_reports/iteration_1.json` - FCOIN blockchain integration tests
- `/app/test_reports/iteration_2.json` - Sports Nutrition Trading tests (100% pass)

## Demo Mode Note
The Sports Nutrition Trading feature operates in **DEMO MODE**:
- FTC balance stored in localStorage (`ftc_nutrition_balance`)
- Product holdings stored in localStorage (`ftc_nutrition_holdings`)
- First-time bonus flag in localStorage (`ftc_nutrition_bonus_received`)
- Products are hardcoded (not fetched from backend)

For production, backend APIs needed for:
- Global inventory tracking (100 units per product across all users)
- User-to-user trading when 50+ units sold
- FTC balance sync with main wallet
