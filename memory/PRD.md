# Future Trade - Product Requirements Document

## Original Problem Statement
Build a full-stack trading application called "Future Trade" for cryptocurrency "Fitcoin (FTC)" with contract address `5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`. The application should be similar to professional platforms like Bitget or Binance.

## Core Features

### 1. User Authentication ✅
- Registration with email, password, full name
- Login with JWT tokens
- Protected routes
- Forgot Password with OTP via Resend email

### 2. Trading Dashboard ✅
- Real-time FTC/USD price display
- Birdeye.so iframe for live chart
- Buy/Sell order panel
- Order book with bids/asks

### 3. Market Overview ✅
- Real-time data from CoinGecko API
- Fitcoin (FTC) included in Top Losers

### 4. Advanced Crypto Search ✅
- Search 10,000+ cryptocurrencies
- AI Recommendations

### 5. Claim FTC Credit Page ✅
- CONNECTED TO REAL FCOIN BLOCKCHAIN API

### 6. Landing Page ✅
- Sports Nutrition Trading "Coming Soon" section

### 7. Sports Nutrition Trading Marketplace - FULLY FUNCTIONAL ⭐
- **Status**: ✅ Complete with Backend Inventory Tracking
- **Route**: `/nutrition-trading`

#### Core Features:
- **18 Premium Products** from MongoDB `nutrition_products` collection
- **10,000 FTC First-Time Login Bonus** (one-time)
- **20% FTC Holder Exclusive Discount**
- **Real Intro Video** with mute/unmute

#### Trading Mechanics (WORKING):
- **100 units max per product** (global inventory)
- **When 50 units sold globally → TRADING OPEN**
  - Users can sell to other users
  - Price increases 25% for remaining units
  - Real-time price fluctuation
- **Global Inventory Sync** - All users see same sold_units count

#### Backend API Endpoints:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nutrition/products` | GET | Get all products with global inventory |
| `/api/nutrition/products/{id}` | GET | Get single product |
| `/api/nutrition/buy` | POST | Buy product (updates global sold_units) |
| `/api/nutrition/sell` | POST | Sell product (only when trading open) |
| `/api/nutrition/wallet` | GET | Get user wallet + holdings |
| `/api/nutrition/transfer` | POST | Transfer FTC to/from wallet |
| `/api/nutrition/leaderboard` | GET | Get top traders |

#### FitWallet Integration:
- Connect FitWallet via email/password
- Real Mining Wallet balance from FitWallet API
- Transfer FTC: FitWallet ↔ Nutrition Wallet
- LIVE badge when connected

#### Database Collections:
- `nutrition_products` - Global product inventory
- `nutrition_wallets` - User wallets with FTC balance
- `nutrition_holdings` - User product holdings
- `nutrition_transactions` - Transaction history

### 8. Portfolio ✅
- Basic UI Complete

### 9. Trade History ✅
- Basic UI Complete

### 10. Send/Receive ⚠️
- Placeholder only

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py          # FastAPI with nutrition trading endpoints
│   ├── tests/
│   │   └── test_nutrition_trading.py
│   └── .env
├── frontend/
│   ├── src/
│   │   └── pages/
│   │       └── NutritionTrading.js  # Backend-integrated trading
│   └── .env
└── memory/
    └── PRD.md
```

## Recent Changes (Mar 27, 2026)

### Backend Inventory Tracking (MAJOR UPDATE)
1. **MongoDB Collections** for nutrition trading
2. **Global Inventory Sync** - sold_units tracked globally
3. **Buy API** - Updates global sold_units, deducts FTC
4. **Sell API** - Only works when 50+ units sold
5. **Wallet API** - Returns balance + holdings + transactions
6. **First-Time Bonus** - 10,000 FTC on first wallet access

### Previous Updates
- FitWallet integration
- Real intro video
- Wallet modal with transfer functionality
- LIVE MODE badges

## Test Reports
- `/app/test_reports/iteration_5.json` - **Backend inventory tests (100% pass)**
- `/app/backend/tests/test_nutrition_trading.py` - Pytest test suite

## Products with Trading Open (sold_units >= 50)
1. Pure Creatine Monohydrate - 73 sold
2. Pure Pea Protein Isolate - 58 sold
3. Omega-3 Fish Oil - 78 sold
4. L-Carnitine Fat Burner - 52 sold
5. Glutamine Recovery - 61 sold
6. Multivitamin Daily - 92 sold
7. Ashwagandha Extract - 92 sold
8. Collagen Peptides - 55 sold
9. Peanut Butter Natural - 73 sold

## Pending/Future Work

### P0 - Critical
- [x] Sports Nutrition Trading ✅
- [x] Backend Inventory Tracking ✅
- [x] FitWallet Integration ✅

### P1 - High Priority
- [ ] Real Place Order functionality (Main trading dashboard)
- [ ] AI Suggestions UI improvement
- [ ] Send/Receive/Exchange backend

### P2 - Medium Priority
- [ ] Portfolio watchlist
- [ ] Refactor server.py

### P3 - Low Priority
- [ ] Replace Birdeye iframe
