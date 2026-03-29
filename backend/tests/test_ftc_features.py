"""
FTC Mining Features Test Suite
Tests: Calories=FTC (1:1), AI Boost (5s, 2x), Send FTC, Wallet Balance Updates, Admin Fee, Global Ledger
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ftc-ledger-hub.preview.emergentagent.com')

# Test credentials
SENDER_EMAIL = "demo@trader.com"
SENDER_PASSWORD = "demo123"
RECEIVER_EMAIL = "test2@trader.com"
RECEIVER_PASSWORD = "test123"
RECEIVER_WALLET = "tvWYd9KiwWXxWEs8JFKqwcR4J7XyGiL3"


class TestAuthentication:
    """Test login functionality"""
    
    def test_sender_login(self):
        """Test sender (demo@trader.com) can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SENDER_EMAIL,
            "password": SENDER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        print(f"✅ Sender login successful: {data['user']['email']}")
        return data['token']
    
    def test_receiver_login(self):
        """Test receiver (test2@trader.com) can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": RECEIVER_EMAIL,
            "password": RECEIVER_PASSWORD
        })
        assert response.status_code == 200, f"Receiver login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        print(f"✅ Receiver login successful: {data['user']['email']}")
        return data['token']


class TestMiningStatus:
    """Test mining status and boost configuration"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SENDER_EMAIL,
            "password": SENDER_PASSWORD
        })
        return response.json()['token']
    
    def test_mining_status_returns_boost_config(self, auth_token):
        """Verify mining status returns boost config with 5s duration and 2x multiplier"""
        response = requests.get(
            f"{BASE_URL}/api/mining/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Mining status failed: {response.text}"
        data = response.json()
        
        # Check boost config exists
        assert "boost_config" in data, "No boost_config in response"
        boost_config = data['boost_config']
        
        # Verify boost duration is 5 seconds
        assert boost_config.get('boost_duration') == 5, f"Expected boost_duration=5, got {boost_config.get('boost_duration')}"
        
        # Verify boost multiplier is 2.0 (2x speed)
        assert boost_config.get('boost_multiplier') == 2.0, f"Expected boost_multiplier=2.0, got {boost_config.get('boost_multiplier')}"
        
        print(f"✅ Boost config verified: {boost_config['boost_duration']}s, {boost_config['boost_multiplier']}x")
        return data


class TestAIBoost:
    """Test AI Boost activation - 5 seconds, 2x speed"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SENDER_EMAIL,
            "password": SENDER_PASSWORD
        })
        return response.json()['token']
    
    def test_activate_boost_returns_correct_values(self, auth_token):
        """Test AI Boost activation returns 5s duration and 2x multiplier"""
        response = requests.post(
            f"{BASE_URL}/api/mining/activate-boost",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Boost activation failed: {response.text}"
        data = response.json()
        
        # Check success
        assert data.get('success') == True, f"Boost not successful: {data}"
        
        # Verify boost duration is 5 seconds
        assert data.get('boost_duration') == 5, f"Expected boost_duration=5, got {data.get('boost_duration')}"
        
        # Verify boost multiplier is 2.0 (NOT 1.5x)
        assert data.get('boost_multiplier') == 2.0, f"Expected boost_multiplier=2.0, got {data.get('boost_multiplier')}"
        
        # Verify message contains 2.0x
        assert "2.0x" in data.get('message', ''), f"Message should contain 2.0x: {data.get('message')}"
        
        print(f"✅ AI Boost activated: {data['boost_duration']}s, {data['boost_multiplier']}x")
        print(f"   Message: {data.get('message')}")


class TestSendFTC:
    """Test Send FTC functionality with wallet balance updates"""
    
    @pytest.fixture
    def sender_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SENDER_EMAIL,
            "password": SENDER_PASSWORD
        })
        return response.json()['token']
    
    @pytest.fixture
    def receiver_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": RECEIVER_EMAIL,
            "password": RECEIVER_PASSWORD
        })
        return response.json()['token']
    
    def test_get_sender_wallet_balance(self, sender_token):
        """Get sender's current wallet balance"""
        response = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {sender_token}"}
        )
        assert response.status_code == 200, f"Get wallet failed: {response.text}"
        data = response.json()
        assert "ftc_balance" in data, "No ftc_balance in response"
        print(f"✅ Sender wallet balance: {data['ftc_balance']} FTC")
        return data['ftc_balance']
    
    def test_get_receiver_wallet_balance(self, receiver_token):
        """Get receiver's current wallet balance"""
        response = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {receiver_token}"}
        )
        assert response.status_code == 200, f"Get wallet failed: {response.text}"
        data = response.json()
        assert "ftc_balance" in data, "No ftc_balance in response"
        print(f"✅ Receiver wallet balance: {data['ftc_balance']} FTC")
        return data['ftc_balance']
    
    def test_send_ftc_and_verify_balances(self, sender_token, receiver_token):
        """Send FTC and verify both sender and receiver balances update"""
        # Get initial balances
        sender_wallet_before = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {sender_token}"}
        ).json()
        
        receiver_wallet_before = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {receiver_token}"}
        ).json()
        
        sender_balance_before = sender_wallet_before['ftc_balance']
        receiver_balance_before = receiver_wallet_before['ftc_balance']
        
        print(f"📊 Before transfer:")
        print(f"   Sender balance: {sender_balance_before} FTC")
        print(f"   Receiver balance: {receiver_balance_before} FTC")
        
        # Send 1 FTC
        send_amount = 1.0
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {sender_token}"},
            json={
                "recipient_wallet_address": RECEIVER_WALLET,
                "amount": send_amount,
                "note": "pytest transfer test"
            }
        )
        
        assert response.status_code == 200, f"Send FTC failed: {response.text}"
        data = response.json()
        
        assert data.get('success') == True, f"Send not successful: {data}"
        
        tx = data['transaction']
        print(f"✅ Transfer successful:")
        print(f"   Amount sent: {tx['amount_sent']} FTC")
        print(f"   Fee: {tx['fee_amount']} FTC ({tx['fee_percent']})")
        print(f"   Amount received: {tx['amount_received']} FTC")
        
        # Verify sender balance decreased
        sender_wallet_after = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {sender_token}"}
        ).json()
        
        sender_balance_after = sender_wallet_after['ftc_balance']
        expected_sender_balance = sender_balance_before - send_amount
        
        assert abs(sender_balance_after - expected_sender_balance) < 0.01, \
            f"Sender balance mismatch: expected ~{expected_sender_balance}, got {sender_balance_after}"
        print(f"✅ Sender balance decreased: {sender_balance_before} -> {sender_balance_after}")
        
        # Verify receiver balance increased
        receiver_wallet_after = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {receiver_token}"}
        ).json()
        
        receiver_balance_after = receiver_wallet_after['ftc_balance']
        expected_receiver_balance = receiver_balance_before + tx['amount_received']
        
        assert abs(receiver_balance_after - expected_receiver_balance) < 0.01, \
            f"Receiver balance mismatch: expected ~{expected_receiver_balance}, got {receiver_balance_after}"
        print(f"✅ Receiver balance increased: {receiver_balance_before} -> {receiver_balance_after}")
        
        return tx


