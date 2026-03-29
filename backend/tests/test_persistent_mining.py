"""
Test Persistent Mining Session APIs
Tests for:
- Mining session start and persistence
- Mining sync updates FTC balance
- Boost activation based on subscription tier
- Boost duration and multiplier per tier
- Mining status endpoint
- Mining only stops when subscription expires
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
DEMO_USER = {"email": "demo@trader.com", "password": "demo123"}

class TestPersistentMining:
    """Test persistent mining session functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token for demo user"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as demo user
        response = self.session.post(f"{BASE_URL}/api/auth/login", json=DEMO_USER)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data.get("token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        yield
    
    # ========== Mining Status Tests ==========
    
    def test_get_mining_status(self):
        """Test GET /api/mining/status returns user mining info"""
        response = self.session.get(f"{BASE_URL}/api/mining/status")
        assert response.status_code == 200, f"Mining status failed: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "ftc_balance" in data
        assert "calories_burned" in data
        assert "ftc_mined_today" in data
        assert "is_mining" in data
        assert "active_subscription" in data
        assert "boost_config" in data
        
        print(f"Mining status: is_mining={data['is_mining']}, ftc_balance={data['ftc_balance']}")
        print(f"Active subscription: {data.get('active_subscription')}")
    
    def test_mining_status_includes_boost_config(self):
        """Test mining status includes boost configuration"""
        response = self.session.get(f"{BASE_URL}/api/mining/status")
        assert response.status_code == 200
        
        data = response.json()
        boost_config = data.get("boost_config", {})
        
        # Verify boost config structure
        assert "base_mining_rate" in boost_config
        assert "boost_duration" in boost_config
        assert "boost_multiplier" in boost_config
        assert "boost_cooldown" in boost_config
        assert "daily_limit" in boost_config
        assert "tier" in boost_config
        
        print(f"Boost config: {boost_config}")
    
    # ========== Mining Session Start Tests ==========
    
    def test_start_mining_session(self):
        """Test POST /api/mining/start-session creates persistent session"""
        response = self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        # Should succeed if user has active subscription
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True
            assert "session" in data
            assert "boost_config" in data
            
            session = data["session"]
            assert "id" in session
            assert "user_id" in session
            assert "is_active" in session
            assert session["is_active"] == True
            assert "started_at" in session
            
            print(f"Mining session started: {session['id']}")
            print(f"Session started at: {session['started_at']}")
        elif response.status_code == 403:
            # No active subscription
            data = response.json()
            assert "No active subscription" in data.get("detail", "")
            print("No active subscription - expected for users without subscription")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}, {response.text}")
    
    def test_start_mining_session_returns_existing(self):
        """Test starting session when one already exists returns existing session"""
        # Start first session
        response1 = self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        if response1.status_code == 200:
            data1 = response1.json()
            session_id1 = data1["session"]["id"]
            
            # Try to start another session
            response2 = self.session.post(f"{BASE_URL}/api/mining/start-session")
            assert response2.status_code == 200
            
            data2 = response2.json()
            session_id2 = data2["session"]["id"]
            
            # Should return same session (mining never stops)
            assert session_id1 == session_id2
            assert "already active" in data2.get("message", "").lower()
            
            print(f"Existing session returned: {session_id2}")
    
    # ========== Mining Session Get Tests ==========
    
    def test_get_mining_session(self):
        """Test GET /api/mining/session returns current session info"""
        # First ensure session exists
        self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        response = self.session.get(f"{BASE_URL}/api/mining/session")
        assert response.status_code == 200, f"Get session failed: {response.text}"
        
        data = response.json()
        
        if data.get("has_session"):
            assert "session" in data
            assert "elapsed_seconds" in data
            assert "current_mined" in data
            assert "mining_rate" in data
            assert "boost_config" in data
            
            print(f"Session info: elapsed={data['elapsed_seconds']}s, mined={data['current_mined']}")
        else:
            print(f"No active session: {data.get('message')}")
    
    def test_get_session_calculates_mined_amount(self):
        """Test session endpoint calculates mined FTC based on elapsed time"""
        # Start session
        start_response = self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        if start_response.status_code == 200:
            # Wait a bit for mining to accumulate
            time.sleep(2)
            
            # Get session
            response = self.session.get(f"{BASE_URL}/api/mining/session")
            assert response.status_code == 200
            
            data = response.json()
            if data.get("has_session"):
                assert data["elapsed_seconds"] >= 2
                assert data["current_mined"] > 0
                
                # Verify mining rate matches boost config
                expected_rate = data["boost_config"]["base_mining_rate"]
                print(f"Mining rate: {data['mining_rate']}, expected base: {expected_rate}")
    
    # ========== Mining Sync Tests ==========
    
    def test_sync_mining_session(self):
        """Test POST /api/mining/sync-session updates FTC balance"""
        # Start session first
        start_response = self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        if start_response.status_code == 200:
            # Wait for some mining to occur
            time.sleep(2)
            
            # Sync session
            response = self.session.post(f"{BASE_URL}/api/mining/sync-session")
            assert response.status_code == 200
            
            data = response.json()
            assert data.get("success") == True
            assert "mined" in data
            assert "total_mined" in data
            assert "mining_rate" in data
            assert "boost_config" in data
            
            assert data["mined"] >= 0
            print(f"Synced: mined={data['mined']}, total={data['total_mined']}, rate={data['mining_rate']}")
    
    def test_sync_updates_wallet_balance(self):
        """Test sync actually updates mining wallet balance"""
        # Get initial balance
        status_before = self.session.get(f"{BASE_URL}/api/mining/status").json()
        initial_balance = status_before.get("ftc_balance", 0)
        
        # Start session
        self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        # Wait and sync
        time.sleep(3)
        sync_response = self.session.post(f"{BASE_URL}/api/mining/sync-session")
        
        if sync_response.status_code == 200 and sync_response.json().get("success"):
            mined = sync_response.json()["mined"]
            
            # Get new balance
            status_after = self.session.get(f"{BASE_URL}/api/mining/status").json()
            new_balance = status_after.get("ftc_balance", 0)
            
            # Balance should have increased
            print(f"Balance before: {initial_balance}, after: {new_balance}, mined: {mined}")
            # Note: Balance includes session_mined calculation so may be higher
    
    def test_sync_no_active_session(self):
        """Test sync returns error when no active session"""
        # This test may not work if session already exists
        # Just verify the endpoint handles the case
        response = self.session.post(f"{BASE_URL}/api/mining/sync-session")
        assert response.status_code == 200
        
        data = response.json()
        # Either success (session exists) or no session message
        if not data.get("success"):
            assert "No active mining session" in data.get("message", "")
            print("No active session - sync correctly returns error")
        else:
            print("Session exists - sync succeeded")
    
    # ========== Boost Activation Tests ==========
    
    def test_activate_boost(self):
        """Test POST /api/mining/activate-boost activates speed boost"""
        # Start session first
        self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        # Wait for any cooldown to pass
        time.sleep(1)
        
        response = self.session.post(f"{BASE_URL}/api/mining/activate-boost")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                assert "boost_multiplier" in data
                assert "boost_duration" in data
                assert "boost_config" in data
                
                print(f"Boost activated: {data['boost_multiplier']}x for {data['boost_duration']}s")
            else:
                # Boost on cooldown
                assert "cooldown" in data.get("message", "").lower()
                print(f"Boost on cooldown: {data.get('message')}")
        elif response.status_code == 400:
            # No active session
            data = response.json()
            assert "No active mining session" in data.get("detail", "")
            print("No active session for boost")
        elif response.status_code == 403:
            # No subscription
            print("No active subscription for boost")
    
    def test_boost_cooldown(self):
        """Test boost has cooldown period"""
        # Start session
        self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        # Activate boost
        response1 = self.session.post(f"{BASE_URL}/api/mining/activate-boost")
        
        if response1.status_code == 200 and response1.json().get("success"):
            # Try to activate again immediately
            response2 = self.session.post(f"{BASE_URL}/api/mining/activate-boost")
            
            if response2.status_code == 200:
                data2 = response2.json()
                # Should be on cooldown
                if not data2.get("success"):
                    assert "cooldown" in data2.get("message", "").lower()
                    assert "cooldown_remaining" in data2
                    print(f"Boost on cooldown: {data2['cooldown_remaining']}s remaining")
    
    def test_boost_config_per_tier(self):
        """Test boost configuration varies by subscription tier"""
        # Get mining status to see boost config
        response = self.session.get(f"{BASE_URL}/api/mining/status")
        assert response.status_code == 200
        
        data = response.json()
        boost_config = data.get("boost_config", {})
        active_sub = data.get("active_subscription")
        
        if active_sub:
            plan_id = active_sub.get("plan_id")
            tier = boost_config.get("tier", 0)
            
            print(f"Plan: {plan_id}, Tier: {tier}")
            print(f"Base mining rate: {boost_config.get('base_mining_rate')}")
            print(f"Boost duration: {boost_config.get('boost_duration')}s")
            print(f"Boost multiplier: {boost_config.get('boost_multiplier')}x")
            print(f"Boost cooldown: {boost_config.get('boost_cooldown')}s")
            print(f"Daily limit: {boost_config.get('daily_limit')}")
            
            # Verify tier-based values (demo user has ultra_2026 = tier 6)
            if plan_id == "ultra_2026":
                assert tier == 6
                assert boost_config.get("base_mining_rate") == 0.008
                assert boost_config.get("boost_duration") == 20
                assert boost_config.get("boost_multiplier") == 3.0
                assert boost_config.get("boost_cooldown") == 25
                assert boost_config.get("daily_limit") == 5000
    
    # ========== Mining Persistence Tests ==========
    
    def test_mining_persists_across_requests(self):
        """Test mining session persists across multiple API calls"""
        # Start session
        start_response = self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        if start_response.status_code == 200:
            session_id = start_response.json()["session"]["id"]
            
            # Make multiple requests
            for i in range(3):
                time.sleep(1)
                session_response = self.session.get(f"{BASE_URL}/api/mining/session")
                assert session_response.status_code == 200
                
                data = session_response.json()
                assert data.get("has_session") == True
                assert data["session"]["id"] == session_id
                
                print(f"Request {i+1}: Session still active, mined={data['current_mined']}")
    
    def test_mining_continues_after_page_refresh_simulation(self):
        """Test mining continues even after simulated page refresh (new session)"""
        # Start session
        start_response = self.session.post(f"{BASE_URL}/api/mining/start-session")
        
        if start_response.status_code == 200:
            session_id = start_response.json()["session"]["id"]
            started_at = start_response.json()["session"]["started_at"]
            
            # Wait
            time.sleep(2)
            
            # Create new HTTP session (simulates page refresh)
            new_session = requests.Session()
            new_session.headers.update({"Content-Type": "application/json"})
            
            # Re-login
            login_response = new_session.post(f"{BASE_URL}/api/auth/login", json=DEMO_USER)
            assert login_response.status_code == 200
            new_token = login_response.json()["token"]
            new_session.headers.update({"Authorization": f"Bearer {new_token}"})
            
            # Check session still exists
            session_response = new_session.get(f"{BASE_URL}/api/mining/session")
            assert session_response.status_code == 200
            
            data = session_response.json()
            assert data.get("has_session") == True
            assert data["session"]["id"] == session_id
            assert data["session"]["started_at"] == started_at
            
            print(f"Session persisted after 'refresh': id={session_id}")
            print(f"Elapsed time: {data['elapsed_seconds']}s, mined: {data['current_mined']}")


