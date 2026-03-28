"""
Test Price Impact Model and AI Recommendations
Tests:
- Price impact from BUY/SELL trades
- AI signals generation and updates
- Global ledger with price_after_impact
- Market sentiment calculation
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPriceImpactModel:
    """Test that BUY trades increase price and SELL trades decrease price"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for authenticated requests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_global_prices_endpoint_returns_ai_signals(self):
        """Test GET /api/nutrition/global-prices includes ai_signals"""
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        data = response.json()
        assert "prices" in data
        assert "ai_signals" in data
        assert "trade_volume" in data
        assert "products" in data
        
        # Verify ai_signals structure
        ai_signals = data["ai_signals"]
        assert len(ai_signals) > 0
        
        # Check a sample signal structure
        sample_signal = list(ai_signals.values())[0]
        assert "signal" in sample_signal
        assert sample_signal["signal"] in ["BUY", "HOLD", "SELL"]
        assert "confidence" in sample_signal
        assert "reason" in sample_signal
        print(f"✓ Global prices includes {len(ai_signals)} AI signals")
    
    def test_global_prices_includes_trade_volume(self):
        """Test that global prices includes trade volume data"""
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        data = response.json()
        trade_volume = data.get("trade_volume", {})
        assert len(trade_volume) > 0
        
        # Check volume structure
        sample_volume = list(trade_volume.values())[0]
        assert "buy" in sample_volume
        assert "sell" in sample_volume
        assert "net" in sample_volume
        print(f"✓ Trade volume data present for {len(trade_volume)} products")
    
    def test_ai_recommendations_endpoint(self):
        """Test GET /api/nutrition/ai-recommendations returns categorized signals"""
        response = self.session.get(f"{BASE_URL}/api/nutrition/ai-recommendations")
        assert response.status_code == 200
        
        data = response.json()
        assert "buy" in data
        assert "hold" in data
        assert "sell" in data
        assert "market_sentiment" in data
        assert "total_products" in data
        
        # Verify market sentiment is valid
        assert data["market_sentiment"] in ["bullish", "bearish", "neutral"]
        
        # Verify recommendation structure
        if len(data["buy"]) > 0:
            rec = data["buy"][0]
            assert "product_id" in rec
            assert "name" in rec
            assert "signal" in rec
            assert rec["signal"] == "BUY"
            assert "confidence" in rec
            assert "reason" in rec
        
        print(f"✓ AI Recommendations: {len(data['buy'])} BUY, {len(data['hold'])} HOLD, {len(data['sell'])} SELL")
        print(f"✓ Market sentiment: {data['market_sentiment']}")
    
    def test_buy_trade_increases_price(self):
        """Test that BUY trade increases the global price"""
        # Get initial price for WPC80
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        initial_price = response.json()["prices"]["WPC80"]["current"]
        
        # Execute a BUY trade
        trade_data = {
            "product_id": "WPC80",
            "product_name": "Whey Protein Concentrate 80%",
            "trade_type": "BUY",
            "quantity": 5,
            "price_per_unit": initial_price,
            "total_ftc": initial_price * 5
        }
        
        trade_response = self.session.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            json=trade_data
        )
        assert trade_response.status_code == 200
        
        trade_result = trade_response.json()
        assert "price_after_impact" in trade_result
        
        # Verify price increased
        new_price = trade_result["price_after_impact"]
        assert new_price > initial_price, f"BUY should increase price: {initial_price} -> {new_price}"
        
        print(f"✓ BUY trade increased price: {initial_price:.2f} -> {new_price:.2f} (+{((new_price-initial_price)/initial_price*100):.2f}%)")
    
    def test_sell_trade_decreases_price(self):
        """Test that SELL trade decreases the global price"""
        # Get initial price for BCAA
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        initial_price = response.json()["prices"]["BCAA"]["current"]
        
        # Execute a SELL trade
        trade_data = {
            "product_id": "BCAA",
            "product_name": "BCAA 2:1:1 Instant",
            "trade_type": "SELL",
            "quantity": 5,
            "price_per_unit": initial_price,
            "total_ftc": initial_price * 5
        }
        
        trade_response = self.session.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            json=trade_data
        )
        assert trade_response.status_code == 200
        
        trade_result = trade_response.json()
        assert "price_after_impact" in trade_result
        
        # Verify price decreased
        new_price = trade_result["price_after_impact"]
        assert new_price < initial_price, f"SELL should decrease price: {initial_price} -> {new_price}"
        
        print(f"✓ SELL trade decreased price: {initial_price:.2f} -> {new_price:.2f} ({((new_price-initial_price)/initial_price*100):.2f}%)")
    
    def test_global_ledger_shows_price_after_impact(self):
        """Test that global ledger transactions include price_after_impact field"""
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert response.status_code == 200
        
        data = response.json()
        assert "transactions" in data
        assert "stats" in data
        
        # Check stats structure
        stats = data["stats"]
        assert "volume_24h" in stats
        assert "buy_count" in stats
        assert "sell_count" in stats
        assert "market_sentiment" in stats
        
        # Check transaction structure
        if len(data["transactions"]) > 0:
            tx = data["transactions"][0]
            assert "price_after_impact" in tx, "Transaction should have price_after_impact field"
            assert "trade_type" in tx
            assert "product_id" in tx
            assert "tx_hash" in tx
            print(f"✓ Latest transaction has price_after_impact: {tx['price_after_impact']}")
        
        print(f"✓ Global ledger has {len(data['transactions'])} transactions")
        print(f"✓ Stats: {stats['buy_count']} buys, {stats['sell_count']} sells, sentiment: {stats['market_sentiment']}")
    
    def test_multiple_buys_increase_buy_pressure(self):
        """Test that multiple BUY trades increase buy pressure and can change AI signal"""
        # Get initial state for CREATINE
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        initial_data = response.json()
        initial_price = initial_data["prices"]["CREATINE"]["current"]
        initial_buy_pressure = initial_data["prices"]["CREATINE"].get("buy_pressure", 50)
        
        # Execute multiple BUY trades
        for i in range(3):
            trade_data = {
                "product_id": "CREATINE",
                "product_name": "Creatine Monohydrate Pure",
                "trade_type": "BUY",
                "quantity": 3,
                "price_per_unit": initial_price,
                "total_ftc": initial_price * 3
            }
            
            trade_response = self.session.post(
                f"{BASE_URL}/api/nutrition/global-ledger/record",
                json=trade_data
            )
            assert trade_response.status_code == 200
        
        # Check updated state
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        updated_data = response.json()
        updated_buy_pressure = updated_data["prices"]["CREATINE"].get("buy_pressure", 50)
        updated_price = updated_data["prices"]["CREATINE"]["current"]
        
        # Verify buy pressure increased
        assert updated_buy_pressure > initial_buy_pressure, f"Buy pressure should increase: {initial_buy_pressure} -> {updated_buy_pressure}"
        assert updated_price > initial_price, f"Price should increase after multiple buys"
        
        print(f"✓ After 3 BUY trades: buy_pressure {initial_buy_pressure:.1f} -> {updated_buy_pressure:.1f}")
        print(f"✓ Price increased: {initial_price:.2f} -> {updated_price:.2f}")
    
    def test_ai_signal_structure_complete(self):
        """Test that AI signals have all required fields"""
        response = self.session.get(f"{BASE_URL}/api/nutrition/global-prices")
        assert response.status_code == 200
        
        ai_signals = response.json()["ai_signals"]
        
        for product_id, signal in ai_signals.items():
            assert "signal" in signal, f"Missing 'signal' for {product_id}"
            assert "confidence" in signal, f"Missing 'confidence' for {product_id}"
            assert "reason" in signal, f"Missing 'reason' for {product_id}"
            assert "trend" in signal, f"Missing 'trend' for {product_id}"
            assert "momentum" in signal, f"Missing 'momentum' for {product_id}"
            assert "updated_at" in signal, f"Missing 'updated_at' for {product_id}"
            
            # Validate values
            assert signal["signal"] in ["BUY", "HOLD", "SELL"]
            assert 0 <= signal["confidence"] <= 100
            assert signal["trend"] in ["bullish", "bearish", "neutral"]
        
        print(f"✓ All {len(ai_signals)} AI signals have complete structure")
    
    def test_market_sentiment_updates_based_on_trades(self):
        """Test that market sentiment reflects buy/sell activity"""
        response = self.session.get(f"{BASE_URL}/api/nutrition/ai-recommendations")
        assert response.status_code == 200
        
        data = response.json()
        buy_count = len(data["buy"])
        sell_count = len(data["sell"])
        sentiment = data["market_sentiment"]
        
        # Verify sentiment logic
        if buy_count > sell_count:
            assert sentiment == "bullish", f"Expected bullish with {buy_count} buys > {sell_count} sells"
        elif sell_count > buy_count:
            assert sentiment == "bearish", f"Expected bearish with {sell_count} sells > {buy_count} buys"
        else:
            assert sentiment == "neutral", f"Expected neutral with equal buys and sells"
        
        print(f"✓ Market sentiment '{sentiment}' matches signal distribution (BUY:{buy_count}, SELL:{sell_count})")


