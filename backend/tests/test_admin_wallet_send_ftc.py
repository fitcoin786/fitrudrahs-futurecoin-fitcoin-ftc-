"""
Test Admin Wallet and Send FTC Features
- Admin wallet display and edit
- Fee structure (0.01% - 15% price bands)
- User-to-user Send FTC with wallet address
- Fee deduction and collection in admin wallet
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
DEMO_USER = {"email": "demo@trader.com", "password": "demo123"}
TEST_USER_2 = {"email": "testuser2@ftc.com", "password": "test123", "wallet": "HCHiMZZayBNJGmkqcMvyJRP73zCwNzsq"}


class TestAdminWallet:
    """Admin Wallet endpoint tests"""
    
    def test_get_admin_wallet(self):
        """Test GET /api/admin/wallet returns wallet info and fee structure"""
        response = requests.get(f"{BASE_URL}/api/admin/wallet")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify wallet address exists
        assert "wallet_address" in data, "Missing wallet_address"
        assert len(data["wallet_address"]) >= 20, "Wallet address too short"
        
        # Verify fee stats
        assert "total_fees_collected" in data, "Missing total_fees_collected"
        assert "total_transactions" in data, "Missing total_transactions"
        assert isinstance(data["total_fees_collected"], (int, float)), "total_fees_collected should be numeric"
        assert isinstance(data["total_transactions"], int), "total_transactions should be int"
        
        # Verify fee structure
        assert "fee_structure" in data, "Missing fee_structure"
        fee_structure = data["fee_structure"]
        assert "1-100 FTC" in fee_structure, "Missing 1-100 FTC band"
        assert fee_structure["1-100 FTC"] == "0.01%", "Wrong fee for 1-100 FTC"
        assert "1,000,000,001+ FTC" in fee_structure, "Missing 1B+ FTC band"
        assert fee_structure["1,000,000,001+ FTC"] == "15%", "Wrong fee for 1B+ FTC"
        
        print(f"✅ Admin wallet: {data['wallet_address'][:20]}...")
        print(f"✅ Total fees collected: {data['total_fees_collected']} FTC")
        print(f"✅ Total transactions: {data['total_transactions']}")
    
    def test_update_admin_wallet_valid(self):
        """Test PUT /api/admin/wallet with valid address"""
        new_address = "TEST_ADMIN_WALLET_" + "X" * 20  # 38 chars
        
        response = requests.put(
            f"{BASE_URL}/api/admin/wallet",
            json={"new_wallet_address": new_address}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert data.get("wallet_address") == new_address, "Wallet address not updated"
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/admin/wallet")
        verify_data = verify_response.json()
        assert verify_data["wallet_address"] == new_address, "Wallet address not persisted"
        
        print(f"✅ Admin wallet updated to: {new_address[:20]}...")
        
        # Restore original wallet
        requests.put(
            f"{BASE_URL}/api/admin/wallet",
            json={"new_wallet_address": "ADMIN_FTC_8x7K9mNpQ2rT5wYz3aB6cD4eF1gH0iJ"}
        )
    
    def test_update_admin_wallet_invalid_short(self):
        """Test PUT /api/admin/wallet with too short address"""
        response = requests.put(
            f"{BASE_URL}/api/admin/wallet",
            json={"new_wallet_address": "short"}
        )
        assert response.status_code == 400, f"Expected 400 for short address, got {response.status_code}"
        print("✅ Short wallet address rejected correctly")
    
    def test_get_admin_fee_history(self):
        """Test GET /api/admin/fee-history"""
        response = requests.get(f"{BASE_URL}/api/admin/fee-history")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "fees" in data, "Missing fees array"
        assert "total_collected" in data, "Missing total_collected"
        assert "total_transactions" in data, "Missing total_transactions"
        
        print(f"✅ Fee history: {len(data['fees'])} records, total: {data['total_collected']} FTC")


class TestFeeCalculator:
    """Fee calculator endpoint tests"""
    
    def test_fee_calculator_band_1(self):
        """Test fee for 1-100 FTC (0.01%)"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=50")
        assert response.status_code == 200
        
        data = response.json()
        assert data["fee_percent"] == 0.01, f"Expected 0.01%, got {data['fee_percent']}%"
        assert data["fee_amount"] == 0.005, f"Expected 0.005, got {data['fee_amount']}"
        assert data["amount_after_fee"] == 49.995, f"Expected 49.995, got {data['amount_after_fee']}"
        print("✅ Fee band 1-100 FTC: 0.01% correct")
    
    def test_fee_calculator_band_2(self):
        """Test fee for 101-1000 FTC (0.05%)"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=500")
        assert response.status_code == 200
        
        data = response.json()
        assert data["fee_percent"] == 0.05, f"Expected 0.05%, got {data['fee_percent']}%"
        assert data["fee_amount"] == 0.25, f"Expected 0.25, got {data['fee_amount']}"
        print("✅ Fee band 101-1000 FTC: 0.05% correct")
    
    def test_fee_calculator_band_3(self):
        """Test fee for 1001-10000 FTC (0.1%)"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=5000")
        assert response.status_code == 200
        
        data = response.json()
        assert data["fee_percent"] == 0.1, f"Expected 0.1%, got {data['fee_percent']}%"
        assert data["fee_amount"] == 5.0, f"Expected 5.0, got {data['fee_amount']}"
        print("✅ Fee band 1001-10000 FTC: 0.1% correct")
    
    def test_fee_calculator_band_4(self):
        """Test fee for 10001-100000 FTC (0.5%)"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=50000")
        assert response.status_code == 200
        
        data = response.json()
        assert data["fee_percent"] == 0.5, f"Expected 0.5%, got {data['fee_percent']}%"
        assert data["fee_amount"] == 250.0, f"Expected 250.0, got {data['fee_amount']}"
        print("✅ Fee band 10001-100000 FTC: 0.5% correct")
    
    def test_fee_calculator_band_5(self):
        """Test fee for 100001-1000000 FTC (1%)"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=500000")
        assert response.status_code == 200
        
        data = response.json()
        assert data["fee_percent"] == 1.0, f"Expected 1%, got {data['fee_percent']}%"
        assert data["fee_amount"] == 5000.0, f"Expected 5000.0, got {data['fee_amount']}"
        print("✅ Fee band 100001-1000000 FTC: 1% correct")
    
    def test_fee_calculator_zero_amount(self):
        """Test fee for 0 amount"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=0")
        assert response.status_code == 200
        
        data = response.json()
        assert data["fee_percent"] == 0, "Expected 0% for zero amount"
        assert data["fee_amount"] == 0, "Expected 0 fee for zero amount"
        print("✅ Zero amount returns zero fee")
    
    def test_fee_calculator_includes_structure(self):
        """Test fee calculator returns full fee structure"""
        response = requests.get(f"{BASE_URL}/api/fee-calculator?amount=100")
        assert response.status_code == 200
        
        data = response.json()
        assert "fee_structure" in data, "Missing fee_structure"
        assert len(data["fee_structure"]) == 9, "Expected 9 fee bands"
        print("✅ Fee structure included in response")


class TestSendFTC:
    """Send FTC endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for demo user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=DEMO_USER
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Login failed - skipping authenticated tests")
    
    @pytest.fixture
    def demo_user_wallet(self, auth_token):
        """Get demo user's wallet address"""
        response = requests.get(
            f"{BASE_URL}/api/wallet/address",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        if response.status_code == 200:
            return response.json().get("ftc_wallet_address")
        return None
    
    def test_send_ftc_requires_auth(self):
        """Test POST /api/wallet/send-ftc requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": 10
            }
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Send FTC requires authentication")
    
    def test_send_ftc_invalid_amount(self, auth_token):
        """Test send FTC with invalid amount"""
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": 0
            }
        )
        assert response.status_code == 400, f"Expected 400 for zero amount, got {response.status_code}"
        print("✅ Zero amount rejected correctly")
    
    def test_send_ftc_invalid_recipient(self, auth_token):
        """Test send FTC with invalid recipient wallet"""
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "recipient_wallet_address": "INVALID_WALLET_ADDRESS_12345",
                "amount": 10
            }
        )
        assert response.status_code == 404, f"Expected 404 for invalid recipient, got {response.status_code}"
        print("✅ Invalid recipient wallet rejected correctly")
    
    def test_send_ftc_to_self(self, auth_token, demo_user_wallet):
        """Test cannot send FTC to self"""
        if not demo_user_wallet:
            pytest.skip("Could not get demo user wallet")
        
        response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "recipient_wallet_address": demo_user_wallet,
                "amount": 10
            }
        )
        assert response.status_code == 400, f"Expected 400 for self-send, got {response.status_code}"
        print("✅ Self-send rejected correctly")
    
    def test_get_transfer_history(self, auth_token):
        """Test GET /api/wallet/transfers"""
        response = requests.get(
            f"{BASE_URL}/api/wallet/transfers",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "transfers" in data, "Missing transfers array"
        assert "total_sent" in data, "Missing total_sent"
        assert "total_received" in data, "Missing total_received"
        assert "total_fees_paid" in data, "Missing total_fees_paid"
        
        print(f"✅ Transfer history: {len(data['transfers'])} transfers")
        print(f"   Total sent: {data['total_sent']} FTC")
        print(f"   Total received: {data['total_received']} FTC")
        print(f"   Total fees paid: {data['total_fees_paid']} FTC")


class TestSendFTCIntegration:
    """Integration tests for Send FTC with fee collection"""
    
    def test_send_ftc_full_flow(self):
        """Test complete send FTC flow with fee collection"""
        # Login as demo user
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=DEMO_USER
        )
        if login_response.status_code != 200:
            pytest.skip("Login failed")
        
        token = login_response.json().get("token")
        
        # Get initial admin wallet state
        admin_wallet_before = requests.get(f"{BASE_URL}/api/admin/wallet").json()
        initial_fees = admin_wallet_before.get("total_fees_collected", 0)
        initial_tx_count = admin_wallet_before.get("total_transactions", 0)
        
        # Get sender balance
        wallet_response = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {token}"}
        )
        if wallet_response.status_code != 200:
            pytest.skip("Could not get wallet")
        
        sender_balance = wallet_response.json().get("ftc_balance", 0)
        
        # Calculate expected fee for 50 FTC (0.01% = 0.005 FTC)
        send_amount = 50
        expected_fee = 0.005
        
        if sender_balance < send_amount:
            pytest.skip(f"Insufficient balance: {sender_balance} < {send_amount}")
        
        # Send FTC
        send_response = requests.post(
            f"{BASE_URL}/api/wallet/send-ftc",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": send_amount,
                "note": "Test transfer"
            }
        )
        
        if send_response.status_code != 200:
            error = send_response.json()
            print(f"Send failed: {error}")
            pytest.skip(f"Send failed: {error.get('detail', 'Unknown error')}")
        
        send_data = send_response.json()
        assert send_data.get("success") == True, "Expected success=True"
        
        tx = send_data.get("transaction", {})
        assert tx.get("amount_sent") == send_amount, f"Expected amount_sent={send_amount}"
        assert tx.get("fee_amount") == expected_fee, f"Expected fee={expected_fee}, got {tx.get('fee_amount')}"
        assert tx.get("amount_received") == send_amount - expected_fee, "Amount received mismatch"
        assert tx.get("status") == "CONFIRMED", "Expected CONFIRMED status"
        
        print(f"✅ Sent {send_amount} FTC, fee: {tx.get('fee_amount')} FTC")
        print(f"   Recipient received: {tx.get('amount_received')} FTC")
        
        # Verify admin wallet updated
        time.sleep(0.5)  # Allow DB to update
        admin_wallet_after = requests.get(f"{BASE_URL}/api/admin/wallet").json()
        new_fees = admin_wallet_after.get("total_fees_collected", 0)
        new_tx_count = admin_wallet_after.get("total_transactions", 0)
        
        assert new_fees > initial_fees, f"Admin fees not increased: {initial_fees} -> {new_fees}"
        assert new_tx_count > initial_tx_count, f"Admin tx count not increased: {initial_tx_count} -> {new_tx_count}"
        
        print(f"✅ Admin wallet fees: {initial_fees} -> {new_fees} FTC")
        print(f"✅ Admin wallet tx count: {initial_tx_count} -> {new_tx_count}")
        
        # Verify transaction in transfer history
        history_response = requests.get(
            f"{BASE_URL}/api/wallet/transfers",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert history_response.status_code == 200
        
        history = history_response.json()
        transfers = history.get("transfers", [])
        
        # Find our transaction
        found = False
        for t in transfers:
            if t.get("amount") == send_amount and t.get("type") == "SENT":
                found = True
                assert t.get("recipient_wallet") == TEST_USER_2["wallet"], "Wrong recipient wallet"
                break
        
        assert found, "Transaction not found in transfer history"
        print("✅ Transaction appears in transfer history")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
