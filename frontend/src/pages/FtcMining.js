import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Flame, Activity, Award, Clock, Check, Star, 
  ArrowRight, Wallet, TrendingUp, Shield, ExternalLink,
  Volume2, VolumeX, Gift, Crown, Target, Rocket
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Fitcoin Logo - New Meditation Logo
const FTC_LOGO = 'https://customer-assets.emergentagent.com/job_8ab2343f-b785-4283-8178-10a5f0187955/artifacts/aghohvl9_998.jpg';

// Subscription Plans - Free Trial first, then paid plans
const SUBSCRIPTION_PLANS = [
  { id: 'free_trial', name: 'Free Trial', calories: 100, ftcLimit: 100, priceUSD: 0, priceFTC: 0, color: '#00BFFF', icon: Gift, isFree: true, duration: '7 Days' },
  { id: 'basic', name: 'Basic Miner', calories: 500, ftcLimit: 500, priceUSD: 5, priceFTC: 1500, color: '#00F090', icon: Zap },
  { id: 'standard', name: 'Standard Miner', calories: 1000, ftcLimit: 1000, priceUSD: 9, priceFTC: 2500, color: '#FFD700', icon: Flame },
  { id: 'pro', name: 'Pro Miner', calories: 2000, ftcLimit: 2000, priceUSD: 15, priceFTC: 4000, color: '#FF9F1C', icon: Activity },
  { id: 'elite', name: 'Elite Miner', calories: 3000, ftcLimit: 3000, priceUSD: 20, priceFTC: 5500, color: '#9945FF', icon: Award },
  { id: 'ultra', name: 'Ultra Miner', calories: 5000, ftcLimit: 5000, priceUSD: 30, priceFTC: 8000, color: '#FF2E50', icon: Star },
  { id: 'max', name: 'Max Miner', calories: 10000, ftcLimit: 10000, priceUSD: 50, priceFTC: 12000, color: '#00F090', icon: Crown }
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
  
  // Sports Nutrition Trading States
  const [nutritionPrices, setNutritionPrices] = useState({});
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [tradeType, setTradeType] = useState('buy');

  // Sports Nutrition Products with base prices
  const NUTRITION_PRODUCTS = [
    { id: 'WPC80', name: 'Whey Protein Concentrate 80%', basePrice: 38.50, category: 'Protein' },
    { id: 'WPI90', name: 'Whey Protein Isolate 90%', basePrice: 72.00, category: 'Protein' },
    { id: 'CREATINE', name: 'Creatine Monohydrate Pure', basePrice: 22.50, category: 'Creatine' },
    { id: 'GLUTAMINE', name: 'L-Glutamine Powder', basePrice: 44.00, category: 'Amino' },
    { id: 'BCAA', name: 'BCAA 2:1:1 Instant', basePrice: 58.00, category: 'Amino' },
    { id: 'CASEIN', name: 'Casein Protein Micellar', basePrice: 52.00, category: 'Protein' },
    { id: 'PEA', name: 'Pea Protein Isolate 85%', basePrice: 32.00, category: 'Protein' },
    { id: 'BETA', name: 'Beta-Alanine Pure', basePrice: 35.00, category: 'Pre-Workout' },
    { id: 'CITRULLINE', name: 'L-Citrulline Malate 2:1', basePrice: 46.00, category: 'Pre-Workout' },
    { id: 'CAFFEINE', name: 'Caffeine Anhydrous USP', basePrice: 14.50, category: 'Pre-Workout' },
    { id: 'MALTO', name: 'Maltodextrin DE 18-20', basePrice: 9.50, category: 'Gainer' },
    { id: 'DEXTROSE', name: 'Dextrose Monohydrate', basePrice: 6.80, category: 'Gainer' },
  ];

  // Initialize and update nutrition prices with fluctuation
  useEffect(() => {
    const initPrices = {};
    NUTRITION_PRODUCTS.forEach(p => {
      initPrices[p.id] = {
        current: p.basePrice,
        change: 0,
        history: Array(20).fill(p.basePrice).map((v, i) => v * (0.95 + Math.random() * 0.1))
      };
    });
    setNutritionPrices(initPrices);
    
    // Update prices every 3 seconds
    const priceInterval = setInterval(() => {
      setNutritionPrices(prev => {
        const updated = { ...prev };
        NUTRITION_PRODUCTS.forEach(p => {
          if (updated[p.id]) {
            const change = (Math.random() - 0.48) * 2; // Slight upward bias
            const newPrice = updated[p.id].current * (1 + change / 100);
            const clampedPrice = Math.max(p.basePrice * 0.7, Math.min(p.basePrice * 1.5, newPrice));
            updated[p.id] = {
              current: clampedPrice,
              change: ((clampedPrice - updated[p.id].current) / updated[p.id].current) * 100,
              history: [...updated[p.id].history.slice(1), clampedPrice]
            };
          }
        });
        return updated;
      });
    }, 3000);
    
    return () => clearInterval(priceInterval);
  }, []);

  // Buy/Sell nutrition product
  const executeNutritionTrade = () => {
    if (!selectedNutrition || !isLoggedIn) return;
    
    const price = nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice;
    const totalCost = price * tradeAmount;
    
    if (tradeType === 'buy' && ftcBalance < totalCost) {
      toast.error('Insufficient FTC balance! Mine more FTC first.');
      return;
    }
    
    if (tradeType === 'buy') {
      const newBalance = ftcBalance - totalCost;
      setFtcBalance(newBalance);
      localStorage.setItem('ftc_mining_balance', newBalance.toString());
      toast.success(`Bought ${tradeAmount} unit(s) of ${selectedNutrition.name}!`, {
        description: `Total: ${totalCost.toFixed(2)} FTC`
      });
    } else {
      const newBalance = ftcBalance + totalCost;
      setFtcBalance(newBalance);
      localStorage.setItem('ftc_mining_balance', newBalance.toString());
      toast.success(`Sold ${tradeAmount} unit(s) of ${selectedNutrition.name}!`, {
        description: `Received: ${totalCost.toFixed(2)} FTC`
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
        setUser(JSON.parse(userData));
        
        // Fetch mining data from backend and merge with local
        await fetchMiningData(token);
      }
    };
    
    checkLogin();
  }, []);

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

  // Save calories to localStorage
  useEffect(() => {
    if (caloriesBurned > 0) {
      localStorage.setItem('ftc_calories_burned', caloriesBurned.toString());
    }
  }, [caloriesBurned]);

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
    
    // If already mining, activate 5-second BOOST
    if (isMining) {
      activateBoost();
      return;
    }
    
    setIsMining(true);
    toast.success('⚡ Mining Started!', {
      description: 'Converting your calories to FTC in real-time'
    });
    
    // Start real-time mining simulation
    const normalSpeed = 2000; // 2 seconds normal
    runMiningLoop(normalSpeed);
  };

  // Activate 5-second boost
  const activateBoost = () => {
    if (isBoosted) {
      toast.info('Boost already active!');
      return;
    }
    
    setIsBoosted(true);
    setBoostTimeLeft(5);
    toast.success('🚀 BOOST ACTIVATED! 5 seconds of 2x speed!');
    
    // Clear existing interval and run faster
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
    }
    runMiningLoop(400); // 5x faster during boost
    
    // Boost countdown
    const boostCountdown = setInterval(() => {
      setBoostTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(boostCountdown);
          setIsBoosted(false);
          // Return to normal speed
          if (miningIntervalRef.current) {
            clearInterval(miningIntervalRef.current);
          }
          runMiningLoop(2000);
          toast.info('Boost ended. Tap again for another boost!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Mining loop function - 1 Calorie = 1 FTC (1:1 ratio)
  const runMiningLoop = (speed) => {
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
    }
    
    miningIntervalRef.current = setInterval(() => {
      // Generate same increment for both calories and FTC (1:1 ratio)
      const increment = isBoosted ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 8) + 3;
      const maxLimit = activeSubscription?.calories || activeSubscription?.ftc_limit || 100;
      
      setCaloriesBurned(prev => {
        const newCalories = prev + increment;
        return Math.min(newCalories, maxLimit);
      });
      
      // FTC = Calories (1:1 ratio)
      setFtcMined(prev => {
        const newFtc = prev + increment;
        return Math.min(newFtc, maxLimit);
      });
    }, speed);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
      }
    };
  }, []);

  // Stop mining
  const stopMining = () => {
    setIsMining(false);
    setIsBoosted(false);
    setBoostTimeLeft(0);
    
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
    }
    
    toast.success(`⏹ Mining Stopped! You have ${ftcMined} FTC to transfer`);
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
          is_free_trial: selectedPlan.isFree || false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionRequest(data.request);
        setShowPlanModal(false);
        setTransactionHash('');
        toast.success(selectedPlan.isFree ? '✅ Free Trial request submitted!' : '✅ Subscription request submitted!', {
          description: selectedPlan.isFree ? 'Admin will approve your 7-day free trial' : 'Admin will verify payment and activate your plan'
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('Failed to submit request');
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
          
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00F090]/20 to-[#FFD700]/20 rounded-lg border border-[#FFD700]/30">
                <Wallet className="h-4 w-4 text-[#FFD700]" />
                <span className="font-bold text-[#FFD700]">{ftcBalance.toLocaleString()} FTC</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
              >
                Login to Mine
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
        <div className="grid md:grid-cols-2 gap-8 mb-12">
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
                  {ftcMined.toLocaleString()}
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
                <p className="text-2xl font-bold text-[#FF9F1C]">{caloriesBurned}</p>
                <p className="text-xs text-white/60">Calories</p>
              </div>
              <div className="text-2xl text-white/20">=</div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00F090]">{ftcMined}</p>
                <p className="text-xs text-white/60">FTC</p>
              </div>
            </div>
            
            {/* Mining Button */}
            <button
              onClick={isMining ? (isBoosted ? stopMining : startMining) : startMining}
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
                  ? '⏹ STOP MINING' 
                  : '🚀 TAP FOR 5s BOOST!'
                : '⚡ START MINING'
              }
            </button>
            
            {isMining && !isBoosted && (
              <p className="text-xs text-white/40 mt-2">Tap again for 5-second speed boost!</p>
            )}
            
            {/* Transfer to Balance Button */}
            {ftcMined > 0 && (
              <button
                onClick={transferToBalance}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#FF2E50] text-white font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 animate-pulse"
                data-testid="transfer-btn"
              >
                <Wallet className="h-5 w-5" />
                Transfer {ftcMined} FTC to Balance
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
                </div>
              ) : subscriptionRequest ? (
                <div className="p-4 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#FFD700]">{subscriptionRequest.plan_name}</span>
                    <span className="px-2 py-1 bg-[#FFD700] text-black text-xs font-bold rounded">PENDING</span>
                  </div>
                  <p className="text-sm text-white/60">Awaiting admin activation</p>
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

        {/* Sports Nutrition Trading Section */}
        <div className="mt-12 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">🏋️</span>
              <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] to-[#FFD700]">
                SPORTS NUTRITION TRADING
              </h2>
              <span className="text-3xl">💪</span>
            </div>
            <p className="text-white/60 text-sm">Trade with your mined FTC • Real-time prices • Global Market</p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {NUTRITION_PRODUCTS.map((product) => {
              const priceData = nutritionPrices[product.id];
              const isUp = priceData?.change >= 0;
              
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-4 cursor-pointer border border-white/10 hover:border-[#FFD700]/50 transition-all"
                  onClick={() => {
                    setSelectedNutrition(product);
                    setShowNutritionModal(true);
                  }}
                  data-testid={`nutrition-${product.id}`}
                >
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
                </motion.div>
              );
            })}
          </div>
        </div>

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
                  <div className="mb-4">
                    <p className="text-sm text-white/60 mb-2">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('USD')}
                        className={`p-3 rounded-lg border transition-all ${
                          paymentMethod === 'USD' ? 'border-[#00F090] bg-[#00F090]/10' : 'border-white/10'
                        }`}
                      >
                        <p className="font-bold text-white">${selectedPlan.priceUSD}</p>
                        <p className="text-xs text-white/60">USD</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('FTC')}
                        className={`p-3 rounded-lg border transition-all ${
                          paymentMethod === 'FTC' ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-white/10'
                        }`}
                      >
                        <p className="font-bold text-[#FFD700]">{selectedPlan.priceFTC}</p>
                        <p className="text-xs text-white/60">FTC</p>
                      </button>
                    </div>
                  </div>
                  
                  {/* Transaction Hash Input */}
                  <div className="mb-6">
                    <label className="text-sm text-white/60 mb-2 block">
                      Transaction Hash <span className="text-[#FF2E50]">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="Enter your payment transaction hash"
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#00F090]/50 outline-none font-mono text-sm"
                      data-testid="transaction-hash-input"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      After sending {paymentMethod === 'USD' ? `$${selectedPlan.priceUSD}` : `${selectedPlan.priceFTC} FTC`}, paste the transaction hash here
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
                {isSubmitting ? 'Submitting...' : !isLoggedIn ? 'Login First' : selectedPlan.isFree ? 'Request Free Trial' : 'Submit Request'}
              </button>
              
              <p className="text-xs text-white/40 text-center mt-4">
                {selectedPlan.isFree 
                  ? 'Admin will approve your free trial request' 
                  : 'Admin will verify payment and activate your subscription immediately'
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
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                disabled={!isLoggedIn || (tradeType === 'buy' && ftcBalance < (nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount)}
                className={`w-full py-4 font-bold rounded-lg transition-all disabled:opacity-50 ${
                  tradeType === 'buy' 
                    ? 'bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black hover:brightness-110'
                    : 'bg-gradient-to-r from-[#FF2E50] to-[#FF9F1C] text-white hover:brightness-110'
                }`}
                data-testid="execute-trade-btn"
              >
                {!isLoggedIn ? 'Login First' : tradeType === 'buy' ? `Buy for ${((nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount).toFixed(2)} FTC` : `Sell for ${((nutritionPrices[selectedNutrition.id]?.current || selectedNutrition.basePrice) * tradeAmount).toFixed(2)} FTC`}
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/50 text-sm mt-12">
        <p className="mb-2">⚡ FTC Mining | 1 Calorie = 1 FTC</p>
        <p className="text-xs text-white/30">© 2026 Future Trade | Powered by VN1 HEALTHBAZAR OPC Pvt Ltd</p>
      </footer>
    </div>
  );
};

export default FtcMining;
