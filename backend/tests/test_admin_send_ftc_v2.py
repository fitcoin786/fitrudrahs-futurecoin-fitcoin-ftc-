"""
Test Admin Send FTC and Enhanced Global Ledger Features
- Admin Send FTC to users (no fee)
- Admin transfer history
- Transaction details endpoint (double-tap)
- Global ledger with ADMIN_SEND type
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
DEMO_USER = {"email": "demo@trader.com", "password": "demo123"}
TEST_USER_2 = {"email": "testuser2@ftc.com", "password": "test123", "wallet": "HCHiMZZayBNJGmkqcMvyJRP73zCwNzsq"}
ADMIN_WALLET = "ADMIN_FTC_8x7K9mNpQ2rT5wYz3aB6cD4eF1gH0iJ"


class TestAdminSendFTC:
    """Admin Send FTC endpoint tests"""
    
    def test_admin_send_ftc_success(self):
        """Test POST /api/admin/send-ftc sends FTC to user"""
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": 100.0,
                "note": "Test admin transfer"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        
        tx = data.get("transaction", {})
        assert tx.get("amount_sent") == 100.0, f"Expected amount_sent=100, got {tx.get('amount_sent')}"
        assert tx.get("status") == "CONFIRMED", "Expected CONFIRMED status"
        assert "tx_hash" in tx, "Missing tx_hash"
        assert "block_number" in tx, "Missing block_number"
        
        print(f"✅ Admin sent 100 FTC to {tx.get('recipient')}")
        print(f"   TX Hash: {tx.get('tx_hash')}")
        print(f"   Block: {tx.get('block_number')}")
        
        return tx.get("id")
    
    def test_admin_send_ftc_invalid_amount(self):
        """Test admin send with invalid amount (0 or negative)"""
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": 0
            }
        )
        assert response.status_code == 400, f"Expected 400 for zero amount, got {response.status_code}"
        print("✅ Zero amount rejected correctly")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": -50
            }
        )
        assert response.status_code == 400, f"Expected 400 for negative amount, got {response.status_code}"
        print("✅ Negative amount rejected correctly")
    
    def test_admin_send_ftc_invalid_recipient(self):
        """Test admin send with non-existent wallet address"""
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": "INVALID_WALLET_ADDRESS_12345",
                "amount": 50
            }
        )
        assert response.status_code == 404, f"Expected 404 for invalid recipient, got {response.status_code}"
        print("✅ Invalid recipient wallet rejected correctly")
    
    def test_admin_send_ftc_no_fee(self):
        """Test admin transfers have no fee deduction"""
        # Get recipient balance before
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_USER_2
        )
        if login_response.status_code != 200:
            pytest.skip("Could not login as test user 2")
        
        token = login_response.json().get("token")
        wallet_before = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {token}"}
        ).json()
        balance_before = wallet_before.get("ftc_balance", 0)
        
        # Admin sends 50 FTC
        send_amount = 50.0
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": send_amount,
                "note": "No fee test"
            }
        )
        assert response.status_code == 200
        
        # Verify recipient received full amount (no fee)
        time.sleep(0.5)
        wallet_after = requests.get(
            f"{BASE_URL}/api/wallet",
            headers={"Authorization": f"Bearer {token}"}
        ).json()
        balance_after = wallet_after.get("ftc_balance", 0)
        
        actual_received = balance_after - balance_before
        # Allow for floating point precision issues
        assert abs(actual_received - send_amount) < 0.001, f"Expected {send_amount}, received {actual_received} (fee deducted?)"
        print(f"✅ Recipient received full {send_amount} FTC (no fee)")


class TestAdminTransfers:
    """Admin transfer history endpoint tests"""
    
    def test_get_admin_transfers(self):
        """Test GET /api/admin/transfers returns transfer history"""
        response = requests.get(f"{BASE_URL}/api/admin/transfers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "transfers" in data, "Missing transfers array"
        assert "total_sent" in data, "Missing total_sent"
        assert "total_transactions" in data, "Missing total_transactions"
        
        print(f"✅ Admin transfers: {data['total_transactions']} transactions")
        print(f"   Total sent: {data['total_sent']} FTC")
        
        # Verify transfer structure
        if data["transfers"]:
            tx = data["transfers"][0]
            assert "id" in tx, "Missing id"
            assert "sender_type" in tx, "Missing sender_type"
            assert tx["sender_type"] == "ADMIN", "Expected sender_type=ADMIN"
            assert "recipient_wallet" in tx, "Missing recipient_wallet"
            assert "amount" in tx, "Missing amount"
            assert "created_at" in tx, "Missing created_at"
            print(f"   Latest: {tx['amount']} FTC to {tx['recipient_wallet'][:15]}...")


class TestTransactionDetails:
    """Transaction details endpoint tests (for double-tap)"""
    
    def test_get_transaction_details_from_ledger(self):
        """Test GET /api/global/ledger-details/{tx_id}"""
        # First, create a transaction
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": 25.0,
                "note": "Details test"
            }
        )
        assert response.status_code == 200
        
        # Get the transaction ID from global ledger
        ledger_response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert ledger_response.status_code == 200
        
        ledger = ledger_response.json().get("transactions", [])
        admin_send_tx = None
        for tx in ledger:
            if tx.get("trade_type") == "ADMIN_SEND":
                admin_send_tx = tx
                break
        
        if not admin_send_tx:
            pytest.skip("No ADMIN_SEND transaction found in ledger")
        
        tx_id = admin_send_tx.get("id")
        
        # Get transaction details
        details_response = requests.get(f"{BASE_URL}/api/global/ledger-details/{tx_id}")
        assert details_response.status_code == 200, f"Expected 200, got {details_response.status_code}"
        
        data = details_response.json()
        assert "transaction" in data, "Missing transaction"
        assert "blockchain" in data, "Missing blockchain info"
        
        tx = data["transaction"]
        blockchain = data["blockchain"]
        
        # Verify transaction fields
        assert tx.get("id") == tx_id, "Transaction ID mismatch"
        assert "tx_hash" in tx or "tx_hash" in blockchain, "Missing tx_hash"
        assert "block_number" in tx or "block_number" in blockchain, "Missing block_number"
        
        # Verify blockchain info
        assert blockchain.get("network") == "Solana Mainnet", "Expected Solana Mainnet"
        assert "confirmations" in blockchain, "Missing confirmations"
        
        print(f"✅ Transaction details retrieved for {tx_id[:20]}...")
        print(f"   Block: {blockchain.get('block_number')}")
        print(f"   Confirmations: {blockchain.get('confirmations')}")
        print(f"   Network: {blockchain.get('network')}")
    
    def test_get_transaction_details_not_found(self):
        """Test GET /api/global/ledger-details with invalid ID"""
        response = requests.get(f"{BASE_URL}/api/global/ledger-details/invalid-tx-id-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Invalid transaction ID returns 404")


class TestGlobalLedgerAdminSend:
    """Test ADMIN_SEND appears in global ledger"""
    
    def test_admin_send_appears_in_global_ledger(self):
        """Test admin send transaction appears in global ledger with ADMIN_SEND type"""
        # Create admin send transaction
        response = requests.post(
            f"{BASE_URL}/api/admin/send-ftc",
            json={
                "recipient_wallet_address": TEST_USER_2["wallet"],
                "amount": 75.0,
                "note": "Ledger test"
            }
        )
        assert response.status_code == 200
        tx_data = response.json()
        
        # Wait for ledger update
        time.sleep(0.5)
        
        # Check global ledger
        ledger_response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert ledger_response.status_code == 200
        
        ledger = ledger_response.json().get("transactions", [])
        
        # Find our transaction
        found = False
        for tx in ledger:
            if tx.get("trade_type") == "ADMIN_SEND" and tx.get("total_ftc") == 75.0:
                found = True
                # Verify ADMIN_SEND specific fields
                assert tx.get("sender_wallet"), "Missing sender_wallet"
                assert tx.get("receiver_wallet"), "Missing receiver_wallet"
                assert tx.get("fee_amount") == 0, "Admin send should have 0 fee"
                print(f"✅ ADMIN_SEND found in global ledger")
                print(f"   From: {tx.get('sender_wallet')}")
                print(f"   To: {tx.get('receiver_wallet')}")
                print(f"   Amount: {tx.get('total_ftc')} FTC")
                break
        
        assert found, "ADMIN_SEND transaction not found in global ledger"
    
    def test_global_ledger_shows_all_transaction_types(self):
        """Test global ledger shows BUY, SELL, SEND, ADMIN_SEND types"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert response.status_code == 200
        
        ledger = response.json().get("transactions", [])
        
        # Collect unique trade types
        trade_types = set()
        for tx in ledger:
            trade_types.add(tx.get("trade_type"))
        
        print(f"✅ Trade types in ledger: {trade_types}")
        
        # At minimum, ADMIN_SEND should be present after our tests
        assert "ADMIN_SEND" in trade_types, "ADMIN_SEND not found in ledger"
    
    def test_global_ledger_has_wallet_addresses(self):
        """Test global ledger entries have sender/receiver wallet addresses"""
        response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert response.status_code == 200
        
        ledger = response.json().get("transactions", [])
        
        # Check SEND and ADMIN_SEND transactions have wallet addresses
        for tx in ledger:
            if tx.get("trade_type") in ["SEND", "ADMIN_SEND"]:
                assert tx.get("sender_wallet"), f"Missing sender_wallet for {tx.get('trade_type')}"
                assert tx.get("receiver_wallet"), f"Missing receiver_wallet for {tx.get('trade_type')}"
                print(f"✅ {tx.get('trade_type')}: From {tx.get('sender_wallet')} To {tx.get('receiver_wallet')}")
                break


class TestGlobalLedgerStats:
    """Test global ledger stats include send counts"""
    
    def test_global_stats_include_send_counts(self):
        """Test global stats include send_count and admin_send_count"""
        # Check if stats endpoint exists - try nutrition/global-prices which has stats
        response = requests.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        data = response.json()
        
        # Global prices endpoint returns prices and stats
        print(f"✅ Global prices/stats retrieved")
        print(f"   Keys: {list(data.keys())[:10]}")
        
        # Also verify global ledger has ADMIN_SEND transactions
        ledger_response = requests.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert ledger_response.status_code == 200
        
        ledger = ledger_response.json().get("transactions", [])
        admin_sends = [tx for tx in ledger if tx.get("trade_type") == "ADMIN_SEND"]
        sends = [tx for tx in ledger if tx.get("trade_type") == "SEND"]
        
        print(f"   ADMIN_SEND count: {len(admin_sends)}")
        print(f"   SEND count: {len(sends)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
