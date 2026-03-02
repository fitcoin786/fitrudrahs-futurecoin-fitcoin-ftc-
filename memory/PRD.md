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
- **Fitcoin (FTC) included in Top Losers** - Always #1 with contract address
- Top Gainers tab with real crypto data
- Top Losers tab with real crypto data (Fitcoin first)
- Trending tab with top coins by market cap
- Clickable coins open details view

### 4. Advanced Crypto Search
- **Status**: ✅ Complete (Fixed Feb 25, 2026)
- Search 10,000+ cryptocurrencies via CoinGecko
- **Fitcoin searchable by**: name, symbol (FTC), contract address
- Search by name or symbol
- Search by contract address (`5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`)
- AI Recommendations: Bitcoin, Ethereum, Solana, Fitcoin
- Detailed view on click with price, market cap, volume, blockchain info

### 5. Mine FTC Link
- **Status**: ✅ Complete (Updated Feb 25, 2026)
- Link: `https://fitcoin-platform.preview.emergentagent.com/`
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
│   ├── server.py        # FastAPI with async CoinGecko integration + Fitcoin data
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── TradingDashboard.js
│   │   │   ├── MarketOverview.js  # Real CoinGecko + Fitcoin in Top Losers
│   │   │   ├── CryptoSearch.js    # Real CoinGecko + Fitcoin searchable
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
| `/api/market/overview` | GET | ✅ | Get gainers/losers(+FTC)/trending |
| `/api/crypto/search` | GET | ✅ | Search cryptos + Fitcoin by name/address |
| `/api/crypto/details/{id}` | GET | ✅ | Get crypto details (handles fitcoin specially) |
| `/api/trade` | POST | ✅ | Execute trade |
| `/api/trade/history` | GET | ✅ | Get trade history |
| `/api/orderbook` | GET | ✅ | Get order book |

## Integrations

| Service | Status | Notes |
|---------|--------|-------|
| CoinGecko API | ✅ Active | Free tier, async thread pool wrapper |
| Birdeye.so | ✅ Active | Via iframe for FTC chart |
| MongoDB | ✅ Active | User data, wallets, orders |

## Fitcoin Integration Details

- **Contract Address**: `5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`
- **Blockchain**: Solana
- **Base Price**: $0.00000349
- **Always appears in**: Top Losers (#1 position)
- **Searchable via**: Name ("fitcoin"), Symbol ("ftc"), Contract Address
- **Details include**: Price, 24h change, market cap, volume, high/low, ATH/ATL, description

## Recent Changes (Mar 2, 2026)

1. **Volume Fluctuation Correction (Trade Dashboard)**
   - **24h Volume**: Now fluctuates between $150 - $280 (real-time automated)
   - **60min Volume**: New field added, fluctuates between $15 - $56 (shown in green)
   - Both volumes auto-update every 5 seconds for real-time experience

## Recent Changes (Feb 25, 2026)

1. **Mine FTC Link Updated**
   - Changed to: `vibe-journal-5.preview.emergentagent.com`

2. **Fitcoin Added to Top Losers**
   - FTC now appears as #1 in Top Losers with contract address
   - Shows Solana blockchain badge

3. **Fitcoin Fully Searchable**
   - Search by: "fitcoin", "ftc", or full contract address
   - Displays with Solana badge and contract address
   - Click shows full details with blockchain info

4. **Backend APIs Fixed**
   - Async CoinGecko integration with ThreadPoolExecutor
   - Special handling for Fitcoin in search and details endpoints

## Pending/Future Work

### P1 - High Priority
- [ ] Real blockchain integration for Send/Receive

### P2 - Medium Priority
- [ ] Portfolio watchlist feature
- [ ] AI/ML trade recommendations

### P3 - Low Priority
- [ ] Replace Birdeye iframe with native chart library

## User Credentials for Testing
- New users can register through `/auth` page
- Initial balance: $10,000 USD, 0 FTC
