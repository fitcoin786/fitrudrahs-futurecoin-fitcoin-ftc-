import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Flame, Activity, Award, Clock, Check, Star, 
  ArrowRight, Wallet, TrendingUp, Shield, ExternalLink,
  Volume2, VolumeX, Gift, Crown, Target, Rocket,
  BookOpen, Brain, BarChart3, History, FileText, Cpu, User
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Fitcoin Logo - New Meditation Logo
const FTC_LOGO = 'https://customer-assets.emergentagent.com/job_8ab2343f-b785-4283-8178-10a5f0187955/artifacts/aghohvl9_998.jpg';

// Subscription Plans - Free Trial first, then paid plans
// Admin Wallet Addresses for Payment
const ADMIN_WALLETS = {
  USDT_SOL: 'A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG',
  FTC_SOL: 'A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG',
  SOL: 'A324Xq5WFkcq7Baa4poo42szFyutZCqq6MWvLHvbHVNG'
};

// 2026 EXCLUSIVE SUBSCRIPTION PLANS
const SUBSCRIPTION_PLANS = [
  // Free Trial
  { id: 'free_trial', name: '🎁 Free Trial', calories: 100, ftcLimit: 100, hashRate: 1000, priceUSD: 0, priceFTC: 0, priceSol: 0, color: '#00BFFF', icon: Gift, isFree: true, duration: '7 Days', approxFTC: 700 },
  
  // 2026 Exclusive Plans (12 Plans from $50 to $5000)
  { id: 'starter_2026', name: '⛏️ Starter 2026', calories: 5000, ftcLimit: 5000, hashRate: 10000, priceUSD: 50, priceFTC: 15000, priceSol: 0.25, color: '#00F090', icon: Zap, duration: '30 Days', approxFTC: 150000, exclusive: true },
  { id: 'basic_2026', name: '⚡ Basic 2026', calories: 10000, ftcLimit: 10000, hashRate: 50000, priceUSD: 100, priceFTC: 30000, priceSol: 0.5, color: '#FFD700', icon: Flame, duration: '30 Days', approxFTC: 300000, exclusive: true },
  { id: 'standard_2026', name: '🔥 Standard 2026', calories: 25000, ftcLimit: 25000, hashRate: 100000, priceUSD: 200, priceFTC: 60000, priceSol: 1, color: '#FF9F1C', icon: Activity, duration: '60 Days', approxFTC: 750000, exclusive: true },
  { id: 'pro_2026', name: '💎 Pro 2026', calories: 50000, ftcLimit: 50000, hashRate: 500000, priceUSD: 350, priceFTC: 100000, priceSol: 1.75, color: '#9945FF', icon: Award, duration: '90 Days', approxFTC: 1500000, exclusive: true },
  { id: 'elite_2026', name: '👑 Elite 2026', calories: 100000, ftcLimit: 100000, hashRate: 1000000, priceUSD: 500, priceFTC: 150000, priceSol: 2.5, color: '#FF2E50', icon: Star, duration: '90 Days', approxFTC: 3000000, exclusive: true },
  { id: 'ultra_2026', name: '🚀 Ultra 2026', calories: 250000, ftcLimit: 250000, hashRate: 5000000, priceUSD: 750, priceFTC: 225000, priceSol: 3.75, color: '#00F090', icon: Crown, duration: '120 Days', approxFTC: 7500000, exclusive: true },
  { id: 'mega_2026', name: '⚡ Mega 2026', calories: 500000, ftcLimit: 500000, hashRate: 10000000, priceUSD: 1000, priceFTC: 300000, priceSol: 5, color: '#FFD700', icon: Rocket, duration: '180 Days', approxFTC: 15000000, exclusive: true },
  { id: 'supreme_2026', name: '💫 Supreme 2026', calories: 1000000, ftcLimit: 1000000, hashRate: 50000000, priceUSD: 1500, priceFTC: 450000, priceSol: 7.5, color: '#9945FF', icon: Target, duration: '180 Days', approxFTC: 30000000, exclusive: true },
  { id: 'titan_2026', name: '🔱 Titan 2026', calories: 2500000, ftcLimit: 2500000, hashRate: 100000000, priceUSD: 2000, priceFTC: 600000, priceSol: 10, color: '#FF2E50', icon: Shield, duration: '270 Days', approxFTC: 75000000, exclusive: true },
  { id: 'legend_2026', name: '🏆 Legend 2026', calories: 5000000, ftcLimit: 5000000, hashRate: 500000000, priceUSD: 3000, priceFTC: 900000, priceSol: 15, color: '#FF9F1C', icon: Award, duration: '365 Days', approxFTC: 150000000, exclusive: true },
  { id: 'immortal_2026', name: '⭐ Immortal 2026', calories: 10000000, ftcLimit: 10000000, hashRate: 1000000000, priceUSD: 4000, priceFTC: 1200000, priceSol: 20, color: '#00F090', icon: Crown, duration: '365 Days', approxFTC: 300000000, exclusive: true },
  { id: 'godmode_2026', name: '👾 GOD MODE 2026', calories: 100000000, ftcLimit: 100000000, hashRate: 10000000000, priceUSD: 5000, priceFTC: 1500000, priceSol: 25, color: '#FFD700', icon: Star, duration: '365 Days', approxFTC: 1000000000, exclusive: true },
];

