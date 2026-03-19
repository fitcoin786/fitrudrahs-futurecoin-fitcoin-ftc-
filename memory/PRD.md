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
- **Status**: ✅ Complete (Updated Mar 19, 2026)
- **CONNECTED TO REAL FCOIN BLOCKCHAIN API**
- Login with FitWallet credentials via `https://solana-fitness.emergent.host/api/auth/login`
- Real-time blockchain data from `https://solana-fitness.emergent.host/api/blockchain/ledger`
- Displays real blockchain stats: Total Blocks, Total Mined, Transferred, Users
- Real transactions: Mining, New User, Referral Commission
- Health-based FTC calculator
- Send/Exchange FTC functionality
- Auto-refresh every 30 seconds
- Manual refresh button

### 6. Landing Page
- **Status**: ✅ Complete (Updated Mar 19, 2026)
- Hero section with FTC branding
- "Health Is Wealth" AI button
- "Mine Fitcoin" section
- "Alpha Radar" section
- Photo links grid including:
  - Tap to Trading Buy-Sell
  - Tap to Mining Cal-FTC
  - **Fast tap to join Fit Pool** → `https://hacker-mine-ftc.emergent.host/`
  - Tap to FTC Wellness
- FiTOwlSiRinG section
- Special offers
- FAQ section
- Extensive ecosystem links

### 7. Portfolio
- **Status**: ✅ Basic UI Complete
- Shows user wallet balances

### 8. Trade History
- **Status**: ✅ Basic UI Complete
- Shows user's past orders

### 9. Send/Receive Feature
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
│   │   │   ├── LandingPage.js       # Updated with Fit Pool link
│   │   │   ├── TradingDashboard.js
│   │   │   ├── MarketOverview.js
│   │   │   ├── CryptoSearch.js
│   │   │   ├── ClaimFtcCredit.js    # FCOIN blockchain integration
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

## External API Integrations

| Service | Status | Notes |
|---------|--------|-------|
| CoinGecko API | ✅ Active | Free tier, async thread pool wrapper |
| Birdeye.so | ✅ Active | Via iframe for FTC chart |
| MongoDB | ✅ Active | User data, wallets, orders |
| FCOIN Blockchain API | ✅ Active | Real-time blockchain data from solana-fitness.emergent.host |
| Resend | ✅ Active | Email OTP for password reset |

## FCOIN Blockchain Integration (Mar 19, 2026)

### API Base URL
`https://solana-fitness.emergent.host`

### Endpoints Used
- `POST /api/auth/login` - Login to FitWallet
- `POST /api/auth/register` - Register new FitWallet
- `GET /api/blockchain/ledger` - Get blockchain transactions (requires auth)
- `GET /api/stats` - Get user mining stats (requires auth)

### Data Retrieved
- **Network Stats**: Total mined (119M+ FTC), total transferred, total users
- **Transactions**: Mining rewards, new user registrations, referral commissions
- **User Data**: Wallet address, FTC balance, referral code

## Recent Changes (Mar 19, 2026)

1. **Landing Page Update**
   - Replaced "Tap to FTC Wellness" with **"Fast tap to join Fit Pool"**
   - New link: `https://hacker-mine-ftc.emergent.host/`
   - Updated data-testid to `fit-pool-link`

2. **FCOIN Blockchain Integration** 
   - Connected ClaimFtcCredit page to **REAL FCOIN blockchain API**
   - Login authenticates via `https://solana-fitness.emergent.host/api/auth/login`
   - Fetches real blockchain data from `/api/blockchain/ledger`
   - Displays real stats: 360 blocks, 119M+ FTC mined, 53 users
   - Shows real transactions: Mining, New User, Referral Commission
   - Auto-refresh every 30 seconds
   - Manual refresh button added
   - Link to FCOIN Explorer

## Pending/Future Work

### P0 - Critical
- [x] Connect Claim FTC page to real blockchain API ✅ DONE

### P1 - High Priority
- [ ] AI Suggestions UI improvement (+X more coins indicator)
- [ ] Real Place Order functionality (update balances)
- [ ] Send/Receive/Exchange backend logic

### P2 - Medium Priority
- [ ] Intro video on landing page
- [ ] Portfolio watchlist feature
- [ ] Refactor server.py into modules

### P3 - Low Priority
- [ ] Replace Birdeye iframe with native chart library
- [ ] Refactor ClaimFtcCredit.js (1100+ lines)

## User Credentials for Testing

### Local App
- New users can register through `/auth` page
- Initial balance: $10,000 USD, 0 FTC

### FCOIN API Test Account
- Email: `test@futuretrade.com`
- Password: `testpass123`
- Wallet: `FTC1D1AC4129EBC4B0F90E2297123459E03`

## Test Reports
- `/app/test_reports/iteration_1.json` - FCOIN blockchain integration tests (100% pass)
