# Future Trade - Product Requirements Document

## Original Problem Statement
Build a full-stack trading application called "Future Trade" for cryptocurrency "Fitcoin (FTC)" with contract address `5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`.

## Core Features Summary

### Completed Features ✅
1. **User Authentication** - JWT login/signup, password reset with OTP
2. **Trading Dashboard** - Birdeye.so chart, buy/sell panel, order book
3. **Market Overview** - CoinGecko live data, gainers/losers/trending
4. **Advanced Crypto Search** - Search 10,000+ cryptos, AI recommendations
5. **Claim FTC Credit** - FCOIN blockchain integration
6. **Landing Page** - Sports Nutrition Trading Coming Soon section

### Sports Nutrition Trading - FULLY FUNCTIONAL ⭐
- **Status**: ✅ Complete with Real FitWallet Integration
- **Route**: `/nutrition-trading`

#### Features:
- **18 Premium Products** from MongoDB global inventory
- **10,000 FTC First-Time Bonus**
- **20% FTC Holder Exclusive Discount**
- **Real Intro Video** with mute/unmute

#### Trading Mechanics:
- **100 units max per product** (global inventory)
- **When 50 units sold → TRADING OPEN**
  - Users can sell to other users
  - Price increases 25%

#### 🔗 FitWallet Integration (REAL BLOCKCHAIN):
- **Connect FitWallet** via solana-fitness.emergent.host
- **Real Mining Wallet Balance** - fetched from FitWallet API
- **LIVE badge** when connected
- **Auto-sync** balance every 30 seconds
- **Sync button** for manual refresh
- **Transfer FTC**:
  - From FitWallet → Nutrition Wallet (uses real blockchain API)
  - From Nutrition Wallet → FitWallet (real blockchain transaction)

#### Wallet Flow:
```
Mine FTC (solana-fitness.emergent.host - Fitcoin Mining)
    ↓
FitWallet (Mining Wallet - Real Balance)
    ↓ Transfer (uses /api/blockchain/send)
Nutrition Wallet (for trading products)
    ↓ Transfer (uses /api/blockchain/receive)
FitWallet (for withdrawal)
```

## Backend API Endpoints

### Nutrition Trading
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nutrition/products` | GET | Get all products with global inventory |
| `/api/nutrition/buy` | POST | Buy product (updates global sold_units) |
| `/api/nutrition/sell` | POST | Sell product (only when trading open) |
| `/api/nutrition/wallet` | GET | Get user wallet + holdings |
| `/api/nutrition/transfer` | POST | Transfer FTC to/from wallet |
| `/api/nutrition/leaderboard` | GET | Get top traders |

### FitWallet API (External - solana-fitness.emergent.host)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login to FitWallet |
| `/api/wallet/balance` | GET | Get real FTC balance |
| `/api/blockchain/send` | POST | Send FTC (real transaction) |
| `/api/blockchain/receive` | POST | Receive FTC (real transaction) |
| `/api/blockchain/ledger` | GET | Get transaction history |

## Database Collections
- `nutrition_products` - Global product inventory (18 products)
- `nutrition_wallets` - User wallets with FTC balance
- `nutrition_holdings` - User product holdings
- `nutrition_transactions` - Transaction history

## Test Reports
- `/app/test_reports/iteration_5.json` - Backend inventory tests (100% pass)
- `/app/backend/tests/test_nutrition_trading.py` - Pytest test suite

## Pending/Future Work

### P1 - High Priority
- [ ] Real Place Order for main Trading Dashboard
- [ ] AI Suggestions UI improvement
- [ ] Send/Receive/Exchange backend

### P2 - Medium Priority
- [ ] Portfolio watchlist
- [ ] Refactor server.py
- [ ] Leaderboard UI

### P3 - Low Priority
- [ ] Replace Birdeye iframe with native chart
