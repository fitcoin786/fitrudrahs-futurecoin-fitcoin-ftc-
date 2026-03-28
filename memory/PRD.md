# Future Trade - Product Requirements Document

## Last Updated: March 28, 2026

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)". Features include real-time crypto trading, in-house "Web5 Hacker theme" mining page (1 calorie burned = 1 FTC), mining subscription tiers, "Raw Materials Global Trading" (Whey Protein, Creatine, etc.) traded using FTC, and an Admin Panel to approve mining subscriptions.

## Core Features

### 1. Real-Time Trading Dashboard ✅
- Candlestick chart with real-time price fluctuations
- **BLOCKCHAIN TRADE LEDGER** - Every trade recorded with TX hash, block number, confirmations
- **Place Order** - Fully functional BUY/SELL with balance validation ✅

### 2. FTC Mining System ✅
- **2026 EXCLUSIVE SUBSCRIPTION PLANS** - 12 plans from $50 to $5000 ✅
- Payment Methods: USDT, SOL, FTC
- Admin Wallet: `A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG`
- **UPGRADE FUNCTIONALITY** - Users can submit upgrade requests
- **REAL-TIME ACTIVATION** - Subscription activates immediately after admin approval
- **SUBSCRIPTION-BASED TOOLS** - Different features unlock based on plan tier ✅

### 3. Admin Control Panel ✅
**Credentials**: FITRUDRAH / 786786 / 0000
- Approve/Reject subscriptions and upgrades
- View TX hashes for verification

### 4. Sports Nutrition Trading ✅ (MAJOR UPDATE - March 28, 2026)
- 40 products with **GLOBAL REAL-TIME PRICES** ✅
- **PRICE IMPACT MODEL** ✅ - When users BUY/SELL, it affects GLOBAL price for ALL users
  - BUY increases price +0.2% per unit and increases buy_pressure
  - SELL decreases price -0.2% per unit and increases sell_pressure
- **AI-POWERED TRADING SIGNALS** ✅ - Real-time BUY/HOLD/SELL recommendations with:
  - Confidence percentage (0-100%)
  - Reason explaining the signal
  - Trend analysis (bullish/bearish)
  - Momentum calculation
- **GLOBAL BLOCKCHAIN LEDGER** ✅ - ALL transactions from ALL users visible globally
  - Each trade records price_after_impact
  - Real-time 24H volume stats
  - Market sentiment (bullish/bearish/neutral)
- **AI Market Analysis Panel** ✅ - Shows BUY/HOLD/SELL signal counts
- Double-tap detailed view modal

### 5. AI-ML Trading Analysis ✅
- Trading signals, confidence %, risk level
- "+X more coins" UI for suggestions ✅
- **Real-time AI recommendations** based on buy/sell pressure and price trends

### 6. Subscription-Based Tools ✅ (NEW - March 28, 2026)
Tools unlock based on plan tier:
- **Free Trial (Tier 0)**: Basic Mining, Price Alerts
- **Starter (Tier 1)**: + AI Trading Signals, Portfolio Tracker
- **Basic (Tier 2)**: + Market Sentiment, Trade History Export
- **Standard (Tier 3)**: + Advanced Charts, Whale Alerts
- **Pro (Tier 4)**: + Auto Trading Bot, Priority Mining (2x)
- **Elite (Tier 5)**: + VIP Support, Early Access
- **Ultra (Tier 6)**: + Custom Alert Rules, API Access
- **Mega (Tier 7)**: + Leverage Trading (5x), Staking Rewards
- **Supreme (Tier 8)**: + Market Maker Mode, Copy Trading
- **Titan (Tier 9)**: + Institutional Data, Dark Pool Access
- **Legend (Tier 10)**: + AI Portfolio Manager, Unlimited Mining
- **Immortal (Tier 11)**: + Governance Voting, Revenue Share
- **GOD MODE (Tier 12)**: ALL Features + Founder Badge NFT

## What's Complete (March 2026)
1. ✅ 2026 Exclusive Subscription Plans (12 tiers, $50-$5000)
2. ✅ Payment modal with wallet addresses (USDT/SOL/FTC)
3. ✅ Place Order functionality (real balance updates)
4. ✅ AI Suggestions UI with "+X more coins"
5. ✅ Subscription submission with TX hash
6. ✅ Admin approval process
7. ✅ Real-time activation (immediate status update)
8. ✅ Auto-polling for pending subscriptions
9. ✅ Blockchain Trade Ledger
10. ✅ Upgrade flow with TX hash
11. ✅ Global FTC price/volume sync
12. ✅ **GLOBAL Nutrition Prices** - ALL users see same prices
13. ✅ **PRICE IMPACT MODEL** - Trades affect global prices
14. ✅ **AI TRADING SIGNALS** - Real-time BUY/HOLD/SELL recommendations
15. ✅ **GLOBAL BLOCKCHAIN LEDGER** - ALL transactions visible to ALL users
16. ✅ **SUBSCRIPTION-BASED TOOLS** - Auto-unlock based on plan tier

## New APIs Added (March 28, 2026)
- `GET /api/nutrition/global-prices` - Returns prices, ai_signals, trade_volume
- `GET /api/nutrition/ai-recommendations` - Returns categorized BUY/HOLD/SELL signals
- `GET /api/nutrition/global-ledger` - Returns ALL transactions with stats
- `POST /api/nutrition/global-ledger/record` - Records trade with price_after_impact

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, MongoDB
- External APIs: CoinGecko, Resend (Email OTPs)
