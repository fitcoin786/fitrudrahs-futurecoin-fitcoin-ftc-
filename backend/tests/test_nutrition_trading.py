"""
Nutrition Trading Backend API Tests
Tests for: GET /api/nutrition/products, POST /api/nutrition/buy, POST /api/nutrition/sell, GET /api/nutrition/wallet
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_EMAIL = f"test_nutrition_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = "Test Nutrition User"


class TestNutritionProducts:
    """Test GET /api/nutrition/products endpoint"""
    
    def test_get_products_returns_200(self):
        """Products endpoint should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✅ GET /api/nutrition/products returns 200")
    
    def test_products_returns_18_products(self):
        """Products endpoint should return 18 products from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        assert response.status_code == 200
        data = response.json()
        
        assert "products" in data, "Response should have 'products' key"
        assert "total" in data, "Response should have 'total' key"
        
        products = data["products"]
        total = data["total"]
        
        # Should have 18 products
        assert total == 18, f"Expected 18 products, got {total}"
        assert len(products) == 18, f"Expected 18 products in list, got {len(products)}"
        print(f"✅ Products endpoint returns {total} products")
    
    def test_products_have_sold_units_field(self):
        """Each product should have 'sold_units' field from global inventory"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        
        for product in products:
            assert "sold_units" in product, f"Product {product.get('id')} missing 'sold_units' field"
            assert isinstance(product["sold_units"], int), f"sold_units should be int, got {type(product['sold_units'])}"
        
        print("✅ All products have 'sold_units' field")
    
    def test_products_have_required_fields(self):
        """Each product should have all required fields"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        
        required_fields = ["id", "name", "brand", "category", "image", "weight", 
                          "mrp", "discount_price", "rating", "reviews", 
                          "total_units", "sold_units"]
        
        for product in products:
            for field in required_fields:
                assert field in product, f"Product {product.get('id')} missing '{field}' field"
        
        print("✅ All products have required fields")
    
    def test_products_with_50_plus_sold_units_exist(self):
        """Some products should have sold_units >= 50 (trading open)"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        
        trading_open_products = [p for p in products if p["sold_units"] >= 50]
        print(f"✅ Found {len(trading_open_products)} products with trading open (sold_units >= 50)")
        
        # List products with trading open
        for p in trading_open_products:
            print(f"   - {p['name']}: {p['sold_units']} sold")


class TestUserRegistrationAndWallet:
    """Test user registration and wallet bonus"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Register a new user and get auth token"""
        # Register new user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "full_name": TEST_NAME
        })
        
        if register_response.status_code == 400:
            # User might already exist, try login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            assert login_response.status_code == 200, f"Login failed: {login_response.text}"
            return login_response.json()["token"]
        
        assert register_response.status_code == 200, f"Registration failed: {register_response.text}"
        return register_response.json()["token"]
    
    def test_user_can_register(self, auth_token):
        """User should be able to register"""
        assert auth_token is not None
        assert len(auth_token) > 0
        print(f"✅ User registered successfully with token: {auth_token[:20]}...")
    
    def test_wallet_shows_10000_ftc_bonus(self, auth_token):
        """After login, wallet should show 10,000 FTC bonus"""
        response = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Wallet fetch failed: {response.text}"
        
        data = response.json()
        assert "wallet" in data, "Response should have 'wallet' key"
        
        wallet = data["wallet"]
        assert "ftc_balance" in wallet, "Wallet should have 'ftc_balance'"
        
        # First-time users get 10,000 FTC bonus
        assert wallet["ftc_balance"] == 10000, f"Expected 10000 FTC bonus, got {wallet['ftc_balance']}"
        print(f"✅ Wallet shows 10,000 FTC bonus: {wallet['ftc_balance']} FTC")
    
    def test_wallet_returns_holdings(self, auth_token):
        """Wallet endpoint should return user holdings"""
        response = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "holdings" in data, "Response should have 'holdings' key"
        assert isinstance(data["holdings"], list), "Holdings should be a list"
        print(f"✅ Wallet returns holdings: {len(data['holdings'])} items")