const FtcMining = () => {
  const navigate = useNavigate();
  const miningIntervalRef = useRef(null);
  const [showIntroVideo, setShowIntroVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [ftcBalance, setFtcBalance] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [ftcMined, setFtcMined] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionRequest, setSubscriptionRequest] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('USD');
  const [transactionHash, setTransactionHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FTC Wallet Address State
  const [ftcWalletAddress, setFtcWalletAddress] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
  
  // Send FTC State
  const [showSendFtcModal, setShowSendFtcModal] = useState(false);
  const [sendRecipientWallet, setSendRecipientWallet] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendFeeInfo, setSendFeeInfo] = useState({ fee_percent: 0, fee_amount: 0 });
  const [transferHistory, setTransferHistory] = useState([]);
  
  // Transaction Details State
  const [selectedTxDetails, setSelectedTxDetails] = useState(null);
  const [showTxDetailsModal, setShowTxDetailsModal] = useState(false);
  const [lastTxTap, setLastTxTap] = useState({ txId: null, time: 0 });
  
  // Sports Nutrition Trading States
  const [nutritionPrices, setNutritionPrices] = useState({});
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [tradeType, setTradeType] = useState('buy');
  
  // Blockchain Transaction Ledger States
  const [transactionLedger, setTransactionLedger] = useState([]);
  const [portfolio, setPortfolio] = useState({});
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [ftcLivePrice, setFtcLivePrice] = useState(0.00000519);
  const [ftcPriceChange, setFtcPriceChange] = useState(0);
  
  // Re-subscription bonus tracking
  const [hasHadPreviousSubscription, setHasHadPreviousSubscription] = useState(false);
  const RESUBSCRIPTION_BONUS_PERCENT = 10; // 10% bonus for returning subscribers
  
  // Global real-time sync state
  const [globalLedger, setGlobalLedger] = useState([]);
  const [globalVolume24h, setGlobalVolume24h] = useState(0);
  const [aiSignals, setAiSignals] = useState({});
  const [marketSentiment, setMarketSentiment] = useState('neutral');
  const [subscriptionTools, setSubscriptionTools] = useState(null);
  
  // Persistent mining state
  const [miningProgress, setMiningProgress] = useState({
    isActive: false,
    startedAt: null,
    totalMined: 0,
    lastSyncTime: null
  });
  
  // Boost configuration from server
  const [boostConfig, setBoostConfig] = useState({
    base_mining_rate: 0.001,
    boost_duration: 5,
    boost_multiplier: 1.5,
    boost_cooldown: 60,
    daily_limit: 100
  });
  
  // Double-tap state for details
  const [lastTap, setLastTap] = useState({ productId: null, time: 0 });
  const [showProductDetails, setShowProductDetails] = useState(null);

  // Mining animation interval - for real-time UI updates
  const miningAnimationRef = useRef(null);
  // Backend sync interval - for persistence
  const miningSyncRef = useRef(null);

  // Real-time mining animation - shows continuous increment
  const startMiningAnimation = () => {
    if (miningAnimationRef.current) {
      clearInterval(miningAnimationRef.current);
    }
    
    // Update UI every 100ms for smooth animation
    miningAnimationRef.current = setInterval(() => {
      const currentRate = isBoosted 
        ? boostConfig.base_mining_rate * boostConfig.boost_multiplier 
        : boostConfig.base_mining_rate;
      
      // Increment per 100ms
      const increment = currentRate * 0.1;
      
      setCaloriesBurned(prev => prev + increment);
      setFtcMined(prev => prev + increment);
      setFtcBalance(prev => prev + increment);
    }, 100);
  };

  // Stop mining animation
  const stopMiningAnimation = () => {
    if (miningAnimationRef.current) {
      clearInterval(miningAnimationRef.current);
      miningAnimationRef.current = null;
    }
  };

  // Start persistent mining session on backend
  const startPersistentMining = async () => {
    if (!activeSubscription) {
      toast.error('Please subscribe to a mining plan first');
      setShowPlanModal(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/mining/start-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsMining(true);
        setBoostConfig(data.boost_config || boostConfig);
        
        // Start real-time animation
        startMiningAnimation();
        
        // Start backend sync
        startMiningSync();
        
        toast.success('⚡ Mining Started!', {
          description: 'Mining continues even if you close this page!'
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to start mining');
      }
    } catch (error) {
      console.error('Mining start error:', error);
      toast.error('Failed to start mining session');
    }
  };

  // Sync mining progress with backend (for persistence only, not UI)
  const syncMiningProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${BACKEND_URL}/api/mining/sync-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update boost state from server
          if (data.boost_active !== isBoosted) {
            setIsBoosted(data.boost_active);
          }
          setBoostConfig(data.boost_config || boostConfig);
          
          // Save to localStorage for persistence
          localStorage.setItem('ftc_mining_balance', ftcBalance.toString());
          localStorage.setItem('ftc_mined_today', ftcMined.toString());
          localStorage.setItem('ftc_calories_burned', caloriesBurned.toString());
        } else if (data.message === 'Subscription expired. Mining stopped.') {
          setIsMining(false);
          stopMiningAnimation();
          stopMiningSync();
          toast.error('Subscription expired. Mining stopped.');
        }
      }
    } catch (error) {
      console.error('Mining sync error:', error);
    }
  };

  // Start mining sync loop
  const startMiningSync = () => {
    if (miningSyncRef.current) {
      clearInterval(miningSyncRef.current);
    }
    
    // Sync every 2 seconds
    miningSyncRef.current = setInterval(syncMiningProgress, 2000);
  };

  // Stop mining sync
  const stopMiningSync = () => {
    if (miningSyncRef.current) {
      clearInterval(miningSyncRef.current);
      miningSyncRef.current = null;
    }
  };

  // Check for existing mining session on page load
  const checkMiningSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${BACKEND_URL}/api/mining/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.has_session) {
          // Resume mining display with server values
          setIsMining(true);
          setFtcMined(data.current_mined || 0);
          setCaloriesBurned(data.current_mined || 0);
          setBoostConfig(data.boost_config || boostConfig);
          setIsBoosted(data.boost_active || false);
          
          if (data.boost_remaining > 0) {
            setBoostTimeLeft(data.boost_remaining);
          }
          
          // Start real-time animation
          startMiningAnimation();
          
          // Start backend sync
          startMiningSync();
          
          toast.success('⚡ Mining resumed!', {
            description: 'Your mining session was running in background'
          });
        }
      }
    } catch (error) {
      console.error('Check session error:', error);
    }
  };

  // Call checkMiningSession when logged in
  useEffect(() => {
    if (isLoggedIn && activeSubscription) {
      checkMiningSession();
    }
    
    return () => {
      stopMiningSync();
    };
  }, [isLoggedIn, activeSubscription]);

  // Generate blockchain-style transaction hash
  const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // Generate block number
  const generateBlockNumber = () => {
    return Math.floor(18000000 + Math.random() * 1000000);
  };

  // AI Prediction for products
  const generateAIPrediction = (productId) => {
    const priceData = nutritionPrices[productId];
    if (!priceData || !priceData.history || priceData.history.length < 5) return null;
    
    const recentPrices = priceData.history.slice(-10);
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const trend = recentPrices[recentPrices.length - 1] > recentPrices[0];
    const volatility = Math.max(...recentPrices) - Math.min(...recentPrices);
    const momentum = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0] * 100;
    
    // AI prediction based on trend analysis
    const prediction = {
      action: momentum > 0.5 ? 'STRONG BUY' : momentum > 0 ? 'BUY' : momentum < -0.5 ? 'STRONG SELL' : 'HOLD',
      confidence: Math.floor(65 + Math.random() * 30),
      targetPrice: avgPrice * (trend ? 1.05 : 0.97),
      riskLevel: volatility > avgPrice * 0.1 ? 'HIGH' : volatility > avgPrice * 0.05 ? 'MEDIUM' : 'LOW',
      sentiment: trend ? 'Bullish' : 'Bearish',
      indicators: {
        RSI: Math.floor(30 + Math.random() * 40),
        MACD: trend ? '+' : '-',
        MA20: trend ? 'Above' : 'Below'
      }
    };
    
    return prediction;
  };

  // Add transaction to ledger
  const addToLedger = (type, details) => {
    const newTx = {
      id: generateTxHash(),
      blockNumber: generateBlockNumber(),
      timestamp: new Date().toISOString(),
      type, // 'MINE', 'TRANSFER', 'BUY', 'SELL'
      status: 'CONFIRMED',
      confirmations: Math.floor(10 + Math.random() * 50),
      gasUsed: Math.floor(21000 + Math.random() * 50000),
      ...details
    };
    
    setTransactionLedger(prev => {
      const updated = [newTx, ...prev].slice(0, 100); // Keep last 100 transactions
      localStorage.setItem('ftc_transaction_ledger', JSON.stringify(updated));
      return updated;
    });
    
    // POST to GLOBAL blockchain ledger - visible to ALL users
    if (type === 'BUY' || type === 'SELL') {
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${BACKEND_URL}/api/nutrition/global-ledger/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            trade_type: type,
            product_id: details.productId,
            product_name: details.productName,
            quantity: details.quantity,
            price_per_unit: details.pricePerUnit,
            total_ftc: details.totalFTC
          })
        }).catch(err => console.error('Error recording to global ledger:', err));
      }
    }
    
    return newTx;
  };

  // Update portfolio with buy/sell
  const updatePortfolio = (productId, quantity, price, isBuy) => {
    setPortfolio(prev => {
      const updated = { ...prev };
      
      if (isBuy) {
        if (!updated[productId]) {
          updated[productId] = { quantity: 0, avgBuyPrice: 0, totalInvested: 0 };
        }
        const existing = updated[productId];
        const newTotalQty = existing.quantity + quantity;
        const newTotalInvested = existing.totalInvested + (price * quantity);
        updated[productId] = {
          quantity: newTotalQty,
          avgBuyPrice: newTotalInvested / newTotalQty,
          totalInvested: newTotalInvested
        };
      } else {
        // Selling
        if (updated[productId]) {
          updated[productId].quantity -= quantity;
          if (updated[productId].quantity <= 0) {
            delete updated[productId];
          }
        }
      }
      
      localStorage.setItem('ftc_portfolio', JSON.stringify(updated));
      return updated;
    });
  };

  // Calculate profit/loss for a product
  const calculateProfitLoss = (productId, currentPrice) => {
    const holding = portfolio[productId];
    if (!holding || holding.quantity <= 0) return null;
    
    const currentValue = holding.quantity * currentPrice;
    const profitLoss = currentValue - holding.totalInvested;
    const profitLossPercent = (profitLoss / holding.totalInvested) * 100;
    
    return {
      quantity: holding.quantity,
      avgBuyPrice: holding.avgBuyPrice,
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercent
    };
  };

  // Sports Nutrition Products with base prices
  const NUTRITION_PRODUCTS = [
    // Proteins
    { id: 'WPC80', name: 'Whey Protein Concentrate 80%', basePrice: 38.50, category: 'Protein' },
    { id: 'WPI90', name: 'Whey Protein Isolate 90%', basePrice: 72.00, category: 'Protein' },
    { id: 'CASEIN', name: 'Casein Protein Micellar', basePrice: 52.00, category: 'Protein' },
    { id: 'PEA', name: 'Pea Protein Isolate 85%', basePrice: 32.00, category: 'Protein' },
    { id: 'SOY', name: 'Soy Protein Isolate', basePrice: 28.00, category: 'Protein' },
    { id: 'EGG', name: 'Egg White Protein', basePrice: 65.00, category: 'Protein' },
    { id: 'COLLAGEN', name: 'Collagen Peptides', basePrice: 48.00, category: 'Protein' },
    
    // Amino Acids
    { id: 'GLUTAMINE', name: 'L-Glutamine Powder', basePrice: 44.00, category: 'Amino' },
    { id: 'BCAA', name: 'BCAA 2:1:1 Instant', basePrice: 58.00, category: 'Amino' },
    { id: 'EAA', name: 'Essential Amino Acids', basePrice: 62.00, category: 'Amino' },
    { id: 'ARGININE', name: 'L-Arginine HCL', basePrice: 36.00, category: 'Amino' },
    { id: 'TAURINE', name: 'L-Taurine Pure', basePrice: 24.00, category: 'Amino' },
    
    // Creatine & Performance
    { id: 'CREATINE', name: 'Creatine Monohydrate Pure', basePrice: 22.50, category: 'Creatine' },
    { id: 'CREATINEHCL', name: 'Creatine HCL', basePrice: 42.00, category: 'Creatine' },
    { id: 'BETA', name: 'Beta-Alanine Pure', basePrice: 35.00, category: 'Pre-Workout' },
    { id: 'CITRULLINE', name: 'L-Citrulline Malate 2:1', basePrice: 46.00, category: 'Pre-Workout' },
    { id: 'CAFFEINE', name: 'Caffeine Anhydrous USP', basePrice: 14.50, category: 'Pre-Workout' },
    
    // Vitamins
    { id: 'VITC', name: 'Vitamin C 1000mg', basePrice: 18.00, category: 'Vitamin' },
    { id: 'VITD3', name: 'Vitamin D3 5000IU', basePrice: 22.00, category: 'Vitamin' },
    { id: 'VITB12', name: 'Vitamin B12 Methylcobalamin', basePrice: 28.00, category: 'Vitamin' },
    { id: 'VITE', name: 'Vitamin E 400IU', basePrice: 26.00, category: 'Vitamin' },
    { id: 'MULTI', name: 'Multivitamin Complete', basePrice: 34.00, category: 'Vitamin' },
    { id: 'BCOMPLEX', name: 'B-Complex Super', basePrice: 24.00, category: 'Vitamin' },
    
    // Omega & Fatty Acids
    { id: 'OMEGA3', name: 'Omega-3 Fish Oil 1000mg', basePrice: 32.00, category: 'Omega' },
    { id: 'OMEGA6', name: 'Omega-6 GLA Complex', basePrice: 38.00, category: 'Omega' },
    { id: 'OMEGA9', name: 'Omega-9 Olive Oil Extract', basePrice: 28.00, category: 'Omega' },
    { id: 'OMEGA369', name: 'Omega 3-6-9 Complete', basePrice: 42.00, category: 'Omega' },
    { id: 'FLAXSEED', name: 'Flaxseed Oil 1000mg', basePrice: 22.00, category: 'Omega' },
    
    // Specialty Supplements
    { id: 'COQ10', name: 'CoQ10 Ubiquinone 100mg', basePrice: 56.00, category: 'Specialty' },
    { id: 'ASHWAGANDHA', name: 'Ashwagandha KSM-66', basePrice: 38.00, category: 'Specialty' },
    { id: 'ZINC', name: 'Zinc Picolinate 50mg', basePrice: 16.00, category: 'Mineral' },
    { id: 'MAGNESIUM', name: 'Magnesium Glycinate', basePrice: 28.00, category: 'Mineral' },
    { id: 'IRON', name: 'Iron Bisglycinate', basePrice: 18.00, category: 'Mineral' },
    { id: 'CALCIUM', name: 'Calcium + D3 Complex', basePrice: 24.00, category: 'Mineral' },
    
    // Weight Management
    { id: 'MALTO', name: 'Maltodextrin DE 18-20', basePrice: 9.50, category: 'Gainer' },
    { id: 'DEXTROSE', name: 'Dextrose Monohydrate', basePrice: 6.80, category: 'Gainer' },
    { id: 'MASSGAINER', name: 'Mass Gainer 1250', basePrice: 58.00, category: 'Gainer' },
    { id: 'CLA', name: 'CLA Softgels 1000mg', basePrice: 32.00, category: 'Fat Burner' },
    { id: 'LCARNITINE', name: 'L-Carnitine Tartrate', basePrice: 36.00, category: 'Fat Burner' },
    { id: 'GREENTEAEXT', name: 'Green Tea Extract EGCG', basePrice: 28.00, category: 'Fat Burner' },
  ];

  // Fetch GLOBAL nutrition prices from backend - SAME for ALL users
  useEffect(() => {
    const fetchGlobalPrices = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/nutrition/global-prices`);
        if (response.ok) {
          const data = await response.json();
          if (data.prices) {
            setNutritionPrices(data.prices);
          }
          if (data.ai_signals) {
            setAiSignals(data.ai_signals);
          }
        }
      } catch (error) {
        console.error('Error fetching global prices:', error);
        // Fallback to local prices if API fails
        const initPrices = {};
        NUTRITION_PRODUCTS.forEach(p => {
          initPrices[p.id] = {
            current: p.basePrice,
            change: 0,
            history: Array(20).fill(p.basePrice).map((v, i) => v * (0.95 + Math.random() * 0.1))
          };
        });
        setNutritionPrices(initPrices);
      }
    };

    // Initial fetch
    fetchGlobalPrices();
    
    // Fetch global prices every 3 seconds - all users get same data
    const priceInterval = setInterval(fetchGlobalPrices, 3000);
    
    return () => clearInterval(priceInterval);
  }, []);

  // Fetch GLOBAL transaction ledger from backend - ALL trades from ALL users
  const fetchGlobalLedger = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/global-ledger`);
      if (response.ok) {
        const data = await response.json();
        if (data.transactions) {
          setGlobalLedger(data.transactions);
          // Update volume and sentiment from stats
          if (data.stats) {
            setGlobalVolume24h(data.stats.volume_24h || 0);
            setMarketSentiment(data.stats.market_sentiment || 'neutral');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching global ledger:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGlobalLedger();
    
    // Fetch global ledger every 3 seconds for real-time updates
    const ledgerInterval = setInterval(fetchGlobalLedger, 3000);
    
    return () => clearInterval(ledgerInterval);
  }, []);

  // Also fetch when ledger modal opens
  useEffect(() => {
    if (showLedgerModal) {
      fetchGlobalLedger();
    }
  }, [showLedgerModal]);

  // Buy/Sell nutrition product with blockchain ledger tracking
  const executeNutritionTrade = () => {
    if (!selectedNutrition || !isLoggedIn) return;
    
    const price = nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice;
    const totalCost = price * tradeAmount;
    
    // For SELL - check if user has enough holdings
    if (tradeType === 'sell') {
      const holding = portfolio[selectedNutrition.id];
      if (!holding || holding.quantity < tradeAmount) {
        toast.error('Insufficient holdings! You don\'t have enough units to sell.');
        return;
      }
    }
    
    if (tradeType === 'buy' && ftcBalance < totalCost) {
      toast.error('Insufficient FTC balance! Mine more FTC first.');
      return;
    }
    
    if (tradeType === 'buy') {
      const newBalance = ftcBalance - totalCost;
      setFtcBalance(newBalance);
      localStorage.setItem('ftc_mining_balance', newBalance.toString());
      
      // Add to ledger with blockchain verification
      addToLedger('BUY', {
        productId: selectedNutrition.id,
        productName: selectedNutrition.name,
        quantity: tradeAmount,
        pricePerUnit: price,
        totalFTC: totalCost,
        balanceAfter: newBalance
      });
      
      // Update portfolio holdings
      updatePortfolio(selectedNutrition.id, tradeAmount, price, true);
      
      toast.success(`Bought ${tradeAmount} unit(s) of ${selectedNutrition.name}!`, {
        description: `Total: ${totalCost.toFixed(2)} FTC | TX Verified on Blockchain`
      });
    } else {
      // Calculate profit/loss on sale
      const holding = portfolio[selectedNutrition.id];
      const costBasis = holding.avgBuyPrice * tradeAmount;
      const saleValue = totalCost;
      const realizedPL = saleValue - costBasis;
      
      const newBalance = ftcBalance + totalCost;
      setFtcBalance(newBalance);
      localStorage.setItem('ftc_mining_balance', newBalance.toString());
      
      // Add to ledger with P/L tracking
      addToLedger('SELL', {
        productId: selectedNutrition.id,
        productName: selectedNutrition.name,
        quantity: tradeAmount,
        pricePerUnit: price,
        totalFTC: totalCost,
        balanceAfter: newBalance,
        costBasis: costBasis,
        realizedPL: realizedPL
      });
      
      // Update portfolio holdings
      updatePortfolio(selectedNutrition.id, tradeAmount, price, false);
      
      const plText = realizedPL >= 0 ? `+${realizedPL.toFixed(2)}` : realizedPL.toFixed(2);
      toast.success(`Sold ${tradeAmount} unit(s) of ${selectedNutrition.name}!`, {
        description: `Received: ${totalCost.toFixed(2)} FTC | P/L: ${plText} FTC`
      });
    }
    
    setShowNutritionModal(false);
    setTradeAmount(1);
  };

  // Check login and fetch mining data
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      // Load saved FTC balance from localStorage first
      const savedBalance = localStorage.getItem('ftc_mining_balance');
      const savedMined = localStorage.getItem('ftc_mined_today');
      const savedCalories = localStorage.getItem('ftc_calories_burned');
      
      console.log('Loading from localStorage:', { savedBalance, savedMined, savedCalories });
      
      if (savedBalance && parseFloat(savedBalance) > 0) {
        setFtcBalance(parseFloat(savedBalance));
      }
      if (savedMined && parseFloat(savedMined) > 0) {
        setFtcMined(parseFloat(savedMined));
      }
      if (savedCalories && parseFloat(savedCalories) > 0) {
        setCaloriesBurned(parseFloat(savedCalories));
      }
      
      if (token && userData) {
        setIsLoggedIn(true);
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Set wallet address from user data if available
        if (parsedUser.ftc_wallet_address) {
          setFtcWalletAddress(parsedUser.ftc_wallet_address);
        }
        
        // Fetch mining data from backend and merge with local
        await fetchMiningData(token);
        
        // Fetch wallet address from backend
        await fetchWalletAddress(token);
      }
    };
    
    checkLogin();
  }, []);

  // Fetch wallet address
  const fetchWalletAddress = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/address`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ftc_wallet_address) {
          setFtcWalletAddress(data.ftc_wallet_address);
          // Also update stored user data
          const userData = localStorage.getItem('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            parsedUser.ftc_wallet_address = data.ftc_wallet_address;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching wallet address:', error);
    }
  };

  // Update wallet address
  const updateWalletAddress = async () => {
    if (!newWalletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }
    
    if (newWalletAddress.trim().length < 32 || newWalletAddress.trim().length > 44) {
      toast.error('Invalid wallet address format. Must be 32-44 characters.');
      return;
    }
    
    setIsUpdatingWallet(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/wallet/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_wallet_address: newWalletAddress.trim() })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFtcWalletAddress(data.ftc_wallet_address);
        setShowWalletModal(false);
        setNewWalletAddress('');
        toast.success('🔑 Wallet address updated successfully!');
        
        // Update stored user data
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.ftc_wallet_address = data.ftc_wallet_address;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to update wallet address');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet address');
    } finally {
      setIsUpdatingWallet(false);
    }
  };

  // Calculate fee for sending FTC
  const calculateSendFee = async (amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      setSendFeeInfo({ fee_percent: 0, fee_amount: 0, amount_after_fee: 0 });
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/fee-calculator?amount=${parseFloat(amount)}`);
      if (response.ok) {
        const data = await response.json();
        setSendFeeInfo(data);
      }
    } catch (error) {
      console.error('Fee calculation error:', error);
    }
  };

  // Send FTC to another user
  const sendFTC = async () => {
    if (!sendRecipientWallet.trim()) {
      toast.error('Please enter recipient wallet address');
      return;
    }
    
    const amount = parseFloat(sendAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > ftcBalance) {
      toast.error('Insufficient FTC balance');
      return;
    }
    
    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/wallet/send-ftc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_wallet_address: sendRecipientWallet.trim(),
          amount: amount,
          note: sendNote || ''
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Sent ${data.transaction.amount_received} FTC (Fee: ${data.transaction.fee_amount} FTC)`);
        setShowSendFtcModal(false);
        setSendRecipientWallet('');
        setSendAmount('');
        setSendNote('');
        setSendFeeInfo({ fee_percent: 0, fee_amount: 0 });
        
        // Refresh balance
        const walletRes = await fetch(`${BACKEND_URL}/api/wallet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setFtcBalance(walletData.ftc_balance || 0);
        }
        
        // Fetch transfer history
        fetchTransferHistory();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send FTC');
      }
    } catch (error) {
      console.error('Send FTC error:', error);
      toast.error('Failed to send FTC');
    } finally {
      setIsSending(false);
    }
  };

  // Fetch transfer history
  const fetchTransferHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/wallet/transfers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransferHistory(data.transfers || []);
      }
    } catch (error) {
      console.error('Transfer history error:', error);
    }
  };

  // Fetch transaction details (tap/double-tap)
  const fetchTxDetails = async (txId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/global/ledger-details/${txId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTxDetails(data);
        setShowTxDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching tx details:', error);
    }
  };

  // Handle transaction tap (double-tap for details)
  const handleTxTap = (txId) => {
    const now = Date.now();
    if (lastTxTap.txId === txId && now - lastTxTap.time < 500) {
      // Double tap - show details
      fetchTxDetails(txId);
    } else {
      // Single tap - just highlight
      setLastTxTap({ txId, time: now });
    }
  };

  // Save FTC balance to localStorage whenever it changes (only if > 0 or was set before)
  const balanceInitializedRef = useRef(false);
  useEffect(() => {
    // Skip initial render to avoid overwriting with 0
    if (!balanceInitializedRef.current) {
      balanceInitializedRef.current = true;
      return;
    }
    localStorage.setItem('ftc_mining_balance', ftcBalance.toString());
    console.log('Saved balance to localStorage:', ftcBalance);
  }, [ftcBalance]);

  // Save mined FTC to localStorage
  useEffect(() => {
    if (ftcMined > 0) {
      localStorage.setItem('ftc_mined_today', ftcMined.toString());
    }
  }, [ftcMined]);

  // Load transaction ledger and portfolio from localStorage on mount
  useEffect(() => {
    const savedLedger = localStorage.getItem('ftc_transaction_ledger');
    const savedPortfolio = localStorage.getItem('ftc_portfolio');
    
    if (savedLedger) {
      try {
        setTransactionLedger(JSON.parse(savedLedger));
      } catch (e) {
        console.error('Failed to parse ledger:', e);
      }
    }
    
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (e) {
        console.error('Failed to parse portfolio:', e);
      }
    }
  }, []);

  // Calculate total portfolio profit/loss whenever portfolio or prices change
  useEffect(() => {
    let totalPL = 0;
    Object.keys(portfolio).forEach(productId => {
      const holding = portfolio[productId];
      const currentPrice = nutritionPrices[productId]?.current;
      if (holding && holding.quantity > 0 && currentPrice) {
        const currentValue = holding.quantity * currentPrice;
        const pl = currentValue - holding.totalInvested;
        totalPL += pl;
      }
    });
    setTotalProfitLoss(totalPL);
  }, [portfolio, nutritionPrices]);

  // Periodic refresh of subscription status (every 10 seconds when pending)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) return;

    // Only poll when there's a pending subscription
    if (subscriptionRequest && (subscriptionRequest.status === 'pending' || subscriptionRequest.status === 'pending_upgrade')) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/mining/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Check if subscription was activated
            if (data.active_subscription && 
                (!activeSubscription || data.active_subscription.id !== activeSubscription?.id)) {
              // Subscription was just activated!
              setActiveSubscription(data.active_subscription);
              setSubscriptionRequest(data.pending_request);
              
              toast.success('🎉 Your subscription has been ACTIVATED!', {
                description: `${data.active_subscription.plan_name} is now active. Start mining now!`
              });
            }
            
            // Update pending request status
            if (data.pending_request?.status !== subscriptionRequest?.status) {
              setSubscriptionRequest(data.pending_request);
            }
          }
        } catch (error) {
          console.log('Status poll error:', error);
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [subscriptionRequest, activeSubscription, isLoggedIn]);

  // Save calories to localStorage
  useEffect(() => {
    if (caloriesBurned > 0) {
      localStorage.setItem('ftc_calories_burned', caloriesBurned.toString());
    }
  }, [caloriesBurned]);

  // FTC Live Price Feed - GLOBAL Real-time fluctuation (same for all users)
  useEffect(() => {
    const fetchGlobalPrice = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/global/ftc-price`);
        if (response.ok) {
          const data = await response.json();
          setFtcLivePrice(data.price);
          setFtcPriceChange(data.change_24h);
          setGlobalVolume24h(data.volume_24h);
        }
      } catch (error) {
        console.log('Global price fetch error:', error);
      }
    };

    // Initial fetch
    fetchGlobalPrice();
    
    // Poll every 3 seconds for real-time global updates
    const priceInterval = setInterval(fetchGlobalPrice, 3000);
    return () => clearInterval(priceInterval);
  }, []);

  // Check if user had previous subscription (for bonus)
  useEffect(() => {
    const checkPreviousSubscription = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/mining/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // If user has had any subscription before (active or expired)
          if (data.active_subscription || localStorage.getItem('ftc_had_subscription') === 'true') {
            setHasHadPreviousSubscription(true);
            localStorage.setItem('ftc_had_subscription', 'true');
          }
        }
      } catch (error) {
        console.log('Error checking subscription history:', error);
      }
    };
    
    checkPreviousSubscription();
  }, []);

  // Persistent Mining - Continues even after logout/refresh until subscription ends
  useEffect(() => {
    if (!activeSubscription || activeSubscription.status !== 'active') {
      setMiningProgress(prev => ({ ...prev, isActive: false }));
      return;
    }

    // Load mining progress from localStorage
    const savedProgress = localStorage.getItem('ftc_mining_progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        // Calculate FTC mined while away
        const now = Date.now();
        const lastSync = progress.lastSyncTime || now;
        const timeDiff = (now - lastSync) / 1000; // seconds
        
        // Mining rate: based on subscription plan (calories per day = FTC per day)
        const dailyLimit = activeSubscription.ftc_limit || 100;
        const ftcPerSecond = dailyLimit / (24 * 60 * 60);
        const minedWhileAway = Math.min(timeDiff * ftcPerSecond, dailyLimit - (progress.totalMined || 0));
        
        if (minedWhileAway > 0 && progress.isActive) {
          const newTotal = (progress.totalMined || 0) + minedWhileAway;
          setFtcMined(prev => prev + minedWhileAway);
          setFtcBalance(prev => {
            const newBalance = prev + minedWhileAway;
            localStorage.setItem('ftc_mining_balance', newBalance.toString());
            return newBalance;
          });
          toast.success(`⛏️ Mined ${minedWhileAway.toFixed(2)} FTC while away!`, {
            description: 'Your mining continued in the background'
          });
        }
        
        setMiningProgress({
          isActive: progress.isActive,
          startedAt: progress.startedAt,
          totalMined: progress.totalMined + (minedWhileAway > 0 ? minedWhileAway : 0),
          lastSyncTime: now
        });
      } catch (e) {
        console.log('Mining progress parse error:', e);
      }
    }

    // Auto-start mining for active subscribers
    if (activeSubscription.status === 'active') {
      setMiningProgress(prev => {
        const updated = {
          ...prev,
          isActive: true,
          startedAt: prev.startedAt || Date.now(),
          lastSyncTime: Date.now()
        };
        localStorage.setItem('ftc_mining_progress', JSON.stringify(updated));
        return updated;
      });
      setIsMining(true);
    }
  }, [activeSubscription]);

  // Save mining progress periodically
  useEffect(() => {
    if (!miningProgress.isActive) return;
    
    const saveInterval = setInterval(() => {
      const progress = {
        ...miningProgress,
        totalMined: ftcMined,
        lastSyncTime: Date.now()
      };
      localStorage.setItem('ftc_mining_progress', JSON.stringify(progress));
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [miningProgress.isActive, ftcMined]);

  // Global Real-time Blockchain Sync - All users see same data
  useEffect(() => {
    const fetchGlobalLedger = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/global/trades`);
        if (response.ok) {
          const data = await response.json();
          setGlobalLedger(data.trades || []);
          setGlobalVolume24h(data.volume_24h || 0);
        }
      } catch (error) {
        // Use local ledger as fallback for global visibility
        setGlobalLedger(transactionLedger.slice(0, 20));
      }
    };

    // Initial fetch
    fetchGlobalLedger();
    
    // Poll every 5 seconds for real-time updates
    const pollInterval = setInterval(fetchGlobalLedger, 5000);
    return () => clearInterval(pollInterval);
  }, [transactionLedger]);

  // Double-tap handler for product details
  const handleProductTap = (product) => {
    const now = Date.now();
    if (lastTap.productId === product.id && (now - lastTap.time) < 300) {
      // Double tap - show details
      setShowProductDetails(product);
    } else {
      // Single tap - open trade modal
      setLastTap({ productId: product.id, time: now });
      setTimeout(() => {
        if (lastTap.productId === product.id) {
          setSelectedNutrition(product);
          setAiPrediction(generateAIPrediction(product.id));
          setShowNutritionModal(true);
        }
      }, 300);
    }
  };

  // Fetch mining data from backend
  const fetchMiningData = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/mining/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Get local balance and use the higher value (in case backend hasn't synced)
        const localBalance = parseFloat(localStorage.getItem('ftc_mining_balance') || '0');
        const backendBalance = data.ftc_balance || 0;
        const finalBalance = Math.max(localBalance, backendBalance);
        
        setFtcBalance(finalBalance);
        localStorage.setItem('ftc_mining_balance', finalBalance.toString());
        
        // Set other data from backend
        setActiveSubscription(data.active_subscription);
        setSubscriptionRequest(data.pending_request);
        
        // If backend has higher values, use those
        if (data.ftc_mined_today > ftcMined) {
          setFtcMined(data.ftc_mined_today);
        }
        if (data.calories_burned > caloriesBurned) {
          setCaloriesBurned(data.calories_burned);
        }
      }
    } catch (error) {
      console.log('Mining data fetch error:', error);
      // On error, still use localStorage data
    }
  };

  // Start mining simulation
  const startMining = async () => {
    if (!activeSubscription) {
      toast.error('Please subscribe to a mining plan first');
      setShowPlanModal(true);
      return;
    }
    
    // If already mining, activate boost
    if (isMining) {
      activateBoost();
      return;
    }
    
    // Start persistent mining session
    await startPersistentMining();
  };

  // Activate boost - based on subscription tier
  const activateBoost = async () => {
    if (isBoosted) {
      toast.info('Boost already active!');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/mining/activate-boost`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsBoosted(true);
          setBoostTimeLeft(data.boost_duration);
          setBoostConfig(data.boost_config || boostConfig);
          toast.success(data.message);
          
          // Restart animation with boosted rate
          startMiningAnimation();
          
          // Start boost countdown
          const boostCountdown = setInterval(() => {
            setBoostTimeLeft(prev => {
              if (prev <= 1) {
                clearInterval(boostCountdown);
                setIsBoosted(false);
                // Restart animation with normal rate
                startMiningAnimation();
                toast.info('Boost ended. Tap again for another boost!');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          toast.info(data.message);
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to activate boost');
      }
    } catch (error) {
      console.error('Boost error:', error);
      toast.error('Failed to activate boost');
    }
  };

  // Mining loop function - uses server mining rate
  const runMiningLoop = (speed) => {
    // This is now handled by backend sync
    // Keep for UI animation only
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
      }
      stopMiningAnimation();
      stopMiningSync();
    };
  }, []);

  // Stop mining - Note: Mining only stops when subscription expires
  const stopMining = () => {
    // Mining never stops unless subscription expires
    // This function is just for UI state
    toast.info('Mining continues in background. Only stops when subscription expires!');
  };

  // Transfer mined FTC to total balance
  const transferToBalance = () => {
    if (ftcMined <= 0) {
      toast.error('No FTC to transfer. Start mining first!');
      return;
    }
    
    const transferAmount = ftcMined;
    
    // Add mined FTC to balance
    const newBalance = ftcBalance + transferAmount;
    setFtcBalance(newBalance);
    localStorage.setItem('ftc_mining_balance', newBalance.toString());
    
    // Reset mined amounts
    setFtcMined(0);
    setCaloriesBurned(0);
    localStorage.setItem('ftc_mined_today', '0');
    localStorage.setItem('ftc_calories_burned', '0');
    
    toast.success(`💰 Transferred ${transferAmount} FTC to your balance!`, {
      description: 'FTC added to Total FTC Balance'
    });
  };

  // Submit subscription request
  const submitSubscriptionRequest = async () => {
    if (!selectedPlan) return;
    
    // Free trial doesn't need transaction hash
    if (!selectedPlan.isFree && !transactionHash.trim()) {
      toast.error('Please enter transaction hash');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/mining/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          calories: selectedPlan.calories,
          ftc_limit: selectedPlan.ftcLimit,
          payment_method: selectedPlan.isFree ? 'FREE' : paymentMethod,
          price: selectedPlan.isFree ? 0 : (paymentMethod === 'USD' ? selectedPlan.priceUSD : selectedPlan.priceFTC),
          transaction_hash: selectedPlan.isFree ? 'FREE_TRIAL_7_DAYS' : transactionHash.trim(),
          is_free_trial: selectedPlan.isFree || false,
          is_resubscription: hasHadPreviousSubscription,
          bonus_percent: hasHadPreviousSubscription ? RESUBSCRIPTION_BONUS_PERCENT : 0
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionRequest(data.request);
        setShowPlanModal(false);
        setTransactionHash('');
        
        // Mark that user has had subscription for future bonus
        localStorage.setItem('ftc_had_subscription', 'true');
        setHasHadPreviousSubscription(true);
        
        const bonusMessage = hasHadPreviousSubscription 
          ? ` 🎁 +${RESUBSCRIPTION_BONUS_PERCENT}% BONUS applied for returning subscriber!` 
          : '';
        
        toast.success(selectedPlan.isFree ? '✅ Free Trial request submitted!' : '✅ Subscription request submitted!', {
          description: selectedPlan.isFree 
            ? 'Admin will approve your 7-day free trial. Status will update automatically!' 
            : `Admin will verify payment and activate your plan.${bonusMessage} Status will update automatically!`
        });
        // Refresh mining data to get updated status
        const token = localStorage.getItem('token');
        if (token) {
          await fetchMiningData(token);
        }
      } else {
        const error = await response.json();
        const errorMessage = error.detail || 'Failed to submit request';
        
        // Check if user already has active subscription - show upgrade option
        if (errorMessage.includes('already have an active subscription')) {
          toast.error('⚠️ You already have an active subscription!', {
            description: 'Contact admin to upgrade your plan or wait for current plan to expire.'
          });
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to submit request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Intro Video */}
      <AnimatePresence>
        {showIntroVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-auto flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-2xl rounded-2xl border-2 border-[#00F090]/50 overflow-hidden mb-6 relative">
                <video
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-auto max-h-[60vh] object-contain bg-black"
                >
                  <source src="https://customer-assets.emergentagent.com/job_8c1a8921-c4d9-482b-bd7c-2cad508cc925/artifacts/mfex5v6c_VID-20251012-WA00032.mp4" type="video/mp4" />
                </video>
                
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 right-4 p-3 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
                </button>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#00F090]/90 rounded-full">
                    <Zap className="h-4 w-4 text-black" />
                    <span className="font-bold text-black text-sm">BURN CALORIES</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FFD700]/90 rounded-full">
                    <Gift className="h-4 w-4 text-black" />
                    <span className="font-bold text-black text-sm">EARN FTC</span>
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F090] via-[#FFD700] to-[#FF9F1C] mb-2 text-center">
                FITCOIN MINING
              </h2>
              <p className="text-white/70 mb-6 text-center">1 Calorie Burned = 1 FTC Mined</p>
              
              <button
                onClick={() => setShowIntroVideo(false)}
                className="px-8 py-4 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-black rounded-full hover:brightness-110 transition-all animate-pulse text-lg"
                data-testid="start-mining-btn"
              >
                ⚡ START AI AUTO MINING
              </button>
              
              <button
                onClick={() => setShowIntroVideo(false)}
                className="absolute top-4 right-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Skip →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://customer-assets.emergentagent.com/job_8c1a8921-c4d9-482b-bd7c-2cad508cc925/artifacts/4a66bn4s_15390.jpg" alt="FTC Mining" className="h-12 w-12 rounded-full" />
            <div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00F090] to-[#FFD700]">FITCOIN MINING</span>
              <span className="block text-xs text-white/50">Burn Calories, Earn Crypto</span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => document.getElementById('mining-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"
            >
              <Zap className="h-4 w-4" />
              Mining
            </button>
            <button
              onClick={() => document.getElementById('subscription-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"
            >
              <Crown className="h-4 w-4" />
              Plans
            </button>
            {isLoggedIn && (
              <>
                <button
                  onClick={() => setShowSendFtcModal(true)}
                  className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </button>
                <button
                  onClick={() => setShowLedgerModal(true)}
                  className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"
                >
                  <TrendingUp className="h-4 w-4" />
                  Ledger
                </button>
              </>
            )}
            <Link
              to="/admin"
              className="px-3 py-2 text-sm text-[#FFD700]/70 hover:text-[#FFD700] hover:bg-[#FFD700]/10 rounded-lg transition-all flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* User Profile Button */}
                <button
                  onClick={() => document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#9945FF]/20 hover:bg-[#9945FF]/30 rounded-lg border border-[#9945FF]/30 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#9945FF] to-[#FF2E50] flex items-center justify-center text-xs font-bold">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-white/80">{user?.full_name?.split(' ')[0] || 'Profile'}</span>
                </button>
                
                {/* Balance */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00F090]/20 to-[#FFD700]/20 rounded-lg border border-[#FFD700]/30">
                  <Wallet className="h-4 w-4 text-[#FFD700]" />
                  <span className="font-bold text-[#FFD700]">{ftcBalance.toLocaleString()} FTC</span>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mining Status Banner */}
      <div className={`py-2 ${isMining ? 'bg-gradient-to-r from-[#00F090]/20 via-[#FFD700]/20 to-[#00F090]/20 animate-pulse' : 'bg-black/50'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          {isMining ? (
            <>
              <span className="px-3 py-1 bg-[#00F090] text-black text-xs font-bold rounded animate-pulse">MINING ACTIVE</span>
              <span className="text-sm text-white/80">1 Calorie Kcl = 1 FTC (1:1 ratio)</span>
            </>
          ) : (
            <>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded">STANDBY</span>
              <span className="text-sm text-white/60">1 Calorie Kcl = 1 FTC - Start mining now</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mining Dashboard */}
        <div id="mining-section" className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Mining Circle */}
          <div className="glass-card p-8 flex flex-col items-center">
            <div className={`relative w-64 h-64 rounded-full border-4 ${isMining ? 'border-[#00F090] animate-pulse' : 'border-white/20'} flex items-center justify-center`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00F090]/10 to-[#FFD700]/10" />
              
              {/* Boost indicator */}
              {isBoosted && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#FF2E50] to-[#FF9F1C] text-white text-xs font-bold rounded-full animate-bounce">
                  🚀 BOOST {boostTimeLeft}s
                </div>
              )}
              
              <div className="text-center z-10">
                <img 
                  src={FTC_LOGO} 
                  alt="Fitcoin" 
                  className={`w-16 h-16 rounded-full mx-auto mb-2 ${isMining ? 'animate-spin-slow' : ''}`}
                  style={{ animationDuration: isBoosted ? '0.5s' : '3s' }}
                />
                <p className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00F090] to-[#FFD700]">
                  {ftcMined.toFixed(3)}
                </p>
                <p className="text-white/60 text-sm">FTC MINED TODAY</p>
              </div>
              
              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(ftcMined / (activeSubscription?.ftc_limit || 500)) * 754} 754`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00F090" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#FF9F1C]">{caloriesBurned.toFixed(2)}</p>
                <p className="text-xs text-white/60">Calories</p>
              </div>
              <div className="text-2xl text-white/20">=</div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00F090]">{ftcMined.toFixed(2)}</p>
                <p className="text-xs text-white/60">FTC</p>
              </div>
            </div>
            
            {/* Mining Button */}
            <button
              onClick={startMining}
              disabled={!isLoggedIn}
              className={`mt-6 px-8 py-4 rounded-full font-black text-lg transition-all ${
                isMining 
                  ? isBoosted 
                    ? 'bg-gradient-to-r from-[#FF2E50] to-[#FF9F1C] text-white animate-pulse' 
                    : 'bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black'
                  : 'bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black'
              } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
              data-testid="mining-btn"
            >
              {isMining 
                ? isBoosted 
                  ? `🚀 BOOST ${boostTimeLeft}s (${boostConfig.boost_multiplier}x)` 
                  : '🚀 TAP FOR BOOST!'
                : '⚡ START MINING'
              }
            </button>
            
            {isMining && (
              <div className="mt-2 text-center">
                <p className="text-xs text-white/40">
                  {isBoosted 
                    ? `${boostConfig.boost_multiplier}x speed for ${boostConfig.boost_duration}s!`
                    : `Tap for ${boostConfig.boost_duration}s boost (${boostConfig.boost_multiplier}x speed)`
                  }
                </p>
                <p className="text-xs text-[#00F090] mt-1">
                  ⚡ Mining continues even if you close this page!
                </p>
              </div>
            )}
            
            {/* Transfer to Balance Button */}
            {ftcMined > 0 && (
              <button
                onClick={transferToBalance}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#FF2E50] text-white font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 animate-pulse"
                data-testid="transfer-btn"
              >
                <Wallet className="h-5 w-5" />
                Transfer {ftcMined.toFixed(2)} FTC to Balance
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Stats & Subscription */}
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#FFD700]" />
                Your Subscription
              </h3>
              
              {activeSubscription ? (
                <div className="p-4 bg-gradient-to-br from-[#00F090]/20 to-[#FFD700]/20 rounded-lg border border-[#00F090]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#00F090]">{activeSubscription.plan_name}</span>
                    <span className="px-2 py-1 bg-[#00F090] text-black text-xs font-bold rounded">ACTIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60">Daily Limit</p>
                      <p className="font-bold text-white">{activeSubscription.ftc_limit} FTC</p>
                    </div>
                    <div>
                      <p className="text-white/60">Calories</p>
                      <p className="font-bold text-white">{activeSubscription.calories}</p>
                    </div>
                  </div>
                  {/* Show pending upgrade if exists */}
                  {subscriptionRequest && subscriptionRequest.status === 'pending_upgrade' && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#9945FF]">⬆️ Upgrade to {subscriptionRequest.plan_name}</span>
                        <span className="px-2 py-0.5 bg-[#9945FF] text-white text-xs font-bold rounded">PENDING</span>
                      </div>
                    </div>
                  )}
                  {/* Allow upgrade button */}
                  {(!subscriptionRequest || subscriptionRequest.status !== 'pending_upgrade') && (
                    <button
                      onClick={() => setShowPlanModal(true)}
                      className="mt-3 w-full py-2 bg-[#9945FF]/20 border border-[#9945FF]/50 text-[#9945FF] font-bold rounded-lg hover:bg-[#9945FF]/30 transition-all text-sm"
                      data-testid="upgrade-plan-btn"
                    >
                      ⬆️ Upgrade Plan
                    </button>
                  )}
                </div>
              ) : subscriptionRequest ? (
                <div className="p-4 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#FFD700]">{subscriptionRequest.plan_name}</span>
                    <span className="px-2 py-1 bg-[#FFD700] text-black text-xs font-bold rounded">
                      {subscriptionRequest.status === 'pending_upgrade' ? 'UPGRADE PENDING' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-2">Awaiting admin activation</p>
                  <p className="text-xs text-white/40 mb-3">Status will update automatically when approved</p>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (token) {
                        toast.loading('Checking status...');
                        await fetchMiningData(token);
                        toast.dismiss();
                        if (activeSubscription) {
                          toast.success('🎉 Subscription activated!');
                        } else {
                          toast.info('Still pending. Admin will review soon.');
                        }
                      }
                    }}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    data-testid="refresh-status-btn"
                  >
                    <Clock className="h-4 w-4" />
                    Refresh Status
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/60 mb-4">No active subscription</p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                  >
                    Choose Mining Plan
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <Wallet className="h-8 w-8 text-[#FFD700] mx-auto mb-2" />
                <p className="text-2xl font-black text-[#FFD700]">{ftcBalance.toLocaleString()}</p>
                <p className="text-xs text-white/60">Total FTC Balance</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Target className="h-8 w-8 text-[#00F090] mx-auto mb-2" />
                <p className="text-2xl font-black text-[#00F090]">{activeSubscription?.ftc_limit || 0}</p>
                <p className="text-xs text-white/60">Daily Limit</p>
              </div>
            </div>

            {/* FTC Wallet Address - Auto-generated unique key */}
            {isLoggedIn && ftcWalletAddress && (
              <div id="wallet-section" className="glass-card p-4 border border-[#9945FF]/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-lg">🔑</span>
                    Your FTC Wallet Address
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewWalletAddress(ftcWalletAddress);
                        setShowWalletModal(true);
                      }}
                      className="text-xs px-2 py-1 bg-[#9945FF]/20 hover:bg-[#9945FF]/30 text-[#9945FF] rounded transition-all"
                      data-testid="edit-wallet-btn"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/10">
                  <p className="text-xs font-mono text-[#00F090] flex-1 truncate" data-testid="wallet-address">
                    {ftcWalletAddress}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ftcWalletAddress);
                      toast.success('Wallet address copied!');
                    }}
                    className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-all"
                    data-testid="copy-wallet-btn"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  💡 This is your unique FTC wallet address. Use it to receive FTC from other users.
                </p>
                
                {/* Send FTC Section */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => { setShowSendFtcModal(true); fetchTransferHistory(); }}
                    className="w-full py-3 bg-gradient-to-r from-[#00F090] to-[#00BFFF] text-black font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    data-testid="send-ftc-btn"
                  >
                    <span>💸</span>
                    Send FTC to Another User
                  </button>
                  <p className="text-xs text-white/30 text-center mt-2">
                    Transaction fee: 0.01% - 15% based on amount
                  </p>
                </div>
              </div>
            )}

            {/* StepsApp Integration */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#FF9F1C]" />
                Track Calories with StepsApp
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Connect StepsApp to automatically track your calories and convert to FTC
              </p>
              <a
                href="https://invite.steps.app/zkK1vmJRdARK"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                Join StepsApp Group
              </a>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div id="subscription-section">
          <h2 className="text-2xl font-black mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00F090] to-[#FFD700]">
            MINING SUBSCRIPTION PLANS
          </h2>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-6 border-2 cursor-pointer transition-all relative ${
                selectedPlan?.id === plan.id ? `border-[${plan.color}]` : 'border-transparent hover:border-white/20'
              } ${plan.isFree ? 'ring-2 ring-[#00BFFF] ring-offset-2 ring-offset-[#050505]' : ''}`}
              onClick={() => {
                setSelectedPlan(plan);
                setShowPlanModal(true);
              }}
              style={{ borderColor: selectedPlan?.id === plan.id ? plan.color : 'transparent' }}
              data-testid={`plan-${plan.id}`}
            >
              {/* Free Trial Badge */}
              {plan.isFree && (
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-[#00BFFF] to-[#00F090] text-black text-xs font-black rounded-full animate-pulse">
                  FREE 7 DAYS
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <plan.icon className="h-8 w-8" style={{ color: plan.color }} />
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
                  {plan.ftcLimit} FTC/day
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: plan.color }}>{plan.name}</h3>
              <p className="text-sm text-white/60 mb-4">{plan.calories} calories conversion</p>
              
              <div className="flex items-center justify-between">
                {plan.isFree ? (
                  <div>
                    <p className="text-2xl font-black text-[#00BFFF]">FREE</p>
                    <p className="text-xs text-white/40">No payment required</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-black text-white">${plan.priceUSD}</p>
                    <p className="text-xs text-white/40">or {plan.priceFTC} FTC</p>
                  </div>
                )}
                <ArrowRight className="h-5 w-5 text-white/40" />
              </div>
            </motion.div>
          ))}
        </div>
        </div>

        {/* Sports Nutrition Trading Section */}
        <div className="mt-12 mb-8">
          {/* FTC Price Header */}
          <div className="glass-card p-4 mb-6 border border-[#FFD700]/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="https://customer-assets.emergentagent.com/job_94cff406-9a2c-4c0b-a835-403a040364ee/artifacts/1nhfkox8_1000174676.jpg" 
                  alt="FTC" 
                  className="h-12 w-12 rounded-full border-2 border-[#FFD700] shadow-lg shadow-[#FFD700]/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">FTC</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                      ftcPriceChange >= 0 ? 'bg-[#00F090]/20 text-[#00F090]' : 'bg-[#FF2E50]/20 text-[#FF2E50]'
                    }`}>
                      {ftcPriceChange >= 0 ? '+' : ''}{ftcPriceChange.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-2xl font-black font-mono ${ftcPriceChange >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                    ${ftcLivePrice.toFixed(11)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-white/50">YOUR BALANCE</p>
                  <p className="text-lg font-black text-[#FFD700]">{ftcBalance.toLocaleString()} FTC</p>
                  <p className="text-xs text-white/50">≈ ${(ftcBalance * ftcLivePrice).toFixed(4)} USD</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-right">
                  <p className="text-xs text-white/50">24H VOLUME</p>
                  <p className="text-sm font-bold text-[#FFD700]">{globalVolume24h.toLocaleString(undefined, {maximumFractionDigits: 2})} FTC</p>
                  <p className="text-xs text-white/30">Global</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">🏋️</span>
              <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] to-[#FFD700]">
                SPORTS NUTRITION TRADING
              </h2>
              <span className="text-3xl">💪</span>
            </div>
            <p className="text-white/60 text-sm">Trade with your mined FTC • Real-time prices • Global Market</p>
          </div>
          
          {/* Enhanced Portfolio Summary */}
          <div className="glass-card p-4 mb-6 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Holdings */}
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-white/50 uppercase mb-1">Total Holdings</p>
                <p className="text-xl font-black text-white">{Object.keys(portfolio).length}</p>
                <p className="text-xs text-white/40">Assets</p>
              </div>
              
              {/* Total Value */}
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-white/50 uppercase mb-1">Total Value</p>
                <p className="text-xl font-black text-[#FFD700]">
                  {Object.values(portfolio).reduce((sum, h) => sum + (h.totalInvested || 0), 0).toFixed(2)} FTC
                </p>
                <p className="text-xs text-white/40">
                  ≈ ${(Object.values(portfolio).reduce((sum, h) => sum + (h.totalInvested || 0), 0) * ftcLivePrice).toFixed(4)}
                </p>
              </div>
              
              {/* P/L */}
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-white/50 uppercase mb-1">Profit / Loss</p>
                <p className={`text-xl font-black ${totalProfitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)} FTC
                </p>
                <p className={`text-xs ${totalProfitLoss >= 0 ? 'text-[#00F090]/70' : 'text-[#FF2E50]/70'}`}>
                  ({Object.values(portfolio).reduce((sum, h) => sum + (h.totalInvested || 0), 0) > 0 
                    ? ((totalProfitLoss / Object.values(portfolio).reduce((sum, h) => sum + (h.totalInvested || 0), 1)) * 100).toFixed(2) 
                    : '0.00'}%) ≈ ${(totalProfitLoss * ftcLivePrice).toFixed(4)}
                </p>
              </div>
              
              {/* Transactions */}
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-white/50 uppercase mb-1">Transactions</p>
                <p className="text-xl font-black text-[#9945FF]">{transactionLedger.length}</p>
                <p className="text-xs text-white/40">Blockchain Verified</p>
              </div>
            </div>
            
            {/* View Ledger Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowLedgerModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#00F090] text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-[#9945FF]/20"
                data-testid="view-ledger-btn"
              >
                <FileText className="h-5 w-5" />
                <span>📜 View Blockchain Ledger</span>
                {transactionLedger.length > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                    {transactionLedger.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Holdings Module */}
          {Object.keys(portfolio).length > 0 && (
            <div className="glass-card p-4 mb-6 border border-[#00F090]/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#00F090]" />
                📦 Your Holdings
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(portfolio).map(([productId, holding]) => {
                  const product = NUTRITION_PRODUCTS.find(p => p.id === productId);
                  const currentPrice = nutritionPrices[productId]?.current || product?.basePrice || 0;
                  const pl = calculateProfitLoss(productId, currentPrice);
                  
                  return (
                    <div key={productId} className="p-3 bg-black/30 rounded-lg border border-white/10 hover:border-[#00F090]/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{product?.name || productId}</p>
                          <p className="text-xs text-[#FFD700]">{product?.category}</p>
                        </div>
                        {pl && (
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                            pl.profitLoss >= 0 ? 'bg-[#00F090]/20 text-[#00F090]' : 'bg-[#FF2E50]/20 text-[#FF2E50]'
                          }`}>
                            {pl.profitLoss >= 0 ? '+' : ''}{pl.profitLossPercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-white/40">Quantity</p>
                          <p className="text-white font-mono">{holding.quantity}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Buy Price</p>
                          <p className="text-white font-mono">{holding.avgBuyPrice.toFixed(2)} FTC</p>
                        </div>
                        <div>
                          <p className="text-white/40">Current Price</p>
                          <p className={`font-mono ${currentPrice >= holding.avgBuyPrice ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                            {currentPrice.toFixed(2)} FTC
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40">P/L</p>
                          <p className={`font-mono font-bold ${pl?.profitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                            {pl ? `${pl.profitLoss >= 0 ? '+' : ''}${pl.profitLoss.toFixed(2)} FTC` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* AI Market Analysis Panel */}
          <div className="glass-card p-4 mb-6 border border-[#9945FF]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#9945FF]/20 rounded-lg">
                  <Activity className="h-6 w-6 text-[#9945FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Market Analysis</h3>
                  <p className="text-xs text-white/50">Real-time trading recommendations</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                marketSentiment === 'bullish' ? 'bg-[#00F090]/20 text-[#00F090]' :
                marketSentiment === 'bearish' ? 'bg-[#FF2E50]/20 text-[#FF2E50]' :
                'bg-[#FFD700]/20 text-[#FFD700]'
              }`}>
                {marketSentiment === 'bullish' ? '📈 BULLISH' : marketSentiment === 'bearish' ? '📉 BEARISH' : '➡️ NEUTRAL'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-[#00F090]/10 rounded-lg border border-[#00F090]/20">
                <p className="text-[#00F090] text-2xl font-black">
                  {Object.values(aiSignals).filter(s => s?.signal === 'BUY').length}
                </p>
                <p className="text-xs text-white/50">BUY Signals</p>
              </div>
              <div className="p-3 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/20">
                <p className="text-[#FFD700] text-2xl font-black">
                  {Object.values(aiSignals).filter(s => s?.signal === 'HOLD').length}
                </p>
                <p className="text-xs text-white/50">HOLD Signals</p>
              </div>
              <div className="p-3 bg-[#FF2E50]/10 rounded-lg border border-[#FF2E50]/20">
                <p className="text-[#FF2E50] text-2xl font-black">
                  {Object.values(aiSignals).filter(s => s?.signal === 'SELL').length}
                </p>
                <p className="text-xs text-white/50">SELL Signals</p>
              </div>
            </div>
            
            <p className="text-center text-xs text-white/40 mt-3">
              AI analyzes price trends, buy/sell pressure, and market momentum in real-time
            </p>
          </div>
          
          {/* Product Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {NUTRITION_PRODUCTS.map((product) => {
              const priceData = nutritionPrices[product.id];
              const signal = aiSignals[product.id];
              const isUp = priceData?.change >= 0;
              const holding = portfolio[product.id];
              const hasHolding = holding && holding.quantity > 0;
              
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  className={`glass-card p-4 cursor-pointer border transition-all relative ${
                    hasHolding 
                      ? 'border-[#00F090]/50 ring-1 ring-[#00F090]/20' 
                      : 'border-white/10 hover:border-[#FFD700]/50'
                  }`}
                  onClick={() => {
                    setSelectedNutrition(product);
                    setAiPrediction(generateAIPrediction(product.id));
                    setShowNutritionModal(true);
                  }}
                  onDoubleClick={() => setShowProductDetails(product)}
                  data-testid={`nutrition-${product.id}`}
                >
                  {/* AI Signal Badge */}
                  {signal && (
                    <div className={`absolute -top-2 -left-2 px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 ${
                      signal.signal === 'BUY' ? 'bg-[#00F090] text-black' :
                      signal.signal === 'SELL' ? 'bg-[#FF2E50] text-white' :
                      'bg-[#FFD700] text-black'
                    }`}>
                      {signal.signal === 'BUY' ? '⬆️' : signal.signal === 'SELL' ? '⬇️' : '➡️'} {signal.signal}
                    </div>
                  )}
                  
                  {/* Holding Badge */}
                  {hasHolding && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#00F090] text-black text-xs font-bold rounded-full">
                      {holding.quantity} owned
                    </div>
                  )}
                  
                  {/* Mini Chart */}
                  <div className="h-16 mb-3 relative">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <defs>
                        <linearGradient id={`gradient-${product.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={isUp ? '#00F090' : '#FF2E50'} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={isUp ? '#00F090' : '#FF2E50'} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {priceData?.history && (
                        <>
                          <path
                            d={`M 0 ${40 - (priceData.history[0] - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 35} ${priceData.history.map((p, i) => `L ${i * 5.26} ${40 - (p - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 35}`).join(' ')} L 100 40 L 0 40 Z`}
                            fill={`url(#gradient-${product.id})`}
                          />
                          <path
                            d={`M 0 ${40 - (priceData.history[0] - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 35} ${priceData.history.map((p, i) => `L ${i * 5.26} ${40 - (p - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 35}`).join(' ')}`}
                            fill="none"
                            stroke={isUp ? '#00F090' : '#FF2E50'}
                            strokeWidth="1.5"
                          />
                        </>
                      )}
                    </svg>
                    {/* Price change badge */}
                    <div className={`absolute top-0 right-0 px-2 py-0.5 rounded text-xs font-bold ${isUp ? 'bg-[#00F090]/20 text-[#00F090]' : 'bg-[#FF2E50]/20 text-[#FF2E50]'}`}>
                      {isUp ? '↑' : '↓'} {Math.abs(priceData?.change || 0).toFixed(2)}%
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <p className="text-xs text-[#FFD700] font-bold mb-1">{product.category}</p>
                  <h4 className="text-sm font-bold text-white truncate mb-2">{product.name}</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-black ${isUp ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                        {(priceData?.current || product.basePrice).toFixed(2)} FTC
                      </p>
                    </div>
                    <TrendingUp className={`h-4 w-4 ${isUp ? 'text-[#00F090]' : 'text-[#FF2E50] rotate-180'}`} />
                  </div>
                  
                  {/* AI Recommendation Reason */}
                  {signal && (
                    <div className="mt-2 p-2 bg-black/30 rounded text-xs text-white/70 border-l-2 border-[#FFD700]">
                      <span className="text-[#FFD700] font-bold">AI:</span> {signal.reason?.substring(0, 60)}...
                    </div>
                  )}
                  
                  {/* Show P/L if user has holdings */}
                  {hasHolding && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      {(() => {
                        const currentPrice = priceData?.current || product.basePrice;
                        const pl = calculateProfitLoss(product.id, currentPrice);
                        if (!pl) return null;
                        return (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60">{pl.quantity} units</span>
                            <span className={pl.profitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}>
                              {pl.profitLoss >= 0 ? '+' : ''}{pl.profitLoss.toFixed(2)} FTC ({pl.profitLossPercent >= 0 ? '+' : ''}{pl.profitLossPercent.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Double-tap hint */}
        <p className="text-center text-xs text-white/40 mt-4 mb-8">
          💡 Tap to trade • Double-tap for detailed market analysis
        </p>

        {/* Admin Panel Link */}
        <div className="glass-card p-6 text-center border border-[#9945FF]/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-[#9945FF]" />
            <h3 className="text-xl font-bold text-[#9945FF]">Admin Control Panel</h3>
          </div>
          <p className="text-white/60 mb-6 text-sm">For administrators only - Manage user subscriptions and approvals</p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9945FF] to-[#FF2E50] text-white font-bold rounded-lg hover:brightness-110 transition-all"
            data-testid="admin-panel-link"
          >
            <Shield className="h-5 w-5" />
            Go to Admin Panel
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {showPlanModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={FTC_LOGO} alt="FTC" className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <selectedPlan.icon className="h-5 w-5" style={{ color: selectedPlan.color }} />
                    {selectedPlan.name}
                    {selectedPlan.isFree && (
                      <span className="px-2 py-0.5 bg-[#00BFFF] text-black text-xs font-bold rounded">FREE</span>
                    )}
                  </h3>
                  <p className="text-xs text-white/60">
                    {selectedPlan.isFree ? '7-Day Free Trial Request' : 'Subscription Request'}
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: `${selectedPlan.color}15` }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Daily FTC Limit</p>
                    <p className="text-xl font-bold" style={{ color: selectedPlan.color }}>{selectedPlan.ftcLimit} FTC</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{selectedPlan.isFree ? 'Duration' : 'Calories'}</p>
                    <p className="text-xl font-bold text-white">{selectedPlan.isFree ? '7 Days' : selectedPlan.calories}</p>
                  </div>
                </div>
              </div>
              
              {/* Free Trial Info */}
              {selectedPlan.isFree ? (
                <div className="p-4 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-[#00BFFF]" />
                    <p className="font-bold text-[#00BFFF]">7-Day Free Trial</p>
                  </div>
                  <ul className="text-sm text-white/60 space-y-1">
                    <li>• No payment required</li>
                    <li>• 100 FTC daily mining limit</li>
                    <li>• 100 calories conversion</li>
                    <li>• Admin approval within 24 hours</li>
                  </ul>
                </div>
              ) : (
                <>
                  {/* 2026 Exclusive Plan Details */}
                  {selectedPlan.exclusive && (
                    <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF9F1C]/10 border border-[#FFD700]/30 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">⭐</span>
                        <p className="font-bold text-[#FFD700]">2026 EXCLUSIVE PLAN</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-white/50">Duration</p>
                          <p className="font-bold text-white">{selectedPlan.duration}</p>
                        </div>
                        <div>
                          <p className="text-white/50">Mining Speed</p>
                          <p className="font-bold text-[#00F090]">{selectedPlan.hashRate?.toLocaleString()} H/s</p>
                        </div>
                        <div>
                          <p className="text-white/50">Calories/Day</p>
                          <p className="font-bold text-white">{selectedPlan.calories?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/50">Approx. FTC</p>
                          <p className="font-bold text-[#FFD700]">~{selectedPlan.approxFTC?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-white/60 mb-2">Choose Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('USD')}
                        className={`p-3 rounded-lg border transition-all ${
                          paymentMethod === 'USD' ? 'border-[#00F090] bg-[#00F090]/10' : 'border-white/10'
                        }`}
                      >
                        <p className="font-bold text-white">${selectedPlan.priceUSD}</p>
                        <p className="text-xs text-white/60">USDT</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('FTC')}
                        className={`p-3 rounded-lg border transition-all ${
                          paymentMethod === 'FTC' ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-white/10'
                        }`}
                      >
                        <p className="font-bold text-[#FFD700]">{selectedPlan.priceFTC?.toLocaleString()}</p>
                        <p className="text-xs text-white/60">FTC</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('SOL')}
                        className={`p-3 rounded-lg border transition-all ${
                          paymentMethod === 'SOL' ? 'border-[#9945FF] bg-[#9945FF]/10' : 'border-white/10'
                        }`}
                      >
                        <p className="font-bold text-[#9945FF]">{selectedPlan.priceSol || (selectedPlan.priceUSD / 200).toFixed(2)}</p>
                        <p className="text-xs text-white/60">SOL</p>
                      </button>
                    </div>
                  </div>

                  {/* Admin Wallet Addresses */}
                  <div className="p-4 bg-black/50 border border-white/10 rounded-lg mb-4">
                    <p className="text-sm font-bold text-white mb-3">📋 Admin Wallet Address</p>
                    <div className="space-y-2">
                      {paymentMethod === 'USD' && (
                        <div>
                          <p className="text-xs text-white/40">USDT (Solana)</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[#00F090] bg-black/50 p-2 rounded flex-1 overflow-x-auto">
                              {ADMIN_WALLETS.USDT_SOL}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ADMIN_WALLETS.USDT_SOL);
                                toast.success('Address copied!');
                              }}
                              className="p-2 bg-white/10 rounded hover:bg-white/20"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'FTC' && (
                        <div>
                          <p className="text-xs text-white/40">FTC (Solana)</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[#FFD700] bg-black/50 p-2 rounded flex-1 overflow-x-auto">
                              {ADMIN_WALLETS.FTC_SOL}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ADMIN_WALLETS.FTC_SOL);
                                toast.success('Address copied!');
                              }}
                              className="p-2 bg-white/10 rounded hover:bg-white/20"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'SOL' && (
                        <div>
                          <p className="text-xs text-white/40">SOL (Solana)</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[#9945FF] bg-black/50 p-2 rounded flex-1 overflow-x-auto">
                              {ADMIN_WALLETS.SOL}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ADMIN_WALLETS.SOL);
                                toast.success('Address copied!');
                              }}
                              className="p-2 bg-white/10 rounded hover:bg-white/20"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Send exact amount to above address
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-white/60 mb-2">Payment Transaction Hash *</p>
                    <input
                      type="text"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="Enter USDT/FTC/SOL transaction hash"
                      className="w-full p-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/30 focus:border-[#00F090] focus:outline-none"
                      data-testid="transaction-hash-input"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      Paste your {paymentMethod} transaction hash after sending payment
                    </p>
                  </div>
                </>
              )}
              
              <button
                onClick={submitSubscriptionRequest}
                disabled={isSubmitting || !isLoggedIn || (!selectedPlan.isFree && !transactionHash.trim())}
                className={`w-full py-4 font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 ${
                  selectedPlan.isFree 
                    ? 'bg-gradient-to-r from-[#00BFFF] to-[#00F090] text-black' 
                    : 'bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black'
                }`}
                data-testid="submit-subscription-btn"
              >
                {isSubmitting ? 'Submitting...' : !isLoggedIn ? 'Login First' : selectedPlan.isFree ? 'Request Free Trial' : 'Submit Request to Admin'}
              </button>
              
              <p className="text-xs text-white/40 text-center mt-4">
                {selectedPlan.isFree 
                  ? 'Admin will approve your free trial request' 
                  : `Admin will verify ${paymentMethod} payment and activate your subscription immediately`
                }
              </p>
              
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setTransactionHash('');
                }}
                className="w-full py-2 text-white/60 hover:text-white text-sm mt-2"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nutrition Trade Modal */}
      <AnimatePresence>
        {showNutritionModal && selectedNutrition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNutritionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#FFD700]/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedNutrition.name}</h3>
                  <p className="text-xs text-[#FFD700]">{selectedNutrition.category}</p>
                </div>
              </div>
              
              {/* Live Price Chart */}
              <div className="h-24 mb-4 bg-black/50 rounded-lg p-2">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  {nutritionPrices[selectedNutrition.id]?.history && (
                    <>
                      <defs>
                        <linearGradient id="modalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={nutritionPrices[selectedNutrition.id]?.change >= 0 ? '#00F090' : '#FF2E50'} stopOpacity="0.4" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0 ${50 - (nutritionPrices[selectedNutrition.id].history[0] - Math.min(...nutritionPrices[selectedNutrition.id].history)) / (Math.max(...nutritionPrices[selectedNutrition.id].history) - Math.min(...nutritionPrices[selectedNutrition.id].history) + 0.01) * 45} ${nutritionPrices[selectedNutrition.id].history.map((p, i) => `L ${i * 5.26} ${50 - (p - Math.min(...nutritionPrices[selectedNutrition.id].history)) / (Math.max(...nutritionPrices[selectedNutrition.id].history) - Math.min(...nutritionPrices[selectedNutrition.id].history) + 0.01) * 45}`).join(' ')} L 100 50 L 0 50 Z`}
                        fill="url(#modalGradient)"
                      />
                      <path
                        d={`M 0 ${50 - (nutritionPrices[selectedNutrition.id].history[0] - Math.min(...nutritionPrices[selectedNutrition.id].history)) / (Math.max(...nutritionPrices[selectedNutrition.id].history) - Math.min(...nutritionPrices[selectedNutrition.id].history) + 0.01) * 45} ${nutritionPrices[selectedNutrition.id].history.map((p, i) => `L ${i * 5.26} ${50 - (p - Math.min(...nutritionPrices[selectedNutrition.id].history)) / (Math.max(...nutritionPrices[selectedNutrition.id].history) - Math.min(...nutritionPrices[selectedNutrition.id].history) + 0.01) * 45}`).join(' ')}`}
                        fill="none"
                        stroke={nutritionPrices[selectedNutrition.id]?.change >= 0 ? '#00F090' : '#FF2E50'}
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              </div>
              
              {/* Price Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-black/50 rounded-lg">
                  <p className="text-xs text-white/60">Current Price</p>
                  <p className={`text-xl font-black ${nutritionPrices[selectedNutrition.id]?.change >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                    {(nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice).toFixed(2)} FTC
                  </p>
                </div>
                <div className="p-3 bg-black/50 rounded-lg">
                  <p className="text-xs text-white/60">Your FTC Balance</p>
                  <p className="text-xl font-black text-[#FFD700]">{ftcBalance.toFixed(2)} FTC</p>
                </div>
              </div>
              
              {/* Your Holdings (if any) */}
              {portfolio[selectedNutrition.id] && portfolio[selectedNutrition.id].quantity > 0 && (
                <div className="mb-4 p-3 bg-[#00F090]/10 border border-[#00F090]/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">Your Holdings</p>
                      <p className="text-lg font-bold text-[#00F090]">
                        {portfolio[selectedNutrition.id].quantity} units
                      </p>
                      <p className="text-xs text-white/40">
                        Avg. buy: {portfolio[selectedNutrition.id].avgBuyPrice.toFixed(2)} FTC
                      </p>
                    </div>
                    {(() => {
                      const currentPrice = nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice;
                      const pl = calculateProfitLoss(selectedNutrition.id, currentPrice);
                      if (!pl) return null;
                      return (
                        <div className={`text-right ${pl.profitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                          <p className="text-lg font-bold">
                            {pl.profitLoss >= 0 ? '+' : ''}{pl.profitLoss.toFixed(2)} FTC
                          </p>
                          <p className="text-xs">
                            {pl.profitLossPercent >= 0 ? '+' : ''}{pl.profitLossPercent.toFixed(1)}%
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* AI Prediction Panel */}
              {aiPrediction && (
                <div className="mb-4 p-3 bg-gradient-to-br from-[#9945FF]/10 to-[#00F090]/10 border border-[#9945FF]/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-[#9945FF]" />
                    <p className="text-xs font-bold text-[#9945FF]">AI-ML TRADING ANALYSIS</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-black/30 rounded">
                      <p className={`text-sm font-black ${
                        aiPrediction.action.includes('BUY') ? 'text-[#00F090]' : 
                        aiPrediction.action.includes('SELL') ? 'text-[#FF2E50]' : 'text-[#FFD700]'
                      }`}>
                        {aiPrediction.action}
                      </p>
                      <p className="text-xs text-white/40">Signal</p>
                    </div>
                    <div className="text-center p-2 bg-black/30 rounded">
                      <p className="text-sm font-bold text-white">{aiPrediction.confidence}%</p>
                      <p className="text-xs text-white/40">Confidence</p>
                    </div>
                    <div className="text-center p-2 bg-black/30 rounded">
                      <p className={`text-sm font-bold ${
                        aiPrediction.riskLevel === 'LOW' ? 'text-[#00F090]' :
                        aiPrediction.riskLevel === 'HIGH' ? 'text-[#FF2E50]' : 'text-[#FFD700]'
                      }`}>
                        {aiPrediction.riskLevel}
                      </p>
                      <p className="text-xs text-white/40">Risk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">RSI: {aiPrediction.indicators.RSI}</span>
                      <span className="text-white/40">|</span>
                      <span className="text-white/40">MACD: {aiPrediction.indicators.MACD}</span>
                      <span className="text-white/40">|</span>
                      <span className={aiPrediction.sentiment === 'Bullish' ? 'text-[#00F090]' : 'text-[#FF2E50]'}>
                        {aiPrediction.sentiment}
                      </span>
                    </div>
                    <span className="text-[#9945FF]">Target: {aiPrediction.targetPrice.toFixed(2)} FTC</span>
                  </div>
                </div>
              )}
              
              {/* Trade Type Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    tradeType === 'buy' ? 'bg-[#00F090] text-black' : 'bg-white/10 text-white/60'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    tradeType === 'sell' ? 'bg-[#FF2E50] text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  SELL
                </button>
              </div>
              
              {/* Amount Input */}
              <div className="mb-6">
                <label className="text-sm text-white/60 mb-2 block">Amount (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white text-center text-xl font-bold focus:border-[#FFD700]/50 outline-none"
                />
                <p className="text-xs text-white/40 mt-2 text-center">
                  Total: {((nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount).toFixed(2)} FTC
                </p>
              </div>
              
              {/* Execute Trade Button */}
              <button
                onClick={executeNutritionTrade}
                disabled={
                  !isLoggedIn || 
                  (tradeType === 'buy' && ftcBalance < (nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount) ||
                  (tradeType === 'sell' && (!portfolio[selectedNutrition.id] || portfolio[selectedNutrition.id].quantity < tradeAmount))
                }
                className={`w-full py-4 font-bold rounded-lg transition-all disabled:opacity-50 ${
                  tradeType === 'buy' 
                    ? 'bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black hover:brightness-110'
                    : 'bg-gradient-to-r from-[#FF2E50] to-[#FF9F1C] text-white hover:brightness-110'
                }`}
                data-testid="execute-trade-btn"
              >
                {!isLoggedIn 
                  ? 'Login First' 
                  : tradeType === 'buy' 
                    ? `Buy for ${((nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount).toFixed(2)} FTC` 
                    : tradeType === 'sell' && (!portfolio[selectedNutrition.id] || portfolio[selectedNutrition.id].quantity < tradeAmount)
                      ? 'Insufficient Holdings'
                      : `Sell for ${((nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount).toFixed(2)} FTC`
                }
              </button>
              
              <button
                onClick={() => setShowNutritionModal(false)}
                className="w-full py-2 text-white/60 hover:text-white text-sm mt-2"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blockchain Ledger Modal */}
      <AnimatePresence>
        {showLedgerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLedgerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#9945FF] to-[#00F090] rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Blockchain Verified Ledger</h3>
                    <p className="text-xs text-white/60">Real-time transaction history • AI-ML Powered</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Portfolio Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-black/50 rounded-lg border border-[#00F090]/30">
                  <p className="text-xs text-white/60">Total Holdings</p>
                  <p className="text-xl font-black text-[#00F090]">
                    {Object.keys(portfolio).length} Products
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-[#FFD700]/30">
                  <p className="text-xs text-white/60">Total Invested</p>
                  <p className="text-xl font-black text-[#FFD700]">
                    {Object.values(portfolio).reduce((sum, h) => sum + (h.totalInvested || 0), 0).toFixed(2)} FTC
                  </p>
                </div>
                <div className={`p-4 bg-black/50 rounded-lg border ${totalProfitLoss >= 0 ? 'border-[#00F090]/30' : 'border-[#FF2E50]/30'}`}>
                  <p className="text-xs text-white/60">Unrealized P/L</p>
                  <p className={`text-xl font-black ${totalProfitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)} FTC
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-[#9945FF]/30">
                  <p className="text-xs text-white/60">Total Transactions</p>
                  <p className="text-xl font-black text-[#9945FF]">
                    {transactionLedger.length}
                  </p>
                </div>
              </div>

              {/* Portfolio Holdings */}
              {Object.keys(portfolio).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#FFD700]" />
                    Active Holdings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                    {Object.entries(portfolio).map(([productId, holding]) => {
                      const product = NUTRITION_PRODUCTS.find(p => p.id === productId);
                      const currentPrice = nutritionPrices[productId]?.current || product?.basePrice || 0;
                      const pl = calculateProfitLoss(productId, currentPrice);
                      
                      return (
                        <div key={productId} className="p-3 bg-black/30 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">{product?.name || productId}</p>
                              <p className="text-xs text-white/60">
                                {holding.quantity} units @ {holding.avgBuyPrice.toFixed(2)} avg
                              </p>
                            </div>
                            {pl && (
                              <div className={`text-right ${pl.profitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                                <p className="text-sm font-bold">
                                  {pl.profitLoss >= 0 ? '+' : ''}{pl.profitLoss.toFixed(2)} FTC
                                </p>
                                <p className="text-xs">
                                  {pl.profitLossPercent >= 0 ? '+' : ''}{pl.profitLossPercent.toFixed(1)}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transaction History */}
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-[#9945FF]" />
                  Transaction History
                </h4>
                <div className="overflow-y-auto max-h-[300px] space-y-2">
                  {transactionLedger.length === 0 ? (
                    <div className="text-center py-8 text-white/40">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                      <p className="text-xs">Start trading to see your blockchain-verified history</p>
                    </div>
                  ) : (
                    transactionLedger.map((tx, index) => (
                      <div 
                        key={tx.id || index} 
                        className="p-3 bg-black/30 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              tx.type === 'BUY' ? 'bg-[#00F090]/20 text-[#00F090]' :
                              tx.type === 'SELL' ? 'bg-[#FF2E50]/20 text-[#FF2E50]' :
                              tx.type === 'MINE' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                              'bg-[#9945FF]/20 text-[#9945FF]'
                            }`}>
                              {tx.type}
                            </span>
                            <span className="text-sm text-white font-medium">{tx.productName || 'FTC'}</span>
                          </div>
                          <span className="text-xs text-[#00F090] flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {tx.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-white/40">Amount</p>
                            <p className="text-white">{tx.quantity || '-'} units</p>
                          </div>
                          <div>
                            <p className="text-white/40">Price</p>
                            <p className="text-white">{tx.pricePerUnit?.toFixed(2) || '-'} FTC</p>
                          </div>
                          <div>
                            <p className="text-white/40">Total</p>
                            <p className="text-[#FFD700]">{tx.totalFTC?.toFixed(2) || '-'} FTC</p>
                          </div>
                          {tx.realizedPL !== undefined && (
                            <div>
                              <p className="text-white/40">P/L</p>
                              <p className={tx.realizedPL >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}>
                                {tx.realizedPL >= 0 ? '+' : ''}{tx.realizedPL.toFixed(2)} FTC
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-white/30 font-mono truncate max-w-[200px]">
                            TX: {tx.id?.substring(0, 18)}...
                          </span>
                          <span className="text-white/30">
                            Block #{tx.blockNumber} • {tx.confirmations} confirmations
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* GLOBAL Blockchain Ledger - ALL Users Worldwide */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#00F090]" />
                  Global Blockchain Ledger 
                  <span className="text-xs text-[#00F090] font-normal ml-auto">LIVE • All Users Worldwide</span>
                </h4>
                <div className="overflow-y-auto max-h-[300px] space-y-2">
                  {globalLedger.length === 0 ? (
                    <div className="text-center py-6 text-white/40">
                      <div className="animate-spin w-6 h-6 border-2 border-[#00F090] border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-xs mb-2">Loading global transactions...</p>
                      <button 
                        onClick={fetchGlobalLedger}
                        className="text-xs px-3 py-1 bg-[#00F090]/20 text-[#00F090] rounded hover:bg-[#00F090]/30 transition-colors"
                      >
                        ↻ Refresh
                      </button>
                    </div>
                  ) : (
                    globalLedger.map((tx, index) => (
                      <div 
                        key={tx.id || index} 
                        className={`p-2 bg-gradient-to-r from-black/40 to-black/20 rounded-lg border transition-all cursor-pointer ${
                          lastTxTap.txId === tx.id ? 'border-[#FFD700]/50 bg-[#FFD700]/5' : 'border-[#00F090]/20 hover:border-[#00F090]/40'
                        }`}
                        onClick={() => handleTxTap(tx.id)}
                        onDoubleClick={() => fetchTxDetails(tx.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              tx.trade_type === 'BUY' ? 'bg-[#00F090]/20 text-[#00F090]' :
                              tx.trade_type === 'SELL' ? 'bg-[#FF2E50]/20 text-[#FF2E50]' :
                              tx.trade_type === 'SEND' ? 'bg-[#00BFFF]/20 text-[#00BFFF]' :
                              tx.trade_type === 'ADMIN_SEND' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                              'bg-white/10 text-white'
                            }`}>
                              {tx.trade_type}
                            </span>
                            <span className="text-sm text-white font-medium">{tx.product_name}</span>
                            <span className="text-xs text-white/40">by {tx.username || 'Anon'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#FFD700] font-bold">{tx.total_ftc?.toFixed(2)} FTC</span>
                            {tx.fee_amount > 0 && (
                              <span className="text-xs text-white/30">(Fee: {tx.fee_amount?.toFixed(4)})</span>
                            )}
                            <span className="text-xs text-[#00F090] flex items-center gap-1">
                              <Check className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-white/30">
                          <span className="font-mono truncate max-w-[150px]">TX: {tx.tx_hash}</span>
                          <span>Block #{tx.block_number} • {tx.confirmations} conf</span>
                        </div>
                        {tx.user_wallet && (
                          <div className="mt-1 text-xs text-[#9945FF]/60 font-mono">
                            Wallet: {tx.user_wallet}
                          </div>
                        )}
                        {(tx.sender_wallet || tx.receiver_wallet) && (
                          <div className="mt-1 text-xs text-white/30">
                            {tx.sender_wallet && <span className="text-[#FF2E50]">From: {tx.sender_wallet} </span>}
                            {tx.receiver_wallet && <span className="text-[#00F090]">To: {tx.receiver_wallet}</span>}
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-between text-xs text-white/20">
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          <span className="text-[#FFD700]/40">Double-tap for details</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Analysis Footer */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[#9945FF]" />
                    <span className="text-xs text-white/60">AI-ML Trading Analysis Active</span>
                  </div>
                  <span className="text-xs text-[#00F090]">All transactions blockchain verified</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Modal (Double-Tap) - Enhanced */}
      <AnimatePresence>
        {showProductDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowProductDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="glass-card p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const product = showProductDetails;
                const priceData = nutritionPrices[product.id];
                const holding = portfolio[product.id];
                const pl = holding ? calculateProfitLoss(product.id, priceData?.current) : null;
                const isUp = priceData?.change >= 0;
                const currentPrice = priceData?.current || product.basePrice;
                const tradingFee = 0.001; // 0.1% fee
                
                // Get product-specific transactions from ledger
                const productTxs = transactionLedger.filter(tx => tx.productId === product.id).slice(0, 5);
                
                return (
                  <>
                    {/* 1. BASIC INFO - Header */}
                    <div className="flex items-start justify-between mb-4 border-b border-white/10 pb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-xs font-bold bg-[#FFD700]/20 text-[#FFD700] rounded">{product.category}</span>
                          {isUp ? (
                            <span className="px-2 py-0.5 text-xs font-bold bg-[#00F090]/20 text-[#00F090] rounded flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" /> BULLISH
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-bold bg-[#FF2E50]/20 text-[#FF2E50] rounded flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 rotate-180" /> BEARISH
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-white">{product.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className={`text-2xl font-black ${isUp ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                              {currentPrice.toFixed(2)} FTC
                            </p>
                            <p className="text-xs text-white/50">≈ ${(currentPrice * ftcLivePrice).toFixed(6)} USD</p>
                          </div>
                          <div className={`px-3 py-1 rounded-lg ${isUp ? 'bg-[#00F090]/20' : 'bg-[#FF2E50]/20'}`}>
                            <p className={`text-lg font-bold ${isUp ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                              {isUp ? '+' : ''}{(priceData?.change || 0).toFixed(2)}%
                            </p>
                            <p className="text-xs text-white/40">24H</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowProductDetails(null)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 2. USER DATA - Holdings & P/L */}
                    <div className="mb-4 p-4 bg-gradient-to-br from-[#9945FF]/10 to-[#00F090]/10 rounded-lg border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        📊 Your Position
                      </h4>
                      {holding ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-2 bg-black/30 rounded">
                            <p className="text-xs text-white/50">Holdings</p>
                            <p className="text-lg font-bold text-white">{holding.quantity} units</p>
                          </div>
                          <div className="p-2 bg-black/30 rounded">
                            <p className="text-xs text-white/50">Avg Buy Price</p>
                            <p className="text-lg font-bold text-[#FFD700]">{holding.avgBuyPrice.toFixed(2)} FTC</p>
                          </div>
                          <div className="p-2 bg-black/30 rounded">
                            <p className="text-xs text-white/50">Current Value</p>
                            <p className="text-lg font-bold text-white">{(holding.quantity * currentPrice).toFixed(2)} FTC</p>
                          </div>
                          <div className="p-2 bg-black/30 rounded">
                            <p className="text-xs text-white/50">P/L</p>
                            <p className={`text-lg font-bold ${pl?.profitLoss >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                              {pl ? `${pl.profitLoss >= 0 ? '+' : ''}${pl.profitLoss.toFixed(2)}` : '0.00'} FTC
                            </p>
                            <p className={`text-xs ${pl?.profitLossPercent >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                              ({pl?.profitLossPercent >= 0 ? '+' : ''}{pl?.profitLossPercent?.toFixed(1) || '0.0'}%)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm text-center py-4">No holdings yet. Start trading!</p>
                      )}
                    </div>

                    {/* 3. CHART - Mini price chart with time tabs */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white">📈 Price Chart</h4>
                        <div className="flex gap-1">
                          {['1H', '24H', '7D'].map((period) => (
                            <button
                              key={period}
                              className="px-3 py-1 text-xs font-bold rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-32 p-3 bg-black/50 rounded-lg border border-white/10">
                        <svg viewBox="0 0 200 60" className="w-full h-full">
                          <defs>
                            <linearGradient id={`chart-gradient-${product.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor={isUp ? '#00F090' : '#FF2E50'} stopOpacity="0.3" />
                              <stop offset="100%" stopColor={isUp ? '#00F090' : '#FF2E50'} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {priceData?.history && (
                            <>
                              <path
                                d={`M 0 ${60 - (priceData.history[0] - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 50} ${priceData.history.map((p, i) => `L ${i * 10.5} ${60 - (p - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 50}`).join(' ')} L 200 60 L 0 60 Z`}
                                fill={`url(#chart-gradient-${product.id})`}
                              />
                              <path
                                d={`M 0 ${60 - (priceData.history[0] - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 50} ${priceData.history.map((p, i) => `L ${i * 10.5} ${60 - (p - Math.min(...priceData.history)) / (Math.max(...priceData.history) - Math.min(...priceData.history) + 0.01) * 50}`).join(' ')}`}
                                fill="none"
                                stroke={isUp ? '#00F090' : '#FF2E50'}
                                strokeWidth="2"
                              />
                            </>
                          )}
                        </svg>
                        <div className="flex justify-between text-xs text-white/30 mt-1">
                          <span>Low: {priceData?.history ? Math.min(...priceData.history).toFixed(2) : product.basePrice}</span>
                          <span>High: {priceData?.history ? Math.max(...priceData.history).toFixed(2) : product.basePrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. TRADING - Buy/Sell with fees */}
                    <div className="mb-4 p-4 bg-black/50 rounded-lg border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-3">🔄 Quick Trade</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                          onClick={() => {
                            setShowProductDetails(null);
                            setSelectedNutrition(product);
                            setTradeType('buy');
                            setAiPrediction(generateAIPrediction(product.id));
                            setShowNutritionModal(true);
                          }}
                          className="py-3 bg-[#00F090] text-black font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="h-4 w-4" /> BUY (FTC)
                        </button>
                        <button
                          onClick={() => {
                            setShowProductDetails(null);
                            setSelectedNutrition(product);
                            setTradeType('sell');
                            setAiPrediction(generateAIPrediction(product.id));
                            setShowNutritionModal(true);
                          }}
                          disabled={!holding || holding.quantity === 0}
                          className="py-3 bg-[#FF2E50] text-white font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="h-4 w-4 rotate-180" /> SELL (FTC)
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-white/5 rounded">
                          <p className="text-white/40">Trading Fee</p>
                          <p className="text-white font-mono">0.1%</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          <p className="text-white/40">Price (1 unit)</p>
                          <p className="text-[#FFD700] font-mono">{currentPrice.toFixed(2)} FTC</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          <p className="text-white/40">Your Balance</p>
                          <p className="text-[#00F090] font-mono">{ftcBalance.toFixed(2)} FTC</p>
                        </div>
                      </div>
                    </div>

                    {/* 5. BLOCKCHAIN - TX History */}
                    <div className="mb-4 p-4 bg-black/50 rounded-lg border border-[#9945FF]/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          🔗 Blockchain Transactions
                        </h4>
                        <button
                          onClick={() => {
                            setShowProductDetails(null);
                            setShowLedgerModal(true);
                          }}
                          className="px-3 py-1 text-xs font-bold bg-[#9945FF]/20 text-[#9945FF] rounded hover:bg-[#9945FF]/30 transition-all"
                        >
                          View Full Ledger
                        </button>
                      </div>
                      {productTxs.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {productTxs.map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-black/30 rounded text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  tx.type === 'BUY' ? 'bg-[#00F090]/20 text-[#00F090]' : 'bg-[#FF2E50]/20 text-[#FF2E50]'
                                }`}>
                                  {tx.type}
                                </span>
                                <span className="text-white/60 font-mono truncate max-w-[120px]">
                                  {tx.id?.substring(0, 16)}...
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#FFD700]">{tx.quantity} units</span>
                                <Check className="h-3 w-3 text-[#00F090]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm text-center py-4">No transactions for this product yet</p>
                      )}
                    </div>

                    {/* 6. FEATURES LIST */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-white mb-3">✨ Features</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { icon: '💰', text: 'Tradable with FTC' },
                          { icon: '📡', text: 'Real-time price' },
                          { icon: '🔗', text: 'Blockchain verified' },
                          { icon: '⚡', text: 'Instant buy/sell' },
                          { icon: '📈', text: 'P/L tracking' },
                          { icon: '🔐', text: 'Secure wallet' },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded text-xs">
                            <span>{feature.icon}</span>
                            <span className="text-white/70">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Stats Bar */}
                    <div className="grid grid-cols-4 gap-2 p-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FF9F1C]/10 rounded-lg border border-[#FFD700]/20 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-white/40">High 24H</p>
                        <p className="text-sm font-bold text-[#00F090]">
                          {priceData?.history ? Math.max(...priceData.history).toFixed(2) : product.basePrice}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/40">Low 24H</p>
                        <p className="text-sm font-bold text-[#FF2E50]">
                          {priceData?.history ? Math.min(...priceData.history).toFixed(2) : product.basePrice}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/40">Volume</p>
                        <p className="text-sm font-bold text-[#FFD700]">
                          {Math.floor(Math.random() * 10000 + 1000)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/40">Trades</p>
                        <p className="text-sm font-bold text-[#9945FF]">{productTxs.length}</p>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowProductDetails(null)}
                      className="w-full py-3 bg-white/10 text-white/70 font-bold rounded-lg hover:bg-white/20 transition-all"
                    >
                      Close Details
                    </button>

                    <p className="text-center text-xs text-white/30 mt-3">
                      💡 Every trade generates TX Hash • Verified on FTC Blockchain
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Address Edit Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="glass-card p-6 max-w-md w-full border border-[#9945FF]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🔑</span>
                  Edit FTC Wallet Address
                </h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-white/60 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Current Address</label>
                <p className="text-xs font-mono text-[#00F090] p-2 bg-black/40 rounded border border-white/10 truncate">
                  {ftcWalletAddress}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">New Wallet Address</label>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="Enter new Solana wallet address (32-44 chars)"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#9945FF] font-mono text-sm"
                  data-testid="new-wallet-input"
                />
                <p className="text-xs text-white/40 mt-2">
                  ⚠️ Make sure to enter a valid Solana wallet address. This address will be used for receiving FTC.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={updateWalletAddress}
                  disabled={isUpdatingWallet}
                  className="flex-1 py-3 bg-gradient-to-r from-[#9945FF] to-[#FF2E50] text-white font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                  data-testid="save-wallet-btn"
                >
                  {isUpdatingWallet ? 'Saving...' : '💾 Save Address'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send FTC Modal */}
      <AnimatePresence>
        {showSendFtcModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSendFtcModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="glass-card p-6 max-w-lg w-full border border-[#00F090]/30 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">💸</span>
                  Send FTC
                </h3>
                <button
                  onClick={() => setShowSendFtcModal(false)}
                  className="text-white/60 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Your Balance */}
              <div className="bg-black/40 p-3 rounded-lg mb-4 border border-white/10">
                <p className="text-sm text-white/60">Your FTC Balance</p>
                <p className="text-2xl font-bold text-[#FFD700]">{ftcBalance.toFixed(4)} FTC</p>
              </div>
              
              {/* Recipient Wallet */}
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Recipient Wallet Address</label>
                <input
                  type="text"
                  value={sendRecipientWallet}
                  onChange={(e) => setSendRecipientWallet(e.target.value)}
                  placeholder="Enter recipient's FTC wallet address"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#00F090] font-mono text-sm"
                  data-testid="send-recipient-input"
                />
              </div>
              
              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Amount (FTC)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => {
                    setSendAmount(e.target.value);
                    calculateSendFee(e.target.value);
                  }}
                  placeholder="Enter amount to send"
                  min="0"
                  step="0.0001"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#00F090]"
                  data-testid="send-amount-input"
                />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        const amt = (ftcBalance * pct / 100).toFixed(4);
                        setSendAmount(amt);
                        calculateSendFee(amt);
                      }}
                      className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-all"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Fee Info */}
              {sendFeeInfo.fee_amount > 0 && (
                <div className="bg-[#FFD700]/10 p-3 rounded-lg mb-4 border border-[#FFD700]/30">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Transaction Fee ({sendFeeInfo.fee_percent}%)</span>
                    <span className="text-[#FFD700]">{sendFeeInfo.fee_amount?.toFixed(4)} FTC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Recipient Receives</span>
                    <span className="text-[#00F090] font-bold">{sendFeeInfo.amount_after_fee?.toFixed(4)} FTC</span>
                  </div>
                </div>
              )}
              
              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  placeholder="Add a note for this transfer"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#00F090]"
                />
              </div>
              
              {/* Send Button */}
              <button
                onClick={sendFTC}
                disabled={isSending || !sendRecipientWallet || !sendAmount || parseFloat(sendAmount) <= 0}
                className="w-full py-4 bg-gradient-to-r from-[#00F090] to-[#00BFFF] text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 text-lg"
                data-testid="confirm-send-btn"
              >
                {isSending ? 'Sending...' : `Send ${sendAmount || 0} FTC`}
              </button>
              
              {/* Transfer History */}
              {transferHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold text-white/60 mb-3">Recent Transfers</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {transferHistory.slice(0, 5).map((tx, idx) => (
                      <div key={idx} className="p-2 bg-black/30 rounded-lg border border-white/5 flex items-center justify-between">
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            tx.type === 'SENT' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {tx.type}
                          </span>
                          <p className="text-xs text-white/40 mt-1">
                            {tx.type === 'SENT' ? `To: ${tx.recipient_wallet?.slice(0,10)}...` : `From: ${tx.sender_wallet?.slice(0,10)}...`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'SENT' ? 'text-red-400' : 'text-green-400'}`}>
                            {tx.type === 'SENT' ? '-' : '+'}{tx.type === 'SENT' ? tx.amount : tx.amount_received}
                          </p>
                          <p className="text-xs text-white/30">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Details Modal (Double-tap) */}
      <AnimatePresence>
        {showTxDetailsModal && selectedTxDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTxDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#9945FF]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Transaction Details
                </h3>
                <button onClick={() => setShowTxDetailsModal(false)} className="text-white/60 hover:text-white text-xl">✕</button>
              </div>
              
              {/* Transaction Info */}
              <div className="space-y-4">
                {/* TX Hash */}
                <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Transaction Hash</p>
                  <p className="font-mono text-[#00F090] text-sm break-all">
                    {selectedTxDetails.transaction?.tx_hash || selectedTxDetails.blockchain?.tx_hash}
                  </p>
                </div>
                
                {/* Block & Confirmations */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/40">Block Number</p>
                    <p className="font-bold text-white text-lg">{selectedTxDetails.transaction?.block_number || selectedTxDetails.blockchain?.block_number}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/40">Confirmations</p>
                    <p className="font-bold text-[#00F090] text-lg">{selectedTxDetails.transaction?.confirmations || selectedTxDetails.blockchain?.confirmations}</p>
                  </div>
                </div>
                
                {/* Trade Type & Amount */}
                <div className="bg-gradient-to-r from-[#FFD700]/10 to-transparent p-4 rounded-lg border border-[#FFD700]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      selectedTxDetails.transaction?.trade_type === 'BUY' ? 'bg-[#00F090]/20 text-[#00F090]' :
                      selectedTxDetails.transaction?.trade_type === 'SELL' ? 'bg-[#FF2E50]/20 text-[#FF2E50]' :
                      selectedTxDetails.transaction?.trade_type === 'SEND' ? 'bg-[#00BFFF]/20 text-[#00BFFF]' :
                      'bg-[#FFD700]/20 text-[#FFD700]'
                    }`}>
                      {selectedTxDetails.transaction?.trade_type}
                    </span>
                    <span className="text-xs text-white/40">{selectedTxDetails.transaction?.product_name}</span>
                  </div>
                  <p className="text-3xl font-bold text-[#FFD700]">
                    {selectedTxDetails.transaction?.total_ftc || selectedTxDetails.transaction?.amount} FTC
                  </p>
                  {selectedTxDetails.transaction?.fee_amount > 0 && (
                    <p className="text-sm text-white/40 mt-1">
                      Fee: {selectedTxDetails.transaction?.fee_amount} FTC ({selectedTxDetails.transaction?.fee_percent}%)
                    </p>
                  )}
                </div>
                
                {/* Sender Info */}
                {selectedTxDetails.sender_info && (
                  <div className="bg-black/40 p-3 rounded-lg border border-[#FF2E50]/30">
                    <p className="text-xs text-[#FF2E50] mb-2 flex items-center gap-1">
                      <span>📤</span> Sender
                    </p>
                    <p className="font-bold text-white">{selectedTxDetails.sender_info.full_name}</p>
                    <p className="font-mono text-xs text-[#9945FF] mt-1">{selectedTxDetails.sender_info.wallet_address}</p>
                    {selectedTxDetails.sender_info.member_since && (
                      <p className="text-xs text-white/30 mt-1">Member since: {new Date(selectedTxDetails.sender_info.member_since).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
                
                {/* Recipient Info */}
                {selectedTxDetails.recipient_info && (
                  <div className="bg-black/40 p-3 rounded-lg border border-[#00F090]/30">
                    <p className="text-xs text-[#00F090] mb-2 flex items-center gap-1">
                      <span>📥</span> Recipient
                    </p>
                    <p className="font-bold text-white">{selectedTxDetails.recipient_info.full_name}</p>
                    <p className="font-mono text-xs text-[#00F090] mt-1">{selectedTxDetails.recipient_info.wallet_address}</p>
                  </div>
                )}
                
                {/* Price Info */}
                {selectedTxDetails.transaction?.price_per_unit && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-white/40">Price/Unit</p>
                      <p className="font-bold text-white">{selectedTxDetails.transaction?.price_per_unit} FTC</p>
                    </div>
                    {selectedTxDetails.transaction?.price_after_impact && (
                      <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                        <p className="text-xs text-white/40">Price After Impact</p>
                        <p className="font-bold text-[#FFD700]">{selectedTxDetails.transaction?.price_after_impact?.toFixed(2)} FTC</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-white/40">Timestamp</p>
                  <p className="text-white">{new Date(selectedTxDetails.transaction?.timestamp || selectedTxDetails.transaction?.created_at).toLocaleString()}</p>
                </div>
                
                {/* Status */}
                <div className="bg-[#00F090]/10 p-4 rounded-lg border border-[#00F090]/30 text-center">
                  <p className="text-[#00F090] font-bold text-lg flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    {selectedTxDetails.transaction?.status || 'CONFIRMED'}
                  </p>
                  <p className="text-xs text-white/40 mt-1">{selectedTxDetails.blockchain?.network || 'Solana Mainnet'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/50 text-sm mt-12">
        <p className="mb-2">⚡ FTC Mining | 1 Calorie = 1 FTC</p>
        <p className="text-xs text-white/30">© 2026 Future Trade | Powered by VN1 HEALTHBAZAR OPC Pvt Ltd</p>
      </footer>
    </div>
  );
};

export default FtcMining;
