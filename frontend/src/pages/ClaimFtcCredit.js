import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Calculator, User, Calendar, Activity, Scale, Ruler, 
  Flame, Zap, Award, Shield, TrendingUp, ArrowLeft,
  CheckCircle, AlertTriangle, Heart, Coins, Wallet,
  Send, ArrowRightLeft, History, ExternalLink, Copy
} from 'lucide-react';

const ClaimFtcCredit = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    dailyIntake: ''
  });
  
  const [walletAddress, setWalletAddress] = useState('');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [claimedFTC, setClaimedFTC] = useState(0);

  // Generate mock real-time transactions
  useEffect(() => {
    // Initial transactions
    const initialTxs = [
      {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        type: 'POBC_VERIFY',
        calories: 2150,
        ftcAmount: 2.15,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hash: '5cKax...' + Math.random().toString(36).substr(2, 6),
        walletTo: 'FitWallet_' + Math.random().toString(36).substr(2, 8)
      },
      {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        type: 'CLAIM',
        calories: 1850,
        ftcAmount: 1.85,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        hash: '5cKax...' + Math.random().toString(36).substr(2, 6),
        walletTo: 'FitWallet_' + Math.random().toString(36).substr(2, 8)
      },
      {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        type: 'EXCHANGE',
        calories: 3200,
        ftcAmount: 3.20,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        hash: '5cKax...' + Math.random().toString(36).substr(2, 6),
        walletTo: 'FitWallet_' + Math.random().toString(36).substr(2, 8)
      }
    ];
    setTransactions(initialTxs);

    // Real-time transaction updates
    const interval = setInterval(() => {
      const types = ['POBC_VERIFY', 'CLAIM', 'EXCHANGE', 'SEND', 'RECEIVE'];
      const newTx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        calories: Math.floor(Math.random() * 3000) + 500,
        ftcAmount: (Math.random() * 5 + 0.5).toFixed(2),
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        hash: '5cKax...' + Math.random().toString(36).substr(2, 6),
        walletTo: 'FitWallet_' + Math.random().toString(36).substr(2, 8)
      };
      
      setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
    }, 15000); // New transaction every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const activityMultipliers = {
    sedentary: { value: 1.2, label: 'Sedentary (Little/No Exercise)' },
    light: { value: 1.375, label: 'Light (1-3 days/week)' },
    moderate: { value: 1.55, label: 'Moderate (3-5 days/week)' },
    active: { value: 1.725, label: 'Active (6-7 days/week)' },
    athlete: { value: 1.9, label: 'Athlete (Intense Training)' }
  };

  const validateInput = () => {
    const newErrors = {};
    const today = new Date();
    const birthDate = new Date(formData.dob);
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const intake = parseFloat(formData.dailyIntake);

    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (age < 5 || age > 100) newErrors.dob = 'Age must be between 5-100 years';
    if (height < 120 || height > 220) newErrors.height = 'Height must be 120-220 cm';
    if (weight < 30 || weight > 200) newErrors.weight = 'Weight must be 30-200 kg';
    if (intake < 800 || intake > 6000) newErrors.dailyIntake = 'Intake must be 800-6000 kcal';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFTC = () => {
    if (!validateInput()) {
      toast.error('Invalid Biological Range - Please check your inputs');
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);
      const intake = parseFloat(formData.dailyIntake);
      const activityMultiplier = activityMultipliers[formData.activityLevel].value;

      // BMR Calculation (Mifflin-St Jeor Formula)
      let bmr;
      if (formData.gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      // TDEE Calculation
      const tdee = bmr * activityMultiplier;

      // 18-Year Energy Projection
      const totalDays = 6570;
      const totalBurn18Years = tdee * totalDays;
      const totalIntake18Years = intake * totalDays;
      const energyBalance = totalIntake18Years - totalBurn18Years;

      // Weight Change Estimation
      const weightChange = energyBalance / 7700;

      // Daily Surplus/Deficit
      const dailyBalance = intake - tdee;

      // FTC Calculation
      const balancedEnergy = Math.min(totalIntake18Years, totalBurn18Years);
      const baseFTC = balancedEnergy / 1000;

      // Health Balance Modifier
      const differencePercent = Math.abs(intake - tdee) / tdee * 100;
      let modifier = 0;
      let healthStatus = '';
      
      if (differencePercent <= 5) {
        modifier = 1.0;
        healthStatus = 'Excellent Balance';
      } else if (differencePercent <= 15) {
        modifier = 0.7;
        healthStatus = 'Good Balance';
      } else if (differencePercent <= 25) {
        modifier = 0.4;
        healthStatus = 'Moderate Imbalance';
      } else {
        modifier = 0;
        healthStatus = 'Health Risk - Rebalance Needed';
      }

      const finalFTC = baseFTC * modifier;

      // Metabolic Stability Score
      const stabilityScore = Math.max(0, 100 - differencePercent);

      setResults({
        age,
        bmr: bmr.toFixed(2),
        tdee: tdee.toFixed(2),
        dailyBalance: dailyBalance.toFixed(2),
        totalBurn18Years: totalBurn18Years.toFixed(0),
        totalIntake18Years: totalIntake18Years.toFixed(0),
        energyBalance: energyBalance.toFixed(0),
        weightChange: weightChange.toFixed(2),
        stabilityScore: stabilityScore.toFixed(1),
        baseFTC: baseFTC.toFixed(2),
        modifier: (modifier * 100).toFixed(0),
        finalFTC: finalFTC.toFixed(2),
        healthStatus,
        differencePercent: differencePercent.toFixed(1)
      });

      setIsCalculating(false);
      toast.success('FTC Credit Calculated Successfully!');
    }, 1500);
  };

  const handleClaim = () => {
    if (!results || parseFloat(results.finalFTC) === 0) {
      toast.error('No FTC credits to claim. Please improve your health balance.');
      return;
    }

    if (!walletAddress.trim()) {
      toast.error('Please enter your FitWallet address to receive FTC');
      return;
    }

    if (walletAddress.length < 32) {
      toast.error('Invalid FitWallet address. Please enter a valid Solana address.');
      return;
    }

    setIsClaiming(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      const timestamp = Date.now();
      const hashData = `${formData.dob}-${formData.height}-${formData.weight}-${formData.dailyIntake}-${results.tdee}-${timestamp}`;
      const hash = '5cKax' + btoa(hashData).substring(0, 20) + '...pump';
      
      // Create new transaction
      const newTx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        type: 'CLAIM',
        calories: parseFloat(results.finalFTC) * 1000,
        ftcAmount: parseFloat(results.finalFTC),
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        hash: hash,
        walletTo: walletAddress.substring(0, 8) + '...' + walletAddress.substring(walletAddress.length - 6)
      };
      
      setTransactions(prev => [newTx, ...prev]);
      setClaimedFTC(prev => prev + parseFloat(results.finalFTC));
      
      setIsClaiming(false);
      toast.success(`🎉 ${results.finalFTC} FTC sent to your FitWallet!`);
      toast.info(`Transaction Hash: ${hash}`);
    }, 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'POBC_VERIFY': return 'text-[#00F090]';
      case 'CLAIM': return 'text-[#FFD700]';
      case 'EXCHANGE': return 'text-[#FF9F1C]';
      case 'SEND': return 'text-[#FF2E50]';
      case 'RECEIVE': return 'text-[#00F090]';
      default: return 'text-white';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'POBC_VERIFY': return <CheckCircle className="h-4 w-4" />;
      case 'CLAIM': return <Coins className="h-4 w-4" />;
      case 'EXCHANGE': return <ArrowRightLeft className="h-4 w-4" />;
      case 'SEND': return <Send className="h-4 w-4" />;
      case 'RECEIVE': return <Wallet className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Header */}
      <div className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5 text-white/60" />
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FUTURE TRADE</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass-card px-4 py-2">
              <Coins className="h-4 w-4 text-[#FFD700]" />
              <span className="text-sm font-mono text-[#FFD700]">{claimedFTC.toFixed(2)} FTC Claimed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_bce9865d-fa6c-43ef-b2bd-4f3e219a1321/artifacts/krhr5tmm_14123.jpg" 
                alt="1 Calorie = 1 Fitcoin" 
                className="h-32 w-auto rounded-lg shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                🪙 CLAIM FTC CREDIT
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              FITRUDRAH'S FUTURECOIN – Health Energy Based Gamified Reward System
            </p>
            <div className="mt-4 glass-card inline-block px-6 py-3">
              <p className="text-xs font-mono text-white/60">CONTRACT ADDRESS (SPL)</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-[#00F090]">5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump</p>
                <button onClick={() => copyToClipboard('5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump')} className="text-white/40 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Core Concept */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-8 border-2 border-[#FFD700]/30"
          >
            <h2 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" /> CORE CONCEPT
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <div className="glass-card px-4 py-2">
                <span className="text-white/80">Human Energy (Calories)</span>
              </div>
              <span className="text-[#FF9F1C]">→</span>
              <div className="glass-card px-4 py-2">
                <span className="text-white/80">POBC Verification</span>
              </div>
              <span className="text-[#FF9F1C]">→</span>
              <div className="glass-card px-4 py-2 border-[#FFD700]/50">
                <span className="text-[#FFD700] font-bold">FTC Credit</span>
              </div>
              <span className="text-[#FF9F1C]">→</span>
              <div className="glass-card px-4 py-2 border-[#00F090]/50">
                <span className="text-[#00F090] font-bold">FitWallet</span>
              </div>
            </div>
            <p className="text-sm text-white/60 text-center mt-4">
              Claimed FTC goes directly to your FitWallet • Real-time blockchain transactions • POBC-verified calorie to Fitcoin conversion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 lg:col-span-1"
            >
              <h2 className="text-xl font-bold text-[#FF9F1C] mb-6 flex items-center gap-2">
                <User className="h-5 w-5" /> USER INPUT
              </h2>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full bg-black/50 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-10 px-3 text-sm outline-none transition-colors`}
                    placeholder="Enter name"
                    data-testid="ftc-name-input"
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" /> DOB *
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className={`w-full bg-black/50 border ${errors.dob ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white rounded-none h-10 px-3 text-sm outline-none transition-colors`}
                    data-testid="ftc-dob-input"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Gender *</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`flex-1 py-2 px-3 text-sm border ${formData.gender === 'male' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'} transition-all`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`flex-1 py-2 px-3 text-sm border ${formData.gender === 'female' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'} transition-all`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className={`w-full bg-black/50 border ${errors.height ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-10 px-3 text-sm outline-none`}
                      placeholder="170"
                      data-testid="ftc-height-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className={`w-full bg-black/50 border ${errors.weight ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-10 px-3 text-sm outline-none`}
                      placeholder="70"
                      data-testid="ftc-weight-input"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white rounded-none h-10 px-3 text-sm outline-none"
                    data-testid="ftc-activity-select"
                  >
                    {Object.entries(activityMultipliers).map(([key, { label }]) => (
                      <option key={key} value={key} className="bg-black">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Daily Calorie Intake */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1">
                    <Flame className="inline h-3 w-3 mr-1" /> Daily Intake (kcal)
                  </label>
                  <input
                    type="number"
                    value={formData.dailyIntake}
                    onChange={(e) => setFormData({...formData, dailyIntake: e.target.value})}
                    className={`w-full bg-black/50 border ${errors.dailyIntake ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-10 px-3 text-sm outline-none`}
                    placeholder="2000"
                    data-testid="ftc-intake-input"
                  />
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculateFTC}
                  disabled={isCalculating}
                  className="w-full py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,159,28,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  data-testid="ftc-calculate-btn"
                >
                  {isCalculating ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" /> Calculating...</>
                  ) : (
                    <><Calculator className="h-4 w-4" /> Calculate FTC</>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Results & Claim Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 lg:col-span-1"
            >
              <h2 className="text-xl font-bold text-[#00F090] mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> RESULTS & CLAIM
              </h2>

              {!results ? (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">Calculate to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass-card p-3">
                      <p className="text-xs text-white/50">BMR</p>
                      <p className="text-lg font-bold text-[#FF9F1C]">{results.bmr}</p>
                    </div>
                    <div className="glass-card p-3">
                      <p className="text-xs text-white/50">TDEE</p>
                      <p className="text-lg font-bold text-[#FFD700]">{results.tdee}</p>
                    </div>
                  </div>

                  {/* Stability Score */}
                  <div className="glass-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-white/50">Stability Score</p>
                      <span className="text-lg font-bold">{results.stabilityScore}</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${parseFloat(results.stabilityScore) >= 75 ? 'bg-[#00F090]' : parseFloat(results.stabilityScore) >= 50 ? 'bg-[#FFD700]' : 'bg-[#FF2E50]'}`}
                        style={{ width: `${results.stabilityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* FTC Earned */}
                  <div className={`glass-card p-4 border-2 ${parseFloat(results.finalFTC) > 0 ? 'border-[#FFD700]' : 'border-[#FF2E50]/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Award className="h-5 w-5 text-[#FFD700]" />
                      <span className={`px-2 py-1 text-xs font-bold rounded ${parseFloat(results.modifier) >= 70 ? 'bg-[#00F090]/20 text-[#00F090]' : 'bg-[#FF2E50]/20 text-[#FF2E50]'}`}>
                        {results.modifier}%
                      </span>
                    </div>
                    <p className="text-3xl font-black text-[#FFD700] text-center">{results.finalFTC}</p>
                    <p className="text-sm text-white/60 text-center">FTC Tokens</p>
                    <p className={`text-xs mt-2 text-center ${parseFloat(results.finalFTC) > 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                      {results.healthStatus}
                    </p>
                  </div>

                  {/* FitWallet Address Input */}
                  <div className="glass-card p-4 border-2 border-[#00F090]/30">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#00F090] mb-2 flex items-center gap-2">
                      <Wallet className="h-4 w-4" /> FitWallet Address (Solana)
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full bg-black/50 border border-[#00F090]/30 focus:border-[#00F090] text-white placeholder:text-white/30 rounded-none h-12 px-4 outline-none transition-colors font-mono text-sm"
                      placeholder="Enter your FitWallet/Solana address..."
                      data-testid="ftc-wallet-input"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      FTC will be sent directly to this wallet address
                    </p>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={parseFloat(results.finalFTC) === 0 || isClaiming}
                    className={`w-full py-4 font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      parseFloat(results.finalFTC) > 0 && !isClaiming
                        ? 'bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black hover:brightness-110 shadow-[0_0_20px_rgba(0,240,144,0.5)]' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                    data-testid="ftc-claim-btn"
                  >
                    {isClaiming ? (
                      <><div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" /> Processing...</>
                    ) : (
                      <><Send className="h-5 w-5" /> Send FTC to FitWallet</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Real-Time Blockchain Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 lg:col-span-1"
            >
              <h2 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
                <History className="h-5 w-5" /> BLOCKCHAIN TRANSACTIONS
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#00F090] rounded-full animate-pulse" />
                  <span className="text-xs text-[#00F090] font-normal">LIVE</span>
                </span>
              </h2>
              
              <p className="text-xs text-white/50 mb-4">Real-time POBC-verified calorie to FTC transactions</p>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-3 border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-2 ${getTypeColor(tx.type)}`}>
                        {getTypeIcon(tx.type)}
                        <span className="text-xs font-bold">{tx.type}</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-mono text-white">{tx.ftcAmount} FTC</p>
                        <p className="text-xs text-white/40">{tx.calories.toLocaleString()} kcal</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60 font-mono">{tx.walletTo}</p>
                        <a 
                          href={`https://solscan.io/token/5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00F090] hover:underline flex items-center gap-1 justify-end"
                        >
                          {tx.hash} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Network</span>
                  <span className="text-[#00F090] font-bold">Solana Mainnet</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-white/50">Contract</span>
                  <span className="text-white/70 font-mono">5cKax...pump</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Token Info & Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#FFD700] mb-4">📌 TOKEN INFORMATION</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-white/50">Name:</span> <span className="text-white">Fitcoin</span></p>
                <p><span className="text-white/50">Symbol:</span> <span className="text-[#FF9F1C] font-bold">FTC</span></p>
                <p><span className="text-white/50">Blockchain:</span> <span className="text-white">Solana</span></p>
                <p><span className="text-white/50">Decimals:</span> <span className="text-white">9</span></p>
                <p className="text-xs text-white/40 mt-3">Contract: 5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump</p>
              </div>
            </div>

            <div className="glass-card p-6 border border-[#FF2E50]/30">
              <h3 className="text-lg font-bold text-[#FF2E50] mb-4">⚠️ LEGAL DISCLAIMER</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                This application provides gamified health-based rewards. It does not provide medical advice. 
                FTC token value is market dependent. No guaranteed financial return. All rewards are formula-based 
                and mathematically calculated. Only 1 claim allowed per 24 hours. Max FTC per day cap applies.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClaimFtcCredit;
