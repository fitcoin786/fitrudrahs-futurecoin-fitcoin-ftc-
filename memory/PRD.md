# Future Trade - Product Requirements Document

## Last Updated: December 2025

## Original Problem Statement
Building a full-stack trading application called "Future Trade" for a cryptocurrency named "Fitcoin (FTC)".

## Core Features

### 1. Real-Time Trading Dashboard ✅
- Live crypto charts with CoinGecko integration
- Buy/Sell functionality
- Order book visualization
- Portfolio tracking

### 2. FTC Mining System (NEW) ✅
**Location**: `/ftc-mining`
- In-house Web5 Hacker themed mining page
- StepsApp integration via `https://invite.steps.app/zkK1vmJRdARK`
- 1 Calorie burned = 1 FTC mined
- Max 10,000 FTC per 24 hours
- Subscription-based daily limits:
  - Basic: 500 calories/FTC
  - Standard: 1,000 calories/FTC
  - Pro: 2,000 calories/FTC
  - Elite: 5,000 calories/FTC
  - Ultra: 7,500 calories/FTC
  - Max: 10,000 calories/FTC

### 3. Admin Panel ✅
**Location**: `/admin`
**Credentials**: 
- Username: `Fitrudrah`
- Password: `000000`
- Secret Code: `0000`

Features:
- View all users and their mining subscriptions
- Approve/Reject subscription requests
- Dashboard with stats (total users, pending requests, active subscriptions)

### 4. Raw Materials Trading ✅
**Location**: `/nutrition-trading`
- Pivoted from brand products to global B2B raw materials
- 18 products with working Unsplash images
- Categories: Protein, Creatine, Pre-Workout, Gainer, Amino, Recovery
- Trading with USD/FTC/INR support
- Global inventory tracking
- 10,000 FTC welcome bonus
- 20% FTC holder discount

### Key API Endpoints

#### Mining APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mining/status` | GET | Get user mining status & balance |
| `/api/mining/subscribe` | POST | Submit subscription request |
| `/api/mining/save-progress` | POST | Save mining progress |

#### Admin APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/mining-requests` | GET | Get all subscription requests & users |
| `/api/admin/activate-subscription` | POST | Activate user subscription |
| `/api/admin/reject-subscription` | POST | Reject subscription request |

#### Nutrition Trading APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nutrition/products` | GET | Get all raw materials products |
| `/api/nutrition/buy` | POST | Buy products with FTC |
| `/api/nutrition/sell` | POST | Sell products for FTC |

## Database Collections
- `users` - User accounts
- `mining_wallets` - FTC mining balances
- `mining_subscriptions` - Subscription requests/status
- `nutrition_products` - Raw materials inventory
- `nutrition_wallets` - User trading balances
- `nutrition_orders` - Order history

## What's Been Completed (This Session)
1. ✅ Built FTC Mining System with Web5 hacker theme
2. ✅ Built Admin Panel with subscription management
3. ✅ Added mining & admin backend APIs
4. ✅ Updated Raw Materials Trading with working images
5. ✅ Fixed MongoDB ObjectId serialization bug
6. ✅ Added App.js routes for new pages
7. ✅ All tests passing (11/11 backend, 100% frontend)

## Pending Work
- P1: Real "Place Order" for main trading dashboard (currently mocked)
- P1: AI Suggestions UI fix ("+X more coins" label)
- P2: Send/Receive/Exchange feature implementation
- P2: Refactor backend/server.py monolith
- P2: Remove deprecated FitWallet proxy code
- P3: Leaderboard UI for top FTC traders
- P3: Portfolio Watchlist

## Tech Stack
- Frontend: React, Tailwind CSS
- Backend: FastAPI, Python
- Database: MongoDB
- Integrations: CoinGecko (crypto data), Resend (email OTPs)
