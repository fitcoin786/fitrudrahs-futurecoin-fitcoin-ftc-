"""
Test Global Nutrition Prices and Ledger APIs
Tests that ALL users see the SAME prices, fluctuations, and global ledger data.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "demo@trader.com"
TEST_USER_PASSWORD = "demo123"


class TestGlobalNutritionPrices:
    """Test that global nutrition prices are consistent for all users"""
    
    def test_global_prices_endpoint_returns_200(self):
        """Test /api/nutrition/global-prices returns 200"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Global prices endpoint returns 200")
    
    def test_global_prices_has_required_fields(self):
        """Test response has prices, last_update, and products"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        data = response.json()
        assert "prices" in data, "Missing 'prices' field"
        assert "last_update" in data, "Missing 'last_update' field"
        assert "products" in data, "Missing 'products' field"
        
        # Verify prices is a dict with product data
        assert isinstance(data["prices"], dict), "prices should be a dict"
        assert len(data["prices"]) > 0, "prices should not be empty"
        
        # Verify products is a list
        assert isinstance(data["products"], list), "products should be a list"
        assert len(data["products"]) > 0, "products should not be empty"
        
        print(f"PASS: Global prices has {len(data['prices'])} products with required fields")
    
    def test_price_data_structure(self):
        """Test each product price has current, change, and history"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        data = response.json()
        
        for product_id, price_data in data["prices"].items():
            assert "current" in price_data, f"Missing 'current' for {product_id}"
            assert "change" in price_data, f"Missing 'change' for {product_id}"
            assert "history" in price_data, f"Missing 'history' for {product_id}"
            
            # Verify types
            assert isinstance(price_data["current"], (int, float)), f"current should be numeric for {product_id}"
            assert isinstance(price_data["change"], (int, float)), f"change should be numeric for {product_id}"
            assert isinstance(price_data["history"], list), f"history should be list for {product_id}"
            assert len(price_data["history"]) == 20, f"history should have 20 points for {product_id}"
        
        print("PASS: All products have correct price data structure")
    
    def test_two_calls_within_3_seconds_return_same_prices(self):
        """Test that two API calls within 3 seconds return IDENTICAL prices (proving global sync)"""
        # First call
        response1 = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        data1 = response1.json()
        
        # Wait 1 second (less than 3 second update interval)
        time.sleep(1)
        
        # Second call
        response2 = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        data2 = response2.json()
        
        # Compare prices - they should be IDENTICAL
        for product_id in data1["prices"]:
            price1 = data1["prices"][product_id]["current"]
            price2 = data2["prices"][product_id]["current"]
            assert price1 == price2, f"Prices differ for {product_id}: {price1} vs {price2}"
        
        print("PASS: Two calls within 3 seconds return IDENTICAL prices (global sync verified)")
    
    def test_prices_update_after_3_seconds(self):
        """Test that prices may update after 3+ seconds"""
        # First call
        response1 = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        data1 = response1.json()
        
        # Wait 4 seconds (more than 3 second update interval)
        time.sleep(4)
        
        # Second call
        response2 = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        data2 = response2.json()
        
        # Prices may or may not have changed, but both should be valid
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Count how many prices changed
        changed_count = 0
        for product_id in data1["prices"]:
            if data1["prices"][product_id]["current"] != data2["prices"][product_id]["current"]:
                changed_count += 1
        
        print(f"PASS: After 4 seconds, {changed_count}/{len(data1['prices'])} prices updated")


