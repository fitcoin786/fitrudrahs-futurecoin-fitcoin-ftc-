# Future Trade - Product Requirements Document

## Last Updated: December 2025

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)".

## Core Features

### 1. Real-Time Trading Dashboard ✅
**Location**: `/trade`
**Features**:
- **New Candlestick Chart** - Real-time OHLC candlesticks with green/red colors
- Automatic price fluctuation every 5 seconds
- Volume bars at bottom
- Price labels on y-axis
- Live FTC/USDT pair with current price display
- **New meditation Fitcoin logo**
- Buy/Sell order panel
- Order book visualization

### 2. FTC Mining System (IN-HOUSE) ✅
**Location**: `/ftc-mining`
**Features**:
- **New meditation Fitcoin logo** (red/green yin-yang style)
- 1 Calorie = 1 FTC mining
- 5-second BOOST mode (2x speed)
- Transaction hash required for subscription
- **Fixed: Can update existing pending request with new hash**
- Subscription plans: Basic to Max (500-10,000 FTC/day)

### 3. Admin Control Panel ✅
**Location**: `/admin`
**Credentials**: FITRUDRAH / 786786 / 0000
**Features**:
- New meditation Fitcoin logo
- Approve/Reject subscriptions
- View transaction hashes
- FTC/USD received totals
- Forgot password with OTP

### 4. Raw Materials Trading ✅
**Location**: `/nutrition-trading`
- 18 raw materials with working images
- USD/FTC/INR trading

## Fixes This Session
1. ✅ Replaced Fitcoin logo with new meditation logo everywhere
2. ✅ Fixed subscription submission - now updates existing pending request instead of failing
3. ✅ Added realistic candlestick trading chart with price fluctuations
4. ✅ Volume bars and price labels on chart
5. ✅ Real-time chart updates every 5 seconds

## Pending Work
- P1: AI Suggestions UI fix ("+X more coins")
- P2: Send/Receive/Exchange feature
- P2: Refactor backend/server.py

## Tech Stack
- Frontend: React, Tailwind CSS, Canvas API (charts)
- Backend: FastAPI, Python
- Database: MongoDB
- Integrations: CoinGecko, Resend
