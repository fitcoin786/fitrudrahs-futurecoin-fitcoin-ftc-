# Test Credentials for Future Trade App

## User Accounts
- **Demo Trader**: `demo@trader.com` / `demo123`
  - FTC Wallet Address: `D27B2n5A4cH58nuNAvYTB7p6jaLyidv7`
- **Test User**: `test@futuretrade.com` / `testpass123`
- **Real User**: `trader@fitcoin.com` (existing)
- **User with Pending**: `nvnv786786@gmail.com` (has pending subscription)

## Admin Panel Credentials
- **Username**: `FITRUDRAH`
- **Password**: `786786`
- **Secret Code**: `0000`

## Routes
- Admin panel: `/admin`
- FTC Mining: `/ftc-mining`
- Raw Materials Trading: `/nutrition-trading`
- Main trading dashboard: `/trade` (requires login)
- Crypto Search: `/search` (requires login)
- Trade History: `/history`
- Portfolio: `/portfolio`
- Markets: `/markets`

## Features
- Admin panel has forgot password with OTP on-screen display
- Mining has 5-second boost mode when tapped while mining
- Transaction hash required for subscription requests
- If user already has pending request, submitting again updates the hash
- Candlestick chart with real-time price fluctuations
- 2026 Exclusive Plans with 12 tiers ($50-$5000)
- Payment wallet: `A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG`
- **FTC Wallet Address** - Auto-generated on registration, editable by user
- **Global Blockchain Ledger** - Shows ALL users' trades worldwide (3-second polling)

## Last Verified: March 28, 2026
- ✅ Login works with demo@trader.com / demo123
- ✅ Place Order API working (balance updates correctly)
- ✅ 2026 Subscription plans render correctly
- ✅ Payment modal shows wallet address
- ✅ FTC Wallet Address auto-generated and displayed in mining section
- ✅ Edit/Update wallet address functionality working
- ✅ Global Blockchain Ledger shows all users' trades