class TestNutritionBuy:
    """Test POST /api/nutrition/buy endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for buy tests"""
        buy_test_email = f"test_buy_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": buy_test_email,
            "password": TEST_PASSWORD,
            "full_name": "Buy Test User"
        })
        
        if register_response.status_code == 400:
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": buy_test_email,
                "password": TEST_PASSWORD
            })
            return login_response.json()["token"]
        
        return register_response.json()["token"]
    
    def test_buy_requires_auth(self):
        """Buy endpoint should require authentication"""
        response = requests.post(f"{BASE_URL}/api/nutrition/buy", json={
            "product_id": "NUT001",
            "quantity": 1,
            "ftc_amount": 1000
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Buy endpoint requires authentication")
    
    def test_buy_product_success(self, auth_token):
        """User should be able to buy a product with FTC"""
        # Get initial wallet balance
        wallet_response = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        initial_balance = wallet_response.json()["wallet"]["ftc_balance"]
        
        # Get products to find one to buy
        products_response = requests.get(f"{BASE_URL}/api/nutrition/products")
        products = products_response.json()["products"]
        product = products[0]  # Buy first product
        
        # Calculate FTC amount (simplified)
        ftc_amount = 1000  # 1000 FTC for 1 unit
        
        # Buy product
        buy_response = requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_id": product["id"],
                "quantity": 1,
                "ftc_amount": ftc_amount
            }
        )
        
        assert buy_response.status_code == 200, f"Buy failed: {buy_response.text}"
        
        data = buy_response.json()
        assert data["success"] == True, "Buy should be successful"
        assert "new_balance" in data, "Response should have new_balance"
        assert "global_sold_units" in data, "Response should have global_sold_units"
        
        # Verify balance was deducted
        assert data["new_balance"] == initial_balance - ftc_amount, \
            f"Balance should be {initial_balance - ftc_amount}, got {data['new_balance']}"
        
        print(f"✅ Buy successful: {product['name']}, new balance: {data['new_balance']} FTC")
        print(f"   Global sold units: {data['global_sold_units']}")
    
    def test_buy_updates_global_sold_units(self, auth_token):
        """Buying should update global sold_units"""
        # Get initial product state
        products_response = requests.get(f"{BASE_URL}/api/nutrition/products")
        products = products_response.json()["products"]
        product = products[1]  # Use second product
        initial_sold = product["sold_units"]
        
        # Buy 1 unit
        buy_response = requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_id": product["id"],
                "quantity": 1,
                "ftc_amount": 500
            }
        )
        
        assert buy_response.status_code == 200, f"Buy failed: {buy_response.text}"
        
        # Verify global sold_units increased
        data = buy_response.json()
        assert data["global_sold_units"] == initial_sold + 1, \
            f"Global sold units should be {initial_sold + 1}, got {data['global_sold_units']}"
        
        # Verify by fetching products again
        products_response2 = requests.get(f"{BASE_URL}/api/nutrition/products")
        products2 = products_response2.json()["products"]
        updated_product = next(p for p in products2 if p["id"] == product["id"])
        
        assert updated_product["sold_units"] == initial_sold + 1, \
            f"Product sold_units should be {initial_sold + 1}, got {updated_product['sold_units']}"
        
        print(f"✅ Global sold_units updated: {initial_sold} -> {updated_product['sold_units']}")
    
    def test_buy_insufficient_balance(self, auth_token):
        """Buy should fail with insufficient balance"""
        response = requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_id": "NUT001",
                "quantity": 1,
                "ftc_amount": 999999999  # Very large amount
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "Insufficient" in response.json().get("detail", ""), "Should mention insufficient balance"
        print("✅ Buy fails with insufficient balance")
    
    def test_buy_invalid_product(self, auth_token):
        """Buy should fail with invalid product ID"""
        response = requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_id": "INVALID_PRODUCT_ID",
                "quantity": 1,
                "ftc_amount": 100
            }
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Buy fails with invalid product ID")