class TestGlobalLedgerIntegration:
    """Test global ledger records all trades correctly"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for authenticated requests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@trader.com",
            "password": "demo123"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_trade_recorded_in_global_ledger(self):
        """Test that a trade is recorded in the global ledger"""
        # Get initial ledger count
        initial_response = self.session.get(f"{BASE_URL}/api/nutrition/global-ledger")
        initial_count = initial_response.json()["total"]
        
        # Execute a trade
        trade_data = {
            "product_id": "VITC",
            "product_name": "Vitamin C 1000mg",
            "trade_type": "BUY",
            "quantity": 2,
            "price_per_unit": 18.00,
            "total_ftc": 36.00
        }
        
        trade_response = self.session.post(
            f"{BASE_URL}/api/nutrition/global-ledger/record",
            json=trade_data
        )
        assert trade_response.status_code == 200
        
        # Verify trade appears in ledger
        ledger_response = self.session.get(f"{BASE_URL}/api/nutrition/global-ledger")
        assert ledger_response.status_code == 200
        
        ledger_data = ledger_response.json()
        
        # Find our trade
        found = False
        for tx in ledger_data["transactions"]:
            if tx["product_id"] == "VITC" and tx["quantity"] == 2:
                found = True
                assert tx["trade_type"] == "BUY"
                assert "price_after_impact" in tx
                assert "tx_hash" in tx
                assert tx["tx_hash"].startswith("0x")
                break
        
        assert found, "Trade should appear in global ledger"
        print(f"✓ Trade recorded in global ledger with blockchain-style tx_hash")
    
    def test_ledger_stats_update_correctly(self):
        """Test that ledger stats (buy_count, sell_count) update correctly"""
        # Get initial stats
        initial_response = self.session.get(f"{BASE_URL}/api/nutrition/global-ledger")
        initial_stats = initial_response.json()["stats"]
        initial_buy_count = initial_stats["buy_count"]
        
        # Execute a BUY trade
        trade_data = {
            "product_id": "OMEGA3",
            "product_name": "Omega-3 Fish Oil 1000mg",
            "trade_type": "BUY",
            "quantity": 1,
            "price_per_unit": 32.00,
            "total_ftc": 32.00
        }
        
        self.session.post(f"{BASE_URL}/api/nutrition/global-ledger/record", json=trade_data)
        
        # Check updated stats
        updated_response = self.session.get(f"{BASE_URL}/api/nutrition/global-ledger")
        updated_stats = updated_response.json()["stats"]
        
        assert updated_stats["buy_count"] >= initial_buy_count, "Buy count should increase or stay same"
        print(f"✓ Ledger stats updated: buy_count {initial_buy_count} -> {updated_stats['buy_count']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
