# Future Trade - Product Requirements Document

## Sports Nutrition Trading - LIVE MODE ✅

### FitWallet Integration (Mining Wallet = FitWallet)
- **Connect FitWallet** via solana-fitness.emergent.host credentials
- **Mining Wallet = FitWallet** - Same balance, real-time sync
- **Auto-sync every 15 seconds** when connected
- **LIVE badge** shows sync status (Syncing... / Live from FitWallet)
- **Transfers**: FitWallet ↔ Nutrition Wallet (real blockchain API)

### Wallet Flow
```
Mine FTC (solana-fitness.emergent.host - burning calories)
    ↓
FitWallet Balance (synced to Mining Wallet)
    ↓ Transfer (real blockchain)
Nutrition Wallet (for trading products)
    ↓ Transfer back
FitWallet (for withdrawal)
```

### Features
- 18 products with global inventory
- 10,000 FTC first-time bonus
- 20% FTC holder discount
- Trading opens at 50+ units sold

### Recent Fix
- Removed manual balance input
- Mining Wallet now directly syncs with FitWallet balance
- Real-time sync every 15 seconds
- Shows "Syncing..." or "Live from FitWallet" status

## Pending Work
- P1: Real Place Order for main dashboard
- P1: AI Suggestions UI fix
