# Future Trade - Product Requirements Document

## Original Problem Statement
Build a full-stack trading application called "Future Trade" for cryptocurrency "Fitcoin (FTC)" with contract address `5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`. The application should be similar to professional platforms like Bitget or Binance.

## Core Features

### 1. User Authentication
- **Status**: ✅ Complete
- Registration with email, password, full name
- Login with JWT tokens
- Protected routes

### 2. Trading Dashboard
- **Status**: ✅ Complete
- Real-time FTC/USD price display
- Birdeye.so iframe for live chart
- Buy/Sell order panel
- Order book with bids/asks
- Wallet balance display (USD/FTC)

### 3. Market Overview (Top Gainers/Losers/Trending)
- **Status**: ✅ Complete (Fixed Feb 25, 2026)
- Real-time data from CoinGecko API
- Top Gainers tab with real crypto data
- Top Losers tab with real crypto data  
- Trending tab with top coins by market cap
- Clickable coins open details view

### 4. Advanced Crypto Search
- **Status**: ✅ Complete (Fixed Feb 25, 2026)
- Search 10,000+ cryptocurrencies via CoinGecko
- Search by name or symbol
- Search by contract address (for Fitcoin)
- AI Recommendations section
- Detailed view on click with price, market cap, volume

### 5. Mine FTC Link
- **Status**: ✅ Complete (Updated Feb 25, 2026)
- Link updated to: `https://vibe-journal-5.preview.emergentagent.com/`
- Available in navbar on: Landing, Trade, Market, and other pages

### 6. Portfolio
- **Status**: ✅ Basic UI Complete
- Shows user wallet balances

### 7. Trade History
- **Status**: ✅ Basic UI Complete
- Shows user's past orders

### 8. Send/Receive Feature
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
│   │   │   ├── LandingPage.js
│   │   │   ├── TradingDashboard.js
│   │   │   ├── MarketOverview.js  # Real CoinGecko data
│   │   │   ├── CryptoSearch.js    # Real CoinGecko search
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
| `/api/wallet` | GET | ✅ | Get wallet balance |
| `/api/price/fitcoin` | GET | ✅ | Get FTC price |
| `/api/market/overview` | GET | ✅ | Get gainers/losers/trending |
| `/api/crypto/search` | GET | ✅ | Search cryptocurrencies |
| `/api/crypto/details/{id}` | GET | ✅ | Get crypto details |
| `/api/trade` | POST | ✅ | Execute trade |
| `/api/trade/history` | GET | ✅ | Get trade history |
| `/api/orderbook` | GET | ✅ | Get order book |

## Integrations

| Service | Status | Notes |
|---------|--------|-------|
| CoinGecko API | ✅ Active | Free tier, async thread pool wrapper |
| Birdeye.so | ✅ Active | Via iframe for FTC chart |
| MongoDB | ✅ Active | User data, wallets, orders |

## Pending/Future Work

### P1 - High Priority
- [ ] Real blockchain integration for Send/Receive
- [ ] Portfolio watchlist feature
- [ ] AI/ML trade recommendations (clarification needed)

### P2 - Medium Priority
- [ ] Replace Birdeye iframe with native chart library
- [ ] Portfolio comparison feature
- [ ] FAQ link verification

### P3 - Low Priority
- [ ] "Moltbot technology" (clarification needed)
- [ ] Additional payment integrations

## Recent Changes (Feb 25, 2026)

1. **Mine FTC Link Updated**
   - Changed from `fitcoinminers.github.io` to `vibe-journal-5.preview.emergentagent.com`
   - Updated in: LandingPage.js, TradingDashboard.js, MarketOverview.js

2. **Market Overview Fixed**
   - Fixed async CoinGecko API calls using ThreadPoolExecutor
   - Top Gainers, Top Losers, Trending now show real data

3. **Crypto Search Fixed**
   - Fixed async search functionality
   - Real-time results from CoinGecko
   - Click on result shows detailed crypto info

## User Credentials for Testing
- New users can register through `/auth` page
- Initial balance: $10,000 USD, 0 FTC