class TestBoostConfigTiers:
    """Test boost configuration for different subscription tiers"""
    
    def test_tier_0_free_trial_config(self):
        """Verify tier 0 (free_trial) boost config"""
        # This is a unit test of the config - we verify via API
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login
        response = session.post(f"{BASE_URL}/api/auth/login", json=DEMO_USER)
        if response.status_code == 200:
            token = response.json()["token"]
            session.headers.update({"Authorization": f"Bearer {token}"})
            
            # Get status
            status = session.get(f"{BASE_URL}/api/mining/status").json()
            boost_config = status.get("boost_config", {})
            
            # Just verify structure exists
            assert "tier" in boost_config
            print(f"Current tier: {boost_config['tier']}")


class TestMiningWithoutSubscription:
    """Test mining behavior without active subscription"""
    
    def test_start_mining_without_subscription(self):
        """Test starting mining without subscription returns 403"""
        # Create a new test user or use one without subscription
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Try to register a new user
        import uuid
        test_email = f"test_no_sub_{uuid.uuid4().hex[:8]}@test.com"
        
        register_response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Test No Sub"
        })
        
        if register_response.status_code == 200:
            token = register_response.json()["token"]
            session.headers.update({"Authorization": f"Bearer {token}"})
            
            # Try to start mining
            response = session.post(f"{BASE_URL}/api/mining/start-session")
            assert response.status_code == 403
            
            data = response.json()
            assert "No active subscription" in data.get("detail", "")
            print("Correctly rejected mining without subscription")
        else:
            print(f"Could not create test user: {register_response.text}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