class TestGlobalLedger:
    """Test global blockchain ledger API"""
    
    def test_global_ledger_endpoint_returns_200(self):
        """Test /api/nutrition/global-ledger returns 200"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Global ledger endpoint returns 200")
    
    def test_global_ledger_has_required_fields(self):
        """Test response has transactions, total, and last_update"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        data = response.json()
        
        assert "transactions" in data, "Missing 'transactions' field"
        assert "total" in data, "Missing 'total' field"
        assert "last_update" in data, "Missing 'last_update' field"
        
        assert isinstance(data["transactions"], list), "transactions should be a list"
        assert isinstance(data["total"], int), "total should be an integer"
        
        print(f"PASS: Global ledger has {data['total']} transactions")
    
    def test_transaction_data_structure(self):
        """Test transaction entries have required blockchain fields"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        data = response.json()
        
        if len(data["transactions"]) > 0:
            tx = data["transactions"][0]
            required_fields = ["id", "user_id", "username", "trade_type", "product_id", 
                             "product_name", "quantity", "price_per_unit", "total_ftc",
                             "tx_hash", "block_number", "confirmations", "status", "timestamp"]
            
            for field in required_fields:
                assert field in tx, f"Missing '{field}' in transaction"
            
            # Verify blockchain-style fields
            assert tx["tx_hash"].startswith("0x"), "tx_hash should start with 0x"
            assert isinstance(tx["block_number"], int), "block_number should be int"
            assert isinstance(tx["confirmations"], int), "confirmations should be int"
            assert tx["status"] == "CONFIRMED", "status should be CONFIRMED"
            
            print("PASS: Transaction has all required blockchain fields")
        else:
            print("PASS: No transactions yet (empty ledger)")


class TestGlobalLedgerRecord:
    """Test recording transactions to global ledger"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_record_transaction_requires_auth(self):
        """Test that recording requires authentication"""
        response = requests.post(f"{BASE_URL}/api/nutrition/global-ledger/record", json={
            "trade_type": "BUY",
            "product_id": "WPC80",
            "product_name": "Whey Protein Concentrate 80%",
            "quantity": 1,
            "price_per_unit": 38.50,
            "total_ftc": 38.50
        })
        # Should fail without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("PASS: Recording transaction requires authentication")
    
    def test_record_transaction_success(self, auth_token):
        """Test successfully recording a transaction"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Record a test transaction
        response = requests.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            headers=headers,
            json={
                "trade_type": "BUY",
                "product_id": "TEST_PRODUCT",
                "product_name": "Test Product for Testing",
                "quantity": 10,
                "price_per_unit": 25.00,
                "total_ftc": 250.00
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tx_hash" in data, "Response should include tx_hash"
        assert "block_number" in data, "Response should include block_number"
        assert data["trade_type"] == "BUY", "trade_type should be BUY"
        assert data["quantity"] == 10, "quantity should be 10"
        assert data["status"] == "CONFIRMED", "status should be CONFIRMED"
        
        print(f"PASS: Transaction recorded with tx_hash: {data['tx_hash'][:20]}...")
    
    def test_recorded_transaction_appears_in_global_ledger(self, auth_token):
        """Test that recorded transaction appears in global ledger"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Record a unique transaction
        unique_product = f"TEST_VERIFY_{int(time.time())}"
        response = requests.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            headers=headers,
            json={
                "trade_type": "SELL",
                "product_id": unique_product,
                "product_name": "Verification Test Product",
                "quantity": 5,
                "price_per_unit": 15.00,
                "total_ftc": 75.00
            }
        )
        
        assert response.status_code == 200
        recorded_tx = response.json()
        
        # Fetch global ledger and verify transaction appears
        ledger_response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        ledger_data = ledger_response.json()
        
        # Find our transaction
        found = False
        for tx in ledger_data["transactions"]:
            if tx["product_id"] == unique_product:
                found = True
                assert tx["trade_type"] == "SELL"
                assert tx["quantity"] == 5
                break
        
        assert found, f"Recorded transaction with product_id {unique_product} not found in global ledger"
        print("PASS: Recorded transaction appears in global ledger")


class TestGlobalSyncVerification:
    """Test that multiple users see the same data"""
    
    def test_prices_consistent_across_multiple_requests(self):
        """Simulate multiple users fetching prices simultaneously"""
        # Make 5 rapid requests (simulating 5 different users)
        responses = []
        for i in range(5):
            response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
            responses.append(response.json())
        
        # All responses should have identical prices
        base_prices = responses[0]["prices"]
        for i, resp in enumerate(responses[1:], 2):
            for product_id in base_prices:
                assert base_prices[product_id]["current"] == resp["prices"][product_id]["current"], \
                    f"User {i} sees different price for {product_id}"
        
        print("PASS: 5 simultaneous requests return identical prices (global sync verified)")
    
    def test_ledger_consistent_across_multiple_requests(self):
        """Simulate multiple users fetching ledger simultaneously"""
        # Make 3 rapid requests
        responses = []
        for i in range(3):
            response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
            responses.append(response.json())
        
        # All responses should have same transaction count
        base_total = responses[0]["total"]
        for i, resp in enumerate(responses[1:], 2):
            assert base_total == resp["total"], \
                f"User {i} sees different transaction count: {resp['total']} vs {base_total}"
        
        print("PASS: 3 simultaneous ledger requests return consistent data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
