# Future Trade - Product Requirements Document

## Sports Nutrition Trading - LIVE MODE ✅

### FitWallet Integration via Backend Proxy (CORS Fix)
- **Problem**: Browser couldn't call FitWallet API directly due to CORS
- **Solution**: Backend proxy endpoints that call FitWallet API server-to-server

### Backend Proxy Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fitwallet/login` | POST | Login to FitWallet, returns token & balance |
| `/api/fitwallet/balance` | GET | Get real FTC balance from FitWallet |
| `/api/fitwallet/send` | POST | Send FTC via FitWallet blockchain |
| `/api/fitwallet/receive` | POST | Receive FTC via FitWallet blockchain |
| `/api/fitwallet/ledger` | GET | Get transaction history |

### Flow
```
Mine FTC (solana-fitness.emergent.host)
    ↓
Frontend connects FitWallet via /api/fitwallet/login
    ↓
Backend calls FitWallet API (no CORS)
    ↓
Returns token + balance to frontend
    ↓
Mining Wallet shows REAL FitWallet balance
    ↓
Transfers use /api/fitwallet/send & /api/fitwallet/receive
```

### Features
- 18 products with global inventory
- 10,000 FTC first-time bonus
- 20% FTC holder discount
- Trading opens at 50+ units sold
- Real-time balance sync via backend proxy

## Recent Changes
- Added backend proxy for FitWallet API (bypasses CORS)
- All FitWallet calls now go through our backend
- Balance fetch uses /api/fitwallet/balance
- Transfers use /api/fitwallet/send and /api/fitwallet/receive

## Pending Work
- P1: Real Place Order for main dashboard
- P1: AI Suggestions UI fix
