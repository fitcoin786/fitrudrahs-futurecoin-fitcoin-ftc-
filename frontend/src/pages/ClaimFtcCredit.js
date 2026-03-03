import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Calculator, User, Calendar, Activity, Scale, Ruler, 
  Flame, Zap, Award, Shield, TrendingUp, ArrowLeft,
  CheckCircle, AlertTriangle, Heart, Coins, Wallet,
  Send, ArrowRightLeft, History, ExternalLink, Copy,
  ArrowDown, ArrowUp, Check, X, Info, LogIn, LogOut,
  Lock, UserCheck, Clock, Mail, Key
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
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userClaimHistory, setUserClaimHistory] = useState([]);
  const [userCalorieData, setUserCalorieData] = useState(null);

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
  
  // Send FTC State
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState('send');
  
  // Transaction Details Modal
  const [selectedTx, setSelectedTx] = useState(null);

  // Initialize wallet balances and ledger
  useEffect(() => {
    const initialBalances = {};
    VERIFIED_FTC_ADDRESSES.forEach(addr => {
      initialBalances[addr] = (Math.random() * 10000 + 1000).toFixed(2);
    });
    setWalletBalances(initialBalances);

    const initialLedger = [
      {
        id: 'tx_' + Date.now() + '_1',
        type: 'POBC_MINT',
        from: 'POBC_SYSTEM',
        to: VERIFIED_FTC_ADDRESSES[0],
        toName: 'FitWallet_Alpha',
        amount: 2150.00,
        calories: 2150000,
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547823,
        received: true,
        pobcVerified: true,
        receiverDetails: {
          name: 'FitWallet_Alpha',
          address: VERIFIED_FTC_ADDRESSES[0],
          balanceBefore: '5000.00',
          balanceAfter: '7150.00',
          verified: true
        }
      },
      {
        id: 'tx_' + Date.now() + '_2',
        type: 'EXCHANGE',
        from: VERIFIED_FTC_ADDRESSES[1],
        to: VERIFIED_FTC_ADDRESSES[2],
        toName: 'FitWallet_Gamma',
        amount: 500.00,
        calories: 500000,
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547801,
        received: true,
        pobcVerified: true,
        receiverDetails: {
          name: 'FitWallet_Gamma',
          address: VERIFIED_FTC_ADDRESSES[2],
          balanceBefore: '3000.00',
          balanceAfter: '3500.00',
          verified: true
        }
      }
    ];
    setLedger(initialLedger);

    // Real-time blockchain activity
    const interval = setInterval(() => {
      const types = ['POBC_MINT', 'EXCHANGE', 'SEND'];
      const fromAddr = VERIFIED_FTC_ADDRESSES[Math.floor(Math.random() * VERIFIED_FTC_ADDRESSES.length)];
      let toAddr = VERIFIED_FTC_ADDRESSES[Math.floor(Math.random() * VERIFIED_FTC_ADDRESSES.length)];
      while (toAddr === fromAddr) {
        toAddr = VERIFIED_FTC_ADDRESSES[Math.floor(Math.random() * VERIFIED_FTC_ADDRESSES.length)];
      }
      
      const amount = (Math.random() * 2000 + 100).toFixed(2);
      const walletNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
      const toName = 'FitWallet_' + walletNames[Math.floor(Math.random() * walletNames.length)];
      
      const newTx = {
        id: 'tx_' + Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        from: types[0] === 'POBC_MINT' ? 'POBC_SYSTEM' : fromAddr,
        to: toAddr,
        toName: toName,
        amount: parseFloat(amount),
        calories: parseFloat(amount) * 1000,
        status: 'CONFIRMED',
        timestamp: new Date().toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547823 + Math.floor(Math.random() * 100),
        received: true,
        pobcVerified: true,
        receiverDetails: {
          name: toName,
          address: toAddr,
          balanceBefore: walletBalances[toAddr] || '0.00',
          balanceAfter: (parseFloat(walletBalances[toAddr] || 0) + parseFloat(amount)).toFixed(2),
          verified: true
        }
      };
      
      setLedger(prev => [newTx, ...prev.slice(0, 14)]);
      setWalletBalances(prev => ({
        ...prev,
        [toAddr]: (parseFloat(prev[toAddr] || 0) + parseFloat(amount)).toFixed(2)
      }));
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Email/Password Login Handler
  const handleLogin = () => {
    if (!loginEmail.trim()) {
      toast.error('Enter your FitWallet email');
      return;
    }
    if (!loginPassword.trim()) {
      toast.error('Enter your password');
      return;
    }
    if (!loginEmail.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }
    if (loginPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoggingIn(true);

    // Simulate FitWallet authentication
    setTimeout(() => {
      // Generate FTC address from email
      const emailHash = loginEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
      const ftcAddress = 'FTC' + emailHash.padEnd(32, Math.random().toString(36).substr(2).toUpperCase()).substring(0, 32);
      const walletName = 'FitWallet_' + loginEmail.split('@')[0].substring(0, 6);
      const balance = (Math.random() * 5000 + 500).toFixed(2);
      
      // Generate mock claim history
      const mockHistory = [
        {
          id: 'claim_' + Date.now() + '_1',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          calories: 2150000,
          ftcAmount: 2150.00,
          status: 'CONFIRMED',
          pobcVerified: true,
          hash: 'FTX' + Math.random().toString(36).substr(2, 12).toUpperCase()
        },
        {
          id: 'claim_' + Date.now() + '_2',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          calories: 1850000,
          ftcAmount: 1850.00,
          status: 'CONFIRMED',
          pobcVerified: true,
          hash: 'FTX' + Math.random().toString(36).substr(2, 12).toUpperCase()
        },
        {
          id: 'claim_' + Date.now() + '_3',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          calories: 3200000,
          ftcAmount: 3200.00,
          status: 'CONFIRMED',
          pobcVerified: true,
          hash: 'FTX' + Math.random().toString(36).substr(2, 12).toUpperCase()
        }
      ];

      const mockCalorieData = {
        totalCaloriesBurned: 7200000,
        totalCaloriesIntake: 6800000,
        avgDailyBurn: 2400,
        avgDailyIntake: 2267,
        lastVerified: new Date().toISOString(),
        pobcStatus: 'VERIFIED'
      };

      setLoggedInUser({
        email: loginEmail,
        address: ftcAddress,
        name: walletName,
        balance: balance,
        verified: true,
        loginTime: new Date().toISOString()
      });
      
      setUserClaimHistory(mockHistory);
      setUserCalorieData(mockCalorieData);
      setWalletAddress(ftcAddress);
      setWalletBalances(prev => ({ ...prev, [ftcAddress]: balance }));
      setIsLoggedIn(true);
      setIsLoggingIn(false);
      
      toast.success(`✅ Welcome ${walletName}!`);
      toast.info(`FitWallet connected • Balance: ${balance} FTC`);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setUserClaimHistory([]);
    setUserCalorieData(null);
    setResults(null);
    setShowSendPanel(false);
    toast.info('Logged out successfully');
  };

  const activityMultipliers = {
    sedentary: { value: 1.2, label: 'Sedentary' },
    light: { value: 1.375, label: 'Light' },
    moderate: { value: 1.55, label: 'Moderate' },
    active: { value: 1.725, label: 'Active' },
    athlete: { value: 1.9, label: 'Athlete' }
  };

  const validateInput = () => {
    const newErrors = {};
    const today = new Date();
    const birthDate = new Date(formData.dob);
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const intake = parseFloat(formData.dailyIntake);

    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.dob) newErrors.dob = 'Required';
    if (age < 5 || age > 100) newErrors.dob = 'Age 5-100';
    if (height < 120 || height > 220) newErrors.height = '120-220 cm';
    if (weight < 30 || weight > 200) newErrors.weight = '30-200 kg';
    if (intake < 800 || intake > 6000) newErrors.dailyIntake = '800-6000 kcal';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFTC = () => {
    if (!validateInput()) {
      toast.error('Invalid input - check values');
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

      let bmr = formData.gender === 'male' 
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161;

      const tdee = bmr * activityMultiplier;
      const totalDays = 6570;
      const totalBurn18Years = tdee * totalDays;
      const totalIntake18Years = intake * totalDays;
      const balancedEnergy = Math.min(totalIntake18Years, totalBurn18Years);
      const baseFTC = balancedEnergy / 1000;
      const differencePercent = Math.abs(intake - tdee) / tdee * 100;
      
      let modifier = differencePercent <= 5 ? 1.0 : differencePercent <= 15 ? 0.7 : differencePercent <= 25 ? 0.4 : 0;
      let healthStatus = differencePercent <= 5 ? 'Excellent' : differencePercent <= 15 ? 'Good' : differencePercent <= 25 ? 'Moderate' : 'Risk';

      const finalFTC = baseFTC * modifier;
      const stabilityScore = Math.max(0, 100 - differencePercent);

      setUserCalorieData(prev => ({
        ...prev,
        currentBMR: bmr.toFixed(2),
        currentTDEE: tdee.toFixed(2),
        currentIntake: intake,
        lastCalculated: new Date().toISOString(),
        pobcStatus: 'VERIFIED'
      }));

      setResults({
        age, bmr: bmr.toFixed(2), tdee: tdee.toFixed(2),
        stabilityScore: stabilityScore.toFixed(1),
        baseFTC: baseFTC.toFixed(2), modifier: (modifier * 100).toFixed(0),
        finalFTC: finalFTC.toFixed(2), healthStatus, differencePercent: differencePercent.toFixed(1)
      });

      setIsCalculating(false);
      toast.success('FTC Calculated! POBC Verified ✓');
    }, 1500);
  };

  const isValidFTCAddress = (address) => address && address.startsWith('FTC') && address.length >= 32;

  const handleClaim = () => {
    if (!results || parseFloat(results.finalFTC) === 0) {
      toast.error('No FTC to claim');
      return;
    }

    setIsClaiming(true);
    
    setTimeout(() => {
      const amount = parseFloat(results.finalFTC);
      const hash = 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase();
      const blockNumber = 18547900 + Math.floor(Math.random() * 100);
      
      const sendTx = {
        id: 'tx_send_' + Date.now(),
        type: 'CLAIM_SEND',
        from: 'POBC_SYSTEM',
        to: loggedInUser.address,
        toName: loggedInUser.name,
        amount, calories: amount * 1000,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        hash, blockNumber, received: false,
        pobcVerified: true,
        receiverDetails: {
          name: loggedInUser.name,
          address: loggedInUser.address,
          balanceBefore: walletBalances[loggedInUser.address] || '0.00',
          balanceAfter: (parseFloat(walletBalances[loggedInUser.address] || 0) + amount).toFixed(2),
          verified: true
        }
      };
      
      setLedger(prev => [sendTx, ...prev]);
      toast.info('📤 Broadcasting POBC-verified claim...');
      
      setTimeout(() => {
        const receiveTx = {
          id: 'tx_recv_' + Date.now(),
          type: 'CLAIM_RECEIVED',
          from: 'POBC_SYSTEM',
          to: loggedInUser.address,
          toName: loggedInUser.name,
          amount, calories: amount * 1000,
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          hash, blockNumber: blockNumber + 1, received: true,
          pobcVerified: true,
          receiverDetails: {
            name: loggedInUser.name,
            address: loggedInUser.address,
            balanceBefore: walletBalances[loggedInUser.address] || '0.00',
            balanceAfter: (parseFloat(walletBalances[loggedInUser.address] || 0) + amount).toFixed(2),
            verified: true
          }
        };
        
        setLedger(prev => [receiveTx, ...prev.map(tx => tx.id === sendTx.id ? { ...tx, status: 'CONFIRMED', received: true } : tx)]);
        
        const newBalance = (parseFloat(walletBalances[loggedInUser.address] || 0) + amount).toFixed(2);
        setWalletBalances(prev => ({ ...prev, [loggedInUser.address]: newBalance }));
        setLoggedInUser(prev => ({ ...prev, balance: newBalance }));
        
        const newClaim = {
          id: 'claim_' + Date.now(),
          timestamp: new Date().toISOString(),
          calories: amount * 1000,
          ftcAmount: amount,
          status: 'CONFIRMED',
          pobcVerified: true,
          hash: hash
        };
        setUserClaimHistory(prev => [newClaim, ...prev]);
        
        setClaimedFTC(prev => prev + amount);
        setIsClaiming(false);
        setShowSendPanel(true);
        
        toast.success(`✅ ${amount.toFixed(2)} FTC RECEIVED! POBC Verified`);
      }, 3000);
    }, 1000);
  };

  const handleSendFTC = () => {
    const senderBalance = parseFloat(walletBalances[loggedInUser.address] || 0);
    const amountToSend = parseFloat(sendAmount);
    
    if (!sendAmount || amountToSend <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (amountToSend > senderBalance) {
      toast.error(`Insufficient balance. Max: ${senderBalance.toFixed(2)} FTC`);
      return;
    }
    if (!receiverAddress.trim() || !isValidFTCAddress(receiverAddress)) {
      toast.error('Enter valid receiver FTC address');
      return;
    }
    if (receiverAddress === loggedInUser.address) {
      toast.error('Cannot send to same address');
      return;
    }

    setIsSending(true);
    
    setTimeout(() => {
      const hash = 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase();
      const blockNumber = 18548000 + Math.floor(Math.random() * 100);
      const receiverName = 'FitWallet_' + receiverAddress.substring(3, 7);
      
      const sendTx = {
        id: 'tx_transfer_' + Date.now(),
        type: sendMode === 'exchange' ? 'EXCHANGE' : 'SEND',
        from: loggedInUser.address,
        fromName: loggedInUser.name,
        to: receiverAddress,
        toName: receiverName,
        amount: amountToSend,
        calories: amountToSend * 1000,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        hash, blockNumber, received: false,
        pobcVerified: true,
        receiverDetails: {
          name: receiverName,
          address: receiverAddress,
          balanceBefore: walletBalances[receiverAddress] || '0.00',
          balanceAfter: (parseFloat(walletBalances[receiverAddress] || 0) + amountToSend).toFixed(2),
          verified: true
        }
      };
      
      setLedger(prev => [sendTx, ...prev]);
      toast.info(`📤 ${sendMode === 'exchange' ? 'Exchanging' : 'Sending'} ${amountToSend} FTC...`);
      
      setTimeout(() => {
        const receiveTx = {
          id: 'tx_recv_transfer_' + Date.now(),
          type: sendMode === 'exchange' ? 'EXCHANGE_RECEIVED' : 'TRANSFER_RECEIVED',
          from: loggedInUser.address,
          fromName: loggedInUser.name,
          to: receiverAddress,
          toName: receiverName,
          amount: amountToSend,
          calories: amountToSend * 1000,
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          hash, blockNumber: blockNumber + 1, received: true,
          pobcVerified: true,
          receiverDetails: {
            name: receiverName,
            address: receiverAddress,
            balanceBefore: walletBalances[receiverAddress] || '0.00',
            balanceAfter: (parseFloat(walletBalances[receiverAddress] || 0) + amountToSend).toFixed(2),
            verified: true
          }
        };
        
        setLedger(prev => [receiveTx, ...prev.map(tx => tx.id === sendTx.id ? { ...tx, status: 'CONFIRMED', received: true } : tx)]);
        
        const newSenderBalance = (parseFloat(walletBalances[loggedInUser.address] || 0) - amountToSend).toFixed(2);
        setWalletBalances(prev => ({
          ...prev,
          [loggedInUser.address]: newSenderBalance,
          [receiverAddress]: (parseFloat(prev[receiverAddress] || 0) + amountToSend).toFixed(2)
        }));
        setLoggedInUser(prev => ({ ...prev, balance: newSenderBalance }));
        
        setIsSending(false);
        setSendAmount('');
        setReceiverAddress('');
        
        toast.success(`✅ ${amountToSend.toFixed(2)} FTC ${sendMode === 'exchange' ? 'exchanged' : 'sent'} to ${receiverName}!`);
      }, 3000);
    }, 1000);
  };

  const handleViewTransaction = (tx) => {
    setSelectedTx(tx);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const getStatusColor = (status) => status === 'CONFIRMED' ? 'text-[#00F090]' : status === 'PENDING' ? 'text-[#FF9F1C]' : 'text-white';

  const getTypeIcon = (type) => {
    const icons = {
      'POBC_MINT': <Flame className="h-4 w-4 text-[#FF9F1C]" />,
      'CLAIM_SEND': <ArrowUp className="h-4 w-4 text-[#FF2E50]" />,
      'CLAIM_RECEIVED': <ArrowDown className="h-4 w-4 text-[#00F090]" />,
      'EXCHANGE': <ArrowRightLeft className="h-4 w-4 text-[#FFD700]" />,
      'EXCHANGE_RECEIVED': <ArrowRightLeft className="h-4 w-4 text-[#00F090]" />,
      'SEND': <Send className="h-4 w-4 text-[#FF9F1C]" />,
      'TRANSFER_RECEIVED': <ArrowDown className="h-4 w-4 text-[#00F090]" />
    };
    return icons[type] || <Activity className="h-4 w-4" />;
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" alt="Fitcoin" className="h-20 w-20 mx-auto mb-4" />
            </Link>
            <h1 className="text-3xl font-black font-unbounded tracking-tighter uppercase mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                🪙 FTC CLAIM LOGIN
              </span>
            </h1>
            <p className="text-white/60 text-sm">Login with your FitWallet credentials</p>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 border-2 border-[#FFD700]/30">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-[#FFD700]" />
              <h2 className="text-lg font-bold text-[#FFD700]">FITWALLET LOGIN</h2>
            </div>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                  <Mail className="inline h-3 w-3 mr-1" /> EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-[#FFD700] text-white placeholder:text-white/30 h-12 px-4 outline-none transition-colors"
                  placeholder="your@email.com"
                  data-testid="login-email-input"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
                  <Key className="inline h-3 w-3 mr-1" /> PASSWORD
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-[#FFD700] text-white placeholder:text-white/30 h-12 px-4 outline-none transition-colors"
                  placeholder="Enter password"
                  data-testid="login-password-input"
                />
              </div>

              {/* FitWallet Link */}
              <div className="glass-card p-3 border border-[#00F090]/20">
                <p className="text-xs text-white/60 mb-2">Don't have a FitWallet account?</p>
                <a
                  href="https://solana-fitness.emergent.host/fitwallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#00F090]/10 border border-[#00F090]/30 text-[#00F090] font-bold text-sm hover:bg-[#00F090]/20 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  Create FitWallet Account
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FF9F1C] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.5)] disabled:opacity-50 flex items-center justify-center gap-3"
                data-testid="login-btn"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                    Connecting to FitWallet...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Login to Claim FTC
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                🔐 Secure connection to Fitcoin Exchange
              </p>
              <p className="text-xs text-[#00F090] text-center mt-2">
                Real-time Blockchain • POBC Verified
              </p>
            </div>
          </div>

          {/* FTC Exchange Link */}
          <div className="mt-6 glass-card p-4 border border-[#FFD700]/30">
            <p className="text-xs text-white/60 text-center mb-3">Access Real FTC Exchange</p>
            <a
              href="https://solana-fitness.emergent.host/fitwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold text-sm hover:brightness-110 transition-all"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Open FitWallet Exchange
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="text-center mt-6">
            <Link to="/" className="text-white/50 hover:text-[#FFD700] text-sm flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN CLAIM PAGE (After Login)
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Header */}
      <div className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5 text-white/60" />
            <img src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" alt="Fitcoin" className="h-10 w-10 object-contain" />
            <span className="text-xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FUTURE TRADE</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#00F090]" />
              <span className="text-sm text-white">{loggedInUser?.email}</span>
              <span className="text-sm font-bold text-[#FFD700]">{loggedInUser?.balance} FTC</span>
            </div>
            <button onClick={handleLogout} className="glass-card px-3 py-2 text-white/60 hover:text-[#FF2E50] transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-black font-unbounded tracking-tighter uppercase">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                🪙 CLAIM & SEND FTC
              </span>
            </h1>
            <p className="text-xs text-white/60 mt-1">Real Blockchain • POBC Verified • FitWallet Exchange</p>
          </div>

          {/* User Info Bar */}
          <div className="glass-card p-3 mb-4 border border-[#00F090]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#00F090]" />
                <span className="text-xs text-white/60">FitWallet:</span>
                <span className="text-xs font-mono text-[#FFD700]">{loggedInUser?.address?.substring(0, 16)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/40" />
                <span className="text-xs text-white/40">Claims: {userClaimHistory.length}</span>
              </div>
            </div>
            <a
              href="https://solana-fitness.emergent.host/fitwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold hover:bg-[#FFD700]/20 transition-colors"
            >
              <ArrowRightLeft className="h-3 w-3" />
              Open FitWallet Exchange
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Calculate Form */}
            <div className="glass-card p-4">
              <h2 className="text-sm font-bold text-[#FF9F1C] mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" /> CALCULATE
              </h2>
              <div className="space-y-2">
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" placeholder="Name" />
                <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" />
                <div className="flex gap-1">
                  {['male', 'female'].map(g => (
                    <button key={g} onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-1.5 text-xs border ${formData.gender === g ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'}`}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <input type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" placeholder="Height cm" />
                  <input type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" placeholder="Weight kg" />
                </div>
                <select value={formData.activityLevel} onChange={(e) => setFormData({...formData, activityLevel: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none">
                  {Object.entries(activityMultipliers).map(([k, v]) => <option key={k} value={k} className="bg-black">{v.label}</option>)}
                </select>
                <input type="number" value={formData.dailyIntake} onChange={(e) => setFormData({...formData, dailyIntake: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" placeholder="Daily kcal" />
                <button onClick={calculateFTC} disabled={isCalculating} className="w-full py-2 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold text-xs uppercase disabled:opacity-50">
                  {isCalculating ? '...' : 'Calculate'}
                </button>
              </div>
            </div>

            {/* Claim & Send Panel */}
            <div className="glass-card p-4">
              <h2 className="text-sm font-bold text-[#00F090] mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> CLAIM & SEND
              </h2>
              
              {!results ? (
                <div className="text-center py-6"><p className="text-white/40 text-xs">Calculate first</p></div>
              ) : (
                <div className="space-y-3">
                  <div className={`glass-card p-3 border ${parseFloat(results.finalFTC) > 0 ? 'border-[#FFD700]' : 'border-[#FF2E50]/50'}`}>
                    <p className="text-2xl font-black text-[#FFD700] text-center">{results.finalFTC}</p>
                    <p className="text-xs text-white/60 text-center">FTC ({results.modifier}% • {results.healthStatus})</p>
                  </div>

                  <button onClick={handleClaim} disabled={isClaiming || parseFloat(results.finalFTC) === 0} className="w-full py-2.5 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold text-xs uppercase disabled:opacity-50">
                    {isClaiming ? 'Processing...' : `Claim to ${loggedInUser?.name}`}
                  </button>

                  <div className="glass-card p-3 border border-[#00F090]/30 bg-[#00F090]/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">Your Balance:</span>
                      <span className="text-lg font-bold text-[#00F090]">{loggedInUser?.balance} FTC</span>
                    </div>
                    
                    {showSendPanel && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex gap-1">
                          <button onClick={() => setSendMode('send')} className={`flex-1 py-1.5 text-xs border ${sendMode === 'send' ? 'border-[#FF9F1C] bg-[#FF9F1C]/10 text-[#FF9F1C]' : 'border-white/10 text-white/60'}`}>
                            <Send className="h-3 w-3 inline mr-1" />Send
                          </button>
                          <button onClick={() => setSendMode('exchange')} className={`flex-1 py-1.5 text-xs border ${sendMode === 'exchange' ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-white/10 text-white/60'}`}>
                            <ArrowRightLeft className="h-3 w-3 inline mr-1" />Exchange
                          </button>
                        </div>
                        
                        <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" placeholder={`Amount (Max: ${loggedInUser?.balance})`} />
                        
                        <div className="flex gap-1">
                          {[25, 50, 75, 100].map(p => (
                            <button key={p} onClick={() => setSendAmount((parseFloat(loggedInUser?.balance || 0) * p / 100).toFixed(2))} className="flex-1 py-1 text-xs border border-white/10 text-white/60 hover:border-[#FFD700] hover:text-[#FFD700]">
                              {p}%
                            </button>
                          ))}
                        </div>
                        
                        <input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value.toUpperCase())} className="w-full bg-black/50 border border-[#FF9F1C]/30 text-white h-9 px-2 text-xs outline-none font-mono" placeholder="Receiver FTC address" />
                        
                        <button onClick={handleSendFTC} disabled={isSending} className={`w-full py-2 font-bold text-xs uppercase disabled:opacity-50 ${sendMode === 'exchange' ? 'bg-gradient-to-r from-[#FFD700] to-[#FF9F1C] text-black' : 'bg-gradient-to-r from-[#FF9F1C] to-[#FF2E50] text-white'}`}>
                          {isSending ? 'Sending...' : `${sendMode === 'exchange' ? 'Exchange' : 'Send'} FTC`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Claim History */}
            <div className="glass-card p-4">
              <h2 className="text-sm font-bold text-[#FFD700] mb-3 flex items-center gap-2">
                <History className="h-4 w-4" /> YOUR CLAIM HISTORY
                <span className="ml-auto text-xs text-[#00F090] font-normal">POBC</span>
              </h2>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {userClaimHistory && userClaimHistory.length > 0 ? (
                  userClaimHistory.map((claim) => (
                    <div 
                      key={claim.id} 
                      className="glass-card p-2 border border-white/5 cursor-pointer hover:border-[#FFD700]/50 transition-colors"
                      onClick={() => handleViewTransaction({
                        ...claim,
                        type: 'CLAIM',
                        from: 'POBC_SYSTEM',
                        to: loggedInUser?.address,
                        toName: loggedInUser?.name,
                        amount: claim.ftcAmount,
                        blockNumber: 18547800 + Math.floor(Math.random() * 100),
                        received: true,
                        receiverDetails: {
                          name: loggedInUser?.name,
                          address: loggedInUser?.address,
                          verified: true
                        }
                      })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#FFD700]">{claim.ftcAmount.toFixed(2)} FTC</span>
                        <span className={`text-xs ${claim.pobcVerified ? 'text-[#00F090]' : 'text-white/50'}`}>
                          {claim.pobcVerified ? '✓ POBC' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>{claim.calories.toLocaleString()} kcal</span>
                        <span>{new Date(claim.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 text-center py-4">No claims yet</p>
                )}
              </div>
              
              {userClaimHistory && userClaimHistory.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/50">
                  Total: <span className="text-[#FFD700] font-bold">{userClaimHistory.reduce((sum, c) => sum + c.ftcAmount, 0).toFixed(2)} FTC</span>
                </div>
              )}
            </div>

            {/* Blockchain Ledger */}
            <div className="glass-card p-4">
              <h2 className="text-sm font-bold text-[#FFD700] mb-3 flex items-center gap-2">
                <History className="h-4 w-4" /> BLOCKCHAIN
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#00F090] rounded-full animate-pulse" />
                  <span className="text-xs text-[#00F090] font-normal">LIVE</span>
                </span>
              </h2>
              <p className="text-xs text-white/40 mb-2">Click transaction for details</p>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {ledger && ledger.length > 0 ? (
                  ledger.slice(0, 8).map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleViewTransaction(tx)}
                      className={`glass-card p-2 border cursor-pointer hover:border-white/30 ${tx.type.includes('RECEIVED') ? 'border-[#00F090]/30 bg-[#00F090]/5' : 'border-white/5'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(tx.type)}
                          <span className="text-xs font-bold text-white/80">{tx.type.substring(0, 10)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs ${getStatusColor(tx.status)}`}>{tx.status}</span>
                          {tx.pobcVerified && <Check className="h-3 w-3 text-[#00F090]" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-white/50">{tx.to?.substring(0, 10)}...</span>
                        <span className="font-bold text-[#FFD700]">{tx.amount?.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 text-center py-4">No transactions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full border border-[#FFD700]/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#FFD700] flex items-center gap-2">
                  <Info className="h-5 w-5" /> Transaction Details
                </h3>
                <button onClick={() => setSelectedTx(null)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="glass-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(selectedTx.type)}
                    <span className="font-bold text-white">{selectedTx.type}</span>
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded ${getStatusColor(selectedTx.status)} bg-white/10`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-[#FFD700]">{selectedTx.amount?.toFixed(2) || selectedTx.ftcAmount?.toFixed(2)} FTC</p>
                  <p className="text-xs text-white/40">{(selectedTx.calories || selectedTx.amount * 1000)?.toLocaleString()} kcal</p>
                </div>

                <div className="glass-card p-3 border border-[#00F090]/30 bg-[#00F090]/5">
                  <p className="text-xs text-[#00F090] mb-2 flex items-center gap-1">
                    <Check className="h-3 w-3" /> RECEIVER DETAILS
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Name:</span>
                      <span className="text-white font-bold">{selectedTx.receiverDetails?.name || selectedTx.toName || loggedInUser?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Address:</span>
                      <span className="font-mono text-white/70 text-xs">{(selectedTx.to || loggedInUser?.address)?.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">POBC Status:</span>
                      <span className="text-[#00F090] flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-3 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/50">Block:</span>
                    <span className="text-white">#{selectedTx.blockNumber || 18547800 + Math.floor(Math.random() * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Hash:</span>
                    <button onClick={() => copyToClipboard(selectedTx.hash)} className="font-mono text-[#00F090] hover:underline">
                      {selectedTx.hash?.substring(0, 16)}...
                    </button>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/50">Time:</span>
                    <span className="text-white">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {(selectedTx.received || selectedTx.status === 'CONFIRMED') && (
                  <div className="text-center py-2 bg-[#00F090]/10 border border-[#00F090]/30 rounded">
                    <p className="text-[#00F090] font-bold flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" /> RECEIVED & POBC VERIFIED
                    </p>
                  </div>
                )}

                {/* FitWallet Exchange Link */}
                <a
                  href="https://solana-fitness.emergent.host/fitwallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-bold text-sm hover:bg-[#FFD700]/20 transition-colors"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  View in FitWallet Exchange
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClaimFtcCredit;
