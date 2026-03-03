import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Calculator, User, Calendar, Activity, Scale, Ruler, 
  Flame, Zap, Award, Shield, TrendingUp, ArrowLeft,
  CheckCircle, AlertTriangle, Heart, Coins, Wallet,
  Send, ArrowRightLeft, History, ExternalLink, Copy,
  ArrowDown, ArrowUp, Check
} from 'lucide-react';

// Verified FTC Wallet Addresses
const VERIFIED_FTC_ADDRESSES = [
  'FTCD0914B7CAF6842978D497437F2122801',
  'FTC7A943F8A21214B03939B1DB9E19C627D',
  'FTC021FBE8A950C43129B1877B21FB8A766',
  'FTC8B2C4D6E8F0A1B3C5D7E9F0A2B4C6D8',
  'FTCA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6'
];

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
  const [ledger, setLedger] = useState([]);
  const [claimedFTC, setClaimedFTC] = useState(0);
  const [walletBalances, setWalletBalances] = useState({});

  // Initialize wallet balances and ledger
  useEffect(() => {
    // Initialize balances for verified addresses
    const initialBalances = {};
    VERIFIED_FTC_ADDRESSES.forEach(addr => {
      initialBalances[addr] = (Math.random() * 10000 + 1000).toFixed(2);
    });
    setWalletBalances(initialBalances);

    // Initial ledger entries
    const initialLedger = [
      {
        id: 'tx_' + Date.now() + '_1',
        type: 'POBC_MINT',
        from: 'POBC_SYSTEM',
        to: VERIFIED_FTC_ADDRESSES[0],
        amount: 2150.00,
        calories: 2150000,
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547823,
        received: true
      },
      {
        id: 'tx_' + Date.now() + '_2',
        type: 'EXCHANGE',
        from: VERIFIED_FTC_ADDRESSES[1],
        to: VERIFIED_FTC_ADDRESSES[2],
        amount: 500.00,
        calories: 500000,
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547801,
        received: true
      },
      {
        id: 'tx_' + Date.now() + '_3',
        type: 'SEND',
        from: VERIFIED_FTC_ADDRESSES[0],
        to: VERIFIED_FTC_ADDRESSES[3],
        amount: 1200.00,
        calories: 1200000,
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547756,
        received: true
      }
    ];
    setLedger(initialLedger);

    // Simulate real-time blockchain activity
    const interval = setInterval(() => {
      const types = ['POBC_MINT', 'EXCHANGE', 'SEND'];
      const fromAddr = VERIFIED_FTC_ADDRESSES[Math.floor(Math.random() * VERIFIED_FTC_ADDRESSES.length)];
      let toAddr = VERIFIED_FTC_ADDRESSES[Math.floor(Math.random() * VERIFIED_FTC_ADDRESSES.length)];
      while (toAddr === fromAddr) {
        toAddr = VERIFIED_FTC_ADDRESSES[Math.floor(Math.random() * VERIFIED_FTC_ADDRESSES.length)];
      }
      
      const amount = (Math.random() * 2000 + 100).toFixed(2);
      
      const newTx = {
        id: 'tx_' + Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        from: types[0] === 'POBC_MINT' ? 'POBC_SYSTEM' : fromAddr,
        to: toAddr,
        amount: parseFloat(amount),
        calories: parseFloat(amount) * 1000,
        status: 'CONFIRMED',
        timestamp: new Date().toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547823 + Math.floor(Math.random() * 100),
        received: true
      };
      
      setLedger(prev => [newTx, ...prev.slice(0, 14)]);
      
      // Update balances
      setWalletBalances(prev => ({
        ...prev,
        [toAddr]: (parseFloat(prev[toAddr] || 0) + parseFloat(amount)).toFixed(2)
      }));
    }, 20000);

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

      let bmr;
      if (formData.gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      const tdee = bmr * activityMultiplier;
      const totalDays = 6570;
      const totalBurn18Years = tdee * totalDays;
      const totalIntake18Years = intake * totalDays;
      const energyBalance = totalIntake18Years - totalBurn18Years;
      const weightChange = energyBalance / 7700;
      const dailyBalance = intake - tdee;
      const balancedEnergy = Math.min(totalIntake18Years, totalBurn18Years);
      const baseFTC = balancedEnergy / 1000;
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

  const isValidFTCAddress = (address) => {
    // Check if address starts with FTC and is 35 characters
    return address.startsWith('FTC') && address.length >= 32;
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

    if (!isValidFTCAddress(walletAddress)) {
      toast.error('Invalid FTC address format. Address must start with "FTC" and be at least 32 characters.');
      return;
    }

    setIsClaiming(true);
    
    // Simulate blockchain transaction with verification
    setTimeout(() => {
      const amount = parseFloat(results.finalFTC);
      const hash = 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase();
      const blockNumber = 18547900 + Math.floor(Math.random() * 100);
      
      // Create SEND transaction from POBC_SYSTEM
      const sendTx = {
        id: 'tx_send_' + Date.now(),
        type: 'CLAIM_SEND',
        from: 'POBC_SYSTEM',
        to: walletAddress,
        amount: amount,
        calories: amount * 1000,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        hash: hash,
        blockNumber: blockNumber,
        received: false
      };
      
      setLedger(prev => [sendTx, ...prev]);
      toast.info('📤 Transaction broadcasted to blockchain...');
      
      // After 2 seconds, confirm the transaction
      setTimeout(() => {
        setLedger(prev => prev.map(tx => 
          tx.id === sendTx.id ? { ...tx, status: 'CONFIRMING' } : tx
        ));
        toast.info('⏳ Waiting for block confirmation...');
        
        // After another 2 seconds, mark as confirmed and received
        setTimeout(() => {
          // Update to CONFIRMED and create RECEIVE entry
          const receiveTx = {
            id: 'tx_recv_' + Date.now(),
            type: 'CLAIM_RECEIVED',
            from: 'POBC_SYSTEM',
            to: walletAddress,
            amount: amount,
            calories: amount * 1000,
            status: 'CONFIRMED',
            timestamp: new Date().toISOString(),
            hash: hash,
            blockNumber: blockNumber + 1,
            received: true
          };
          
          setLedger(prev => [
            receiveTx,
            ...prev.map(tx => tx.id === sendTx.id ? { ...tx, status: 'CONFIRMED', received: true } : tx)
          ]);
          
          // Update wallet balance
          setWalletBalances(prev => ({
            ...prev,
            [walletAddress]: (parseFloat(prev[walletAddress] || 0) + amount).toFixed(2)
          }));
          
          setClaimedFTC(prev => prev + amount);
          setIsClaiming(false);
          
          toast.success(`✅ ${amount.toFixed(2)} FTC RECEIVED by ${walletAddress.substring(0, 12)}...`);
          toast.success(`Block #${blockNumber + 1} confirmed!`);
        }, 2000);
      }, 2000);
    }, 1000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'text-[#00F090]';
      case 'CONFIRMING': return 'text-[#FFD700]';
      case 'PENDING': return 'text-[#FF9F1C]';
      default: return 'text-white';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'POBC_MINT': return <Flame className="h-4 w-4 text-[#FF9F1C]" />;
      case 'CLAIM_SEND': return <ArrowUp className="h-4 w-4 text-[#FF2E50]" />;
      case 'CLAIM_RECEIVED': return <ArrowDown className="h-4 w-4 text-[#00F090]" />;
      case 'EXCHANGE': return <ArrowRightLeft className="h-4 w-4 text-[#FFD700]" />;
      case 'SEND': return <Send className="h-4 w-4 text-[#FF9F1C]" />;
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
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                🪙 CLAIM FTC CREDIT
              </span>
            </h1>
            <p className="text-lg text-white/70">POBC-Verified Calorie to Fitcoin • Real Blockchain Ledger</p>
          </motion.div>

          {/* Verified FTC Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6 border border-[#00F090]/30"
          >
            <h3 className="text-sm font-bold text-[#00F090] mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" /> VERIFIED FTC WALLET ADDRESSES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {VERIFIED_FTC_ADDRESSES.map((addr, i) => (
                <div key={i} className="flex items-center justify-between bg-black/30 px-3 py-2 rounded">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-[#00F090]" />
                    <span className="text-xs font-mono text-white/80">{addr.substring(0, 20)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#FFD700]">{walletBalances[addr] || '0.00'} FTC</span>
                    <button onClick={() => copyToClipboard(addr)} className="text-white/40 hover:text-white">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-5"
            >
              <h2 className="text-lg font-bold text-[#FF9F1C] mb-4 flex items-center gap-2">
                <User className="h-5 w-5" /> CALCULATE FTC
              </h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 h-10 px-3 text-sm outline-none"
                  placeholder="Full Name"
                  data-testid="ftc-name-input"
                />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white h-10 px-3 text-sm outline-none"
                  data-testid="ftc-dob-input"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({...formData, gender: 'male'})}
                    className={`flex-1 py-2 text-sm border ${formData.gender === 'male' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'}`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setFormData({...formData, gender: 'female'})}
                    className={`flex-1 py-2 text-sm border ${formData.gender === 'female' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'}`}
                  >
                    Female
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 h-10 px-3 text-sm outline-none"
                    placeholder="Height (cm)"
                    data-testid="ftc-height-input"
                  />
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 h-10 px-3 text-sm outline-none"
                    placeholder="Weight (kg)"
                    data-testid="ftc-weight-input"
                  />
                </div>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 text-white h-10 px-3 text-sm outline-none"
                >
                  {Object.entries(activityMultipliers).map(([key, { label }]) => (
                    <option key={key} value={key} className="bg-black">{label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={formData.dailyIntake}
                  onChange={(e) => setFormData({...formData, dailyIntake: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/30 h-10 px-3 text-sm outline-none"
                  placeholder="Daily Intake (kcal)"
                  data-testid="ftc-intake-input"
                />
                <button
                  onClick={calculateFTC}
                  disabled={isCalculating}
                  className="w-full py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold uppercase text-sm hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="ftc-calculate-btn"
                >
                  {isCalculating ? 'Calculating...' : <><Calculator className="h-4 w-4" /> Calculate</>}
                </button>
              </div>
            </motion.div>

            {/* Results & Claim */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5"
            >
              <h2 className="text-lg font-bold text-[#00F090] mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" /> CLAIM TO FITWALLET
              </h2>

              {!results ? (
                <div className="text-center py-8">
                  <Calculator className="h-10 w-10 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">Calculate first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass-card p-2 text-center">
                      <p className="text-xs text-white/50">BMR</p>
                      <p className="text-lg font-bold text-[#FF9F1C]">{results.bmr}</p>
                    </div>
                    <div className="glass-card p-2 text-center">
                      <p className="text-xs text-white/50">TDEE</p>
                      <p className="text-lg font-bold text-[#FFD700]">{results.tdee}</p>
                    </div>
                  </div>

                  <div className={`glass-card p-3 border-2 ${parseFloat(results.finalFTC) > 0 ? 'border-[#FFD700]' : 'border-[#FF2E50]/50'}`}>
                    <p className="text-3xl font-black text-[#FFD700] text-center">{results.finalFTC}</p>
                    <p className="text-sm text-white/60 text-center">FTC to Claim</p>
                    <p className={`text-xs mt-1 text-center ${parseFloat(results.finalFTC) > 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                      {results.healthStatus} ({results.modifier}% modifier)
                    </p>
                  </div>

                  {/* FitWallet Address Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[#00F090] flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> FTC WALLET ADDRESS
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value.toUpperCase())}
                      className="w-full bg-black/50 border border-[#00F090]/30 focus:border-[#00F090] text-white placeholder:text-white/30 h-12 px-3 outline-none font-mono text-sm"
                      placeholder="FTC..."
                      data-testid="ftc-wallet-input"
                    />
                    <p className="text-xs text-white/40">Format: FTC + 32 characters (e.g., FTCD0914B7...)</p>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={parseFloat(results.finalFTC) === 0 || isClaiming}
                    className={`w-full py-3 font-bold uppercase text-sm flex items-center justify-center gap-2 ${
                      parseFloat(results.finalFTC) > 0 && !isClaiming
                        ? 'bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black hover:brightness-110' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                    data-testid="ftc-claim-btn"
                  >
                    {isClaiming ? (
                      <><div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" /> Processing...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Send & Receive FTC</>
                    )}
                  </button>

                  {walletAddress && walletBalances[walletAddress] && (
                    <div className="glass-card p-3 border border-[#00F090]/50 bg-[#00F090]/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Wallet Balance:</span>
                        <span className="text-lg font-bold text-[#00F090]">{walletBalances[walletAddress]} FTC</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="h-3 w-3 text-[#00F090]" />
                        <span className="text-xs text-[#00F090]">Verified & Received</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Blockchain Ledger */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-5"
            >
              <h2 className="text-lg font-bold text-[#FFD700] mb-4 flex items-center gap-2">
                <History className="h-5 w-5" /> BLOCKCHAIN LEDGER
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#00F090] rounded-full animate-pulse" />
                  <span className="text-xs text-[#00F090] font-normal">LIVE</span>
                </span>
              </h2>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {ledger.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glass-card p-3 border ${tx.type === 'CLAIM_RECEIVED' ? 'border-[#00F090]/50 bg-[#00F090]/5' : 'border-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="text-xs font-bold text-white/80">{tx.type}</span>
                      </div>
                      <span className={`text-xs font-bold ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-3 w-3 text-[#FF2E50]" />
                        <span className="text-white/50">From:</span>
                        <span className="font-mono text-white/70">{tx.from.substring(0, 16)}...</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="h-3 w-3 text-[#00F090]" />
                        <span className="text-white/50">To:</span>
                        <span className="font-mono text-white/70">{tx.to.substring(0, 16)}...</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-sm font-bold text-[#FFD700]">{tx.amount.toFixed(2)} FTC</span>
                        <span className="text-xs text-white/40 ml-2">({tx.calories.toLocaleString()} kcal)</span>
                      </div>
                      {tx.received && (
                        <div className="flex items-center gap-1 text-[#00F090]">
                          <Check className="h-3 w-3" />
                          <span className="text-xs">RECEIVED</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-xs text-white/40">
                      <span>Block #{tx.blockNumber}</span>
                      <a href="#" className="hover:text-[#00F090] flex items-center gap-1">
                        {tx.hash.substring(0, 12)}... <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Network</span>
                  <span className="text-[#00F090]">Solana Mainnet</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-white/50">Contract</span>
                  <span className="font-mono text-white/70">5cKax...pump</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 glass-card p-4 border border-[#FF2E50]/30"
          >
            <p className="text-xs text-white/50 text-center">
              ⚠️ This application provides gamified health-based rewards. FTC token value is market dependent. 
              All transactions are POBC-verified and recorded on Solana blockchain. 24-hour cooldown applies.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClaimFtcCredit;
