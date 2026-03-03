import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Calculator, User, Calendar, Activity, Scale, Ruler, 
  Flame, Zap, Award, Shield, TrendingUp, ArrowLeft,
  CheckCircle, AlertTriangle, Heart, Coins
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
  
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

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
    
    // Generate calculation hash (simulated)
    const timestamp = Date.now();
    const hashData = `${formData.dob}-${formData.height}-${formData.weight}-${formData.dailyIntake}-${results.tdee}-${timestamp}`;
    const hash = btoa(hashData).substring(0, 32);
    
    toast.success(`Claim Request Submitted! Hash: ${hash}`);
    toast.info('FTC will be minted to your wallet within 24 hours.');
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
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#FFD700]" />
            <span className="text-sm font-mono text-[#FFD700]">FTC CREDIT CALCULATOR</span>
          </div>
        </div>
      </div>

      <div className="pt-24 px-6">
        <div className="max-w-6xl mx-auto">
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
              <p className="text-sm font-mono text-[#00F090] break-all">5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump</p>
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
                <span className="text-white/80">Mathematical Health Score</span>
              </div>
              <span className="text-[#FF9F1C]">→</span>
              <div className="glass-card px-4 py-2 border-[#00F090]/50">
                <span className="text-[#00F090] font-bold">FTC Credit Reward</span>
              </div>
            </div>
            <p className="text-sm text-white/60 text-center mt-4">
              System is 100% formula-based • All calculations are deterministic & verifiable • 1 FTC = 1,000 kcal Balanced Energy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-[#FF9F1C] mb-6 flex items-center gap-2">
                <User className="h-6 w-6" /> USER INPUT MODULE
              </h2>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full bg-black/50 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors`}
                    placeholder="Enter your full name"
                    data-testid="ftc-name-input"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                    <Calendar className="inline h-3 w-3 mr-1" /> Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className={`w-full bg-black/50 border ${errors.dob ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white rounded-none h-12 px-4 outline-none transition-colors`}
                    data-testid="ftc-dob-input"
                  />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                    Gender *
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`flex-1 py-3 px-4 border ${formData.gender === 'male' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'} transition-all`}
                      data-testid="ftc-gender-male"
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`flex-1 py-3 px-4 border ${formData.gender === 'female' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'} transition-all`}
                      data-testid="ftc-gender-female"
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                      <Ruler className="inline h-3 w-3 mr-1" /> Height (cm) *
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className={`w-full bg-black/50 border ${errors.height ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors`}
                      placeholder="170"
                      data-testid="ftc-height-input"
                    />
                    {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                      <Scale className="inline h-3 w-3 mr-1" /> Weight (kg) *
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className={`w-full bg-black/50 border ${errors.weight ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors`}
                      placeholder="70"
                      data-testid="ftc-weight-input"
                    />
                    {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                    <Activity className="inline h-3 w-3 mr-1" /> Activity Level *
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white rounded-none h-12 px-4 outline-none transition-colors"
                    data-testid="ftc-activity-select"
                  >
                    {Object.entries(activityMultipliers).map(([key, { label }]) => (
                      <option key={key} value={key} className="bg-black">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Daily Calorie Intake */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                    <Flame className="inline h-3 w-3 mr-1" /> Average Daily Calorie Intake (kcal) *
                  </label>
                  <input
                    type="number"
                    value={formData.dailyIntake}
                    onChange={(e) => setFormData({...formData, dailyIntake: e.target.value})}
                    className={`w-full bg-black/50 border ${errors.dailyIntake ? 'border-red-500' : 'border-white/10'} focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors`}
                    placeholder="2000"
                    data-testid="ftc-intake-input"
                  />
                  {errors.dailyIntake && <p className="text-red-500 text-xs mt-1">{errors.dailyIntake}</p>}
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculateFTC}
                  disabled={isCalculating}
                  className="w-full py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,159,28,0.5)] hover:shadow-[0_0_30px_rgba(255,159,28,0.7)] disabled:opacity-50 flex items-center justify-center gap-3"
                  data-testid="ftc-calculate-btn"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      Calculate FTC Credit
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Results Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-[#00F090] mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" /> DASHBOARD OUTPUT
              </h2>

              {!results ? (
                <div className="text-center py-16">
                  <Calculator className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">Enter your data and calculate to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Basic Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-4">
                      <p className="text-xs text-white/50 uppercase">Age</p>
                      <p className="text-2xl font-bold text-white">{results.age} <span className="text-sm text-white/50">years</span></p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs text-white/50 uppercase">BMR</p>
                      <p className="text-2xl font-bold text-[#FF9F1C]">{results.bmr} <span className="text-sm text-white/50">kcal/day</span></p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs text-white/50 uppercase">TDEE</p>
                      <p className="text-2xl font-bold text-[#FFD700]">{results.tdee} <span className="text-sm text-white/50">kcal/day</span></p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs text-white/50 uppercase">Daily Balance</p>
                      <p className={`text-2xl font-bold ${parseFloat(results.dailyBalance) >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                        {parseFloat(results.dailyBalance) >= 0 ? '+' : ''}{results.dailyBalance} <span className="text-sm text-white/50">kcal</span>
                      </p>
                    </div>
                  </div>

                  {/* 18-Year Projection */}
                  <div className="glass-card p-4 border border-[#FFD700]/30">
                    <p className="text-xs text-[#FFD700] uppercase mb-3">18-Year Energy Projection (6,570 Days)</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/50">Total Burn</p>
                        <p className="font-mono text-white">{parseInt(results.totalBurn18Years).toLocaleString()} kcal</p>
                      </div>
                      <div>
                        <p className="text-white/50">Total Intake</p>
                        <p className="font-mono text-white">{parseInt(results.totalIntake18Years).toLocaleString()} kcal</p>
                      </div>
                      <div>
                        <p className="text-white/50">Energy Balance</p>
                        <p className={`font-mono ${parseFloat(results.energyBalance) >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                          {parseFloat(results.energyBalance) >= 0 ? '+' : ''}{parseInt(results.energyBalance).toLocaleString()} kcal
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50">Est. Weight Change</p>
                        <p className={`font-mono ${parseFloat(results.weightChange) >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}`}>
                          {parseFloat(results.weightChange) >= 0 ? '+' : ''}{results.weightChange} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stability Score */}
                  <div className="glass-card p-4 border border-[#00F090]/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#00F090] uppercase">Metabolic Stability Score</p>
                      <Heart className="h-4 w-4 text-[#FF2E50]" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            parseFloat(results.stabilityScore) >= 75 ? 'bg-[#00F090]' :
                            parseFloat(results.stabilityScore) >= 50 ? 'bg-[#FFD700]' : 'bg-[#FF2E50]'
                          }`}
                          style={{ width: `${results.stabilityScore}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold text-white">{results.stabilityScore}</span>
                    </div>
                    <p className="text-xs text-white/50 mt-2">Energy Alignment: {results.differencePercent}% deviation</p>
                  </div>

                  {/* FTC Earned */}
                  <div className={`glass-card p-6 border-2 ${parseFloat(results.finalFTC) > 0 ? 'border-[#FFD700]' : 'border-[#FF2E50]/50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-6 w-6 text-[#FFD700]" />
                        <p className="text-sm text-white/70 uppercase">FTC Credit Earned</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded ${
                        parseFloat(results.modifier) === 100 ? 'bg-[#00F090]/20 text-[#00F090]' :
                        parseFloat(results.modifier) >= 70 ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                        parseFloat(results.modifier) >= 40 ? 'bg-orange-500/20 text-orange-500' : 'bg-[#FF2E50]/20 text-[#FF2E50]'
                      }`}>
                        {results.modifier}% Modifier
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FFD700] mb-2">{results.finalFTC}</p>
                      <p className="text-lg text-white/60">FTC Tokens</p>
                      <p className={`text-sm mt-2 flex items-center justify-center gap-2 ${
                        parseFloat(results.finalFTC) > 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'
                      }`}>
                        {parseFloat(results.finalFTC) > 0 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        {results.healthStatus}
                      </p>
                    </div>
                    <p className="text-xs text-white/40 text-center mt-3">Base: {results.baseFTC} FTC × {results.modifier}% modifier</p>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={parseFloat(results.finalFTC) === 0}
                    className={`w-full py-4 font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                      parseFloat(results.finalFTC) > 0 
                        ? 'bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black hover:brightness-110 shadow-[0_0_20px_rgba(0,240,144,0.5)] hover:shadow-[0_0_30px_rgba(0,240,144,0.7)]' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                    data-testid="ftc-claim-btn"
                  >
                    <Shield className="h-5 w-5" />
                    {parseFloat(results.finalFTC) > 0 ? 'Claim FTC to Wallet' : 'Improve Balance to Claim'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Token Info & Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
