import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Flame, Activity, Award, Clock, Check, Star, 
  ArrowRight, Wallet, TrendingUp, Shield, ExternalLink,
  Volume2, VolumeX, Gift, Crown, Target
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Subscription Plans
const SUBSCRIPTION_PLANS = [
  { id: 'basic', name: 'Basic Miner', calories: 500, ftcLimit: 500, priceUSD: 5, priceFTC: 1500, color: '#00F090', icon: Zap },
  { id: 'standard', name: 'Standard Miner', calories: 1000, ftcLimit: 1000, priceUSD: 9, priceFTC: 2500, color: '#FFD700', icon: Flame },
  { id: 'pro', name: 'Pro Miner', calories: 2000, ftcLimit: 2000, priceUSD: 15, priceFTC: 4000, color: '#FF9F1C', icon: Activity },
  { id: 'elite', name: 'Elite Miner', calories: 3000, ftcLimit: 3000, priceUSD: 20, priceFTC: 5500, color: '#9945FF', icon: Award },
  { id: 'ultra', name: 'Ultra Miner', calories: 5000, ftcLimit: 5000, priceUSD: 30, priceFTC: 8000, color: '#FF2E50', icon: Star },
  { id: 'max', name: 'Max Miner', calories: 10000, ftcLimit: 10000, priceUSD: 50, priceFTC: 12000, color: '#00F090', icon: Crown }
];

const FtcMining = () => {
  const navigate = useNavigate();
  const [showIntroVideo, setShowIntroVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [ftcBalance, setFtcBalance] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [ftcMined, setFtcMined] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionRequest, setSubscriptionRequest] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('USD');
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
    
    setIsMining(true);
    toast.success('⚡ Mining Started!', {
      description: 'Converting your calories to FTC'
    });
    
    // Simulate mining (in real app, this would fetch from StepsApp)
    const miningInterval = setInterval(() => {
      setCaloriesBurned(prev => {
        const newCalories = prev + Math.floor(Math.random() * 10) + 5;
        const maxCalories = activeSubscription?.calories || 500;
        return Math.min(newCalories, maxCalories);
      });
      
      setFtcMined(prev => {
        const newFtc = prev + Math.floor(Math.random() * 5) + 1;
        const maxFtc = activeSubscription?.ftc_limit || 500;
        return Math.min(newFtc, maxFtc);
      });
    }, 2000);
    
    // Store interval ID to clear later
    localStorage.setItem('miningInterval', miningInterval);
  };

  // Stop mining
  const stopMining = () => {
    setIsMining(false);
    const intervalId = localStorage.getItem('miningInterval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem('miningInterval');
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
          payment_method: paymentMethod,
          price: paymentMethod === 'USD' ? selectedPlan.priceUSD : selectedPlan.priceFTC
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionRequest(data.request);
        setShowPlanModal(false);
        toast.success('✅ Subscription request submitted!', {
          description: 'Admin will activate your plan shortly'
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
              
              <div className="text-center z-10">
                <div className="text-5xl mb-2">💰</div>
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
              onClick={isMining ? stopMining : startMining}
              disabled={!isLoggedIn}
              className={`mt-6 px-8 py-4 rounded-full font-black text-lg transition-all ${
                isMining 
                  ? 'bg-gradient-to-r from-[#FF2E50] to-[#FF9F1C] text-white' 
                  : 'bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black'
              } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
            >
              {isMining ? '⏹ STOP MINING' : '⚡ START MINING'}
            </button>
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
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-6 border-2 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id ? `border-[${plan.color}]` : 'border-transparent hover:border-white/20'
              }`}
              onClick={() => {
                setSelectedPlan(plan);
                setShowPlanModal(true);
              }}
              style={{ borderColor: selectedPlan?.id === plan.id ? plan.color : 'transparent' }}
            >
              <div className="flex items-center justify-between mb-4">
                <plan.icon className="h-8 w-8" style={{ color: plan.color }} />
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
                  {plan.ftcLimit} FTC/day
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: plan.color }}>{plan.name}</h3>
              <p className="text-sm text-white/60 mb-4">{plan.calories} calories conversion</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-white">${plan.priceUSD}</p>
                  <p className="text-xs text-white/40">or {plan.priceFTC} FTC</p>
                </div>
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
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <selectedPlan.icon className="h-6 w-6" style={{ color: selectedPlan.color }} />
                {selectedPlan.name}
              </h3>
              
              <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: `${selectedPlan.color}15` }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Daily FTC Limit</p>
                    <p className="text-xl font-bold" style={{ color: selectedPlan.color }}>{selectedPlan.ftcLimit} FTC</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Calories</p>
                    <p className="text-xl font-bold text-white">{selectedPlan.calories}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
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
              
              <button
                onClick={submitSubscriptionRequest}
                disabled={isSubmitting || !isLoggedIn}
                className="w-full py-4 bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : isLoggedIn ? 'Request Activation' : 'Login First'}
              </button>
              
              <p className="text-xs text-white/40 text-center mt-4">
                Admin will review and activate your subscription within 24 hours
              </p>
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
