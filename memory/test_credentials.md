# Test Credentials for Future Trade App

## User Accounts
- **Demo Trader**: `demo@trader.com` / `demo123`
- **Test User**: `test@futuretrade.com` / `testpass123`
- **Real User**: `trader@fitcoin.com` (existing)
- **User with Pending**: `nvnv786786@gmail.com` (has pending subscription)

## Admin Panel Credentials
- **Username**: `FITRUDRAH`
- **Password**: `786786`
- **Secret Code**: `0000`

## Notes
- Admin panel is at `/admin` route
- FTC Mining is at `/ftc-mining` route
- Raw Materials Trading is at `/nutrition-trading` route
- Main trading dashboard is at `/trade` (requires login)

## Features
- Admin panel has forgot password with OTP on-screen display
- Mining has 5-second boost mode when tapped while mining
- Transaction hash required for subscription requests
- If user already has pending request, submitting again updates the hash
- Candlestick chart with real-time price fluctuations
