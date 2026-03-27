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

  // Check login and fetch mining data
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
        
        // Fetch mining data
        await fetchMiningData(token);
      }
    };
    
    checkLogin();
  }, []);

  // Fetch mining data from backend
  const fetchMiningData = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/mining/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFtcBalance(data.ftc_balance || 0);
        setCaloriesBurned(data.calories_burned || 0);
        setFtcMined(data.ftc_mined_today || 0);
        setActiveSubscription(data.active_subscription);
        setSubscriptionRequest(data.pending_request);
        setIsMining(data.is_mining || false);
      }
    } catch (error) {
      console.log('Mining data fetch error:', error);
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

  // Mining loop function
  const runMiningLoop = (speed) => {
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
    }
    
    miningIntervalRef.current = setInterval(() => {
      setCaloriesBurned(prev => {
        const increment = isBoosted ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 10) + 5;
        const newCalories = prev + increment;
        const maxCalories = activeSubscription?.calories || 500;
        return Math.min(newCalories, maxCalories);
      });
      
      setFtcMined(prev => {
        const increment = isBoosted ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 5) + 1;
        const newFtc = prev + increment;
        const maxFtc = activeSubscription?.ftc_limit || 500;
        return Math.min(newFtc, maxFtc);
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
    
    // Save mined FTC to balance
    setFtcBalance(prev => prev + ftcMined);
    localStorage.setItem('ftc_mining_balance', (ftcBalance + ftcMined).toString());
    
    toast.success(`💰 Mining Stopped! Earned ${ftcMined} FTC`);
    setFtcMined(0);
    setCaloriesBurned(0);
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
              <span className="text-sm text-white/80">Converting calories to FTC in real-time</span>
            </>
          ) : (
            <>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded">STANDBY</span>
              <span className="text-sm text-white/60">Activate mining to start earning FTC</span>
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

        {/* Link to Nutrient Trading */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Ready to trade your FTC?</h3>
          <p className="text-white/60 mb-6">Use your mined FTC to trade raw nutrients in the global marketplace</p>
          <Link
            to="/nutrition-trading"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
          >
            Go to Nutrient Trading
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/50 text-sm mt-12">
        <p className="mb-2">⚡ FTC Mining | 1 Calorie = 1 FTC</p>
        <p className="text-xs text-white/30">© 2026 Future Trade | Powered by VN1 HEALTHBAZAR OPC Pvt Ltd</p>
      </footer>
    </div>
  );
};

export default FtcMining;
