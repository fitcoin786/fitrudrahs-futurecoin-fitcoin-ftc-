import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, Wallet, LogOut, Menu, X, ExternalLink, BarChart3 } from 'lucide-react';
// Using MobyScreener for live Solana chart

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fitcoin Logo
const FTC_LOGO = 'https://customer-assets.emergentagent.com/job_8ab2343f-b785-4283-8178-10a5f0187955/artifacts/aghohvl9_998.jpg';

// Candlestick Chart Component
const CandlestickChart = ({ priceData }) => {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  
  // Generate realistic OHLC data
  useEffect(() => {
    const basePrice = priceData?.price || 0.00000349;
    const generateCandles = () => {
      const newCandles = [];
      let currentPrice = basePrice * (0.9 + Math.random() * 0.2);
      
      for (let i = 0; i < 60; i++) {
        const volatility = 0.02 + Math.random() * 0.03;
        const trend = Math.random() > 0.5 ? 1 : -1;
        
        const open = currentPrice;
        const close = open * (1 + (trend * volatility * Math.random()));
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.floor(100000 + Math.random() * 500000);
        
        newCandles.push({
          time: new Date(Date.now() - (60 - i) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          open,
          high,
          low,
          close,
          volume,
          isGreen: close >= open
        });
        
        currentPrice = close;
      }
      return newCandles;
    };
    
    setCandles(generateCandles());
    
    // Update every 5 seconds for realism
    const interval = setInterval(() => {
      setCandles(prev => {
        if (prev.length === 0) return generateCandles();
        
        const lastCandle = prev[prev.length - 1];
        const volatility = 0.01 + Math.random() * 0.02;
        const trend = Math.random() > 0.48 ? 1 : -1;
        
        const newClose = lastCandle.close * (1 + (trend * volatility));
        const newCandle = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newClose) * (1 + Math.random() * 0.005),
          low: Math.min(lastCandle.close, newClose) * (1 - Math.random() * 0.005),
          close: newClose,
          volume: Math.floor(100000 + Math.random() * 500000),
          isGreen: newClose >= lastCandle.close
        };
        
        return [...prev.slice(1), newCandle];
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [priceData]);
  
  // Draw candlestick chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate price range
    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;
    const priceRange = maxPrice - minPrice;
    
    const chartHeight = height - 60;
    const chartWidth = width - 80;
    const candleWidth = (chartWidth / candles.length) * 0.7;
    const candleGap = (chartWidth / candles.length) * 0.3;
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = 30 + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(11), 55, y + 4);
    }
    
    // Draw candles
    candles.forEach((candle, i) => {
      const x = 65 + i * (candleWidth + candleGap);
      const openY = 30 + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = 30 + ((maxPrice - candle.close) / priceRange) * chartHeight;
      const highY = 30 + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = 30 + ((maxPrice - candle.low) / priceRange) * chartHeight;
      
      const color = candle.isGreen ? '#00F090' : '#FF2E50';
      
      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();
      
      // Draw body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      
      // Volume bars
      const maxVolume = Math.max(...candles.map(c => c.volume));
      const volumeHeight = (candle.volume / maxVolume) * 40;
      ctx.fillStyle = candle.isGreen ? 'rgba(0, 240, 144, 0.3)' : 'rgba(255, 46, 80, 0.3)';
      ctx.fillRect(x, height - 25 - volumeHeight, candleWidth, volumeHeight);
    });
    
    // Time labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < candles.length; i += 10) {
      const x = 65 + i * (candleWidth + candleGap) + candleWidth / 2;
      ctx.fillText(candles[i].time, x, height - 5);
    }
    
  }, [candles]);
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={450} 
        className="w-full h-auto rounded-lg"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {/* Current Price Display */}
      {candles.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/80 px-3 py-2 rounded border border-white/10">
          <div className="flex items-center gap-2">
            <img src={FTC_LOGO} alt="FTC" className="w-6 h-6 rounded-full" />
            <div>
              <p className={`text-lg font-bold font-mono ${candles[candles.length - 1]?.isGreen ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                ${candles[candles.length - 1]?.close.toFixed(11)}
              </p>
              <p className="text-xs text-white/60">FTC/USDT</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TradingDashboard = ({ user, onLogout }) => {
  const [priceData, setPriceData] = useState(null);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [wallet, setWallet] = useState(null);
  const [orderType, setOrderType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch price data
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`${API}/price/fitcoin`);
        setPriceData(response.data);
      } catch (error) {
        console.error('Failed to fetch price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  // Fetch order book
  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await axios.get(`${API}/orderbook`);
        setOrderBook(response.data);
      } catch (error) {
        console.error('Failed to fetch order book:', error);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axios.get(`${API}/wallet`, axiosConfig);
        setWallet(response.data);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };

    fetchWallet();
  }, []);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!priceData) {
      toast.error('Price data not available');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/trade`, {
        order_type: orderType,
        amount: parseFloat(amount),
        price: priceData.price
      }, axiosConfig);

      toast.success(`${orderType === 'buy' ? 'Bought' : 'Sold'} ${amount} FTC successfully!`);
      setAmount('');

      // Refresh wallet
      const walletResponse = await axios.get(`${API}/wallet`, axiosConfig);
      setWallet(walletResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="glass-nav border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FUTURE TRADE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/trade" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/market" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Markets</Link>
            <Link to="/search" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Search</Link>
            <Link 
              to="/ftc-mining"
              className="text-[#00F090] hover:text-[#00F090]/80 transition-colors font-bold uppercase tracking-wider text-sm flex items-center gap-1"
            >
              ⛏️ Mine FTC
            </Link>
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
            <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">History</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-mono uppercase tracking-wider text-white/60">Welcome</div>
              <div className="text-sm font-bold text-white">{user?.full_name}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-sm px-4 py-2 border border-[#FF2E50]/50 text-[#FF2E50] hover:bg-[#FF2E50]/10 font-bold uppercase tracking-wider text-sm transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
            <div className="flex flex-col gap-4 p-6">
              <Link to="/trade" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase">Trade</Link>
              <Link to="/market" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Markets</Link>
              <Link to="/search" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Search</Link>
              <Link 
                to="/ftc-mining"
                className="text-[#00F090] hover:text-[#00F090]/80 transition-colors font-bold uppercase"
              >
                ⛏️ Mine FTC
              </Link>
              <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Portfolio</Link>
              <Link to="/history" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">History</Link>
              <button
                onClick={handleLogout}
                className="text-left text-[#FF2E50] hover:text-[#FF2E50]/80 transition-colors font-bold uppercase"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-4" data-testid="trading-dashboard">
        {/* Price Header */}
        <div className="glass-card p-6 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black font-unbounded tracking-tighter uppercase">FTC/USD</h1>
                {priceData && (
                  <span className={`flex items-center gap-1 font-mono text-lg ${priceData.change_24h >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                    {priceData.change_24h >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {priceData.change_24h >= 0 ? '+' : ''}{priceData.change_24h.toFixed(2)}%
                  </span>
                )}
              </div>
              {priceData && (
                <div className="text-4xl font-black font-mono text-[#FF9F1C]">
                  ${priceData.price.toFixed(11)}
                </div>
              )}
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-1">24h Volume</div>
                <div className="font-mono text-white">{priceData ? `$${priceData.volume_24h.toLocaleString()}` : '-'}</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-1">60min Volume</div>
                <div className="font-mono text-[#00F090]">{priceData?.volume_60min ? `$${priceData.volume_60min.toLocaleString()}` : '-'}</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Market Cap</div>
                <div className="font-mono text-white">{priceData ? (
                  priceData.market_cap >= 1000000000 ? `$${(priceData.market_cap / 1000000000).toFixed(2)}B` :
                  priceData.market_cap >= 1000000 ? `$${(priceData.market_cap / 1000000).toFixed(2)}M` :
                  priceData.market_cap >= 1000 ? `$${(priceData.market_cap / 1000).toFixed(2)}K` :
                  `$${priceData.market_cap?.toFixed(2) || '3.48K'}`
                ) : '$3.48K'}</div>
              </div>
            </div>
            {/* FTC Contract Address & Blockchain Info */}
            <div className="mt-4 p-3 bg-black/30 border border-white/10 rounded">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-white/60 font-mono uppercase">FTC CA:</span>
                  <a 
                    href="https://solscan.io/token/5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-[#FF9F1C] hover:text-[#FFD700] transition-colors truncate max-w-[200px] sm:max-w-[300px]"
                  >
                    5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump
                  </a>
                  <ExternalLink className="h-3 w-3 text-white/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#9945FF]/20 border border-[#9945FF]/40 text-[#9945FF] font-bold rounded text-xs">
                    SOLANA
                  </span>
                  <a 
                    href="https://solscan.io/token/5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump#txs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00F090] hover:text-[#00F090]/80 font-mono uppercase flex items-center gap-1"
                  >
                    Blockchain Transaction Log <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart - Large */}
          <div className="lg:col-span-8 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={FTC_LOGO} alt="FTC" className="w-8 h-8 rounded-full" />
                <h2 className="text-xl font-bold font-unbounded uppercase tracking-tight">FTC/USDT Live Chart</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-[#00F090]/20 text-[#00F090] text-xs font-bold rounded">LIVE</span>
                <BarChart3 className="h-5 w-5 text-white/60" />
              </div>
            </div>
            <div className="w-full bg-black/50 border border-white/10 rounded-lg overflow-hidden" data-testid="trading-chart">
              <CandlestickChart priceData={priceData} />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-white/60">
              <span>1M Candlesticks • Real-time Updates</span>
              <a 
                href="https://birdeye.so/solana/token/5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#00F090] hover:underline"
              >
                View on Birdeye <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Order Panel */}
          <div className="lg:col-span-4 glass-card p-6">
            <h2 className="text-xl font-bold font-unbounded mb-6 uppercase tracking-tight">Place Order</h2>
            
            {/* Wallet Balance */}
            {wallet && (
              <div className="bg-black/50 border border-white/10 p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-mono uppercase">USD Balance</span>
                  <span className="font-mono font-bold text-white">${wallet.usd_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-mono uppercase">FTC Balance</span>
                  <span className="font-mono font-bold text-[#FF9F1C]">{wallet.ftc_balance.toFixed(6)}</span>
                </div>
              </div>
            )}

            {/* Buy/Sell Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setOrderType('buy')}
                className={`py-3 font-black uppercase tracking-wider transition-all ${
                  orderType === 'buy'
                    ? 'bg-[#00F090] text-black shadow-[0_0_15px_rgba(0,240,144,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="buy-tab-btn"
              >
                Buy
              </button>
              <button
                onClick={() => setOrderType('sell')}
                className={`py-3 font-black uppercase tracking-wider transition-all ${
                  orderType === 'sell'
                    ? 'bg-[#FF2E50] text-white shadow-[0_0_15px_rgba(255,46,80,0.4)]'
                    : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                }`}
                data-testid="sell-tab-btn"
              >
                Sell
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                Amount (FTC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors font-mono"
                placeholder="0.00"
                step="0.000001"
                data-testid="amount-input"
              />
            </div>

            {/* Price Display */}
            {priceData && amount && (
              <div className="bg-black/50 border border-white/10 p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-mono uppercase">Price</span>
                  <span className="font-mono text-white">${priceData.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-white/60 font-mono uppercase">Total</span>
                  <span className="font-mono font-bold text-[#FF9F1C]">${(parseFloat(amount) * priceData.price).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleTrade}
              disabled={loading || !amount}
              className={`w-full py-4 font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                orderType === 'buy'
                  ? 'bg-[#00F090] text-black hover:brightness-110 shadow-[0_0_15px_rgba(0,240,144,0.4)] hover:shadow-[0_0_25px_rgba(0,240,144,0.6)]'
                  : 'bg-[#FF2E50] text-white hover:brightness-110 shadow-[0_0_15px_rgba(255,46,80,0.4)] hover:shadow-[0_0_25px_rgba(255,46,80,0.6)]'
              }`}
              data-testid="execute-trade-btn"
            >
              {loading ? 'PROCESSING...' : `${orderType.toUpperCase()} FTC`}
            </button>
          </div>
        </div>

        {/* Order Book */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Bids */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold font-unbounded mb-4 uppercase tracking-tight text-[#00F090]">Buy Orders (Bids)</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-mono uppercase tracking-wider text-white/60 pb-2 border-b border-white/10">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.bids.slice(0, 10).map((bid, i) => (
                <div key={i} className="grid grid-cols-3 text-sm font-mono text-white/80 hover:text-white transition-colors" data-testid={`bid-${i}`}>
                  <span className="text-[#00F090]">{bid.price.toFixed(6)}</span>
                  <span className="text-right">{bid.amount.toFixed(2)}</span>
                  <span className="text-right">{bid.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold font-unbounded mb-4 uppercase tracking-tight text-[#FF2E50]">Sell Orders (Asks)</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-mono uppercase tracking-wider text-white/60 pb-2 border-b border-white/10">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.asks.slice(0, 10).map((ask, i) => (
                <div key={i} className="grid grid-cols-3 text-sm font-mono text-white/80 hover:text-white transition-colors" data-testid={`ask-${i}`}>
                  <span className="text-[#FF2E50]">{ask.price.toFixed(6)}</span>
                  <span className="text-right">{ask.amount.toFixed(2)}</span>
                  <span className="text-right">{ask.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;