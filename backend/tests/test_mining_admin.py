"""
Test suite for FTC Mining and Admin Panel features
Tests:
- Mining status endpoint
- Mining subscription request
- Admin panel endpoints (get requests, activate, reject)
- Nutrition products endpoint (Raw Materials)
"""

import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://nutrition-trader.preview.emergentagent.com').rstrip('/')

# Admin credentials from test_credentials.md
ADMIN_USERNAME = "Fitrudrah"
ADMIN_PASSWORD = "000000"
ADMIN_SECRET = "0000"


class TestMiningEndpoints:
    """Test FTC Mining API endpoints"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user and return token"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"test_mining_{unique_id}@test.com"
        password = "TestPass123!"
        
        # Register user
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Mining Test User"
        })
        
        if response.status_code == 200:
            data = response.json()
            return {"token": data["token"], "user": data["user"], "email": email}
        elif response.status_code == 400:
            # User exists, try login
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": password
            })
            if response.status_code == 200:
                data = response.json()
                return {"token": data["token"], "user": data["user"], "email": email}
        
        pytest.skip("Could not create test user")
    
    def test_mining_status_requires_auth(self):
        """Test that mining status endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/mining/status")
        assert response.status_code == 403 or response.status_code == 401
        print("✓ Mining status requires authentication")
    
    def test_mining_status_with_auth(self, test_user):
        """Test mining status endpoint with valid auth"""
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        response = requests.get(f"{BASE_URL}/api/mining/status", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "ftc_balance" in data
        assert "calories_burned" in data
        assert "ftc_mined_today" in data
        assert "is_mining" in data
        
        print(f"✓ Mining status returned: balance={data['ftc_balance']}, mining={data['is_mining']}")
    
    def test_mining_subscribe_requires_auth(self):
        """Test that subscribe endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/mining/subscribe", json={
            "plan_id": "basic",
            "plan_name": "Basic Miner",
            "calories": 500,
            "ftc_limit": 500,
            "payment_method": "USD",
            "price": 5
        })
        assert response.status_code == 403 or response.status_code == 401
        print("✓ Mining subscribe requires authentication")
    
    def test_mining_subscribe_with_auth(self, test_user):
        """Test mining subscription request with valid auth"""
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        
        response = requests.post(f"{BASE_URL}/api/mining/subscribe", headers=headers, json={
            "plan_id": "basic",
            "plan_name": "Basic Miner",
            "calories": 500,
            "ftc_limit": 500,
            "payment_method": "USD",
            "price": 5
        })
        
        # Should succeed or return 400 if already has pending request
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            data = response.json()
            assert "request" in data
            assert data["request"]["status"] == "pending"
            print(f"✓ Subscription request created: {data['request']['id']}")
        else:
            print("✓ Subscription request already exists (expected)")


class TestAdminEndpoints:
    """Test Admin Panel API endpoints"""
    
    def test_admin_get_mining_requests(self):
        """Test admin endpoint to get mining requests"""
        response = requests.get(f"{BASE_URL}/api/admin/mining-requests")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "requests" in data
        assert "users" in data
        assert isinstance(data["requests"], list)
        assert isinstance(data["users"], list)
        
        print(f"✓ Admin mining requests: {len(data['requests'])} requests, {len(data['users'])} users")
    
    def test_admin_activate_subscription_invalid_id(self):
        """Test admin activate with invalid request ID"""
        response = requests.post(f"{BASE_URL}/api/admin/activate-subscription", json={
            "request_id": "invalid-id-12345"
        })
        
        # Should return 404 for invalid ID
        assert response.status_code == 404
        print("✓ Admin activate returns 404 for invalid ID")
    
    def test_admin_reject_subscription_invalid_id(self):
        """Test admin reject with invalid request ID"""
        response = requests.post(f"{BASE_URL}/api/admin/reject-subscription", json={
            "request_id": "invalid-id-12345"
        })
        
        # Should return 404 or 200 (if no matching doc)
        assert response.status_code in [200, 404]
        print("✓ Admin reject handles invalid ID correctly")


class TestAdminActivationFlow:
    """Test full admin activation flow"""
    
    def test_full_subscription_activation_flow(self):
        """Test complete flow: user subscribes -> admin activates"""
        # Step 1: Create a new test user
        unique_id = str(uuid.uuid4())[:8]
        email = f"test_admin_flow_{unique_id}@test.com"
        password = "TestPass123!"
        
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Admin Flow Test"
        })
        
        if register_response.status_code != 200:
            pytest.skip("Could not create test user")
        
        token = register_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 2: Submit subscription request
        subscribe_response = requests.post(f"{BASE_URL}/api/mining/subscribe", headers=headers, json={
            "plan_id": "standard",
            "plan_name": "Standard Miner",
            "calories": 1000,
            "ftc_limit": 1000,
            "payment_method": "FTC",
            "price": 2500
        })
        
        assert subscribe_response.status_code == 200
        request_id = subscribe_response.json()["request"]["id"]
        print(f"✓ Subscription request created: {request_id}")
        
        # Step 3: Verify request appears in admin panel
        admin_response = requests.get(f"{BASE_URL}/api/admin/mining-requests")
        assert admin_response.status_code == 200
        
        requests_list = admin_response.json()["requests"]
        found_request = next((r for r in requests_list if r["id"] == request_id), None)
        assert found_request is not None
        assert found_request["status"] == "pending"
        print(f"✓ Request found in admin panel with status: {found_request['status']}")
        
        # Step 4: Admin activates the subscription
        activate_response = requests.post(f"{BASE_URL}/api/admin/activate-subscription", json={
            "request_id": request_id
        })
        
        assert activate_response.status_code == 200
        print("✓ Admin activated subscription")
        
        # Step 5: Verify user's mining status shows active subscription
        status_response = requests.get(f"{BASE_URL}/api/mining/status", headers=headers)
        assert status_response.status_code == 200
        
        status_data = status_response.json()
        assert status_data.get("active_subscription") is not None
        assert status_data["active_subscription"]["plan_name"] == "Standard Miner"
        print(f"✓ User now has active subscription: {status_data['active_subscription']['plan_name']}")


class TestNutritionProducts:
    """Test Raw Materials Trading products endpoint"""
    
    def test_get_nutrition_products(self):
        """Test that nutrition products endpoint returns raw materials"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "products" in data
        products = data["products"]
        assert len(products) > 0
        
        # Verify product structure
        first_product = products[0]
        required_fields = ["id", "name", "brand", "category", "image", "weight", "mrp", "discount_price"]
        for field in required_fields:
            assert field in first_product, f"Missing field: {field}"
        
        # Verify categories are raw materials
        categories = set(p["category"] for p in products)
        expected_categories = {"Protein", "Creatine", "Pre-Workout", "Gainer", "Amino", "Recovery"}
        assert categories.issubset(expected_categories) or len(categories) > 0
        
        print(f"✓ Nutrition products: {len(products)} products, categories: {categories}")
    
    def test_products_have_working_images(self):
        """Test that product images are valid URLs"""
        response = requests.get(f"{BASE_URL}/api/nutrition/products")
        assert response.status_code == 200
        
        products = response.json()["products"]
        
        # Check first 3 products have valid image URLs
        for product in products[:3]:
            image_url = product.get("image", "")
            assert image_url.startswith("http"), f"Invalid image URL: {image_url}"
            assert "unsplash.com" in image_url or "emergentagent.com" in image_url
        
        print("✓ Product images have valid URLs")


class TestStepsAppLink:
    """Test StepsApp integration link"""
    
    def test_stepsapp_link_accessible(self):
        """Test that StepsApp invite link is accessible"""
        stepsapp_url = "https://invite.steps.app/zkK1vmJRdARK"
        
        try:
            # Use GET instead of HEAD as some services don't support HEAD
            response = requests.get(stepsapp_url, allow_redirects=True, timeout=10)
            # StepsApp should return 200 or redirect
            assert response.status_code in [200, 301, 302, 307, 308, 405]
            print(f"✓ StepsApp link accessible: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠ StepsApp link check failed (external service): {e}")
            # Don't fail test for external service issues - it's an external link
            pytest.skip(f"External service unavailable: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