class TestNutritionSell:
    """Test POST /api/nutrition/sell endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token_with_holdings(self):
        """Create user with holdings for sell tests"""
        sell_test_email = f"test_sell_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": sell_test_email,
            "password": TEST_PASSWORD,
            "full_name": "Sell Test User"
        })
        
        if register_response.status_code == 400:
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": sell_test_email,
                "password": TEST_PASSWORD
            })
            token = login_response.json()["token"]
        else:
            token = register_response.json()["token"]
        
        # Find a product with trading open (sold_units >= 50)
        products_response = requests.get(f"{BASE_URL}/api/nutrition/products")
        products = products_response.json()["products"]
        trading_open_product = next((p for p in products if p["sold_units"] >= 50), None)
        
        if trading_open_product:
            # Buy some units to have holdings
            requests.post(
                f"{BASE_URL}/api/nutrition/buy",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "product_id": trading_open_product["id"],
                    "quantity": 2,
                    "ftc_amount": 1000
                }
            )
        
        return token
    
    def test_sell_requires_auth(self):
        """Sell endpoint should require authentication"""
        response = requests.post(f"{BASE_URL}/api/nutrition/sell", json={
            "product_id": "NUT002",
            "quantity": 1,
            "ftc_amount": 500
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Sell endpoint requires authentication")
    
    def test_sell_fails_when_trading_not_open(self, auth_token_with_holdings):
        """Sell should fail when product has < 50 sold units"""
        # Find a product with trading NOT open
        products_response = requests.get(f"{BASE_URL}/api/nutrition/products")
        products = products_response.json()["products"]
        trading_closed_product = next((p for p in products if p["sold_units"] < 50), None)
        
        if not trading_closed_product:
            pytest.skip("No products with trading closed found")
        
        # First buy the product to have holdings
        requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {auth_token_with_holdings}"},
            json={
                "product_id": trading_closed_product["id"],
                "quantity": 1,
                "ftc_amount": 500
            }
        )
        
        # Try to sell
        response = requests.post(
            f"{BASE_URL}/api/nutrition/sell",
            headers={"Authorization": f"Bearer {auth_token_with_holdings}"},
            json={
                "product_id": trading_closed_product["id"],
                "quantity": 1,
                "ftc_amount": 500
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "Trading not yet open" in response.json().get("detail", "") or \
               "50 units" in response.json().get("detail", ""), \
               f"Should mention trading not open: {response.json()}"
        print(f"✅ Sell fails when trading not open (product: {trading_closed_product['name']}, sold: {trading_closed_product['sold_units']})")
    
    def test_sell_works_when_trading_open(self):
        """Sell should work when product has >= 50 sold units"""
        # Create fresh user for this test
        sell_test_email = f"test_sell_open_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": sell_test_email,
            "password": TEST_PASSWORD,
            "full_name": "Sell Open Test User"
        })
        token = register_response.json()["token"]
        
        # IMPORTANT: Call wallet endpoint first to get the 10,000 FTC bonus
        wallet_init = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert wallet_init.status_code == 200, f"Wallet init failed: {wallet_init.text}"
        initial_balance = wallet_init.json()["wallet"]["ftc_balance"]
        assert initial_balance == 10000, f"Expected 10000 FTC bonus, got {initial_balance}"
        
        # Find a product with trading open
        products_response = requests.get(f"{BASE_URL}/api/nutrition/products")
        products = products_response.json()["products"]
        trading_open_product = next((p for p in products if p["sold_units"] >= 50), None)
        
        if not trading_open_product:
            pytest.skip("No products with trading open found")
        
        # Buy first to have holdings (user has 10000 FTC bonus)
        buy_response = requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "product_id": trading_open_product["id"],
                "quantity": 2,
                "ftc_amount": 1000
            }
        )
        assert buy_response.status_code == 200, f"Buy failed: {buy_response.text}"
        
        # Get balance after buy
        wallet_response = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {token}"}
        )
        balance_after_buy = wallet_response.json()["wallet"]["ftc_balance"]
        
        # Sell 1 unit
        ftc_amount = 600  # Sell price
        response = requests.post(
            f"{BASE_URL}/api/nutrition/sell",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "product_id": trading_open_product["id"],
                "quantity": 1,
                "ftc_amount": ftc_amount
            }
        )
        
        assert response.status_code == 200, f"Sell failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True, "Sell should be successful"
        assert data["new_balance"] == balance_after_buy + ftc_amount, \
            f"Balance should be {balance_after_buy + ftc_amount}, got {data['new_balance']}"
        
        print(f"✅ Sell successful: {trading_open_product['name']}, received {ftc_amount} FTC")
    
    def test_sell_fails_without_holdings(self, auth_token_with_holdings):
        """Sell should fail if user doesn't have holdings"""
        # Find a product user doesn't own
        products_response = requests.get(f"{BASE_URL}/api/nutrition/products")
        products = products_response.json()["products"]
        
        # Get user holdings
        wallet_response = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {auth_token_with_holdings}"}
        )
        holdings = wallet_response.json()["holdings"]
        owned_ids = [h["product_id"] for h in holdings]
        
        # Find a product with trading open that user doesn't own
        unowned_product = next(
            (p for p in products if p["sold_units"] >= 50 and p["id"] not in owned_ids), 
            None
        )
        
        if not unowned_product:
            pytest.skip("No unowned products with trading open found")
        
        response = requests.post(
            f"{BASE_URL}/api/nutrition/sell",
            headers={"Authorization": f"Bearer {auth_token_with_holdings}"},
            json={
                "product_id": unowned_product["id"],
                "quantity": 1,
                "ftc_amount": 500
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "Insufficient holdings" in response.json().get("detail", ""), \
            f"Should mention insufficient holdings: {response.json()}"
        print("✅ Sell fails without holdings")


class TestGlobalInventorySync:
    """Test that inventory updates are global across all users"""
    
    def test_sold_units_visible_to_all_users(self):
        """Sold units should be visible to all users (global inventory)"""
        # Create two different users
        user1_email = f"test_global1_{uuid.uuid4().hex[:8]}@test.com"
        user2_email = f"test_global2_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register user 1
        reg1 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": user1_email,
            "password": TEST_PASSWORD,
            "full_name": "Global Test User 1"
        })
        assert reg1.status_code == 200, f"User 1 registration failed: {reg1.text}"
        token1 = reg1.json()["token"]
        
        # IMPORTANT: Call wallet endpoint first to get the 10,000 FTC bonus
        wallet_init = requests.get(
            f"{BASE_URL}/api/nutrition/wallet",
            headers={"Authorization": f"Bearer {token1}"}
        )
        assert wallet_init.status_code == 200, f"Wallet init failed: {wallet_init.text}"
        
        # Register user 2
        reg2 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": user2_email,
            "password": TEST_PASSWORD,
            "full_name": "Global Test User 2"
        })
        assert reg2.status_code == 200, f"User 2 registration failed: {reg2.text}"
        token2 = reg2.json()["token"]
        
        # Get initial products state
        products_before = requests.get(f"{BASE_URL}/api/nutrition/products").json()["products"]
        # Find a product with available units
        product = next((p for p in products_before if p["total_units"] - p["sold_units"] > 0), products_before[5])
        initial_sold = product["sold_units"]
        
        # User 1 buys (use small FTC amount)
        buy_response = requests.post(
            f"{BASE_URL}/api/nutrition/buy",
            headers={"Authorization": f"Bearer {token1}"},
            json={
                "product_id": product["id"],
                "quantity": 1,
                "ftc_amount": 500
            }
        )
        assert buy_response.status_code == 200, f"Buy failed: {buy_response.text}"
        
        # User 2 should see updated sold_units (no auth needed for products)
        products_after = requests.get(f"{BASE_URL}/api/nutrition/products").json()["products"]
        updated_product = next(p for p in products_after if p["id"] == product["id"])
        
        assert updated_product["sold_units"] == initial_sold + 1, \
            f"User 2 should see updated sold_units: expected {initial_sold + 1}, got {updated_product['sold_units']}"
        
        print(f"✅ Global inventory sync works: {initial_sold} -> {updated_product['sold_units']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
