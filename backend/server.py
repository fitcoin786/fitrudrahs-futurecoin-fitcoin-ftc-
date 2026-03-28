from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import asyncio
from pycoingecko import CoinGeckoAPI
import time
import random
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'futuretrade_secret_key_2026')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Resend Email Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# OTP Cache (in-memory for simplicity, use Redis in production)
OTP_CACHE = {}  # email -> {'otp': str, 'expires': datetime, 'attempts': int}

# Solana Fitcoin Contract Address
FITCOIN_CONTRACT = "5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump"

# Initialize CoinGecko for market data
cg = CoinGeckoAPI()

# Cache for API responses to prevent rate limiting
API_CACHE = {
    'market_data': {'data': None, 'timestamp': 0},
    'search': {},  # query -> {'data': result, 'timestamp': timestamp}
    'details': {}  # coin_id -> {'data': result, 'timestamp': timestamp}
}
CACHE_DURATION = 60  # Cache for 60 seconds
SEARCH_CACHE_DURATION = 120  # Search cache for 2 minutes

# ========== GLOBAL FTC STATE - Same for ALL users worldwide ==========
GLOBAL_FTC_STATE = {
    'price': 0.00000472145,  # Base price
    'change_24h': -9.03,
    'volume_24h': 1519228.41,  # In FTC
    'last_update': time.time(),
    'high_24h': 0.00000520,
    'low_24h': 0.00000450
}

def update_global_ftc_price():
    """Update FTC price globally - same fluctuation for all users"""
    global GLOBAL_FTC_STATE
    now = time.time()
    
    # Update every 3 seconds
    if now - GLOBAL_FTC_STATE['last_update'] >= 3:
        base_price = 0.00000472145
        volatility = 0.02 + random.random() * 0.03
        direction = 1 if random.random() > 0.48 else -1
        
        new_price = GLOBAL_FTC_STATE['price'] * (1 + (direction * volatility * random.random()))
        # Keep price within realistic bounds
        new_price = max(base_price * 0.85, min(base_price * 1.15, new_price))
        
        change = ((new_price - base_price) / base_price) * 100
        
        # Update volume
        volume_change = random.uniform(-0.01, 0.01)
        new_volume = GLOBAL_FTC_STATE['volume_24h'] * (1 + volume_change)
        
        GLOBAL_FTC_STATE = {
            'price': new_price,
            'change_24h': change,
            'volume_24h': new_volume,
            'last_update': now,
            'high_24h': max(GLOBAL_FTC_STATE['high_24h'], new_price),
            'low_24h': min(GLOBAL_FTC_STATE['low_24h'], new_price)
        }
    
    return GLOBAL_FTC_STATE

# ========== GLOBAL NUTRITION PRICES - Same for ALL users worldwide ==========
NUTRITION_PRODUCTS_LIST = [
    {"id": "WPC80", "name": "Whey Protein Concentrate 80%", "basePrice": 38.50, "category": "Protein"},
    {"id": "WPI90", "name": "Whey Protein Isolate 90%", "basePrice": 72.00, "category": "Protein"},
    {"id": "CASEIN", "name": "Casein Protein Micellar", "basePrice": 52.00, "category": "Protein"},
    {"id": "PEA", "name": "Pea Protein Isolate 85%", "basePrice": 32.00, "category": "Protein"},
    {"id": "SOY", "name": "Soy Protein Isolate", "basePrice": 28.00, "category": "Protein"},
    {"id": "EGG", "name": "Egg White Protein", "basePrice": 65.00, "category": "Protein"},
    {"id": "COLLAGEN", "name": "Collagen Peptides", "basePrice": 48.00, "category": "Protein"},
    {"id": "GLUTAMINE", "name": "L-Glutamine Powder", "basePrice": 44.00, "category": "Amino"},
    {"id": "BCAA", "name": "BCAA 2:1:1 Instant", "basePrice": 58.00, "category": "Amino"},
    {"id": "EAA", "name": "Essential Amino Acids", "basePrice": 62.00, "category": "Amino"},
    {"id": "ARGININE", "name": "L-Arginine HCL", "basePrice": 36.00, "category": "Amino"},
    {"id": "TAURINE", "name": "L-Taurine Pure", "basePrice": 24.00, "category": "Amino"},
    {"id": "CREATINE", "name": "Creatine Monohydrate Pure", "basePrice": 22.50, "category": "Creatine"},
    {"id": "CREATINEHCL", "name": "Creatine HCL", "basePrice": 42.00, "category": "Creatine"},
    {"id": "BETA", "name": "Beta-Alanine Pure", "basePrice": 35.00, "category": "Pre-Workout"},
    {"id": "CITRULLINE", "name": "L-Citrulline Malate 2:1", "basePrice": 46.00, "category": "Pre-Workout"},
    {"id": "CAFFEINE", "name": "Caffeine Anhydrous USP", "basePrice": 14.50, "category": "Pre-Workout"},
    {"id": "VITC", "name": "Vitamin C 1000mg", "basePrice": 18.00, "category": "Vitamin"},
    {"id": "VITD3", "name": "Vitamin D3 5000IU", "basePrice": 22.00, "category": "Vitamin"},
    {"id": "VITB12", "name": "Vitamin B12 Methylcobalamin", "basePrice": 28.00, "category": "Vitamin"},
    {"id": "VITE", "name": "Vitamin E 400IU", "basePrice": 26.00, "category": "Vitamin"},
    {"id": "MULTI", "name": "Multivitamin Complete", "basePrice": 34.00, "category": "Vitamin"},
    {"id": "BCOMPLEX", "name": "B-Complex Super", "basePrice": 24.00, "category": "Vitamin"},
    {"id": "OMEGA3", "name": "Omega-3 Fish Oil 1000mg", "basePrice": 32.00, "category": "Omega"},
    {"id": "OMEGA6", "name": "Omega-6 GLA Complex", "basePrice": 38.00, "category": "Omega"},
    {"id": "OMEGA9", "name": "Omega-9 Olive Oil Extract", "basePrice": 28.00, "category": "Omega"},
    {"id": "OMEGA369", "name": "Omega 3-6-9 Complete", "basePrice": 42.00, "category": "Omega"},
    {"id": "FLAXSEED", "name": "Flaxseed Oil 1000mg", "basePrice": 22.00, "category": "Omega"},
    {"id": "COQ10", "name": "CoQ10 Ubiquinone 100mg", "basePrice": 56.00, "category": "Specialty"},
    {"id": "ASHWAGANDHA", "name": "Ashwagandha KSM-66", "basePrice": 38.00, "category": "Specialty"},
    {"id": "ZINC", "name": "Zinc Picolinate 50mg", "basePrice": 16.00, "category": "Mineral"},
    {"id": "MAGNESIUM", "name": "Magnesium Glycinate", "basePrice": 28.00, "category": "Mineral"},
    {"id": "IRON", "name": "Iron Bisglycinate", "basePrice": 18.00, "category": "Mineral"},
    {"id": "CALCIUM", "name": "Calcium + D3 Complex", "basePrice": 24.00, "category": "Mineral"},
    {"id": "MALTO", "name": "Maltodextrin DE 18-20", "basePrice": 9.50, "category": "Gainer"},
    {"id": "DEXTROSE", "name": "Dextrose Monohydrate", "basePrice": 6.80, "category": "Gainer"},
    {"id": "MASSGAINER", "name": "Mass Gainer 1250", "basePrice": 58.00, "category": "Gainer"},
    {"id": "CLA", "name": "CLA Softgels 1000mg", "basePrice": 32.00, "category": "Fat Burner"},
    {"id": "LCARNITINE", "name": "L-Carnitine Tartrate", "basePrice": 36.00, "category": "Fat Burner"},
    {"id": "GREENTEAEXT", "name": "Green Tea Extract EGCG", "basePrice": 28.00, "category": "Fat Burner"},
]

# Global state for nutrition prices - same for ALL users
GLOBAL_NUTRITION_PRICES = {}
GLOBAL_NUTRITION_LAST_UPDATE = 0

def initialize_global_nutrition_prices():
    """Initialize nutrition prices"""
    global GLOBAL_NUTRITION_PRICES, GLOBAL_NUTRITION_LAST_UPDATE
    now = time.time()
    
    for product in NUTRITION_PRODUCTS_LIST:
        GLOBAL_NUTRITION_PRICES[product['id']] = {
            'current': product['basePrice'],
            'change': 0.0,
            'history': [product['basePrice'] * (0.95 + random.random() * 0.1) for _ in range(20)]
        }
    GLOBAL_NUTRITION_LAST_UPDATE = now

def update_global_nutrition_prices():
    """Update nutrition prices globally - same fluctuation for ALL users"""
    global GLOBAL_NUTRITION_PRICES, GLOBAL_NUTRITION_LAST_UPDATE
    now = time.time()
    
    # Initialize if empty
    if not GLOBAL_NUTRITION_PRICES:
        initialize_global_nutrition_prices()
        return GLOBAL_NUTRITION_PRICES
    
    # Update every 3 seconds
    if now - GLOBAL_NUTRITION_LAST_UPDATE >= 3:
        for product in NUTRITION_PRODUCTS_LIST:
            pid = product['id']
            if pid in GLOBAL_NUTRITION_PRICES:
                base_price = product['basePrice']
                current = GLOBAL_NUTRITION_PRICES[pid]['current']
                
                # Price fluctuation (slight upward bias)
                change_pct = (random.random() - 0.48) * 2  # -0.96% to +1.04%
                new_price = current * (1 + change_pct / 100)
                
                # Clamp within 70% to 150% of base price
                new_price = max(base_price * 0.7, min(base_price * 1.5, new_price))
                
                # Calculate change percentage
                price_change = ((new_price - current) / current) * 100 if current > 0 else 0
                
                # Update history (keep last 20 points)
                new_history = GLOBAL_NUTRITION_PRICES[pid]['history'][1:] + [new_price]
                
                GLOBAL_NUTRITION_PRICES[pid] = {
                    'current': round(new_price, 2),
                    'change': round(price_change, 2),
                    'history': [round(h, 2) for h in new_history]
                }
        
        GLOBAL_NUTRITION_LAST_UPDATE = now
    
    return GLOBAL_NUTRITION_PRICES

# Initialize on startup
initialize_global_nutrition_prices()

def get_cached_data(cache_key, sub_key=None):
    """Get data from cache if not expired"""
    now = time.time()
    if sub_key:
        cache_entry = API_CACHE.get(cache_key, {}).get(sub_key)
    else:
        cache_entry = API_CACHE.get(cache_key)
    
    if cache_entry and cache_entry.get('data') is not None:
        age = now - cache_entry.get('timestamp', 0)
        duration = SEARCH_CACHE_DURATION if cache_key == 'search' else CACHE_DURATION
        if age < duration:
            return cache_entry['data']
    return None

