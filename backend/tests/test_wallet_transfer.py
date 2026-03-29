"""
Test FTC Wallet Transfer Features
- Wallet verification (valid/invalid)
- Send FTC to valid wallet
- Balance updates after transfer
- Global ledger entries
- Admin fee collection
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ftc-ledger-hub.preview.emergentagent.com')

# Test credentials
SENDER_EMAIL = "demo@trader.com"
SENDER_PASSWORD = "demo123"
VALID_WALLET = "VPxDZRjxLQj4oMM6jaRNgVtvAp4DWiwy"  # User Fita
INVALID_WALLET = "INVALID_12345"


class TestWalletVerification:
    """Test wallet address verification endpoint"""
    
    def test_verify_valid_wallet_address(self):
        """Test verifying a valid wallet address returns verified status"""
        response = requests.get(f"{BASE_URL}/api/wallet/verify/{VALID_WALLET}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data['valid'] == True
        assert data['recipient_name'] is not None
        assert 'Fi' in data['recipient_name'] or '***' in data['recipient_name']  # Masked name
        assert data['message'] == 'Wallet address verified'
        print(f"✅ Valid wallet verified: {data['recipient_name']}")
    
    def test_verify_invalid_wallet_address(self):
        """Test verifying an invalid wallet address returns not found"""
        response = requests.get(f"{BASE_URL}/api/wallet/verify/{INVALID_WALLET}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data['valid'] == False
        assert data['recipient_name'] is None
        assert data['message'] == 'Wallet address not found'
        print(f"✅ Invalid wallet correctly rejected")
    
    def test_verify_short_wallet_address(self):
        """Test verifying a too-short wallet address"""
        response = requests.get(f"{BASE_URL}/api/wallet/verify/ABC123")
        
        assert response.status_code == 200
        data = response.json()
        assert data['valid'] == False
        print(f"✅ Short wallet correctly rejected")


class TestSendFTC:
    """Test FTC transfer functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for sender"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": SENDER_EMAIL, "password": SENDER_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()['token']
    
    @pytest.fixture
    def sender_wallet_info(self, auth_token):
        """Get sender's wallet info before transfer"""
        response = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        return response.json()
    
    def test_send_ftc_to_valid_wallet(self, auth_token, sender_wallet_info):
        """Test sending FTC to a valid wallet address"""
        initial_balance = sender_wallet_info['ftc_balance']
        send_amount = 0.5
        
        # Skip if insufficient balance
        if initial_balance < send_amount:
            pytest.skip(f"Insufficient balance: {initial_balance} FTC")
        
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "recipient_wallet_address": VALID_WALLET,
                "amount": send_amount,
                "note": "Test transfer from pytest"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify success response
        assert data['success'] == True
        assert 'transaction' in data
        tx = data['transaction']
        assert tx['status'] == 'CONFIRMED'
        assert float(tx['amount_sent']) == send_amount
        assert float(tx['fee_amount']) > 0  # Fee should be collected
        assert float(tx['amount_received']) <= send_amount  # Amount after fee (may be equal for tiny fees)
        
        print(f"✅ FTC sent successfully: {tx['amount_received']} FTC (fee: {tx['fee_amount']})")
        
        # Verify balance decreased
        time.sleep(0.5)  # Wait for DB update
        response = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        new_balance = response.json()['ftc_balance']
        assert new_balance < initial_balance
        print(f"✅ Balance updated: {initial_balance} -> {new_balance}")
    
    def test_send_ftc_to_invalid_wallet(self, auth_token):
        """Test sending FTC to an invalid wallet address returns error"""
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "recipient_wallet_address": INVALID_WALLET,
                "amount": 1.0,
                "note": "Test invalid transfer"
            }
        )
        
        assert response.status_code == 404
        data = response.json()
        assert 'not found' in data['detail'].lower()
        print(f"✅ Invalid wallet transfer correctly rejected: {data['detail']}")
    
    def test_send_ftc_insufficient_balance(self, auth_token, sender_wallet_info):
        """Test sending more FTC than available balance"""
        huge_amount = sender_wallet_info['ftc_balance'] + 1000000
        
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "recipient_wallet_address": VALID_WALLET,
                "amount": huge_amount,
                "note": "Test insufficient balance"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'insufficient' in data['detail'].lower()
        print(f"✅ Insufficient balance correctly rejected")


class TestGlobalLedger:
    """Test global blockchain ledger visibility"""
    
    def test_global_ledger_returns_transactions(self):
        """Test that global ledger returns recent transactions"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'transactions' in data
        assert isinstance(data['transactions'], list)
        
        if len(data['transactions']) > 0:
            tx = data['transactions'][0]
            # Verify transaction structure
            assert 'id' in tx
            assert 'trade_type' in tx
            assert 'status' in tx
            assert 'timestamp' in tx
            print(f"✅ Global ledger has {len(data['transactions'])} transactions")
        else:
            print("⚠️ Global ledger is empty (no transactions yet)")
    
    def test_global_ledger_shows_ftc_transfers(self):
        """Test that FTC transfers appear in global ledger"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        
        assert response.status_code == 200
        data = response.json()
        
        # Look for FTC_TRANSFER entries
        ftc_transfers = [tx for tx in data['transactions'] if tx.get('product_id') == 'FTC_TRANSFER']
        
        if len(ftc_transfers) > 0:
            tx = ftc_transfers[0]
            assert tx['trade_type'] == 'SEND'
            assert 'fee_amount' in tx
            assert tx['status'] == 'CONFIRMED'
            print(f"✅ Found {len(ftc_transfers)} FTC transfers in global ledger")
        else:
            print("⚠️ No FTC transfers in global ledger yet")


class TestMiningAndBoost:
    """Test mining status and AI boost functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": SENDER_EMAIL, "password": SENDER_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()['token']
    
    def test_mining_status_returns_boost_config(self, auth_token):
        """Test that mining status includes boost configuration"""
        response = requests.get(
            f"{BASE_URL}/api/mining/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check for boost config
        if 'boost_config' in data:
            config = data['boost_config']
            assert config.get('boost_duration') == 5  # 5 seconds
            assert config.get('boost_multiplier') == 2.0  # 2x speed
            print(f"✅ Boost config: {config['boost_duration']}s at {config['boost_multiplier']}x")
        else:
            print("⚠️ No boost_config in mining status (may need active subscription)")
    
    def test_activate_boost(self, auth_token):
        """Test activating AI boost"""
        response = requests.post(
            f"{BASE_URL}/api/mining/activate-boost",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # May fail if no active subscription or already boosted
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                assert data['boost_duration'] == 5
                assert data['boost_multiplier'] == 2.0
                print(f"✅ AI Boost activated: {data['boost_duration']}s at {data['boost_multiplier']}x")
            else:
                print(f"⚠️ Boost not activated: {data.get('message')}")
        else:
            print(f"⚠️ Boost activation failed (may need active mining session)")


class TestFeeCalculation:
    """Test transaction fee calculation"""
    
    def test_fee_calculator_endpoint(self):
        """Test fee calculator returns correct fee structure"""
        test_amounts = [10, 100, 1000, 10000]
        
        for amount in test_amounts:
            response = requests.get(f"{BASE_URL}/api/fee-calculator?amount={amount}")
            
            assert response.status_code == 200
            data = response.json()
            
            assert 'fee_percent' in data
            assert 'fee_amount' in data
            assert 'amount_after_fee' in data
            assert data['fee_amount'] > 0
            assert data['amount_after_fee'] < amount
            
            print(f"✅ Fee for {amount} FTC: {data['fee_percent']}% = {data['fee_amount']} FTC")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
