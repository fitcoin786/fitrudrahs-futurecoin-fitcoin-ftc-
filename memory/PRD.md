# Future Trade - Product Requirements Document

## Core Features - All Complete ✅

### Sports Nutrition Trading - LIVE MODE
- **Route**: `/nutrition-trading`
- 18 products with global inventory tracking
- 10,000 FTC first-time bonus
- 20% FTC holder discount
- Trading mechanics: 100 units max, TRADING OPEN at 50+ sold

### FitWallet Integration
- Connect via solana-fitness.emergent.host credentials
- Real balance sync (tries multiple API endpoints)
- **Manual balance input** - if auto-sync fails, user can enter balance manually
- Transfer FTC: FitWallet ↔ Nutrition Wallet

### Wallet Flow
```
Mine FTC (solana-fitness.emergent.host)
    ↓
FitWallet (Real Balance - auto or manual sync)
    ↓ Transfer
Nutrition Wallet (for trading)
    ↓ Transfer
FitWallet (for withdrawal)
```

## Recent Fix (Mar 27, 2026)
- Added manual balance input when auto-sync fails
- User can check balance at FitWallet and enter manually
- Multiple API endpoints tried for balance fetch

## Pending Work
- P1: Real Place Order for main dashboard
- P1: AI Suggestions UI fix
- P2: Portfolio watchlist