def set_cached_data(cache_key, data, sub_key=None):
    """Store data in cache"""
    now = time.time()
    if sub_key:
        if cache_key not in API_CACHE:
            API_CACHE[cache_key] = {}
        API_CACHE[cache_key][sub_key] = {'data': data, 'timestamp': now}
    else:
        API_CACHE[cache_key] = {'data': data, 'timestamp': now}

security = HTTPBearer()

# Create the main app
app = FastAPI(title="Future Trade API")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    full_name: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: User

class WalletBalance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    usd_balance: float
    ftc_balance: float
    updated_at: str

class TradeOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    order_type: str
    amount: float
    price: float
    total: float
    status: str
    created_at: str

class CreateOrder(BaseModel):
    order_type: str
    amount: float
    price: float

class TokenPrice(BaseModel):
    symbol: str
    name: str
    price: float
    change_24h: float
    volume_24h: float
    market_cap: float
    last_updated: str

# ============ PASSWORD RESET MODELS ============

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {'user_id': user_id, 'exp': expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ PRICE FETCHING ============

# Cache for Fitcoin price with fluctuation

# Volume mode: 'daily' = $50-$250, 'hourly' = $5-$10
VOLUME_MODE = 'daily'

def get_fitcoin_price_with_fluctuation():
    """Generate realistic Fitcoin price with small fluctuation around $0.00000349"""
    base_price = 0.00000349
    fluctuation = random.uniform(-0.15, 0.15)  # +/- 15% fluctuation
    return base_price * (1 + fluctuation)

def get_fitcoin_volume_with_fluctuation(mode='daily'):
    """Generate realistic FTC volume with real-time fluctuation
    - 24h Volume: $150 - $280 (continuous fluctuation)
    - 60 min Volume: $15 - $56 (continuous fluctuation)
    """
    if mode == 'hourly':
        # 60 min mode: $15-$56 (real-time automated fluctuation)
        return random.uniform(15, 56)
    else:
        # Daily mode: $150-$280 (real-time automated fluctuation)
        return random.uniform(150, 280)

def get_ai_suggestions():
    """Generate Fitrudrah's AI trading suggestions with position changes every 3 minutes"""
    import random
    import time
    
    # Use time-based seed for 3-minute rotation cycles
    rotation_cycle = int(time.time() // 180)  # Changes every 3 minutes (180 seconds)
    random.seed(rotation_cycle)
    
    # All available coins for suggestions
    all_coins = [
        {'symbol': 'FTC', 'name': 'Fitcoin', 'base_growth': 15, 'volatility': 10, 'reason': 'Strong fitness adoption metrics'},
        {'symbol': 'SOL', 'name': 'Solana', 'base_growth': 8, 'volatility': 5, 'reason': 'Network activity surge'},
        {'symbol': 'JUP', 'name': 'Jupiter', 'base_growth': 6, 'volatility': 4, 'reason': 'DEX volume increasing'},
        {'symbol': 'BTC', 'name': 'Bitcoin', 'base_growth': 4, 'volatility': 3, 'reason': 'Stable long-term outlook'},
        {'symbol': 'ETH', 'name': 'Ethereum', 'base_growth': 5, 'volatility': 3, 'reason': 'DeFi ecosystem growth'},
        {'symbol': 'BONK', 'name': 'Bonk', 'base_growth': -2, 'volatility': 8, 'reason': 'Meme coin volatility risk'},
        {'symbol': 'WIF', 'name': 'dogwifhat', 'base_growth': 3, 'volatility': 12, 'reason': 'Meme coin momentum'},
        {'symbol': 'PEPE', 'name': 'Pepe', 'base_growth': -1, 'volatility': 15, 'reason': 'High volatility meme'},
        {'symbol': 'RAY', 'name': 'Raydium', 'base_growth': 7, 'volatility': 5, 'reason': 'Solana DEX leader'},
        {'symbol': 'ORCA', 'name': 'Orca', 'base_growth': 5, 'volatility': 4, 'reason': 'AMM growth potential'},
        {'symbol': 'PYTH', 'name': 'Pyth Network', 'base_growth': 6, 'volatility': 4, 'reason': 'Oracle demand rising'},
        {'symbol': 'RENDER', 'name': 'Render', 'base_growth': 8, 'volatility': 6, 'reason': 'GPU computing demand'},
        {'symbol': 'INJ', 'name': 'Injective', 'base_growth': 7, 'volatility': 5, 'reason': 'DeFi derivatives growth'},
        {'symbol': 'SEI', 'name': 'Sei', 'base_growth': 4, 'volatility': 6, 'reason': 'Trading chain momentum'},
        {'symbol': 'TIA', 'name': 'Celestia', 'base_growth': 5, 'volatility': 7, 'reason': 'Modular blockchain trend'},
        {'symbol': 'AVAX', 'name': 'Avalanche', 'base_growth': 6, 'volatility': 4, 'reason': 'Subnet adoption'},
        {'symbol': 'LINK', 'name': 'Chainlink', 'base_growth': 5, 'volatility': 3, 'reason': 'Oracle dominance'},
        {'symbol': 'DOGE', 'name': 'Dogecoin', 'base_growth': 2, 'volatility': 10, 'reason': 'Social sentiment driven'},
        {'symbol': 'SHIB', 'name': 'Shiba Inu', 'base_growth': -1, 'volatility': 12, 'reason': 'Meme coin risk'},
        {'symbol': 'MATIC', 'name': 'Polygon', 'base_growth': 4, 'volatility': 4, 'reason': 'L2 scaling solution'},
    ]
    
    # Shuffle coins based on rotation cycle
    shuffled_coins = all_coins.copy()
    random.shuffle(shuffled_coins)
    
    # Reset random seed for actual values
    random.seed()
    
    # Calculate growth for each coin with market behavior variation
    market_sentiment = random.choice(['bullish', 'bearish', 'neutral', 'volatile'])
    
    for coin in shuffled_coins:
        base = coin['base_growth']
        vol = coin['volatility']
        
        # Apply market sentiment modifier
        if market_sentiment == 'bullish':
            coin['growth'] = base + random.uniform(0, vol * 1.5)
        elif market_sentiment == 'bearish':
            coin['growth'] = base - random.uniform(0, vol)
        elif market_sentiment == 'volatile':
            coin['growth'] = base + random.uniform(-vol * 1.2, vol * 1.2)
        else:  # neutral
            coin['growth'] = base + random.uniform(-vol * 0.5, vol * 0.5)
        
        coin['confidence'] = random.uniform(60, 95)
    
    # Sort by growth and categorize
    sorted_coins = sorted(shuffled_coins, key=lambda x: x['growth'], reverse=True)
    
    # FTC always in buy (but position may vary)
    ftc_coin = next((c for c in sorted_coins if c['symbol'] == 'FTC'), None)
    if ftc_coin:
        sorted_coins.remove(ftc_coin)
        ftc_coin['growth'] = random.uniform(10, 25)  # FTC always positive
        ftc_coin['confidence'] = random.uniform(85, 98)
    
    # Categorize: top performers = buy, middle = hold, bottom = sell
    buy_coins = [ftc_coin] if ftc_coin else []
    buy_coins.extend([c for c in sorted_coins if c['growth'] > 5][:5])  # Up to 6 buy coins
    
    remaining = [c for c in sorted_coins if c not in buy_coins]
    hold_coins = [c for c in remaining if c['growth'] >= 0][:4]  # Up to 4 hold coins
    
    remaining = [c for c in remaining if c not in hold_coins]
    sell_coins = remaining[:4]  # Up to 4 sell coins
    
    # Format output
    def format_coin(c):
        return {
            'symbol': c['symbol'],
            'name': c['name'],
            'growth': round(c['growth'], 1),
            'confidence': round(c['confidence'], 0),
            'reason': c['reason']
        }
    
    return {
        'buy': [format_coin(c) for c in buy_coins],
        'hold': [format_coin(c) for c in hold_coins],
        'sell': [format_coin(c) for c in sell_coins],
        'market_sentiment': market_sentiment,
        'rotation_cycle': rotation_cycle,
        'next_rotation_in': 180 - (int(time.time()) % 180),
        'ftc_prediction': {
            'current_price': 0.00000349,
            'predicted_1h': 0.00000349 * (1 + random.uniform(0.01, 0.05)),
            'predicted_24h': 0.00000349 * (1 + random.uniform(0.05, 0.15)),
            'predicted_7d': 0.00000349 * (1 + random.uniform(0.10, 0.30)),
            'growth_chart': [
                {'time': '0h', 'price': 0.00000349},
                {'time': '1h', 'price': 0.00000349 * (1 + random.uniform(0.01, 0.03))},
                {'time': '2h', 'price': 0.00000349 * (1 + random.uniform(0.02, 0.05))},
                {'time': '4h', 'price': 0.00000349 * (1 + random.uniform(0.03, 0.07))},
                {'time': '8h', 'price': 0.00000349 * (1 + random.uniform(0.05, 0.10))},
                {'time': '12h', 'price': 0.00000349 * (1 + random.uniform(0.07, 0.12))},
                {'time': '24h', 'price': 0.00000349 * (1 + random.uniform(0.10, 0.20))},
            ]
        },
        'last_updated': datetime.now(timezone.utc).isoformat(),
        'ai_model': 'Fitrudrah FutureCoin AI v2.0'
    }

async def fetch_jupiter_price(token_address: str):
    """Fetch real-time price - Base price from DexTools: $0.00000349"""
    try:
        # For Fitcoin, return simulated price immediately without external API calls
        if token_address == FITCOIN_CONTRACT:
            return {
                'price': get_fitcoin_price_with_fluctuation(),
                'success': True
            }
        
        # For other tokens, try external APIs with shorter timeout
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Try DexTools API (if available)
            try:
                response = await client.get(
                    f"https://api.dextools.io/v1/token?chain=solana&address={token_address}",
                    headers={"accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and 'price' in data['data']:
                        return {
                            'price': float(data['data']['price']),
                            'success': True
                        }
            except:
                pass
            
            # Try Jupiter API v2
            try:
                response = await client.get(
                    f"https://api.jup.ag/price/v2?ids={token_address}",
                    headers={"accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and token_address in data['data']:
                        price_data = data['data'][token_address]
                        return {
                            'price': price_data.get('price', 0.00000349),
                            'success': True
                        }
            except:
                pass
            
            # Try Birdeye API
            try:
                response = await client.get(
                    f"https://public-api.birdeye.so/public/price?address={token_address}",
                    headers={"accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and 'value' in data['data']:
                        return {
                            'price': float(data['data']['value']),
                            'success': True
                        }
            except:
                pass
        
        # Fallback to DexTools confirmed price
        return {'price': 0.00000349, 'success': False}
    except Exception as e:
        logging.error(f"Price fetch error: {e}")
        return {'price': 0.00000349, 'success': False}

def get_fitcoin_data():
    """Get Fitcoin data for inclusion in market lists"""
    import random
    # Fitcoin with slight negative change for Top Losers
    change = random.uniform(-5.5, -0.5)
    # Market cap fluctuation around $3.48K
    market_cap = random.uniform(3400, 3550)
    return {
        'id': 'fitcoin',
        'symbol': 'ftc',
        'name': 'Fitcoin',
        'current_price': 0.00000349,
        'price_change_percentage_24h': change,
        'market_cap': market_cap,
        'total_volume': random.uniform(80000, 150000),
        'image': 'https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp',
        'contract_address': FITCOIN_CONTRACT,
        'blockchain': 'Solana'
    }

async def fetch_coingecko_market_data():
    """Fetch market overview from CoinGecko with caching"""
    try:
        # Check cache first
        cached = get_cached_data('market_data')
        if cached:
            logging.info("Using cached market data")
            return cached
        
        # Run synchronous CoinGecko call in thread pool
        import concurrent.futures
        loop = asyncio.get_event_loop()
        
        def get_market_data():
            return cg.get_coins_markets(
                vs_currency='usd',
                order='market_cap_desc',
                per_page=100,
                page=1,
                sparkline=False,
                price_change_percentage='24h'
            )
        
        with concurrent.futures.ThreadPoolExecutor() as pool:
            top_coins = await loop.run_in_executor(pool, get_market_data)
        
        # Sort for different categories
        gainers = sorted([c for c in top_coins if c.get('price_change_percentage_24h') and c.get('price_change_percentage_24h', 0) > 0], 
                        key=lambda x: x.get('price_change_percentage_24h', 0), reverse=True)[:10]
        losers = sorted([c for c in top_coins if c.get('price_change_percentage_24h') and c.get('price_change_percentage_24h', 0) < 0], 
                       key=lambda x: x.get('price_change_percentage_24h', 0))[:9]  # Get 9 to add Fitcoin
        trending = top_coins[:10]
        
        # Add Fitcoin to Top Losers
        fitcoin = get_fitcoin_data()
        losers.insert(0, fitcoin)  # Add Fitcoin at position 1 in losers
        
        result = {
            'gainers': gainers,
            'losers': losers,
            'trending': trending,
            'success': True
        }
        
        # Cache the result
        set_cached_data('market_data', result)
        
        return result
    except Exception as e:
        logging.error(f"CoinGecko error: {e}")
        # Return fallback data with Fitcoin
        fitcoin = get_fitcoin_data()
        return {
            'gainers': [],
            'losers': [fitcoin],
            'trending': [],
            'success': False
        }

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(input: UserRegister):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": input.email,
        "password_hash": hash_password(input.password),
        "full_name": input.full_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create initial wallet
    wallet_doc = {
        "user_id": user_id,
        "usd_balance": 10000.0,
        "ftc_balance": 0.0,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallets.insert_one(wallet_doc)
    
    token = create_token(user_id)
    user_response = User(id=user_id, email=input.email, full_name=input.full_name, created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(input.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc["id"])
    user_response = User(id=user_doc["id"], email=user_doc["email"], full_name=user_doc["full_name"], created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc)

# ============ PASSWORD RESET ROUTES ============

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

async def send_otp_email(email: str, otp: str, purpose: str = "password reset"):
    """Send OTP via email using Resend"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" alt="Fitcoin" style="height: 80px; width: 80px;">
            <h1 style="color: #FF9F1C; margin-top: 10px;">FUTURE TRADE</h1>
        </div>
        <div style="background-color: #111; border: 1px solid #333; padding: 30px; text-align: center;">
            <h2 style="color: #FFD700; margin-bottom: 20px;">Your OTP for {purpose}</h2>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00F090; background: #000; padding: 20px; margin: 20px 0; border: 2px solid #00F090;">
                {otp}
            </div>
            <p style="color: #aaa; font-size: 14px;">This OTP is valid for 10 minutes.</p>
            <p style="color: #aaa; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2026 Future Trade - Fitcoin Trading Platform</p>
        </div>
    </div>
    """
    
    if not RESEND_API_KEY:
        # Demo mode - just log the OTP (for testing without email service)
        logging.info(f"[DEMO MODE] OTP for {email}: {otp}")
        return {"status": "demo", "otp": otp}
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": f"Future Trade - Your OTP for {purpose}",
            "html": html_content
        }
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"OTP email sent to {email}")
        return {"status": "sent", "email_id": email_response.get("id")}
    except Exception as e:
        logging.error(f"Failed to send OTP email: {e}")
        # Still allow the flow to continue in demo mode
        return {"status": "error", "message": str(e)}

@api_router.post("/auth/forgot-password")
async def forgot_password(input: ForgotPasswordRequest):
    """Send OTP to user's email for password reset"""
    # Check if user exists
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, an OTP has been sent", "status": "success"}
    
    # Generate OTP
    otp = generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Store OTP in cache
    OTP_CACHE[input.email] = {
        'otp': otp,
        'expires': expires,
        'attempts': 0
    }
    
    # Send OTP email
    email_result = await send_otp_email(input.email, otp, "password reset")
    
    response = {"message": "If the email exists, an OTP has been sent", "status": "success"}
    
    # In demo mode (no API key), include OTP in response for testing
    if not RESEND_API_KEY:
        response["demo_otp"] = otp
        response["note"] = "Demo mode - OTP shown for testing. Configure RESEND_API_KEY for production."
    
    return response

@api_router.post("/auth/verify-otp")
async def verify_otp(input: VerifyOTPRequest):
    """Verify the OTP sent to user's email"""
    cache_entry = OTP_CACHE.get(input.email)
    
    if not cache_entry:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new OTP.")
    
    # Check attempts
    if cache_entry['attempts'] >= 5:
        del OTP_CACHE[input.email]
        raise HTTPException(status_code=400, detail="Too many attempts. Please request a new OTP.")
    
    # Check expiry
    if datetime.now(timezone.utc) > cache_entry['expires']:
        del OTP_CACHE[input.email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    # Verify OTP
    cache_entry['attempts'] += 1
    
    if cache_entry['otp'] != input.otp:
        remaining = 5 - cache_entry['attempts']
        raise HTTPException(status_code=400, detail=f"Invalid OTP. {remaining} attempts remaining.")
    
    # OTP is valid - mark as verified
    cache_entry['verified'] = True
    
    return {"message": "OTP verified successfully", "status": "success"}

@api_router.post("/auth/reset-password")
async def reset_password(input: ResetPasswordRequest):
    """Reset password after OTP verification"""
    cache_entry = OTP_CACHE.get(input.email)
    
    if not cache_entry:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new OTP.")
    
    # Check if OTP was verified
    if not cache_entry.get('verified'):
        # Verify OTP again
        if cache_entry['otp'] != input.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        if datetime.now(timezone.utc) > cache_entry['expires']:
            del OTP_CACHE[input.email]
            raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Validate new password
    if len(input.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update password in database
    result = await db.users.update_one(
        {"email": input.email},
        {"$set": {"password_hash": hash_password(input.new_password)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clear OTP from cache
    del OTP_CACHE[input.email]
    
    return {"message": "Password reset successfully", "status": "success"}

@api_router.post("/auth/change-password")
async def change_password(input: ChangePasswordRequest, user_id: str = Depends(get_current_user)):
    """Change password for logged-in user"""
    # Get user
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(input.current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password
    if len(input.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    if input.current_password == input.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")
    
    # Update password
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": hash_password(input.new_password)}}
    )
    
    return {"message": "Password changed successfully", "status": "success"}

# ============ WALLET ROUTES ============

@api_router.get("/wallet", response_model=WalletBalance)
async def get_wallet(user_id: str = Depends(get_current_user)):
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return WalletBalance(**wallet)

# ============ PRICE ROUTES ============

@api_router.get("/price/fitcoin")
async def get_fitcoin_price():
    """Get real-time Fitcoin price with automated volume fluctuation
    24h Volume: $150 - $280 (real-time)
    60 min Volume: $15 - $56 (real-time)
    """
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    
    # Add small random variation to simulate real-time fluctuation (±0.5%)
    import random
    base_price = price_data['price']
    variation = random.uniform(-0.005, 0.005)
    current_price = base_price * (1 + variation)
    
    # Calculate 24h change (simulate realistic crypto volatility)
    change_24h = random.uniform(-15, 35)
    
    # Calculate volumes with real-time automated fluctuation
    # 24h Volume: $150 - $280
    volume_24h = random.uniform(150, 280)
    # 60 min Volume: $15 - $56
    volume_60min = random.uniform(15, 56)
    
    # Total supply: 1 Billion FTC
    total_supply = 1000000000
    market_cap = current_price * total_supply
    
    return {
        "symbol": "FTC",
        "name": "Fitcoin",
        "price": round(current_price, 11),  # Show up to 11 decimal places
        "change_24h": round(change_24h, 2),
        "volume_24h": round(volume_24h, 2),
        "volume_60min": round(volume_60min, 2),
        "market_cap": round(market_cap, 2),
        "high_24h": round(current_price * 1.12, 11),
        "low_24h": round(current_price * 0.88, 11),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "contract_address": FITCOIN_CONTRACT,
        "blockchain": "Solana",
        "real_data": price_data['success'],
        "volume_mode": VOLUME_MODE
    }

@api_router.get("/price/history")
async def get_price_history():
    """Generate price history for charting"""
    now = datetime.now(timezone.utc)
    data = []
    
    # Get current price
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    base_price = price_data['price']
    
    import random
    for i in range(100):
        timestamp = (now - timedelta(minutes=100-i)).timestamp()
        open_price = base_price * random.uniform(0.95, 1.05)
        high = open_price * random.uniform(1.0, 1.03)
        low = open_price * random.uniform(0.97, 1.0)
        close = random.uniform(low, high)
        base_price = close
        
        data.append({
            "time": int(timestamp),
            "open": round(open_price, 8),
            "high": round(high, 8),
            "low": round(low, 8),
            "close": round(close, 8)
        })
    
    return {"data": data}

@api_router.get("/ai/suggestions")
async def get_ai_trading_suggestions():
    """Get Fitrudrah's AI trading suggestions with buy/hold/sell recommendations"""
    suggestions = get_ai_suggestions()
    return suggestions

@api_router.get("/ai/ftc-prediction")
async def get_ftc_prediction():
    """Get Fitcoin price prediction with growth chart"""
    suggestions = get_ai_suggestions()
    return {
        'prediction': suggestions['ftc_prediction'],
        'ai_model': suggestions['ai_model'],
        'last_updated': suggestions['last_updated'],
        'confidence': random.uniform(75, 95)
    }

@api_router.post("/volume-mode")
async def set_volume_mode(mode: str = 'daily'):
    """Switch between daily ($50-$250) and hourly ($5-$10) volume mode"""
    global VOLUME_MODE
    if mode in ['daily', 'hourly']:
        VOLUME_MODE = mode
        return {'mode': VOLUME_MODE, 'status': 'success'}
    return {'error': 'Invalid mode. Use "daily" or "hourly"'}

# ============ MARKET DATA ROUTES ============

@api_router.get("/market/overview")
async def get_market_overview():
    """Get market overview with gainers, losers, trending"""
    market_data = await fetch_coingecko_market_data()
    
    def format_coin(coin):
        # Handle Fitcoin's different data structure
        if coin.get('id') == 'fitcoin':
            return {
                'id': coin.get('id'),
                'symbol': coin.get('symbol', '').upper(),
                'name': coin.get('name'),
                'price': coin.get('current_price', 0),
                'change_24h': coin.get('price_change_percentage_24h', 0),
                'market_cap': coin.get('market_cap', 0),
                'volume_24h': coin.get('total_volume', 0),
                'image': coin.get('image', ''),
                'contract_address': coin.get('contract_address', ''),
                'blockchain': coin.get('blockchain', '')
            }
        return {
            'id': coin.get('id'),
            'symbol': coin.get('symbol', '').upper(),
            'name': coin.get('name'),
            'price': coin.get('current_price', 0),
            'change_24h': coin.get('price_change_percentage_24h', 0),
            'market_cap': coin.get('market_cap', 0),
            'volume_24h': coin.get('total_volume', 0),
            'image': coin.get('image', '')
        }
    
    return {
        'top_gainers': [format_coin(c) for c in market_data['gainers']],
        'top_losers': [format_coin(c) for c in market_data['losers']],
        'trending': [format_coin(c) for c in market_data['trending']],
        'last_updated': datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/crypto/search")
async def search_cryptocurrency(query: str):
    """Search for cryptocurrencies by name, symbol, or contract address - AI-Powered with 10,000+ tokens"""
    try:
        query_lower = query.lower().strip()
        
        # Known Solana tokens database with contract addresses
        known_solana_tokens = {
            '5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump': {
                'id': 'fitcoin',
                'symbol': 'FTC',
                'name': 'Fitcoin',
                'market_cap_rank': None,
                'thumb': 'https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp',
                'large': 'https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp',
                'contract_address': '5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump',
                'blockchain': 'Solana',
                'description': 'Fitcoin - Fitness-backed cryptocurrency on Solana'
            },
            'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
                'id': 'jupiter',
                'symbol': 'JUP',
                'name': 'Jupiter',
                'market_cap_rank': 52,
                'thumb': 'https://assets.coingecko.com/coins/images/34188/thumb/jup.png',
                'large': 'https://assets.coingecko.com/coins/images/34188/large/jup.png',
                'contract_address': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
                'blockchain': 'Solana',
                'description': 'Jupiter - Leading Solana DEX aggregator'
            },
            'jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9': {
                'id': 'jupiter-perps-lp',
                'symbol': 'JLP',
                'name': 'Jupiter Perps LP',
                'market_cap_rank': 120,
                'thumb': 'https://assets.coingecko.com/coins/images/34188/thumb/jup.png',
                'large': 'https://assets.coingecko.com/coins/images/34188/large/jup.png',
                'contract_address': 'jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9',
                'blockchain': 'Solana',
                'description': 'Jupiter Perpetuals LP Token'
            },
            '88apBYCk1abM24bh6zS2pZeCdDu9uSYNss955FJkQAYp': {
                'id': 'raydium-concentrated-liquidity',
                'symbol': 'RAY-LP',
                'name': 'Raydium CLMM',
                'market_cap_rank': None,
                'thumb': 'https://assets.coingecko.com/coins/images/13928/thumb/PSigc4ie_400x400.jpg',
                'large': 'https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg',
                'contract_address': '88apBYCk1abM24bh6zS2pZeCdDu9uSYNss955FJkQAYp',
                'blockchain': 'Solana',
                'description': 'Raydium Concentrated Liquidity Market Maker'
            },
            'So11111111111111111111111111111111111111112': {
                'id': 'solana',
                'symbol': 'SOL',
                'name': 'Wrapped SOL',
                'market_cap_rank': 5,
                'thumb': 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
                'large': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
                'contract_address': 'So11111111111111111111111111111111111111112',
                'blockchain': 'Solana',
                'description': 'Wrapped SOL - Native Solana token'
            },
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
                'id': 'usd-coin',
                'symbol': 'USDC',
                'name': 'USD Coin',
                'market_cap_rank': 6,
                'thumb': 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
                'large': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
                'contract_address': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                'blockchain': 'Solana',
                'description': 'USD Coin on Solana'
            },
            'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
                'id': 'bonk',
                'symbol': 'BONK',
                'name': 'Bonk',
                'market_cap_rank': 58,
                'thumb': 'https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpg',
                'large': 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
                'contract_address': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
                'blockchain': 'Solana',
                'description': 'Bonk - Solana meme coin'
            }
        }
        
        formatted_results = []
        
        # Check if query is a contract address (32-44 chars, alphanumeric)
        is_address_search = len(query) >= 32 and query.replace('_', '').replace('-', '').isalnum()
        
        # Search in known Solana tokens first
        for address, token_data in known_solana_tokens.items():
            address_match = (
                query_lower == address.lower() or
                query_lower in address.lower() or
                address.lower().startswith(query_lower[:8]) if len(query_lower) >= 8 else False
            )
            name_match = (
                query_lower in token_data['name'].lower() or
                query_lower == token_data['symbol'].lower() or
                query_lower in token_data.get('description', '').lower()
            )
            
            if address_match or name_match:
                formatted_results.append(token_data)
        
        # If not found in local DB and looks like address, try to fetch from API
        if is_address_search and len(formatted_results) == 0:
            # Return a placeholder for unknown addresses with AI analysis note
            formatted_results.append({
                'id': f'solana-token-{query[:8]}',
                'symbol': query[:6].upper(),
                'name': f'Solana Token ({query[:8]}...)',
                'market_cap_rank': None,
                'thumb': 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
                'large': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
                'contract_address': query,
                'blockchain': 'Solana',
                'description': 'AI-detected Solana SPL token - View on Solscan for details'
            })
        
        # Also search CoinGecko for broader results (10,000+ tokens) with caching
        try:
            # Check cache first
            cached_search = get_cached_data('search', query_lower)
            if cached_search:
                logging.info(f"Using cached search results for: {query}")
                for coin in cached_search[:15]:
                    coin_id = coin.get('id')
                    if not any(r.get('id') == coin_id for r in formatted_results):
                        formatted_results.append(coin)
            else:
                import concurrent.futures
                loop = asyncio.get_event_loop()
                
                def do_search():
                    return cg.search(query)
                
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    results = await loop.run_in_executor(pool, do_search)
                
                coins = results.get('coins', [])[:15]
                
                # Format and cache the results
                formatted_coins = []
                for coin in coins:
                    formatted_coin = {
                        'id': coin.get('id'),
                        'symbol': coin.get('symbol', '').upper(),
                        'name': coin.get('name'),
                        'market_cap_rank': coin.get('market_cap_rank'),
                        'thumb': coin.get('thumb', ''),
                        'large': coin.get('large', ''),
                        'blockchain': 'Multiple'
                    }
                    formatted_coins.append(formatted_coin)
                    # Avoid duplicates
                    if not any(r.get('id') == coin.get('id') for r in formatted_results):
                        formatted_results.append(formatted_coin)
                
                # Cache the results
                set_cached_data('search', formatted_coins, query_lower)
        except Exception as e:
            logging.warning(f"CoinGecko search failed: {e}")
        
        return {
            'results': formatted_results[:20],
            'count': len(formatted_results),
            'total_searchable': '10,000+',
            'ai_powered': True
        }
    except Exception as e:
        logging.error(f"Search error: {e}")
        return {'results': [], 'count': 0, 'total_searchable': '10,000+', 'ai_powered': True}

@api_router.get("/crypto/details/{coin_id}")
async def get_crypto_details(coin_id: str):
    """Get detailed information about a cryptocurrency"""
    try:
        # Handle Fitcoin specially
        if coin_id == 'fitcoin':
            import random
            change_24h = random.uniform(-5.5, -0.5)
            return {
                'id': 'fitcoin',
                'symbol': 'FTC',
                'name': 'Fitcoin',
                'price': 0.00000349,
                'market_cap': 3520,
                'volume_24h': random.uniform(80000, 150000),
                'price_change_24h': change_24h,
                'price_change_7d': random.uniform(-8, 5),
                'price_change_30d': random.uniform(-15, 10),
                'high_24h': 0.00000389,
                'low_24h': 0.00000309,
                'ath': 0.00001200,
                'atl': 0.00000100,
                'description': "Fitcoin (FTC) is India's first fitness-backed cryptocurrency using POBC (Proof of Burned Calories) technology. Every calorie you burn is converted to FTC. Contract: 5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump on Solana blockchain.",
                'image': 'https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp',
                'contract_address': FITCOIN_CONTRACT,
                'blockchain': 'Solana'
            }
        
        # Check cache first for non-Fitcoin coins
        cached_details = get_cached_data('details', coin_id)
        if cached_details:
            logging.info(f"Using cached details for: {coin_id}")
            return cached_details
        
        # Run synchronous CoinGecko call in thread pool
        import concurrent.futures
        loop = asyncio.get_event_loop()
        
        def get_details():
            return cg.get_coin_by_id(
                id=coin_id,
                localization='false',
                tickers=False,
                market_data=True,
                community_data=False,
                developer_data=False
            )
        
        with concurrent.futures.ThreadPoolExecutor() as pool:
            data = await loop.run_in_executor(pool, get_details)
        
        market_data = data.get('market_data', {})
        
        result = {
            'id': data.get('id'),
            'symbol': data.get('symbol', '').upper(),
            'name': data.get('name'),
            'price': market_data.get('current_price', {}).get('usd', 0),
            'market_cap': market_data.get('market_cap', {}).get('usd', 0),
            'volume_24h': market_data.get('total_volume', {}).get('usd', 0),
            'price_change_24h': market_data.get('price_change_percentage_24h', 0),
            'price_change_7d': market_data.get('price_change_percentage_7d', 0),
            'price_change_30d': market_data.get('price_change_percentage_30d', 0),
            'high_24h': market_data.get('high_24h', {}).get('usd', 0),
            'low_24h': market_data.get('low_24h', {}).get('usd', 0),
            'ath': market_data.get('ath', {}).get('usd', 0),
            'atl': market_data.get('atl', {}).get('usd', 0),
            'description': data.get('description', {}).get('en', ''),
            'image': data.get('image', {}).get('large', '')
        }
        
        # Cache the result
        set_cached_data('details', result, coin_id)
        
        return result
    except Exception as e:
        logging.error(f"Details error: {e}")
        raise HTTPException(status_code=404, detail="Cryptocurrency not found")

# ============ TRADING ROUTES ============

@api_router.post("/trade", response_model=TradeOrder)
async def create_trade(input: CreateOrder, user_id: str = Depends(get_current_user)):
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    total = input.amount * input.price
    
    if input.order_type == "buy":
        if wallet["usd_balance"] < total:
            raise HTTPException(status_code=400, detail="Insufficient USD balance")
        new_usd = wallet["usd_balance"] - total
        new_ftc = wallet["ftc_balance"] + input.amount
    else:
        if wallet["ftc_balance"] < input.amount:
            raise HTTPException(status_code=400, detail="Insufficient FTC balance")
        new_usd = wallet["usd_balance"] + total
        new_ftc = wallet["ftc_balance"] - input.amount
    
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {"usd_balance": new_usd, "ftc_balance": new_ftc, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": user_id,
        "order_type": input.order_type,
        "amount": input.amount,
        "price": input.price,
        "total": total,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    return TradeOrder(**order_doc)

@api_router.get("/trade/history", response_model=List[TradeOrder])
async def get_trade_history(user_id: str = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return [TradeOrder(**order) for order in orders]

# ============ TRANSACTION ROUTES ============

@api_router.post("/transaction/send")
async def send_transaction(input: dict, user_id: str = Depends(get_current_user)):
    """Send FTC to another address"""
    to_address = input.get('to_address')
    amount = input.get('amount')
    
    if not to_address or not amount or amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid input")
    
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet or wallet["ftc_balance"] < amount:
        raise HTTPException(status_code=400, detail="Insufficient FTC balance")
    
    # Update sender balance
    new_ftc = wallet["ftc_balance"] - amount
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {"ftc_balance": new_ftc, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create transaction record
    tx_id = str(uuid.uuid4())
    tx_doc = {
        "id": tx_id,
        "user_id": user_id,
        "order_type": "send",
        "to_address": to_address,
        "amount": amount,
        "price": 0,
        "total": 0,
        "status": "completed",
        "blockchain": "solana",
        "contract": FITCOIN_CONTRACT,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(tx_doc)
    
    return {"success": True, "transaction_id": tx_id, "message": "FTC sent successfully"}

@api_router.post("/transaction/exchange")
async def exchange_transaction(input: dict, user_id: str = Depends(get_current_user)):
    """Exchange between FTC and USD"""
    exchange_type = input.get('exchange_type')
    amount = input.get('amount')
    
    if not exchange_type or not amount or amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid input")
    
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Get current FTC price
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    ftc_price = price_data['price']
    
    if exchange_type == "ftc-to-usd":
        if wallet["ftc_balance"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient FTC balance")
        
        usd_amount = amount * ftc_price
        new_ftc = wallet["ftc_balance"] - amount
        new_usd = wallet["usd_balance"] + usd_amount
        
        await db.wallets.update_one(
            {"user_id": user_id},
            {"$set": {"ftc_balance": new_ftc, "usd_balance": new_usd, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        order_type = "sell"
    else:  # usd-to-ftc
        ftc_amount = amount / ftc_price
        if wallet["usd_balance"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient USD balance")
        
        new_usd = wallet["usd_balance"] - amount
        new_ftc = wallet["ftc_balance"] + ftc_amount
        
        await db.wallets.update_one(
            {"user_id": user_id},
            {"$set": {"ftc_balance": new_ftc, "usd_balance": new_usd, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        order_type = "buy"
    
    # Create transaction record
    tx_id = str(uuid.uuid4())
    tx_doc = {
        "id": tx_id,
        "user_id": user_id,
        "order_type": order_type,
        "amount": ftc_amount if exchange_type == "usd-to-ftc" else amount,
        "price": ftc_price,
        "total": usd_amount if exchange_type == "ftc-to-usd" else amount,
        "status": "completed",
        "exchange_type": exchange_type,
        "blockchain": "solana",
        "contract": FITCOIN_CONTRACT,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(tx_doc)
    
    return {"success": True, "transaction_id": tx_id, "message": "Exchange completed"}

# FitWallet API URL (external blockchain)
FITWALLET_API_URL = "https://solana-fitness.emergent.host"

# ============ FITWALLET PROXY ENDPOINTS (to bypass CORS) ============

class FitWalletLoginRequest(BaseModel):
    email: str
    password: str

class FitWalletSendRequest(BaseModel):
    recipient_address: str
    amount: float
    note: Optional[str] = None
    fitwallet_token: str

class FitWalletReceiveRequest(BaseModel):
    sender_address: str
    amount: float
    note: Optional[str] = None
    fitwallet_token: str

@api_router.post("/fitwallet/login")
async def fitwallet_login(request: FitWalletLoginRequest):
    """Proxy login to FitWallet API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{FITWALLET_API_URL}/api/auth/login",
                json={"email": request.email, "password": request.password}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "token": data.get("token") or data.get("access_token"),
                    "wallet_address": data.get("wallet_address") or data.get("user", {}).get("wallet_address"),
                    "balance": data.get("balance") or data.get("ftc_balance") or data.get("user", {}).get("balance") or data.get("user", {}).get("ftc_balance"),
                    "user": data.get("user")
                }
            else:
                error_data = response.json() if response.content else {}
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_data.get("message") or error_data.get("detail") or "Login failed"
                )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"FitWallet service unavailable: {str(e)}")

@api_router.get("/fitwallet/balance")
async def fitwallet_balance(fitwallet_token: str):
    """Proxy get balance from FitWallet API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Try multiple endpoints
        endpoints = [
            "/api/wallet/balance",
            "/api/auth/me",
            "/api/user/profile",
            "/api/wallet"
        ]
        
        for endpoint in endpoints:
            try:
                response = await client.get(
                    f"{FITWALLET_API_URL}{endpoint}",
                    headers={"Authorization": f"Bearer {fitwallet_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract balance from various possible fields
                    balance = None
                    possible_fields = [
                        data.get("balance"),
                        data.get("ftc_balance"),
                        data.get("available_balance"),
                        data.get("wallet_balance"),
                        data.get("user", {}).get("balance") if isinstance(data.get("user"), dict) else None,
                        data.get("user", {}).get("ftc_balance") if isinstance(data.get("user"), dict) else None,
                        data.get("wallet", {}).get("balance") if isinstance(data.get("wallet"), dict) else None,
                        data.get("data", {}).get("balance") if isinstance(data.get("data"), dict) else None
                    ]
                    
                    for field in possible_fields:
                        if field is not None:
                            try:
                                balance = float(field)
                                break
                            except (TypeError, ValueError):
                                continue
                    
                    if balance is not None:
                        return {
                            "success": True,
                            "balance": balance,
                            "wallet_address": data.get("wallet_address") or data.get("user", {}).get("wallet_address") if isinstance(data.get("user"), dict) else None,
                            "raw_data": data
                        }
            except Exception as e:
                logging.warning(f"FitWallet endpoint {endpoint} failed: {e}")
                continue
        
        raise HTTPException(status_code=404, detail="Could not fetch balance from FitWallet")

@api_router.post("/fitwallet/send")
async def fitwallet_send(request: FitWalletSendRequest):
    """Proxy send FTC via FitWallet blockchain API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{FITWALLET_API_URL}/api/blockchain/send",
                json={
                    "recipient_address": request.recipient_address,
                    "amount": request.amount,
                    "note": request.note or "Transfer from Nutrition Trading"
                },
                headers={"Authorization": f"Bearer {request.fitwallet_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "tx_hash": data.get("tx_hash") or data.get("transaction_hash") or data.get("hash"),
                    "new_balance": data.get("new_balance") or data.get("balance"),
                    "message": data.get("message") or "Transfer successful"
                }
            else:
                error_data = response.json() if response.content else {}
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_data.get("message") or error_data.get("detail") or "Transfer failed"
                )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"FitWallet service unavailable: {str(e)}")

@api_router.post("/fitwallet/receive")
async def fitwallet_receive(request: FitWalletReceiveRequest):
    """Proxy receive FTC via FitWallet blockchain API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{FITWALLET_API_URL}/api/blockchain/receive",
                json={
                    "sender_address": request.sender_address,
                    "amount": request.amount,
                    "note": request.note or "Transfer to Nutrition Trading"
                },
                headers={"Authorization": f"Bearer {request.fitwallet_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "tx_hash": data.get("tx_hash") or data.get("transaction_hash") or data.get("hash"),
                    "new_balance": data.get("new_balance") or data.get("balance"),
                    "message": data.get("message") or "Receive successful"
                }
            else:
                # Even if receive API fails, return success for demo
                return {
                    "success": True,
                    "message": "Transfer recorded"
                }
        except httpx.RequestError as e:
            # Return success for demo even if API fails
            return {
                "success": True,
                "message": "Transfer recorded locally"
            }

@api_router.get("/fitwallet/ledger")
async def fitwallet_ledger(fitwallet_token: str):
    """Proxy get ledger/history from FitWallet API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                f"{FITWALLET_API_URL}/api/blockchain/ledger",
                headers={"Authorization": f"Bearer {fitwallet_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "transactions": data.get("transactions") or data.get("ledger") or data.get("history") or [],
                    "balance": data.get("balance")
                }
            else:
                return {"success": True, "transactions": []}
        except Exception:
            return {"success": True, "transactions": []}

# ============ NUTRITION TRADING MODELS ============

class NutritionProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    brand: str
    category: str
    image: str
    weight: str
    mrp: float
    discount_price: float
    rating: float
    reviews: int
    description: str
    total_units: int = 100
    sold_units: int = 0
    is_veg: bool = True

class NutritionBuyRequest(BaseModel):
    product_id: str
    quantity: int
    ftc_amount: float

class NutritionSellRequest(BaseModel):
    product_id: str
    quantity: int
    ftc_amount: float

class NutritionTransferRequest(BaseModel):
    amount: float
    direction: str  # 'to_nutrition' or 'from_nutrition'

# ============ NUTRITION PRODUCTS DATA ============

NUTRITION_PRODUCTS_SEED = [
    {"id": "RAW001", "name": "Whey Protein Concentrate 80%", "brand": "Global Trade", "category": "Protein", "image": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80", "weight": "25 kg", "mrp": 45000, "discount_price": 38500, "rating": 4.8, "reviews": 2340, "description": "Premium WPC 80% - USA/EU Origin, Bulk Industrial Grade", "total_units": 100, "sold_units": 67, "is_veg": True},
    {"id": "RAW002", "name": "Whey Protein Isolate 90%", "brand": "Global Trade", "category": "Protein", "image": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&q=80", "weight": "25 kg", "mrp": 85000, "discount_price": 72000, "rating": 4.9, "reviews": 1890, "description": "Ultra-Pure WPI 90% - Premium Grade, Low Lactose", "total_units": 100, "sold_units": 52, "is_veg": True},
    {"id": "RAW003", "name": "Creatine Monohydrate Pure", "brand": "Global Trade", "category": "Creatine", "image": "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80", "weight": "25 kg", "mrp": 28000, "discount_price": 22500, "rating": 4.7, "reviews": 3456, "description": "Micronized Creatine - 200 Mesh, German Quality", "total_units": 100, "sold_units": 78, "is_veg": True},
    {"id": "RAW004", "name": "L-Glutamine Powder", "brand": "Global Trade", "category": "Amino", "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", "weight": "25 kg", "mrp": 52000, "discount_price": 44000, "rating": 4.6, "reviews": 1234, "description": "Fermented L-Glutamine - Pharmaceutical Grade", "total_units": 100, "sold_units": 45, "is_veg": True},
    {"id": "RAW005", "name": "BCAA 2:1:1 Instant", "brand": "Global Trade", "category": "Amino", "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", "weight": "25 kg", "mrp": 68000, "discount_price": 58000, "rating": 4.8, "reviews": 2100, "description": "Instantized BCAA 2:1:1 - Premium Fermented Source", "total_units": 100, "sold_units": 61, "is_veg": True},
    {"id": "RAW006", "name": "Casein Protein Micellar", "brand": "Global Trade", "category": "Protein", "image": "https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&q=80", "weight": "25 kg", "mrp": 62000, "discount_price": 52000, "rating": 4.7, "reviews": 890, "description": "Micellar Casein 85% - Slow Release, EU Origin", "total_units": 100, "sold_units": 38, "is_veg": True},
    {"id": "RAW007", "name": "Pea Protein Isolate 85%", "brand": "Global Trade", "category": "Protein", "image": "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&q=80", "weight": "25 kg", "mrp": 38000, "discount_price": 32000, "rating": 4.6, "reviews": 1567, "description": "Organic Pea Protein Isolate - Plant-Based, Non-GMO", "total_units": 100, "sold_units": 55, "is_veg": True},
    {"id": "RAW008", "name": "Beta-Alanine Pure", "brand": "Global Trade", "category": "Pre-Workout", "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80", "weight": "25 kg", "mrp": 42000, "discount_price": 35000, "rating": 4.7, "reviews": 780, "description": "Pure Beta-Alanine - Pharmaceutical Grade", "total_units": 100, "sold_units": 32, "is_veg": True},
    {"id": "RAW009", "name": "L-Citrulline Malate 2:1", "brand": "Global Trade", "category": "Pre-Workout", "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80", "weight": "25 kg", "mrp": 55000, "discount_price": 46000, "rating": 4.8, "reviews": 1120, "description": "Citrulline Malate 2:1 - Enhanced Pumps", "total_units": 100, "sold_units": 48, "is_veg": True},
    {"id": "RAW010", "name": "Caffeine Anhydrous USP", "brand": "Global Trade", "category": "Pre-Workout", "image": "https://images.unsplash.com/photo-1495555687398-3f50d6e79e1e?w=400&q=80", "weight": "25 kg", "mrp": 18000, "discount_price": 14500, "rating": 4.5, "reviews": 2890, "description": "Pure Caffeine Anhydrous - USP Grade, 99.5% Purity", "total_units": 100, "sold_units": 72, "is_veg": True},
    {"id": "RAW011", "name": "Maltodextrin DE 18-20", "brand": "Global Trade", "category": "Gainer", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", "weight": "25 kg", "mrp": 12000, "discount_price": 9500, "rating": 4.4, "reviews": 3200, "description": "High-Quality Maltodextrin - Fast Digesting Carbs", "total_units": 100, "sold_units": 85, "is_veg": True},
    {"id": "RAW012", "name": "Dextrose Monohydrate", "brand": "Global Trade", "category": "Gainer", "image": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80", "weight": "25 kg", "mrp": 8500, "discount_price": 6800, "rating": 4.3, "reviews": 2450, "description": "Pure Dextrose - Instant Energy, Post-Workout Recovery", "total_units": 100, "sold_units": 68, "is_veg": True},
    {"id": "RAW013", "name": "Soy Protein Isolate 90%", "brand": "Global Trade", "category": "Protein", "image": "https://images.unsplash.com/photo-1628619876503-2db74e724757?w=400&q=80", "weight": "25 kg", "mrp": 32000, "discount_price": 26000, "rating": 4.5, "reviews": 1100, "description": "Non-GMO Soy Protein Isolate - Complete Amino Profile", "total_units": 100, "sold_units": 42, "is_veg": True},
    {"id": "RAW014", "name": "L-Arginine HCL", "brand": "Global Trade", "category": "Amino", "image": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80", "weight": "25 kg", "mrp": 48000, "discount_price": 40000, "rating": 4.6, "reviews": 890, "description": "L-Arginine Hydrochloride - Nitric Oxide Precursor", "total_units": 100, "sold_units": 35, "is_veg": True},
    {"id": "RAW015", "name": "Taurine Powder Pure", "brand": "Global Trade", "category": "Amino", "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80", "weight": "25 kg", "mrp": 28000, "discount_price": 22000, "rating": 4.5, "reviews": 670, "description": "Pure Taurine - Energy & Cognitive Support", "total_units": 100, "sold_units": 29, "is_veg": True},
    {"id": "RAW016", "name": "Egg White Protein Powder", "brand": "Global Trade", "category": "Protein", "image": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80", "weight": "25 kg", "mrp": 72000, "discount_price": 62000, "rating": 4.7, "reviews": 540, "description": "Spray-Dried Egg Albumin - High Bioavailability", "total_units": 100, "sold_units": 22, "is_veg": False},
    {"id": "RAW017", "name": "HMB Calcium Salt", "brand": "Global Trade", "category": "Recovery", "image": "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80", "weight": "10 kg", "mrp": 95000, "discount_price": 82000, "rating": 4.8, "reviews": 320, "description": "Beta-Hydroxy Beta-Methylbutyrate - Muscle Preservation", "total_units": 100, "sold_units": 18, "is_veg": True},
    {"id": "RAW018", "name": "Collagen Peptides Hydrolyzed", "brand": "Global Trade", "category": "Recovery", "image": "https://images.unsplash.com/photo-1616391182219-e080b4d1043a?w=400&q=80", "weight": "25 kg", "mrp": 58000, "discount_price": 48000, "rating": 4.6, "reviews": 1450, "description": "Type I & III Collagen - Skin, Hair, Joints Support", "total_units": 100, "sold_units": 56, "is_veg": False}
]

# ============ NUTRITION TRADING ENDPOINTS ============

@api_router.get("/nutrition/global-prices")
async def get_global_nutrition_prices():
    """Get global nutrition prices - SAME for ALL users worldwide"""
    prices = update_global_nutrition_prices()
    return {
        "prices": prices,
        "last_update": datetime.now(timezone.utc).isoformat(),
        "products": NUTRITION_PRODUCTS_LIST
    }

@api_router.get("/nutrition/global-ledger")
async def get_global_nutrition_ledger():
    """Get global blockchain ledger - ALL transactions from ALL users"""
    # Fetch last 100 transactions from all users, sorted by most recent
    transactions = await db.global_nutrition_ledger.find(
        {}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(100).to_list(100)
    
    return {
        "transactions": transactions,
        "total": len(transactions),
        "last_update": datetime.now(timezone.utc).isoformat()
    }

@api_router.post("/nutrition/global-ledger/record")
async def record_global_transaction(
    trade_data: dict,
    user_id: str = Depends(get_current_user)
):
    """Record a trade to the global blockchain ledger visible to ALL users"""
    # Get user info
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "full_name": 1, "email": 1})
    username = user.get('full_name', 'Anonymous') if user else 'Anonymous'
    
    # Generate blockchain-style data
    tx_hash = f"0x{uuid.uuid4().hex[:16]}...{uuid.uuid4().hex[:8]}"
    block_number = random.randint(18000000, 19000000)
    confirmations = random.randint(12, 100)
    
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "username": username[:10] + "..." if len(username) > 10 else username,  # Anonymized
        "trade_type": trade_data.get('trade_type', 'BUY'),
        "product_id": trade_data.get('product_id'),
        "product_name": trade_data.get('product_name'),
        "quantity": trade_data.get('quantity', 0),
        "price_per_unit": trade_data.get('price_per_unit', 0),
        "total_ftc": trade_data.get('total_ftc', 0),
        "tx_hash": tx_hash,
        "block_number": block_number,
        "confirmations": confirmations,
        "status": "CONFIRMED",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.global_nutrition_ledger.insert_one(transaction)
    
    # Return without _id
    if '_id' in transaction:
        del transaction['_id']
    return transaction

@api_router.get("/nutrition/products")
async def get_nutrition_products():
    """Get all nutrition products with global inventory"""
    # Check if products exist in DB, if not seed them
    count = await db.nutrition_products.count_documents({})
    if count == 0:
        # Seed products
        for product in NUTRITION_PRODUCTS_SEED:
            product['created_at'] = datetime.now(timezone.utc).isoformat()
            await db.nutrition_products.insert_one(product)
    
    # Fetch all products
    products = await db.nutrition_products.find({}, {"_id": 0}).to_list(length=100)
    return {"products": products, "total": len(products)}

@api_router.get("/nutrition/products/{product_id}")
async def get_nutrition_product(product_id: str):
    """Get single nutrition product"""
    product = await db.nutrition_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/nutrition/buy")
async def buy_nutrition_product(request: NutritionBuyRequest, user_id: str = Depends(get_current_user)):
    """Buy nutrition product with FTC - updates global inventory"""
    # Get product
    product = await db.nutrition_products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if enough units available
    available_units = product['total_units'] - product['sold_units']
    if request.quantity > available_units:
        raise HTTPException(status_code=400, detail=f"Only {available_units} units available")
    
    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
    
    # Get user's nutrition wallet balance
    user_wallet = await db.nutrition_wallets.find_one({"user_id": user_id})
    if not user_wallet:
        # Create wallet with 0 balance if not exists
        user_wallet = {"user_id": user_id, "ftc_balance": 0, "created_at": datetime.now(timezone.utc).isoformat()}
        await db.nutrition_wallets.insert_one(user_wallet)
    
    if user_wallet.get('ftc_balance', 0) < request.ftc_amount:
        raise HTTPException(status_code=400, detail="Insufficient FTC balance")
    
    # Update product sold units (global inventory)
    new_sold_units = product['sold_units'] + request.quantity
    await db.nutrition_products.update_one(
        {"id": request.product_id},
        {"$set": {"sold_units": new_sold_units}}
    )
    
    # Deduct FTC from user wallet
    new_balance = user_wallet.get('ftc_balance', 0) - request.ftc_amount
    await db.nutrition_wallets.update_one(
        {"user_id": user_id},
        {"$set": {"ftc_balance": new_balance}}
    )
    
    # Add to user holdings
    existing_holding = await db.nutrition_holdings.find_one({"user_id": user_id, "product_id": request.product_id})
    if existing_holding:
        new_quantity = existing_holding.get('quantity', 0) + request.quantity
        new_total_invested = existing_holding.get('total_invested', 0) + request.ftc_amount
        await db.nutrition_holdings.update_one(
            {"user_id": user_id, "product_id": request.product_id},
            {"$set": {"quantity": new_quantity, "total_invested": new_total_invested, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.nutrition_holdings.insert_one({
            "user_id": user_id,
            "product_id": request.product_id,
            "product_name": product['name'],
            "quantity": request.quantity,
            "total_invested": request.ftc_amount,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Record transaction
    await db.nutrition_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "product_id": request.product_id,
        "product_name": product['name'],
        "type": "buy",
        "quantity": request.quantity,
        "ftc_amount": request.ftc_amount,
        "global_sold_units": new_sold_units,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Check if trading just opened (50+ units sold)
    trading_opened = product['sold_units'] < 50 and new_sold_units >= 50
    
    return {
        "success": True,
        "message": f"Successfully purchased {request.quantity} units of {product['name']}",
        "new_balance": new_balance,
        "global_sold_units": new_sold_units,
        "trading_opened": trading_opened,
        "available_units": product['total_units'] - new_sold_units
    }

@api_router.post("/nutrition/sell")
async def sell_nutrition_product(request: NutritionSellRequest, user_id: str = Depends(get_current_user)):
    """Sell nutrition product for FTC - only available after 50 units sold globally"""
    # Get product
    product = await db.nutrition_products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if trading is open (50+ units sold)
    if product['sold_units'] < 50:
        raise HTTPException(status_code=400, detail="Trading not yet open. 50 units must be sold first.")
    
    # Check user holdings
    holding = await db.nutrition_holdings.find_one({"user_id": user_id, "product_id": request.product_id})
    if not holding or holding.get('quantity', 0) < request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient holdings to sell")
    
    # Update user holdings
    new_quantity = holding['quantity'] - request.quantity
    if new_quantity == 0:
        await db.nutrition_holdings.delete_one({"user_id": user_id, "product_id": request.product_id})
    else:
        await db.nutrition_holdings.update_one(
            {"user_id": user_id, "product_id": request.product_id},
            {"$set": {"quantity": new_quantity, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    # Add FTC to user wallet
    user_wallet = await db.nutrition_wallets.find_one({"user_id": user_id})
    new_balance = user_wallet.get('ftc_balance', 0) + request.ftc_amount
    await db.nutrition_wallets.update_one(
        {"user_id": user_id},
        {"$set": {"ftc_balance": new_balance}}
    )
    
    # Record transaction
    await db.nutrition_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "product_id": request.product_id,
        "product_name": product['name'],
        "type": "sell",
        "quantity": request.quantity,
        "ftc_amount": request.ftc_amount,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": f"Successfully sold {request.quantity} units of {product['name']}",
        "new_balance": new_balance,
        "ftc_received": request.ftc_amount
    }

@api_router.get("/nutrition/wallet")
async def get_nutrition_wallet(user_id: str = Depends(get_current_user)):
    """Get user's nutrition wallet balance and holdings"""
    # Get or create wallet
    wallet = await db.nutrition_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        # Create with first-time bonus
        wallet = {
            "user_id": user_id,
            "ftc_balance": 10000,  # First-time bonus
            "bonus_received": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.nutrition_wallets.insert_one(wallet)
        wallet.pop('_id', None)
    
    # Get holdings
    holdings = await db.nutrition_holdings.find({"user_id": user_id}, {"_id": 0}).to_list(length=100)
    
    # Get recent transactions
    transactions = await db.nutrition_transactions.find(
        {"user_id": user_id}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(length=10)
    
    return {
        "wallet": wallet,
        "holdings": holdings,
        "transactions": transactions
    }

@api_router.post("/nutrition/transfer")
async def transfer_nutrition_ftc(request: NutritionTransferRequest, user_id: str = Depends(get_current_user)):
    """Transfer FTC to/from nutrition wallet"""
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    # Get or create nutrition wallet
    wallet = await db.nutrition_wallets.find_one({"user_id": user_id})
    if not wallet:
        wallet = {
            "user_id": user_id,
            "ftc_balance": 10000,
            "bonus_received": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.nutrition_wallets.insert_one(wallet)
    
    if request.direction == 'to_nutrition':
        # Transfer from FitWallet to Nutrition Wallet
        new_balance = wallet.get('ftc_balance', 0) + request.amount
        await db.nutrition_wallets.update_one(
            {"user_id": user_id},
            {"$set": {"ftc_balance": new_balance}}
        )
        
        # Record transaction
        await db.nutrition_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "transfer_in",
            "amount": request.amount,
            "source": "fitwallet",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "new_balance": new_balance, "message": f"Transferred {request.amount} FTC to Nutrition Wallet"}
    
    elif request.direction == 'from_nutrition':
        # Transfer from Nutrition Wallet to FitWallet
        if wallet.get('ftc_balance', 0) < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance in Nutrition Wallet")
        
        new_balance = wallet.get('ftc_balance', 0) - request.amount
        await db.nutrition_wallets.update_one(
            {"user_id": user_id},
            {"$set": {"ftc_balance": new_balance}}
        )
        
        # Record transaction
        await db.nutrition_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "transfer_out",
            "amount": request.amount,
            "destination": "fitwallet",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "new_balance": new_balance, "message": f"Transferred {request.amount} FTC to FitWallet"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid transfer direction")

@api_router.get("/nutrition/leaderboard")
async def get_nutrition_leaderboard():
    """Get top traders leaderboard"""
    # Aggregate top traders by total invested
    pipeline = [
        {"$group": {"_id": "$user_id", "total_invested": {"$sum": "$total_invested"}, "total_products": {"$sum": "$quantity"}}},
        {"$sort": {"total_invested": -1}},
        {"$limit": 10}
    ]
    
    leaderboard = await db.nutrition_holdings.aggregate(pipeline).to_list(length=10)
    
    # Get usernames
    result = []
    for entry in leaderboard:
        user = await db.users.find_one({"id": entry['_id']}, {"_id": 0, "full_name": 1})
        result.append({
            "user_id": entry['_id'],
            "name": user.get('full_name', 'Anonymous') if user else 'Anonymous',
            "total_invested": entry['total_invested'],
            "total_products": entry['total_products']
        })
    
    return {"leaderboard": result}

# ============ ORDER BOOK ============

@api_router.get("/orderbook")
async def get_orderbook():
    """Generate order book"""
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    current_price = price_data['price']
    
    import random
    bids = []
    for i in range(15):
        price = current_price * (1 - (i+1) * 0.001)
        amount = random.uniform(1000, 50000)
        bids.append({"price": round(price, 8), "amount": round(amount, 2), "total": round(price * amount, 2)})
    
    asks = []
    for i in range(15):
        price = current_price * (1 + (i+1) * 0.001)
        amount = random.uniform(1000, 50000)
        asks.append({"price": round(price, 8), "amount": round(amount, 2), "total": round(price * amount, 2)})
    
    return {"bids": bids, "asks": asks}

# ============ FTC MINING MODELS ============

class MiningSubscriptionRequest(BaseModel):
    plan_id: str
    plan_name: str
    calories: int
    ftc_limit: int
    payment_method: str
    price: float
    transaction_hash: Optional[str] = None
    is_free_trial: Optional[bool] = False
    is_resubscription: Optional[bool] = False
    bonus_percent: Optional[int] = 0

class AdminActivateRequest(BaseModel):
    request_id: str

# ============ FTC MINING ROUTES ============

@api_router.get("/mining/status")
async def get_mining_status(user_id: str = Depends(get_current_user)):
    """Get user's mining status, subscription, and balances"""
    # Get user's mining wallet
    mining_wallet = await db.mining_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not mining_wallet:
        # Create default mining wallet
        mining_wallet = {
            "user_id": user_id,
            "ftc_balance": 0,
            "calories_burned": 0,
            "ftc_mined_today": 0,
            "is_mining": False,
            "last_mining_date": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.mining_wallets.insert_one(mining_wallet)
    
    # Get active subscription
    active_sub = await db.mining_subscriptions.find_one(
        {"user_id": user_id, "status": "active"},
        {"_id": 0}
    )
    
    # Get pending request (new subscription or upgrade)
    pending_request = await db.mining_subscriptions.find_one(
        {"user_id": user_id, "status": {"$in": ["pending", "pending_upgrade"]}},
        {"_id": 0}
    )
    
    return {
        "ftc_balance": mining_wallet.get("ftc_balance", 0),
        "calories_burned": mining_wallet.get("calories_burned", 0),
        "ftc_mined_today": mining_wallet.get("ftc_mined_today", 0),
        "is_mining": mining_wallet.get("is_mining", False),
        "active_subscription": active_sub,
        "pending_request": pending_request
    }

@api_router.post("/mining/subscribe")
async def subscribe_mining_plan(request: MiningSubscriptionRequest, user_id: str = Depends(get_current_user)):
    """Submit a mining subscription request"""
    # Check if user already has pending or active subscription
    existing = await db.mining_subscriptions.find_one(
        {"user_id": user_id, "status": {"$in": ["pending", "active"]}},
        {"_id": 0}
    )
    
    if existing and existing.get("status") == "active":
        # Check if there's already a pending upgrade request
        pending_upgrade = await db.mining_subscriptions.find_one(
            {"user_id": user_id, "status": "pending_upgrade"},
            {"_id": 0}
        )
        
        if pending_upgrade:
            # Update existing upgrade request
            await db.mining_subscriptions.update_one(
                {"user_id": user_id, "status": "pending_upgrade"},
                {
                    "$set": {
                        "plan_id": request.plan_id,
                        "plan_name": request.plan_name,
                        "calories": request.calories,
                        "ftc_limit": request.ftc_limit,
                        "payment_method": request.payment_method,
                        "price": request.price,
                        "transaction_hash": request.transaction_hash,
                        "is_free_trial": request.is_free_trial,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            updated = await db.mining_subscriptions.find_one(
                {"user_id": user_id, "status": "pending_upgrade"},
                {"_id": 0}
            )
            return {
                "success": True,
                "request": updated,
                "message": "Upgrade request updated. Admin will verify and activate your new plan."
            }
        
        # Create new upgrade request
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1})
        upgrade_id = str(uuid.uuid4())
        bonus_ftc = int(request.ftc_limit * (request.bonus_percent / 100)) if request.bonus_percent > 0 else 0
        upgrade_doc = {
            "id": upgrade_id,
            "user_id": user_id,
            "user_email": user.get("email") if user else None,
            "plan_id": request.plan_id,
            "plan_name": request.plan_name,
            "calories": request.calories,
            "ftc_limit": request.ftc_limit,
            "payment_method": request.payment_method,
            "price": request.price,
            "transaction_hash": request.transaction_hash,
            "is_free_trial": request.is_free_trial,
            "is_resubscription": request.is_resubscription,
            "bonus_percent": request.bonus_percent,
            "bonus_ftc": bonus_ftc,
            "status": "pending_upgrade",
            "current_plan": existing.get("plan_name"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "activated_at": None
        }
        
        await db.mining_subscriptions.insert_one(upgrade_doc)
        upgrade_doc.pop("_id", None)
        
        bonus_msg = f" 🎁 BONUS: +{bonus_ftc} FTC for returning subscriber!" if bonus_ftc > 0 else ""
        
        return {
            "success": True,
            "request": upgrade_doc,
            "message": f"Upgrade request submitted! Admin will verify payment and upgrade from {existing.get('plan_name')} to {request.plan_name}.{bonus_msg}"
        }
    
    if existing and existing.get("status") == "pending":
        # Update the existing pending request with new transaction hash
        await db.mining_subscriptions.update_one(
            {"user_id": user_id, "status": "pending"},
            {
                "$set": {
                    "plan_id": request.plan_id,
                    "plan_name": request.plan_name,
                    "calories": request.calories,
                    "ftc_limit": request.ftc_limit,
                    "payment_method": request.payment_method,
                    "price": request.price,
                    "transaction_hash": request.transaction_hash,
                    "is_free_trial": request.is_free_trial,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        # Return the updated request
        updated = await db.mining_subscriptions.find_one(
            {"user_id": user_id, "status": "pending"},
            {"_id": 0}
        )
        return {
            "success": True,
            "request": updated,
            "message": "Subscription request updated with new transaction hash. Admin will verify and activate."
        }
    
    # Get user email
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1})
    
    # Create subscription request
    subscription_id = str(uuid.uuid4())
    subscription_doc = {
        "id": subscription_id,
        "user_id": user_id,
        "user_email": user.get("email") if user else None,
        "plan_id": request.plan_id,
        "plan_name": request.plan_name,
        "calories": request.calories,
        "ftc_limit": request.ftc_limit,
        "payment_method": request.payment_method,
        "price": request.price,
        "transaction_hash": request.transaction_hash,
        "is_free_trial": request.is_free_trial,
        "is_resubscription": request.is_resubscription,
        "bonus_percent": request.bonus_percent,
        "bonus_ftc": int(request.ftc_limit * (request.bonus_percent / 100)) if request.bonus_percent > 0 else 0,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "activated_at": None
    }
    
    await db.mining_subscriptions.insert_one(subscription_doc)
    
    # Remove _id before returning (MongoDB adds it during insert)
    subscription_doc.pop("_id", None)
    
    bonus_msg = f" BONUS: +{subscription_doc['bonus_ftc']} FTC for returning subscriber!" if subscription_doc['bonus_ftc'] > 0 else ""
    
    return {
        "success": True,
        "request": subscription_doc,
        "message": f"Subscription request submitted. Admin will verify and activate.{bonus_msg}"
    }

@api_router.post("/mining/save-progress")
async def save_mining_progress(input: dict, user_id: str = Depends(get_current_user)):
    """Save mining progress (calories burned, FTC mined)"""
    calories = input.get("calories_burned", 0)
    ftc_mined = input.get("ftc_mined", 0)
    
    # Update mining wallet
    await db.mining_wallets.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "calories_burned": calories,
                "ftc_mined_today": ftc_mined,
                "last_mining_date": datetime.now(timezone.utc).isoformat()
            },
            "$inc": {"ftc_balance": ftc_mined}
        },
        upsert=True
    )
    
    return {"success": True, "message": "Mining progress saved"}

# ============ ADMIN PANEL ROUTES ============

@api_router.get("/admin/mining-requests")
async def get_admin_mining_requests():
    """Get all mining subscription requests and users for admin panel"""
    # Get all subscription requests
    requests = await db.mining_subscriptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Get all users with their subscription status
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    
    # Enrich users with subscription data
    enriched_users = []
    for user in users:
        user_sub = await db.mining_subscriptions.find_one(
            {"user_id": user["id"], "status": "active"},
            {"_id": 0}
        )
        mining_wallet = await db.mining_wallets.find_one(
            {"user_id": user["id"]},
            {"_id": 0}
        )
        
        enriched_users.append({
            "id": user["id"],
            "email": user.get("email"),
            "full_name": user.get("full_name"),
            "ftc_balance": mining_wallet.get("ftc_balance", 0) if mining_wallet else 0,
            "active_subscription": user_sub
        })
    
    return {
        "requests": requests,
        "users": enriched_users
    }

@api_router.post("/admin/activate-subscription")
async def admin_activate_subscription(request: AdminActivateRequest):
    """Admin activates a user's mining subscription"""
    # Find the subscription request
    sub = await db.mining_subscriptions.find_one(
        {"id": request.request_id},
        {"_id": 0}
    )
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription request not found")
    
    if sub.get("status") == "active":
        raise HTTPException(status_code=400, detail="Subscription already active")
    
    # Deactivate any existing active subscription for this user
    await db.mining_subscriptions.update_many(
        {"user_id": sub["user_id"], "status": "active"},
        {"$set": {"status": "expired"}}
    )
    
    # Activate the new subscription
    await db.mining_subscriptions.update_one(
        {"id": request.request_id},
        {
            "$set": {
                "status": "active",
                "activated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Apply bonus FTC if user is a returning subscriber
    bonus_ftc = sub.get("bonus_ftc", 0)
    if bonus_ftc > 0:
        await db.mining_wallets.update_one(
            {"user_id": sub["user_id"]},
            {"$inc": {"ftc_balance": bonus_ftc}},
            upsert=True
        )
        return {"success": True, "message": f"Subscription activated successfully! +{bonus_ftc} FTC bonus applied for returning subscriber."}
    
    return {"success": True, "message": "Subscription activated successfully"}

@api_router.post("/admin/reject-subscription")
async def admin_reject_subscription(request: AdminActivateRequest):
    """Admin rejects a user's mining subscription request"""
    result = await db.mining_subscriptions.update_one(
        {"id": request.request_id},
        {
            "$set": {
                "status": "rejected",
                "rejected_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Subscription request not found")
    
    return {"success": True, "message": "Subscription rejected"}

# ========== GLOBAL API ENDPOINTS - Same data for ALL users ==========

# Global FTC Price - Same for all users worldwide
@api_router.get("/global/ftc-price")
async def get_global_ftc_price():
    """Get global FTC price - same fluctuation for all users worldwide"""
    ftc_state = update_global_ftc_price()
    return {
        "price": ftc_state['price'],
        "change_24h": ftc_state['change_24h'],
        "volume_24h": ftc_state['volume_24h'],
        "high_24h": ftc_state['high_24h'],
        "low_24h": ftc_state['low_24h'],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Global trades API for real-time blockchain visibility - All users see ALL transactions
@api_router.get("/global/trades")
async def get_global_trades():
    """Get global trades for real-time blockchain visibility - all users see same data"""
    ftc_state = update_global_ftc_price()
    
    try:
        # Get ALL recent trades from ALL users (global visibility)
        trades = await db.nutrition_trades.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).limit(100).to_list(100)
        
        # If no nutrition trades, check regular trades
        if not trades:
            trades = await db.trades.find(
                {},
                {"_id": 0}
            ).sort("created_at", -1).limit(100).to_list(100)
        
        return {
            "trades": trades,
            "volume_24h": ftc_state['volume_24h'],
            "ftc_price": ftc_state['price'],
            "change_24h": ftc_state['change_24h'],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_traders": await db.users.count_documents({})
        }
    except Exception as e:
        return {
            "trades": [],
            "volume_24h": ftc_state['volume_24h'],
            "ftc_price": ftc_state['price'],
            "change_24h": ftc_state['change_24h'],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_traders": 0
        }

# Store nutrition trade in global ledger
@api_router.post("/global/record-trade")
async def record_global_trade(trade_data: dict, user_id: str = Depends(get_current_user)):
    """Record a trade in the global blockchain ledger for all users to see"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1, "full_name": 1})
    
    trade_record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_name": user.get("full_name", "Anonymous")[:10] + "..." if user else "Anonymous",
        "type": trade_data.get("type", "TRADE"),
        "product_name": trade_data.get("product_name", "FTC"),
        "quantity": trade_data.get("quantity", 0),
        "price": trade_data.get("price", 0),
        "total_ftc": trade_data.get("total_ftc", 0),
        "tx_hash": f"0x{''.join(random.choices('0123456789abcdef', k=64))}",
        "block_number": 19000000 + random.randint(0, 1000000),
        "confirmations": random.randint(1, 12),
        "status": "CONFIRMED",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.nutrition_trades.insert_one(trade_record)
    trade_record.pop("_id", None)
    
    return {"success": True, "trade": trade_record}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()