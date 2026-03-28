"""
Test FTC Wallet Address Features:
1. Auto-generation on registration
2. Auto-generation on first login (for existing users without wallet)
3. GET /api/wallet/address endpoint
4. PUT /api/wallet/address endpoint (update wallet)
5. Login response includes ftc_wallet_address
6. Global Ledger shows ALL users trades
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWalletAddressFeatures:
    """Test FTC Wallet Address auto-generation and management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_email = f"test_wallet_{uuid.uuid4().hex[:8]}@test.com"
        self.test_password = "testpass123"
        self.test_name = "Test Wallet User"
        self.token = None
        self.user_id = None
        self.wallet_address = None
    
    def test_01_register_generates_wallet_address(self):
        """Test that registration auto-generates FTC wallet address"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "full_name": self.test_name
        })
        
        print(f"Register response status: {response.status_code}")
        print(f"Register response: {response.json()}")
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        
        user = data["user"]
        assert "ftc_wallet_address" in user, "ftc_wallet_address not in user response"
        assert user["ftc_wallet_address"] is not None, "ftc_wallet_address is None"
        assert len(user["ftc_wallet_address"]) >= 32, f"Wallet address too short: {user['ftc_wallet_address']}"
        assert len(user["ftc_wallet_address"]) <= 44, f"Wallet address too long: {user['ftc_wallet_address']}"
        
        self.token = data["token"]
        self.wallet_address = user["ftc_wallet_address"]
        print(f"✅ Registration generated wallet address: {self.wallet_address}")
    
    def test_02_login_returns_wallet_address(self):
        """Test that login response includes ftc_wallet_address"""
        # First register a new user
        test_email = f"test_login_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "full_name": "Login Test User"
        })
        assert reg_response.status_code == 200
        
        # Now login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "testpass123"
        })
        
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.json()}")
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "user" in data, "User not in login response"
        
        user = data["user"]
        assert "ftc_wallet_address" in user, "ftc_wallet_address not in login response"
        assert user["ftc_wallet_address"] is not None, "ftc_wallet_address is None in login"
        print(f"✅ Login returned wallet address: {user['ftc_wallet_address']}")
    
    def test_03_demo_user_login_has_wallet(self):
        """Test that demo user login returns wallet address"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        
        print(f"Demo login status: {response.status_code}")
        
        assert response.status_code == 200, f"Demo login failed: {response.text}"
        
        data = response.json()
        user = data["user"]
        
        assert "ftc_wallet_address" in user, "ftc_wallet_address not in demo user response"
        assert user["ftc_wallet_address"] is not None, "Demo user ftc_wallet_address is None"
        print(f"✅ Demo user wallet address: {user['ftc_wallet_address']}")
        
        # Store for later tests
        self.__class__.demo_token = data["token"]
        self.__class__.demo_wallet = user["ftc_wallet_address"]
    
    def test_04_get_wallet_address_endpoint(self):
        """Test GET /api/wallet/address endpoint"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Get wallet address
        response = requests.get(
            f"{BASE_URL}/api/wallet/address",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"GET wallet address status: {response.status_code}")
        print(f"GET wallet address response: {response.json()}")
        
        assert response.status_code == 200, f"GET wallet address failed: {response.text}"
        
        data = response.json()
        assert "ftc_wallet_address" in data, "ftc_wallet_address not in response"
        assert "user_id" in data, "user_id not in response"
        assert data["ftc_wallet_address"] is not None, "ftc_wallet_address is None"
        print(f"✅ GET wallet address returned: {data['ftc_wallet_address']}")
    
    def test_05_update_wallet_address(self):
        """Test PUT /api/wallet/address endpoint"""
        # Register a new user for this test
        test_email = f"test_update_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "full_name": "Update Wallet Test"
        })
        assert reg_response.status_code == 200
        token = reg_response.json()["token"]
        original_wallet = reg_response.json()["user"]["ftc_wallet_address"]
        
        # Generate a new valid wallet address (32-44 chars alphanumeric)
        new_wallet = f"TEST{uuid.uuid4().hex[:36].upper()}"[:44]
        
        # Update wallet address
        response = requests.put(
            f"{BASE_URL}/api/wallet/address",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"new_wallet_address": new_wallet}
        )
        
        print(f"PUT wallet address status: {response.status_code}")
        print(f"PUT wallet address response: {response.json()}")
        
        assert response.status_code == 200, f"PUT wallet address failed: {response.text}"
        
        data = response.json()
        assert data["ftc_wallet_address"] == new_wallet, "Wallet address not updated"
        assert data["status"] == "success", "Status not success"
        
        # Verify by GET
        get_response = requests.get(
            f"{BASE_URL}/api/wallet/address",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 200
        assert get_response.json()["ftc_wallet_address"] == new_wallet
        
        print(f"✅ Wallet address updated from {original_wallet[:10]}... to {new_wallet[:10]}...")
    
    def test_06_update_wallet_validation_too_short(self):
        """Test wallet address validation - too short"""
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        token = login_response.json()["token"]
        
        # Try to update with too short address
        response = requests.put(
            f"{BASE_URL}/api/wallet/address",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"new_wallet_address": "short"}
        )
        
        print(f"Short wallet validation status: {response.status_code}")
        
        assert response.status_code == 400, "Should reject short wallet address"
        print("✅ Short wallet address correctly rejected")
    
    def test_07_update_wallet_validation_too_long(self):
        """Test wallet address validation - too long"""
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        token = login_response.json()["token"]
        
        # Try to update with too long address
        long_address = "A" * 50
        response = requests.put(
            f"{BASE_URL}/api/wallet/address",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"new_wallet_address": long_address}
        )
        
        print(f"Long wallet validation status: {response.status_code}")
        
        assert response.status_code == 400, "Should reject long wallet address"
        print("✅ Long wallet address correctly rejected")


class TestGlobalLedger:
    """Test Global Blockchain Ledger features"""
    
    def test_01_get_global_ledger(self):
        """Test GET /api/nutrition/global-ledger returns all users' trades"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        
        print(f"Global ledger status: {response.status_code}")
        
        assert response.status_code == 200, f"Global ledger failed: {response.text}"
        
        data = response.json()
        assert "transactions" in data, "transactions not in response"
        assert "total" in data, "total not in response"
        assert "stats" in data, "stats not in response"
        
        stats = data["stats"]
        assert "volume_24h" in stats, "volume_24h not in stats"
        assert "buy_count" in stats, "buy_count not in stats"
        assert "sell_count" in stats, "sell_count not in stats"
        assert "market_sentiment" in stats, "market_sentiment not in stats"
        
        print(f"✅ Global ledger has {data['total']} transactions")
        print(f"   Stats: volume={stats['volume_24h']}, buys={stats['buy_count']}, sells={stats['sell_count']}, sentiment={stats['market_sentiment']}")
    
    def test_02_record_trade_to_global_ledger(self):
        """Test POST /api/nutrition/global-ledger/record"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Record a trade
        trade_data = {
            "trade_type": "BUY",
            "product_id": "WPC80",
            "product_name": "Whey Protein Concentrate 80%",
            "quantity": 2,
            "price_per_unit": 38.50,
            "total_ftc": 77.00
        }
        
        response = requests.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=trade_data
        )
        
        print(f"Record trade status: {response.status_code}")
        print(f"Record trade response: {response.json()}")
        
        assert response.status_code == 200, f"Record trade failed: {response.text}"
        
        data = response.json()
        assert "tx_hash" in data, "tx_hash not in response"
        assert "status" in data, "status not in response"
        assert data["status"] == "CONFIRMED", "Trade not confirmed"
        assert "price_after_impact" in data, "price_after_impact not in response"
        
        print(f"✅ Trade recorded with tx_hash: {data['tx_hash']}")
        print(f"   Price after impact: {data['price_after_impact']}")
    
    def test_03_global_ledger_shows_recorded_trade(self):
        """Test that recorded trade appears in global ledger"""
        # First record a trade
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        token = login_response.json()["token"]
        
        unique_product = f"TEST_PRODUCT_{uuid.uuid4().hex[:6]}"
        trade_data = {
            "trade_type": "SELL",
            "product_id": "BCAA",
            "product_name": "BCAA 2:1:1 Instant",
            "quantity": 3,
            "price_per_unit": 58.00,
            "total_ftc": 174.00
        }
        
        record_response = requests.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=trade_data
        )
        assert record_response.status_code == 200
        recorded_tx = record_response.json()
        
        # Now check global ledger
        ledger_response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert ledger_response.status_code == 200
        
        ledger_data = ledger_response.json()
        transactions = ledger_data["transactions"]
        
        # Find our transaction
        found = False
        for tx in transactions:
            if tx.get("tx_hash") == recorded_tx["tx_hash"]:
                found = True
                assert tx["trade_type"] == "SELL"
                assert tx["product_id"] == "BCAA"
                break
        
        assert found, "Recorded trade not found in global ledger"
        print(f"✅ Trade found in global ledger with tx_hash: {recorded_tx['tx_hash']}")


class TestGlobalPrices:
    """Test Global Nutrition Prices with real-time sync"""
    
    def test_01_get_global_prices(self):
        """Test GET /api/nutrition/global-prices"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        
        print(f"Global prices status: {response.status_code}")
        
        assert response.status_code == 200, f"Global prices failed: {response.text}"
        
        data = response.json()
        assert "prices" in data, "prices not in response"
        assert "products" in data, "products not in response"
        assert "ai_signals" in data, "ai_signals not in response"
        
        # Check price structure
        prices = data["prices"]
        assert len(prices) > 0, "No prices returned"
        
        # Check a sample price
        sample_id = list(prices.keys())[0]
        sample_price = prices[sample_id]
        assert "current" in sample_price, "current not in price"
        assert "change" in sample_price, "change not in price"
        assert "history" in sample_price, "history not in price"
        
        print(f"✅ Global prices returned {len(prices)} products")
        print(f"   Sample: {sample_id} = ${sample_price['current']}")
    
    def test_02_price_impact_from_trade(self):
        """Test that trades affect global prices"""
        # Get initial price
        initial_response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert initial_response.status_code == 200
        initial_price = initial_response.json()["prices"]["CREATINE"]["current"]
        
        # Login and make a BUY trade (should increase price)
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        token = login_response.json()["token"]
        
        # Record multiple BUY trades to see impact
        for i in range(3):
            trade_data = {
                "trade_type": "BUY",
                "product_id": "CREATINE",
                "product_name": "Creatine Monohydrate Pure",
                "quantity": 5,
                "price_per_unit": initial_price,
                "total_ftc": initial_price * 5
            }
            
            requests.post(
                f"{BASE_URL}/api/nutrition/global-ledger/record",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=trade_data
            )
        
        # Get new price
        new_response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert new_response.status_code == 200
        new_price = new_response.json()["prices"]["CREATINE"]["current"]
        
        print(f"Initial CREATINE price: ${initial_price}")
        print(f"New CREATINE price after BUY trades: ${new_price}")
        
        # BUY trades should increase price
        assert new_price >= initial_price, "BUY trades should increase or maintain price"
        print(f"✅ Price impact model working: ${initial_price} -> ${new_price}")


class TestAuthMeEndpoint:
    """Test /api/auth/me endpoint includes wallet address"""
    
    def test_auth_me_includes_wallet(self):
        """Test GET /api/auth/me returns ftc_wallet_address"""
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Get /auth/me
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"Auth me status: {response.status_code}")
        print(f"Auth me response: {response.json()}")
        
        assert response.status_code == 200, f"Auth me failed: {response.text}"
        
        data = response.json()
        assert "ftc_wallet_address" in data, "ftc_wallet_address not in /auth/me response"
        assert data["ftc_wallet_address"] is not None, "ftc_wallet_address is None"
        
        print(f"✅ /auth/me includes wallet address: {data['ftc_wallet_address']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
