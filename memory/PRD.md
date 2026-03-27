# Future Trade - Product Requirements Document

## Last Updated: December 2025

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)".

## Core Features

### 1. Real-Time Trading Dashboard
- Live crypto charts with CoinGecko integration
- Buy/Sell functionality
- Order book visualization
- Portfolio tracking

### 2. FTC Mining System (IN-HOUSE)
**Location**: `/ftc-mining`
**Features**:
- In-house Web5 Hacker themed mining page
- **Round Fitcoin logo** instead of $ symbol
- StepsApp integration via `https://invite.steps.app/zkK1vmJRdARK`
- 1 Calorie burned = 1 FTC mined
- Max 10,000 FTC per 24 hours
- **5-second BOOST mode** - Tap mining button again for 2x speed
- **Transaction hash** required for subscription
- Subscription-based daily limits:
  - Basic: 500 FTC - $5/1500 FTC
  - Standard: 1,000 FTC - $9/2500 FTC
  - Pro: 2,000 FTC - $15/4000 FTC
  - Elite: 3,000 FTC - $20/5500 FTC
  - Ultra: 5,000 FTC - $30/8000 FTC
  - Max: 10,000 FTC - $50/12000 FTC

### 3. Admin Control Panel
**Location**: `/admin`
**Credentials**: 
- **Username**: `FITRUDRAH`
- **Password**: `786786`
- **Secret Code**: `0000`

**Features**:
- **Round Fitcoin logo** on login and dashboard
- View all users and their mining subscriptions
- Approve/Reject subscription requests immediately
- Dashboard stats: Pending, Active, Users, FTC Received, USD Received
- **Forgot password with OTP on-screen** - Copy/paste to reset
- **Transaction hash display** on subscription requests

### 4. Raw Materials Trading
**Location**: `/nutrition-trading`
- 18 raw materials with working Unsplash images
- Categories: Protein, Creatine, Pre-Workout, Gainer, Amino, Recovery
- Trading with USD/FTC/INR support

## What's Been Completed (This Session)
1. ✅ Updated Admin credentials: FITRUDRAH / 786786 / 0000
2. ✅ Added round Fitcoin logo to Admin Panel and Mining
3. ✅ Built forgot password OTP system with on-screen display
4. ✅ Added transaction hash input for subscription requests
5. ✅ Implemented 5-second BOOST mining feature
6. ✅ Real-time mining auto-starts after subscription approval
7. ✅ Admin dashboard shows FTC/USD received totals
8. ✅ All tests passing

## Pending Work
- P1: Real "Place Order" for main trading dashboard
- P1: AI Suggestions UI fix
- P2: Send/Receive/Exchange feature
- P2: Refactor backend/server.py monolith

## Tech Stack
- Frontend: React, Tailwind CSS
- Backend: FastAPI, Python
- Database: MongoDB
- Integrations: CoinGecko, Resend
