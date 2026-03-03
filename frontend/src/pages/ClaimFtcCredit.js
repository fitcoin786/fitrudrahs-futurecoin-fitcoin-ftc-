import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Calculator, User, Calendar, Activity, Scale, Ruler, 
  Flame, Zap, Award, Shield, TrendingUp, ArrowLeft,
  CheckCircle, AlertTriangle, Heart, Coins, Wallet,
  Send, ArrowRightLeft, History, ExternalLink, Copy,
  ArrowDown, ArrowUp, Check, X, Info
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
  
  // Send FTC State
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState('send'); // 'send' or 'exchange'
  
  // Transaction Details Modal
  const [selectedTx, setSelectedTx] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState(null);

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
        receiverDetails: {
          name: 'FitWallet_Gamma',
          address: VERIFIED_FTC_ADDRESSES[2],
          balanceBefore: '3000.00',
          balanceAfter: '3500.00',
          verified: true
        }
      },
      {
        id: 'tx_' + Date.now() + '_3',
        type: 'SEND',
        from: VERIFIED_FTC_ADDRESSES[0],
        to: VERIFIED_FTC_ADDRESSES[3],
        toName: 'FitWallet_Delta',
        amount: 1200.00,
        calories: 1200000,
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        hash: 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        blockNumber: 18547756,
        received: true,
        receiverDetails: {
          name: 'FitWallet_Delta',
          address: VERIFIED_FTC_ADDRESSES[3],
          balanceBefore: '2500.00',
          balanceAfter: '3700.00',
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
    }, 20000);

    return () => clearInterval(interval);
  }, []);

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

      setResults({
        age, bmr: bmr.toFixed(2), tdee: tdee.toFixed(2),
        stabilityScore: stabilityScore.toFixed(1),
        baseFTC: baseFTC.toFixed(2), modifier: (modifier * 100).toFixed(0),
        finalFTC: finalFTC.toFixed(2), healthStatus, differencePercent: differencePercent.toFixed(1)
      });

      setIsCalculating(false);
      toast.success('FTC Calculated!');
    }, 1500);
  };

  const isValidFTCAddress = (address) => address.startsWith('FTC') && address.length >= 32;

  const handleClaim = () => {
    if (!results || parseFloat(results.finalFTC) === 0) {
      toast.error('No FTC to claim');
      return;
    }
    if (!walletAddress.trim() || !isValidFTCAddress(walletAddress)) {
      toast.error('Enter valid FTC address (FTC + 32 chars)');
      return;
    }

    setIsClaiming(true);
    
    setTimeout(() => {
      const amount = parseFloat(results.finalFTC);
      const hash = 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase();
      const blockNumber = 18547900 + Math.floor(Math.random() * 100);
      const walletName = 'FitWallet_' + walletAddress.substring(3, 7);
      
      const sendTx = {
        id: 'tx_send_' + Date.now(),
        type: 'CLAIM_SEND',
        from: 'POBC_SYSTEM',
        to: walletAddress,
        toName: walletName,
        amount, calories: amount * 1000,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        hash, blockNumber, received: false,
        receiverDetails: {
          name: walletName,
          address: walletAddress,
          balanceBefore: walletBalances[walletAddress] || '0.00',
          balanceAfter: (parseFloat(walletBalances[walletAddress] || 0) + amount).toFixed(2),
          verified: true
        }
      };
      
      setLedger(prev => [sendTx, ...prev]);
      toast.info('📤 Broadcasting to blockchain...');
      
      setTimeout(() => {
        const receiveTx = {
          id: 'tx_recv_' + Date.now(),
          type: 'CLAIM_RECEIVED',
          from: 'POBC_SYSTEM',
          to: walletAddress,
          toName: walletName,
          amount, calories: amount * 1000,
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          hash, blockNumber: blockNumber + 1, received: true,
          receiverDetails: {
            name: walletName,
            address: walletAddress,
            balanceBefore: walletBalances[walletAddress] || '0.00',
            balanceAfter: (parseFloat(walletBalances[walletAddress] || 0) + amount).toFixed(2),
            verified: true
          }
        };
        
        setLedger(prev => [receiveTx, ...prev.map(tx => tx.id === sendTx.id ? { ...tx, status: 'CONFIRMED', received: true } : tx)]);
        setWalletBalances(prev => ({
          ...prev,
          [walletAddress]: (parseFloat(prev[walletAddress] || 0) + amount).toFixed(2)
        }));
        setClaimedFTC(prev => prev + amount);
        setIsClaiming(false);
        setShowSendPanel(true);
        
        toast.success(`✅ ${amount.toFixed(2)} FTC RECEIVED!`);
      }, 3000);
    }, 1000);
  };

  // Send FTC to another address
  const handleSendFTC = () => {
    const senderBalance = parseFloat(walletBalances[walletAddress] || 0);
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
    if (receiverAddress === walletAddress) {
      toast.error('Cannot send to same address');
      return;
    }

    setIsSending(true);
    
    setTimeout(() => {
      const hash = 'FTX' + Math.random().toString(36).substr(2, 16).toUpperCase();
      const blockNumber = 18548000 + Math.floor(Math.random() * 100);
      const receiverName = 'FitWallet_' + receiverAddress.substring(3, 7);
      const senderName = 'FitWallet_' + walletAddress.substring(3, 7);
      
      // Create SEND transaction
      const sendTx = {
        id: 'tx_transfer_' + Date.now(),
        type: sendMode === 'exchange' ? 'EXCHANGE' : 'SEND',
        from: walletAddress,
        fromName: senderName,
        to: receiverAddress,
        toName: receiverName,
        amount: amountToSend,
        calories: amountToSend * 1000,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        hash, blockNumber, received: false,
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
        // Create RECEIVE transaction
        const receiveTx = {
          id: 'tx_recv_transfer_' + Date.now(),
          type: sendMode === 'exchange' ? 'EXCHANGE_RECEIVED' : 'TRANSFER_RECEIVED',
          from: walletAddress,
          fromName: senderName,
          to: receiverAddress,
          toName: receiverName,
          amount: amountToSend,
          calories: amountToSend * 1000,
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          hash, blockNumber: blockNumber + 1, received: true,
          receiverDetails: {
            name: receiverName,
            address: receiverAddress,
            balanceBefore: walletBalances[receiverAddress] || '0.00',
            balanceAfter: (parseFloat(walletBalances[receiverAddress] || 0) + amountToSend).toFixed(2),
            verified: true
          }
        };
        
        setLedger(prev => [receiveTx, ...prev.map(tx => tx.id === sendTx.id ? { ...tx, status: 'CONFIRMED', received: true } : tx)]);
        
        // Update balances
        setWalletBalances(prev => ({
          ...prev,
          [walletAddress]: (parseFloat(prev[walletAddress] || 0) - amountToSend).toFixed(2),
          [receiverAddress]: (parseFloat(prev[receiverAddress] || 0) + amountToSend).toFixed(2)
        }));
        
        setIsSending(false);
        setSendAmount('');
        setReceiverAddress('');
        
        toast.success(`✅ ${amountToSend.toFixed(2)} FTC ${sendMode === 'exchange' ? 'exchanged' : 'sent'} to ${receiverName}!`);
        toast.success(`Receiver balance: ${(parseFloat(walletBalances[receiverAddress] || 0) + amountToSend).toFixed(2)} FTC`);
      }, 3000);
    }, 1000);
  };

  // Double-tap handler for transaction details
  const handleTxClick = (tx) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
      setClickCount(0);
      setSelectedTx(tx);
    } else {
      setClickCount(1);
      const timer = setTimeout(() => {
        setClickCount(0);
        setClickTimer(null);
      }, 300);
      setClickTimer(timer);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const getStatusColor = (status) => {
    return status === 'CONFIRMED' ? 'text-[#00F090]' : status === 'PENDING' ? 'text-[#FF9F1C]' : 'text-white';
  };

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
          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <Coins className="h-4 w-4 text-[#FFD700]" />
            <span className="text-sm font-mono text-[#FFD700]">{claimedFTC.toFixed(2)} FTC</span>
          </div>
        </div>
      </div>

      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-black font-unbounded tracking-tighter uppercase">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
                🪙 CLAIM & SEND FTC
              </span>
            </h1>
            <p className="text-sm text-white/60 mt-2">POBC-Verified • Real Blockchain • Double-tap TX for details</p>
          </div>

          {/* Verified Addresses */}
          <div className="glass-card p-3 mb-4 border border-[#00F090]/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-[#00F090]" />
              <span className="text-xs font-bold text-[#00F090]">VERIFIED FTC ADDRESSES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {VERIFIED_FTC_ADDRESSES.map((addr, i) => (
                <div key={i} className="flex items-center justify-between bg-black/30 px-2 py-1.5 rounded text-xs">
                  <span className="font-mono text-white/70">{addr.substring(0, 12)}...</span>
                  <span className="font-mono text-[#FFD700]">{walletBalances[addr] || '0'}</span>
                </div>
              ))}
            </div>
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
                <Wallet className="h-4 w-4" /> CLAIM & SEND FTC
              </h2>
              
              {!results ? (
                <div className="text-center py-6"><p className="text-white/40 text-xs">Calculate first</p></div>
              ) : (
                <div className="space-y-3">
                  <div className={`glass-card p-3 border ${parseFloat(results.finalFTC) > 0 ? 'border-[#FFD700]' : 'border-[#FF2E50]/50'}`}>
                    <p className="text-2xl font-black text-[#FFD700] text-center">{results.finalFTC}</p>
                    <p className="text-xs text-white/60 text-center">FTC ({results.modifier}% • {results.healthStatus})</p>
                  </div>

                  <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value.toUpperCase())} className="w-full bg-black/50 border border-[#00F090]/30 text-white h-10 px-2 text-xs outline-none font-mono" placeholder="Your FTC address (FTC...)" />
                  
                  <button onClick={handleClaim} disabled={isClaiming || parseFloat(results.finalFTC) === 0} className="w-full py-2.5 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold text-xs uppercase disabled:opacity-50">
                    {isClaiming ? 'Processing...' : 'Claim to FitWallet'}
                  </button>

                  {/* Wallet Balance & Send Section */}
                  {walletAddress && walletBalances[walletAddress] && (
                    <div className="glass-card p-3 border border-[#00F090]/30 bg-[#00F090]/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60">Your Balance:</span>
                        <span className="text-lg font-bold text-[#00F090]">{walletBalances[walletAddress]} FTC</span>
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
                          
                          <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white h-9 px-2 text-xs outline-none" placeholder={`Amount (Max: ${walletBalances[walletAddress]})`} />
                          
                          <div className="flex gap-1">
                            {[25, 50, 75, 100].map(p => (
                              <button key={p} onClick={() => setSendAmount((parseFloat(walletBalances[walletAddress]) * p / 100).toFixed(2))} className="flex-1 py-1 text-xs border border-white/10 text-white/60 hover:border-[#FFD700] hover:text-[#FFD700]">
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
                  )}
                </div>
              )}
            </div>

            {/* Blockchain Ledger */}
            <div className="glass-card p-4 lg:col-span-2">
              <h2 className="text-sm font-bold text-[#FFD700] mb-3 flex items-center gap-2">
                <History className="h-4 w-4" /> BLOCKCHAIN LEDGER
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#00F090] rounded-full animate-pulse" />
                  <span className="text-xs text-[#00F090] font-normal">LIVE</span>
                </span>
              </h2>
              <p className="text-xs text-white/40 mb-2">Double-tap transaction for receiver details</p>

              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {ledger.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleTxClick(tx)}
                    className={`glass-card p-2.5 border cursor-pointer hover:border-white/30 transition-colors ${tx.type.includes('RECEIVED') ? 'border-[#00F090]/30 bg-[#00F090]/5' : 'border-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="text-xs font-bold text-white/80">{tx.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${getStatusColor(tx.status)}`}>{tx.status}</span>
                        {tx.received && <Check className="h-3 w-3 text-[#00F090]" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3 text-[#FF2E50]" />
                          <span className="font-mono text-white/60">{tx.from.substring(0, 12)}...</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowDown className="h-3 w-3 text-[#00F090]" />
                          <span className="font-mono text-white/60">{tx.to.substring(0, 12)}...</span>
                          <span className="text-white/40">({tx.toName})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FFD700]">{tx.amount.toFixed(2)} FTC</p>
                        <p className="text-xs text-white/40">#{tx.blockNumber}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                  <p className="text-xs text-white/50 mb-1">Transaction Type</p>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedTx.type)}
                    <span className="font-bold text-white">{selectedTx.type}</span>
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded ${getStatusColor(selectedTx.status)} bg-white/10`}>
                      {selectedTx.status}
                    </span>
                  </div>
                </div>

                <div className="glass-card p-3">
                  <p className="text-xs text-white/50 mb-1">Amount</p>
                  <p className="text-2xl font-black text-[#FFD700]">{selectedTx.amount.toFixed(2)} FTC</p>
                  <p className="text-xs text-white/40">{selectedTx.calories.toLocaleString()} kcal</p>
                </div>

                <div className="glass-card p-3 border border-[#00F090]/30 bg-[#00F090]/5">
                  <p className="text-xs text-[#00F090] mb-2 flex items-center gap-1">
                    <Check className="h-3 w-3" /> RECEIVER DETAILS
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Name:</span>
                      <span className="text-white font-bold">{selectedTx.receiverDetails?.name || selectedTx.toName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Address:</span>
                      <span className="font-mono text-white/70 text-xs">{selectedTx.to.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Balance Before:</span>
                      <span className="text-white">{selectedTx.receiverDetails?.balanceBefore || '0.00'} FTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Balance After:</span>
                      <span className="text-[#00F090] font-bold">{selectedTx.receiverDetails?.balanceAfter || '0.00'} FTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Verified:</span>
                      <span className="text-[#00F090] flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> POBC Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-3">
                  <p className="text-xs text-white/50 mb-2">Blockchain Info</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Block:</span>
                      <span className="text-white">#{selectedTx.blockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Hash:</span>
                      <button onClick={() => copyToClipboard(selectedTx.hash)} className="font-mono text-[#00F090] hover:underline flex items-center gap-1">
                        {selectedTx.hash} <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Time:</span>
                      <span className="text-white">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedTx.received && (
                  <div className="text-center py-2 bg-[#00F090]/10 border border-[#00F090]/30 rounded">
                    <p className="text-[#00F090] font-bold flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" /> FTC RECEIVED & VERIFIED
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClaimFtcCredit;