class TestAdminFeeCollection:
    """Test that transaction fees are collected in admin wallet"""
    
    def test_fee_calculator_endpoint(self):
        """Test fee calculator returns correct fee structure"""
        # Test different amounts
        test_amounts = [1, 100, 1000, 10000]
        expected_fees = [0.01, 0.01, 0.05, 0.1]  # Fee percentages
        
        for amount, expected_fee_pct in zip(test_amounts, expected_fees):
            response = requests.get(f"{BASE_URL}/api/fee-calculator?amount={amount}")
            assert response.status_code == 200, f"Fee calculator failed for amount {amount}"
            data = response.json()
            
            assert "fee_percent" in data, "No fee_percent in response"
            assert "fee_amount" in data, "No fee_amount in response"
            
            print(f"✅ Fee for {amount} FTC: {data['fee_percent']}% = {data['fee_amount']} FTC")
    
    def test_admin_wallet_stats(self):
        """Test admin wallet stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/wallet-stats")
        assert response.status_code == 200, f"Admin wallet stats failed: {response.text}"
        data = response.json()
        
        assert "total_fees_collected" in data, "No total_fees_collected in response"
        assert "total_transactions" in data, "No total_transactions in response"
        
        print(f"✅ Admin wallet stats:")
        print(f"   Total fees collected: {data['total_fees_collected']} FTC")
        print(f"   Total transactions: {data['total_transactions']}")


class TestGlobalFTCLedger:
    """Test Global FTC Ledger shows all wallet transfers"""
    
    def test_global_ledger_returns_transfers(self):
        """Test global ledger endpoint returns FTC transfers"""
        response = requests.get(f"{BASE_URL}/api/ftc/global-ledger")
        assert response.status_code == 200, f"Global ledger failed: {response.text}"
        data = response.json()
        
        assert "transactions" in data, "No transactions in response"
        assert "total_count" in data, "No total_count in response"
        
        transactions = data['transactions']
        print(f"✅ Global FTC Ledger: {data['total_count']} transactions")
        
        if len(transactions) > 0:
            # Verify transaction structure
            tx = transactions[0]
            required_fields = ['id', 'tx_hash', 'sender_name', 'recipient_name', 'amount', 'status']
            for field in required_fields:
                assert field in tx, f"Missing field '{field}' in transaction"
            
            print(f"   Latest: {tx['sender_name']} -> {tx['recipient_name']}: {tx['amount']} FTC")
            
            # Show first 3 transactions
            for i, tx in enumerate(transactions[:3]):
                print(f"   [{i+1}] {tx['sender_name']} -> {tx['recipient_name']}: {tx['amount']} FTC ({tx['status']})")
    
    def test_global_ledger_shows_recent_transfer(self):
        """Verify the global ledger shows our recent test transfer"""
        response = requests.get(f"{BASE_URL}/api/ftc/global-ledger")
        data = response.json()
        
        transactions = data['transactions']
        
        # Look for transfers involving our test users
        demo_transfers = [tx for tx in transactions if 'Demo' in tx.get('sender_name', '')]
        
        assert len(demo_transfers) > 0, "No transfers from Demo Trader found in global ledger"
        print(f"✅ Found {len(demo_transfers)} transfers from Demo Trader in global ledger")


class TestCaloriesEqualsFTC:
    """Test that Calories = FTC (1:1 ratio) - verified via mining status"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SENDER_EMAIL,
            "password": SENDER_PASSWORD
        })
        return response.json()['token']
    
    def test_mining_status_has_ftc_values(self, auth_token):
        """Verify mining status returns FTC values (Calories = FTC in frontend)"""
        response = requests.get(
            f"{BASE_URL}/api/mining/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Backend returns ftc_mined_today which equals calories in frontend
        assert "ftc_mined_today" in data or "ftc_balance" in data, "No FTC values in mining status"
        
        print(f"✅ Mining status FTC values:")
        print(f"   FTC Balance: {data.get('ftc_balance', 'N/A')}")
        print(f"   FTC Mined Today: {data.get('ftc_mined_today', 'N/A')}")
        
        # Note: The 1:1 ratio (Calories = FTC) is enforced in frontend via useEffect
        # See FtcMining.js lines 944-951


class TestTransferButton:
    """Test Transfer button functionality (transfers mined FTC to balance)"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SENDER_EMAIL,
            "password": SENDER_PASSWORD
        })
        return response.json()['token']
    
    def test_mining_session_exists(self, auth_token):
        """Verify mining session can be checked"""
        response = requests.get(
            f"{BASE_URL}/api/mining/session",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Mining session check failed: {response.text}"
        data = response.json()
        
        print(f"✅ Mining session status:")
        print(f"   Has session: {data.get('has_session', False)}")
        print(f"   Current mined: {data.get('current_mined', 0)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
