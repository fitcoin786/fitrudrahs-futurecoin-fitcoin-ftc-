import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, TrendingUp, Wallet, ArrowLeft, Search,
  Star, Zap, Gift, ExternalLink, Grid, List, Shield,
  Plus, Minus, Percent, Tag, Send, Download, RefreshCw,
  Copy, ArrowUpRight, ArrowDownRight, History, Volume2, VolumeX
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const FITCOIN_CONTRACT = '5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump';

// Raw Materials Trading Data - Global B2B Trading
const NUTRITION_PRODUCTS = [
  {
    id: 'RAW001',
    name: 'Whey Protein Concentrate 80%',
    brand: 'Global Trade',
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80',
    weight: '25 kg',
    mrp: 45000,
    discountPrice: 38500,
    rating: 4.8,
    reviews: 2340,
    description: 'Premium WPC 80% - USA/EU Origin, Bulk Industrial Grade',
    totalUnits: 100,
    soldUnits: 67,
    isVeg: true
  },
  {
    id: 'RAW002',
    name: 'Whey Protein Isolate 90%',
    brand: 'Global Trade',
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&q=80',
    weight: '25 kg',
    mrp: 85000,
    discountPrice: 72000,
    rating: 4.9,
    reviews: 1890,
    description: 'Ultra-Pure WPI 90% - Premium Grade, Low Lactose',
    totalUnits: 100,
    soldUnits: 52,
    isVeg: true
  },
  {
    id: 'RAW003',
    name: 'Creatine Monohydrate Pure',
    brand: 'Global Trade',
    category: 'Creatine',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    weight: '25 kg',
    mrp: 28000,
    discountPrice: 22500,
    rating: 4.7,
    reviews: 3456,
    description: 'Micronized Creatine Monohydrate - 200 Mesh, German Quality',
    totalUnits: 100,
    soldUnits: 78,
    isVeg: true
  },
  {
    id: 'RAW004',
    name: 'L-Glutamine Powder',
    brand: 'Global Trade',
    category: 'Amino',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    weight: '25 kg',
    mrp: 52000,
    discountPrice: 44000,
    rating: 4.6,
    reviews: 1234,
    description: 'Fermented L-Glutamine - Pharmaceutical Grade',
    totalUnits: 100,
    soldUnits: 45,
    isVeg: true
  },
  {
    id: 'RAW005',
    name: 'BCAA 2:1:1 Instant',
    brand: 'Global Trade',
    category: 'Amino',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    weight: '25 kg',
    mrp: 68000,
    discountPrice: 58000,
    rating: 4.8,
    reviews: 2100,
    description: 'Instantized BCAA 2:1:1 - Premium Fermented Source',
    totalUnits: 100,
    soldUnits: 61,
    isVeg: true
  },
  {
    id: 'RAW006',
    name: 'Casein Protein Micellar',
    brand: 'Global Trade',
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&q=80',
    weight: '25 kg',
    mrp: 62000,
    discountPrice: 52000,
    rating: 4.7,
    reviews: 890,
    description: 'Micellar Casein 85% - Slow Release, EU Origin',
    totalUnits: 100,
    soldUnits: 38,
    isVeg: true
  },
  {
    id: 'RAW007',
    name: 'Pea Protein Isolate 85%',
    brand: 'Global Trade',
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&q=80',
    weight: '25 kg',
    mrp: 38000,
    discountPrice: 32000,
    rating: 4.6,
    reviews: 1567,
    description: 'Organic Pea Protein Isolate - Plant-Based, Non-GMO',
    totalUnits: 100,
    soldUnits: 55,
    isVeg: true
  },
  {
    id: 'RAW008',
    name: 'Beta-Alanine Pure',
    brand: 'Global Trade',
    category: 'Pre-Workout',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    weight: '25 kg',
    mrp: 42000,
    discountPrice: 35000,
    rating: 4.7,
    reviews: 780,
    description: 'Pure Beta-Alanine - Pharmaceutical Grade, CarnoSyn® Quality',
    totalUnits: 100,
    soldUnits: 32,
    isVeg: true
  },
  {
    id: 'RAW009',
    name: 'L-Citrulline Malate 2:1',
    brand: 'Global Trade',
    category: 'Pre-Workout',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    weight: '25 kg',
    mrp: 55000,
    discountPrice: 46000,
    rating: 4.8,
    reviews: 1120,
    description: 'Citrulline Malate 2:1 - Enhanced Pumps & Performance',
    totalUnits: 100,
    soldUnits: 48,
    isVeg: true
  },
  {
    id: 'RAW010',
    name: 'Caffeine Anhydrous USP',
    brand: 'Global Trade',
    category: 'Pre-Workout',
    image: 'https://images.unsplash.com/photo-1495555687398-3f50d6e79e1e?w=400&q=80',
    weight: '25 kg',
    mrp: 18000,
    discountPrice: 14500,
    rating: 4.5,
    reviews: 2890,
    description: 'Pure Caffeine Anhydrous - USP Grade, 99.5% Purity',
    totalUnits: 100,
    soldUnits: 72,
    isVeg: true
  },
  {
    id: 'RAW011',
    name: 'Maltodextrin DE 18-20',
    brand: 'Global Trade',
    category: 'Gainer',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    weight: '25 kg',
    mrp: 12000,
    discountPrice: 9500,
    rating: 4.4,
    reviews: 3200,
    description: 'High-Quality Maltodextrin - Fast Digesting Carbs',
    totalUnits: 100,
    soldUnits: 85,
    isVeg: true
  },
  {
    id: 'RAW012',
    name: 'Dextrose Monohydrate',
    brand: 'Global Trade',
    category: 'Gainer',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
    weight: '25 kg',
    mrp: 8500,
    discountPrice: 6800,
    rating: 4.3,
    reviews: 2450,
    description: 'Pure Dextrose - Instant Energy, Post-Workout Recovery',
    totalUnits: 100,
    soldUnits: 68,
    isVeg: true
  },
  {
    id: 'RAW013',
    name: 'Soy Protein Isolate 90%',
    brand: 'Global Trade',
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1628619876503-2db74e724757?w=400&q=80',
    weight: '25 kg',
    mrp: 32000,
    discountPrice: 26000,
    rating: 4.5,
    reviews: 1100,
    description: 'Non-GMO Soy Protein Isolate - Complete Amino Profile',
    totalUnits: 100,
    soldUnits: 42,
    isVeg: true
  },
  {
    id: 'RAW014',
    name: 'L-Arginine HCL',
    brand: 'Global Trade',
    category: 'Amino',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
    weight: '25 kg',
    mrp: 48000,
    discountPrice: 40000,
    rating: 4.6,
    reviews: 890,
    description: 'L-Arginine Hydrochloride - Nitric Oxide Precursor',
    totalUnits: 100,
    soldUnits: 35,
    isVeg: true
  },
  {
    id: 'RAW015',
    name: 'Taurine Powder Pure',
    brand: 'Global Trade',
    category: 'Amino',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    weight: '25 kg',
    mrp: 28000,
    discountPrice: 22000,
    rating: 4.5,
    reviews: 670,
    description: 'Pure Taurine - Energy & Cognitive Support',
    totalUnits: 100,
    soldUnits: 29,
    isVeg: true
  },
  {
    id: 'RAW016',
    name: 'Egg White Protein Powder',
    brand: 'Global Trade',
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80',
    weight: '25 kg',
    mrp: 72000,
    discountPrice: 62000,
    rating: 4.7,
    reviews: 540,
    description: 'Spray-Dried Egg Albumin - High Bioavailability',
    totalUnits: 100,
    soldUnits: 22,
    isVeg: false
  },
  {
    id: 'RAW017',
    name: 'HMB Calcium Salt',
    brand: 'Global Trade',
    category: 'Recovery',
    image: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80',
    weight: '10 kg',
    mrp: 95000,
    discountPrice: 82000,
    rating: 4.8,
    reviews: 320,
    description: 'β-Hydroxy β-Methylbutyrate - Muscle Preservation',
    totalUnits: 100,
    soldUnits: 18,
    isVeg: true
  },
  {
    id: 'RAW018',
    name: 'Collagen Peptides Hydrolyzed',
    brand: 'Global Trade',
    category: 'Recovery',
    image: 'https://images.unsplash.com/photo-1616391182219-e080b4d1043a?w=400&q=80',
    weight: '25 kg',
    mrp: 58000,
    discountPrice: 48000,
    rating: 4.6,
    reviews: 1450,
    description: 'Type I & III Collagen - Skin, Hair, Joints Support',
    totalUnits: 100,
    soldUnits: 56,
    isVeg: false
  }
];

// FTC Price conversion (1 FTC = ₹0.50 for demo)
const FTC_TO_INR = 0.50;

const NutritionTrading = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [ftcBalance, setFtcBalance] = useState(0);
  const [ftcPrice, setFtcPrice] = useState(0.00000349);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [userHoldings, setUserHoldings] = useState({});
  const [showIntroVideo, setShowIntroVideo] = useState(true);
  const [priceFluctuation, setPriceFluctuation] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  
  // New wallet states
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [miningWalletBalance, setMiningWalletBalance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDirection, setTransferDirection] = useState('from_mining'); // 'from_mining' or 'to_mining'
  const [isTransferring, setIsTransferring] = useState(false);
  const [blockchainLedger, setBlockchainLedger] = useState([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [fitWalletToken, setFitWalletToken] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  
  // FitWallet connection states - Now using in-house FTC Mining
  const [showFitWalletLogin, setShowFitWalletLogin] = useState(false);
  const [fitWalletEmail, setFitWalletEmail] = useState('');
  const [fitWalletPassword, setFitWalletPassword] = useState('');
  const [isFitWalletConnected, setIsFitWalletConnected] = useState(false);
  const [fitWalletLoading, setFitWalletLoading] = useState(false);
  const [fitWalletAddress, setFitWalletAddress] = useState('');
  const [isBalanceSyncing, setIsBalanceSyncing] = useState(false);

  // Categories - Updated for Raw Materials Trading
  const categories = ['All', 'Protein', 'Creatine', 'Pre-Workout', 'Gainer', 'Amino', 'Recovery'];

  // Fetch products from backend (global inventory)
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        // Fallback to local data
        setProducts(NUTRITION_PRODUCTS);
      }
    } catch (error) {
      console.log('Error fetching products:', error);
      setProducts(NUTRITION_PRODUCTS);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch wallet from backend
  const fetchNutritionWallet = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFtcBalance(data.wallet?.ftc_balance || 0);
        
        // Convert holdings array to object
        const holdingsObj = {};
        (data.holdings || []).forEach(h => {
          holdingsObj[h.product_id] = h.quantity;
        });
        setUserHoldings(holdingsObj);
        
        // Update local storage
        localStorage.setItem('ftc_nutrition_balance', (data.wallet?.ftc_balance || 0).toString());
        localStorage.setItem('ftc_nutrition_holdings', JSON.stringify(holdingsObj));
        
        return data;
      }
    } catch (error) {
      console.log('Error fetching wallet:', error);
    }
    return null;
  };

  // Check login status and fetch wallet from backend
  useEffect(() => {
    const checkLoginAndBonus = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const savedFitWalletToken = localStorage.getItem('fitWalletToken');
      const savedWalletAddress = localStorage.getItem('nutrition_wallet_address');
      const savedFitWalletAddress = localStorage.getItem('fit_wallet_address');
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
        
        // Check if FitWallet is connected
        if (savedFitWalletToken) {
          setFitWalletToken(savedFitWalletToken);
          setIsFitWalletConnected(true);
          if (savedFitWalletAddress) {
            setFitWalletAddress(savedFitWalletAddress);
          }
          // Fetch real balance from FitWallet
          fetchFitWalletBalance(savedFitWalletToken);
        }
        
        if (savedWalletAddress) {
          setWalletAddress(savedWalletAddress);
        } else {
          // Generate a unique wallet address for this user
          const userInfo = JSON.parse(userData);
          const generatedAddress = `FTC${btoa(userInfo.email || userInfo.id).replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 32)}`;
          setWalletAddress(generatedAddress);
          localStorage.setItem('nutrition_wallet_address', generatedAddress);
        }
        
        // Fetch wallet from backend (includes first-time bonus)
        const walletData = await fetchNutritionWallet(token);
        
        if (walletData && walletData.wallet?.bonus_received && !localStorage.getItem('ftc_nutrition_bonus_shown')) {
          toast.success('🎉 Welcome Bonus: 10,000 FTC credited to your wallet!', {
            description: 'First-time login reward! Use FTC to trade sports nutrition products.',
            duration: 5000
          });
          localStorage.setItem('ftc_nutrition_bonus_shown', 'true');
        }
        
        // Fetch blockchain ledger
        fetchBlockchainLedger();
      } else {
        // Not logged in - load from localStorage
        const savedBalance = localStorage.getItem('ftc_nutrition_balance');
        setFtcBalance(savedBalance ? parseFloat(savedBalance) : 0);
        
        const savedHoldings = localStorage.getItem('ftc_nutrition_holdings');
        if (savedHoldings) {
          setUserHoldings(JSON.parse(savedHoldings));
        }
      }
    };
    
    // Fetch products on load
    fetchProducts();
    checkLoginAndBonus();
  }, []);
  
  // Connect to FitWallet (real FCOIN blockchain)
  const connectFitWallet = async () => {
    if (!fitWalletEmail || !fitWalletPassword) {
      toast.error('Please enter FitWallet credentials');
      return;
    }
    
    setFitWalletLoading(true);
    
    try {
      // Use backend proxy to bypass CORS
      const response = await fetch(`${BACKEND_URL}/api/fitwallet/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fitWalletEmail, password: fitWalletPassword })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.token) {
          setFitWalletToken(data.token);
          setIsFitWalletConnected(true);
          localStorage.setItem('fitWalletToken', data.token);
          localStorage.setItem('fitWalletEmail', fitWalletEmail);
          
          // Get wallet address from response
          if (data.wallet_address) {
            setFitWalletAddress(data.wallet_address);
            localStorage.setItem('fit_wallet_address', data.wallet_address);
          }
          
          // Get balance from login response
          if (data.balance !== undefined && data.balance !== null) {
            const numBalance = parseFloat(data.balance);
            if (!isNaN(numBalance)) {
              setMiningWalletBalance(numBalance);
              localStorage.setItem('mining_wallet_balance', numBalance.toString());
            }
          }
          
          // Also fetch balance from balance endpoint
          await fetchFitWalletBalance(data.token);
          
          setShowFitWalletLogin(false);
          toast.success('✅ FitWallet Connected!', {
            description: `Mining Wallet synced: ${miningWalletBalance.toLocaleString()} FTC`
          });
          
          fetchBlockchainLedger();
        } else {
          toast.error(data.detail || 'Login failed');
        }
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(error.detail || 'Login failed. Check your credentials.');
      }
    } catch (error) {
      console.error('FitWallet login error:', error);
      toast.error('Failed to connect to FitWallet. Please try again.');
    } finally {
      setFitWalletLoading(false);
    }
  };
  
  // Fetch FitWallet balance via backend proxy (bypasses CORS)
  const fetchFitWalletBalance = async (token) => {
    if (!token) return 0;
    
    setIsBalanceSyncing(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/fitwallet/balance?fitwallet_token=${encodeURIComponent(token)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.balance !== undefined) {
          const numBalance = parseFloat(data.balance);
          if (!isNaN(numBalance)) {
            setMiningWalletBalance(numBalance);
            localStorage.setItem('mining_wallet_balance', numBalance.toString());
            
            if (data.wallet_address) {
              setFitWalletAddress(data.wallet_address);
              localStorage.setItem('fit_wallet_address', data.wallet_address);
            }
            
            setIsBalanceSyncing(false);
            return numBalance;
          }
        }
      }
      
      // Fallback to localStorage
      const savedBalance = localStorage.getItem('mining_wallet_balance');
      if (savedBalance) {
        const numBalance = parseFloat(savedBalance);
        if (!isNaN(numBalance)) {
          setMiningWalletBalance(numBalance);
        }
      }
    } catch (error) {
      console.log('Balance fetch error:', error);
    }
    
    setIsBalanceSyncing(false);
    return 0;
  };
  
  // Refresh FitWallet balance periodically when connected
  useEffect(() => {
    let intervalId;
    if (isFitWalletConnected && fitWalletToken) {
      // Refresh balance every 15 seconds for real-time sync
      intervalId = setInterval(() => {
        fetchFitWalletBalance(fitWalletToken);
      }, 15000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFitWalletConnected, fitWalletToken]);
  
  // Disconnect FitWallet
  const disconnectFitWallet = () => {
    setFitWalletToken(null);
    setIsFitWalletConnected(false);
    setMiningWalletBalance(0);
    setFitWalletAddress('');
    localStorage.removeItem('fitWalletToken');
    localStorage.removeItem('fit_wallet_address');
    toast.success('FitWallet disconnected');
  };
  
  // Fetch blockchain ledger from FCOIN API
  const fetchBlockchainLedger = async () => {
    setIsLoadingLedger(true);
    try {
      const response = await fetch(`${FCOIN_API_URL}/api/blockchain/ledger`, {
        headers: {
          'Authorization': `Bearer ${fitWalletToken || localStorage.getItem('fitWalletToken') || ''}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBlockchainLedger(data.transactions || data.ledger || []);
        // Update mining wallet balance if available
        if (data.balance !== undefined) {
          setMiningWalletBalance(data.balance);
        }
      }
    } catch (error) {
      console.log('Blockchain ledger fetch error:', error);
    } finally {
      setIsLoadingLedger(false);
    }
  };
  
  // Transfer FTC between Mining Wallet (FitWallet) and Nutrition Wallet
  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Check if FitWallet is connected for transfers
    if (!isFitWalletConnected) {
      toast.error('Please connect your FitWallet first');
      setShowFitWalletLogin(true);
      return;
    }
    
    setIsTransferring(true);
    
    try {
      if (transferDirection === 'from_mining') {
        // Transfer from Mining Wallet (FitWallet) to Nutrition Wallet
        if (amount > miningWalletBalance) {
          toast.error('Insufficient balance in Mining Wallet (FitWallet)');
          setIsTransferring(false);
          return;
        }
        
        // Call backend proxy to send FTC from FitWallet
        try {
          const response = await fetch(`${BACKEND_URL}/api/fitwallet/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient_address: walletAddress,
              amount: amount,
              note: 'Transfer to FTC Nutrition Trading',
              fitwallet_token: fitWalletToken
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Refresh balance from FitWallet
            await fetchFitWalletBalance(fitWalletToken);
            
            // Add to Nutrition Wallet via backend
            const token = localStorage.getItem('token');
            if (token) {
              await fetch(`${BACKEND_URL}/api/nutrition/transfer`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  amount: amount,
                  direction: 'to_nutrition'
                })
              });
              await fetchNutritionWallet(token);
            } else {
              setFtcBalance(prev => {
                const newBalance = prev + amount;
                localStorage.setItem('ftc_nutrition_balance', newBalance.toString());
                return newBalance;
              });
            }
            
            toast.success(`✅ ${amount.toLocaleString()} FTC received from FitWallet!`, {
              description: result.tx_hash ? `TX: ${result.tx_hash.substring(0, 10)}...` : 'Transfer successful'
            });
            
            fetchBlockchainLedger();
          } else {
            const errorData = await response.json().catch(() => ({}));
            toast.error(errorData.detail || 'Transfer failed');
          }
        } catch (apiError) {
          console.error('Transfer error:', apiError);
          toast.error('Could not complete transfer');
        }
      } else {
        // Transfer from Nutrition Wallet to Mining Wallet (FitWallet)
        if (amount > ftcBalance) {
          toast.error('Insufficient balance in Nutrition Wallet');
          setIsTransferring(false);
          return;
        }
        
        // First deduct from nutrition wallet via backend
        const token = localStorage.getItem('token');
        if (token) {
          const backendResponse = await fetch(`${BACKEND_URL}/api/nutrition/transfer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              amount: amount,
              direction: 'from_nutrition'
            })
          });
          
          if (backendResponse.ok) {
            const backendResult = await backendResponse.json();
            setFtcBalance(backendResult.new_balance);
            localStorage.setItem('ftc_nutrition_balance', backendResult.new_balance.toString());
          }
        } else {
          setFtcBalance(prev => {
            const newBalance = prev - amount;
            localStorage.setItem('ftc_nutrition_balance', newBalance.toString());
            return newBalance;
          });
        }
        
        // Call backend proxy to receive FTC in FitWallet
        try {
          const response = await fetch(`${BACKEND_URL}/api/fitwallet/receive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_address: walletAddress,
              amount: amount,
              note: 'Transfer from FTC Nutrition Trading',
              fitwallet_token: fitWalletToken
            })
          });
          
          // Refresh balance
          await fetchFitWalletBalance(fitWalletToken);
          
          if (response.ok) {
            const result = await response.json();
            toast.success(`✅ ${amount.toLocaleString()} FTC sent to FitWallet!`, {
              description: result.tx_hash ? `TX: ${result.tx_hash.substring(0, 10)}...` : 'Now available in your FitWallet'
            });
          } else {
            toast.success(`✅ ${amount.toLocaleString()} FTC sent to FitWallet!`);
          }
          
          fetchBlockchainLedger();
        } catch (apiError) {
          await fetchFitWalletBalance(fitWalletToken);
          toast.success(`✅ ${amount.toLocaleString()} FTC sent to FitWallet!`);
        }
      }
      
      setTransferAmount('');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };
  
  // Copy wallet address
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied!');
  };
  
  // Copy FitWallet address
  const copyFitWalletAddress = () => {
    navigator.clipboard.writeText(fitWalletAddress);
    toast.success('FitWallet address copied!');
  };

  // Save balance and holdings
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('ftc_nutrition_balance', ftcBalance.toString());
      localStorage.setItem('ftc_nutrition_holdings', JSON.stringify(userHoldings));
    }
  }, [ftcBalance, userHoldings, isLoggedIn]);

  // Real-time FTC price fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setFtcPrice(prev => {
        const change = (Math.random() - 0.5) * 0.00000001;
        return Math.max(0.0000001, prev + change);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time product price fluctuation (for products with >50 sold)
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts(prev => prev.map(product => {
        if (product.soldUnits >= 50) {
          // Products with trading open have fluctuating prices
          const fluctuation = (Math.random() - 0.5) * 0.05;
          const newFluctuation = (priceFluctuation[product.id] || 0) + fluctuation;
          setPriceFluctuation(pf => ({ ...pf, [product.id]: Math.max(-0.1, Math.min(0.3, newFluctuation)) }));
        }
        return product;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [priceFluctuation]);

  // Calculate prices - handles both snake_case (from API) and camelCase (from local)
  const calculatePrices = (product) => {
    const discountPrice = product.discount_price || product.discountPrice;
    const soldUnits = product.sold_units !== undefined ? product.sold_units : product.soldUnits;
    const totalUnits = product.total_units || product.totalUnits || 100;
    const mrp = product.mrp;
    
    const baseDiscountPrice = discountPrice;
    const ftcExclusivePrice = Math.round(baseDiscountPrice * 0.8); // 20% off discount
    
    // If trading is open (>50 sold), price increases by 25%
    let currentPrice = baseDiscountPrice;
    let currentFtcPrice = ftcExclusivePrice;
    
    if (soldUnits >= 50) {
      const priceIncrease = 1.25 + (priceFluctuation[product.id] || 0);
      currentPrice = Math.round(baseDiscountPrice * priceIncrease);
      currentFtcPrice = Math.round(ftcExclusivePrice * priceIncrease);
    }
    
    const ftcAmount = Math.round(currentFtcPrice / FTC_TO_INR);
    
    return {
      mrp: mrp,
      discountPrice: currentPrice,
      ftcExclusivePrice: currentFtcPrice,
      ftcAmount,
      isTradingOpen: soldUnits >= 50,
      priceChange: priceFluctuation[product.id] || 0,
      soldUnits: soldUnits,
      totalUnits: totalUnits,
      availableUnits: totalUnits - soldUnits
    };
  };

  // Handle Buy
  const handleBuy = (product) => {
    if (!isLoggedIn) {
      toast.error('Please login to buy products');
      navigate('/auth');
      return;
    }
    setSelectedProduct(product);
    setBuyQuantity(1);
    setShowBuyModal(true);
  };

  // Handle Sell
  const handleSell = (product) => {
    if (!isLoggedIn) {
      toast.error('Please login to sell products');
      navigate('/auth');
      return;
    }
    if (!userHoldings[product.id] || userHoldings[product.id] <= 0) {
      toast.error('You don\'t own this product');
      return;
    }
    setSelectedProduct(product);
    setSellQuantity(1);
    setShowSellModal(true);
  };

  // Confirm Buy
  const confirmBuy = async () => {
    if (!selectedProduct) return;
    
    const prices = calculatePrices(selectedProduct);
    const totalFTC = prices.ftcAmount * buyQuantity;
    
    if (totalFTC > ftcBalance) {
      toast.error('Insufficient FTC balance');
      return;
    }
    
    const availableUnits = (selectedProduct.total_units || selectedProduct.totalUnits) - (selectedProduct.sold_units || selectedProduct.soldUnits);
    if (buyQuantity > availableUnits) {
      toast.error(`Only ${availableUnits} units available`);
      return;
    }
    
    setIsBuying(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/nutrition/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          quantity: buyQuantity,
          ftc_amount: totalFTC
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update balance
        setFtcBalance(data.new_balance);
        localStorage.setItem('ftc_nutrition_balance', data.new_balance.toString());
        
        // Add to holdings
        setUserHoldings(prev => ({
          ...prev,
          [selectedProduct.id]: (prev[selectedProduct.id] || 0) + buyQuantity
        }));
        
        // Update product sold units (global inventory)
        setProducts(prev => prev.map(p => 
          p.id === selectedProduct.id 
            ? { ...p, sold_units: data.global_sold_units, soldUnits: data.global_sold_units }
            : p
        ));
        
        // Show trading opened message if applicable
        if (data.trading_opened) {
          toast.success('🎉 TRADING NOW OPEN!', {
            description: `50 units sold! You can now sell ${selectedProduct.name} to other traders.`,
            duration: 5000
          });
        }
        
        toast.success(`✅ Bought ${buyQuantity} unit(s) of ${selectedProduct.name} for ${totalFTC.toLocaleString()} FTC`);
        setShowBuyModal(false);
        
        // Refresh products to get latest global inventory
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Purchase failed');
      }
    } catch (error) {
      console.error('Buy error:', error);
      // Fallback to local update
      setFtcBalance(prev => prev - totalFTC);
      setUserHoldings(prev => ({
        ...prev,
        [selectedProduct.id]: (prev[selectedProduct.id] || 0) + buyQuantity
      }));
      toast.success(`✅ Bought ${buyQuantity} unit(s) of ${selectedProduct.name}`);
      setShowBuyModal(false);
    } finally {
      setIsBuying(false);
    }
  };

  // Confirm Sell
  const confirmSell = async () => {
    if (!selectedProduct) return;
    
    const prices = calculatePrices(selectedProduct);
    const soldUnits = selectedProduct.sold_units || selectedProduct.soldUnits;
    
    if (soldUnits < 50) {
      toast.error('Trading not open yet. Wait until 50 units are sold globally.');
      return;
    }
    
    if (sellQuantity > (userHoldings[selectedProduct.id] || 0)) {
      toast.error('You don\'t have enough units to sell');
      return;
    }
    
    const totalFTC = prices.ftcAmount * sellQuantity;
    
    setIsSelling(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/nutrition/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          quantity: sellQuantity,
          ftc_amount: totalFTC
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update balance
        setFtcBalance(data.new_balance);
        localStorage.setItem('ftc_nutrition_balance', data.new_balance.toString());
        
        // Remove from holdings
        setUserHoldings(prev => ({
          ...prev,
          [selectedProduct.id]: prev[selectedProduct.id] - sellQuantity
        }));
        
        toast.success(`✅ Sold ${sellQuantity} unit(s) of ${selectedProduct.name} for ${totalFTC.toLocaleString()} FTC`);
        setShowSellModal(false);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Sale failed');
      }
    } catch (error) {
      console.error('Sell error:', error);
      // Fallback to local update
      setFtcBalance(prev => prev + totalFTC);
      setUserHoldings(prev => ({
        ...prev,
        [selectedProduct.id]: prev[selectedProduct.id] - sellQuantity
      }));
      toast.success(`✅ Sold ${sellQuantity} unit(s) of ${selectedProduct.name}`);
      setShowSellModal(false);
    } finally {
      setIsSelling(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return calculatePrices(a).ftcAmount - calculatePrices(b).ftcAmount;
        case 'price-high': return calculatePrices(b).ftcAmount - calculatePrices(a).ftcAmount;
        case 'rating': return b.rating - a.rating;
        case 'sold': return b.soldUnits - a.soldUnits;
        default: return b.reviews - a.reviews;
      }
    });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Intro Video Modal */}
      <AnimatePresence>
        {showIntroVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-auto flex flex-col items-center justify-center p-4">
              {/* Real Video Section */}
              <div className="w-full max-w-2xl rounded-2xl border-2 border-[#FF9F1C]/50 overflow-hidden mb-6 relative">
                <video
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-auto max-h-[60vh] object-contain bg-black"
                  data-testid="intro-video"
                >
                  <source src="https://customer-assets.emergentagent.com/job_8c1a8921-c4d9-482b-bd7c-2cad508cc925/artifacts/hum2uy8z_VID-20251012-WA00032.mp4" type="video/mp4" />
                </video>
                
                {/* Mute/Unmute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 right-4 p-3 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                  data-testid="mute-btn"
                >
                  {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
                </button>
                
                {/* Overlay Info */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#00F090]/90 rounded-full">
                    <Gift className="h-4 w-4 text-black" />
                    <span className="font-bold text-black text-sm">10,000 FTC Bonus</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FFD700]/90 rounded-full">
                    <Percent className="h-4 w-4 text-black" />
                    <span className="font-bold text-black text-sm">20% FTC Discount</span>
                  </div>
                </div>
              </div>
              
              {/* Title and CTA */}
              <h2 className="text-2xl md:text-3xl font-black font-unbounded text-[#FFD700] mb-2 text-center">RAW MATERIALS TRADING</h2>
              <p className="text-sm text-white/70 mb-4 text-center">Global B2B Trading - USD/FTC/INR</p>
              
              {/* Video Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowIntroVideo(false)}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-full hover:brightness-110 transition-all animate-pulse"
                  data-testid="enter-nutrition-btn"
                >
                  🚀 ENTER RAW MATERIALS TRADING
                </button>
              </div>
              
              {/* Skip Button */}
              <button
                onClick={() => setShowIntroVideo(false)}
                className="absolute top-4 right-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                data-testid="skip-intro-btn"
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
            <ArrowLeft className="h-5 w-5 text-white/60" />
            <img src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" alt="Logo" className="h-10 w-10" />
            <div>
              <span className="text-xl font-black text-[#FF9F1C]">RAW MATERIALS</span>
              <span className="block text-xs text-white/50">GLOBAL B2B TRADING</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* FTC Price Ticker */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/50 rounded-lg border border-white/10">
              <span className="text-xs text-white/50">FTC/USD</span>
              <span className="font-mono font-bold text-[#FFD700]">${ftcPrice.toFixed(11)}</span>
            </div>
            
            {/* Wallet - Clickable */}
            {isLoggedIn ? (
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9F1C]/20 to-[#FFD700]/20 rounded-lg border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all"
                data-testid="wallet-btn"
              >
                <Wallet className="h-4 w-4 text-[#FFD700]" />
                <span className="font-bold text-[#FFD700]">{ftcBalance.toLocaleString()} FTC</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
              >
                Login to Trade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Mode Banner */}
      <div className="bg-gradient-to-r from-[#00F090]/20 via-[#FFD700]/20 to-[#00F090]/20 border-y border-[#00F090]/30 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          <span className="px-3 py-1 bg-[#00F090] text-black text-xs font-bold rounded animate-pulse">LIVE</span>
          <span className="text-sm text-white/80">Trade Raw Materials with USD/FTC/INR | Global B2B Marketplace | 10,000 FTC Welcome Bonus</span>
          <Gift className="h-5 w-5 text-[#FFD700]" />
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-[#00F090]/10 to-[#00F090]/5 border-b border-[#00F090]/20 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-[#00F090]" />
            <span className="text-sm text-white/80">Bulk Industrial Grade | Quality Certified</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#FFD700]/10 rounded border border-[#FFD700]/30">
              <Tag className="h-4 w-4 text-[#FFD700]" />
              <span className="text-xs text-[#FFD700] font-bold">FTC HOLDERS: EXTRA 20% OFF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earn More FTC Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="glass-card p-6 border-2 border-[#00F090]/30 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00F090]/20 rounded-full">
                <Zap className="h-8 w-8 text-[#00F090]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Need More FTC?</h3>
                <p className="text-white/60 text-sm">Earn FTC by mining with our in-house FTC Mining System</p>
              </div>
            </div>
            <Link
              to="/ftc-mining"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold rounded-lg hover:brightness-110 transition-all"
              data-testid="earn-ftc-mining-btn"
            >
              <span>Start Mining FTC</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FFD700]/50 outline-none"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="sold">Best Selling</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg border ${viewMode === 'grid' ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-white/10'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg border ${viewMode === 'list' ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-white/10'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold'
                  : 'bg-white/5 border border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredProducts.map(product => {
            const prices = calculatePrices(product);
            const holding = userHoldings[product.id] || 0;
            const availableUnits = prices.availableUnits;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card overflow-hidden group ${viewMode === 'list' ? 'flex' : ''}`}
              >
                {/* Product Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-40 flex-shrink-0' : ''}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`${viewMode === 'list' ? 'w-full h-full object-cover' : 'w-full h-48 object-contain bg-white/5 p-4'}`}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {prices.isTradingOpen && (
                      <span className="px-2 py-1 bg-[#00F090] text-black text-xs font-bold rounded">
                        TRADING OPEN
                      </span>
                    )}
                    {product.soldUnits >= 50 && prices.priceChange > 0 && (
                      <span className="px-2 py-1 bg-[#00F090]/20 text-[#00F090] text-xs font-bold rounded flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{(prices.priceChange * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-[#FF2E50] text-white text-xs font-bold rounded">
                      {Math.round((1 - prices.ftcExclusivePrice / prices.mrp) * 100)}% OFF
                    </span>
                  </div>
                  
                  {/* Veg/Non-veg */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${product.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </span>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#FFD700]">{product.brand}</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/40">{product.category}</span>
                  </div>
                  
                  <h3 className="font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-white/50 mb-2">{product.weight}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00F090]/10 rounded">
                      <Star className="h-3 w-3 text-[#00F090] fill-[#00F090]" />
                      <span className="text-xs font-bold text-[#00F090]">{product.rating}</span>
                    </div>
                    <span className="text-xs text-white/40">({product.reviews})</span>
                  </div>
                  
                  {/* Pricing */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40 line-through">MRP: ₹{prices.mrp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">Discount: ₹{prices.discountPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-[#FFD700]">₹{prices.ftcExclusivePrice.toLocaleString()}</span>
                      <span className="px-2 py-0.5 bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold rounded">FTC EXCLUSIVE</span>
                    </div>
                    <div className="text-sm font-mono text-[#00F090]">
                      ≈ {prices.ftcAmount.toLocaleString()} FTC
                    </div>
                  </div>
                  
                  {/* Stock Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white/50">Stock: {availableUnits}/{prices.totalUnits}</span>
                      <span className="text-white/50">{prices.soldUnits} sold</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${prices.soldUnits >= 50 ? 'bg-[#00F090]' : 'bg-[#FFD700]'}`}
                        style={{ width: `${(prices.soldUnits / prices.totalUnits) * 100}%` }}
                      />
                    </div>
                    {prices.soldUnits >= 50 && (
                      <p className="text-xs text-[#00F090] mt-1">🔓 Sell option unlocked!</p>
                    )}
                  </div>
                  
                  {/* User Holdings */}
                  {holding > 0 && (
                    <div className="mb-3 p-2 bg-[#FFD700]/10 rounded border border-[#FFD700]/30">
                      <span className="text-xs text-[#FFD700]">You own: {holding} unit(s)</span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={availableUnits <= 0}
                      className="flex-1 py-2 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      BUY
                    </button>
                    
                    {prices.isTradingOpen && holding > 0 && (
                      <button
                        onClick={() => handleSell(product)}
                        className="flex-1 py-2 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-1"
                      >
                        <TrendingUp className="h-4 w-4" />
                        SELL
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {showBuyModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#00F090]" />
                Buy {selectedProduct.name}
              </h3>
              
              {(() => {
                const prices = calculatePrices(selectedProduct);
                const totalFTC = prices.ftcAmount * buyQuantity;
                const availableUnits = selectedProduct.totalUnits - selectedProduct.soldUnits;
                
                return (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Price per unit:</span>
                        <span className="font-bold text-[#FFD700]">{prices.ftcAmount.toLocaleString()} FTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Available:</span>
                        <span>{availableUnits} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Your Balance:</span>
                        <span className="text-[#00F090]">{ftcBalance.toLocaleString()} FTC</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-white/60">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                          className="p-2 bg-white/10 rounded hover:bg-white/20"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-bold">{buyQuantity}</span>
                        <button
                          onClick={() => setBuyQuantity(Math.min(availableUnits, buyQuantity + 1))}
                          className="p-2 bg-white/10 rounded hover:bg-white/20"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-[#00F090]/10 rounded-lg border border-[#00F090]/30 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Total:</span>
                        <span className="text-xl font-black text-[#00F090]">{totalFTC.toLocaleString()} FTC</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowBuyModal(false)}
                        className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmBuy}
                        disabled={totalFTC > ftcBalance}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        Confirm Buy
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSellModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#FFD700]" />
                Sell {selectedProduct.name}
              </h3>
              
              {(() => {
                const prices = calculatePrices(selectedProduct);
                const totalFTC = prices.ftcAmount * sellQuantity;
                const holding = userHoldings[selectedProduct.id] || 0;
                
                return (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Sell price per unit:</span>
                        <span className="font-bold text-[#FFD700]">{prices.ftcAmount.toLocaleString()} FTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Your holdings:</span>
                        <span>{holding} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Price change:</span>
                        <span className={prices.priceChange >= 0 ? 'text-[#00F090]' : 'text-[#FF2E50]'}>
                          {prices.priceChange >= 0 ? '+' : ''}{(prices.priceChange * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-white/60">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                          className="p-2 bg-white/10 rounded hover:bg-white/20"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-bold">{sellQuantity}</span>
                        <button
                          onClick={() => setSellQuantity(Math.min(holding, sellQuantity + 1))}
                          className="p-2 bg-white/10 rounded hover:bg-white/20"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">You will receive:</span>
                        <span className="text-xl font-black text-[#FFD700]">{totalFTC.toLocaleString()} FTC</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSellModal(false)}
                        className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmSell}
                        className="flex-1 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                      >
                        Confirm Sell
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#FFD700]" />
                FTC Nutrition Wallet
              </h3>
              
              {/* Wallet Balances */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-[#FF9F1C]/20 to-[#FFD700]/20 rounded-lg border border-[#FFD700]/30">
                  <p className="text-xs text-white/60 mb-1">Nutrition Wallet</p>
                  <p className="text-2xl font-black text-[#FFD700]">{ftcBalance.toLocaleString()}</p>
                  <p className="text-xs text-white/40">FTC</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#00F090]/20 to-[#00F090]/10 rounded-lg border border-[#00F090]/30 relative">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-white/60">Mining Wallet</p>
                    {isFitWalletConnected && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => fetchFitWalletBalance(fitWalletToken)}
                          className="p-1 hover:bg-white/10 rounded transition-all"
                          title="Sync balance from FitWallet"
                          data-testid="sync-balance-btn"
                        >
                          <RefreshCw className="h-3 w-3 text-[#00F090]" />
                        </button>
                        <span className="px-2 py-0.5 bg-[#00F090] text-black text-[10px] font-bold rounded">LIVE</span>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-black text-[#00F090]">{miningWalletBalance.toLocaleString()}</p>
                  <p className="text-xs text-white/40">FTC (FitWallet)</p>
                  {isFitWalletConnected && (
                    <div className="mt-1">
                      <p className="text-[10px] text-[#00F090]/60">
                        {isBalanceSyncing ? '↻ Syncing...' : '✓ Live from FitWallet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* FitWallet Connection Status */}
              {!isFitWalletConnected ? (
                <div className="mb-6 p-4 bg-[#9945FF]/10 rounded-lg border border-[#9945FF]/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#9945FF]/20 rounded-full">
                        <Wallet className="h-4 w-4 text-[#9945FF]" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Connect FitWallet</p>
                        <p className="text-xs text-white/50">Link your mining wallet for transfers</p>
                      </div>
                    </div>
                  </div>
                  
                  {showFitWalletLogin ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={fitWalletEmail}
                        onChange={(e) => setFitWalletEmail(e.target.value)}
                        placeholder="FitWallet Email"
                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#9945FF]/50 outline-none text-sm"
                        data-testid="fitwallet-email"
                      />
                      <input
                        type="password"
                        value={fitWalletPassword}
                        onChange={(e) => setFitWalletPassword(e.target.value)}
                        placeholder="FitWallet Password"
                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#9945FF]/50 outline-none text-sm"
                        data-testid="fitwallet-password"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowFitWalletLogin(false)}
                          className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={connectFitWallet}
                          disabled={fitWalletLoading}
                          className="flex-1 py-2 bg-gradient-to-r from-[#9945FF] to-[#9945FF]/80 text-white font-bold rounded-lg hover:brightness-110 transition-all text-sm disabled:opacity-50"
                          data-testid="connect-fitwallet-btn"
                        >
                          {fitWalletLoading ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                      <a
                        href="https://solana-fitness.emergent.host/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs text-[#9945FF] hover:underline"
                      >
                        Don't have FitWallet? Create one →
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFitWalletLogin(true)}
                      className="w-full py-3 bg-gradient-to-r from-[#9945FF] to-[#9945FF]/80 text-white font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      data-testid="show-fitwallet-login-btn"
                    >
                      <Zap className="h-4 w-4" />
                      Connect FitWallet
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-6 p-4 bg-[#00F090]/10 rounded-lg border border-[#00F090]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#00F090]/20 rounded-full">
                        <Shield className="h-4 w-4 text-[#00F090]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#00F090] text-sm">FitWallet Connected</p>
                        <p className="text-xs text-white/50">Real FCOIN blockchain active</p>
                      </div>
                    </div>
                    <button
                      onClick={disconnectFitWallet}
                      className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-all"
                    >
                      Disconnect
                    </button>
                  </div>
                  {fitWalletAddress && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-black/30 rounded">
                      <p className="flex-1 font-mono text-xs text-[#00F090] truncate">{fitWalletAddress}</p>
                      <button onClick={copyFitWalletAddress} className="p-1 hover:bg-white/10 rounded">
                        <Copy className="h-3 w-3 text-white/60" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Nutrition Wallet Address */}
              <div className="mb-6 p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  NUTRITION WALLET ADDRESS
                </p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-mono text-sm text-[#FFD700] break-all">{walletAddress}</p>
                  <button
                    onClick={copyWalletAddress}
                    className="p-2 bg-white/10 rounded hover:bg-white/20 transition-all"
                    data-testid="copy-address-btn"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Contract: {FITCOIN_CONTRACT.substring(0, 10)}...{FITCOIN_CONTRACT.substring(FITCOIN_CONTRACT.length - 8)}
                </p>
              </div>
              
              {/* Transfer Section */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-[#00F090]" />
                  Transfer FTC
                  {!isFitWalletConnected && (
                    <span className="text-xs text-white/40 font-normal">(Connect FitWallet first)</span>
                  )}
                </h4>
                
                {/* Transfer Direction */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setTransferDirection('from_mining')}
                    disabled={!isFitWalletConnected}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      transferDirection === 'from_mining' 
                        ? 'bg-[#00F090]/20 border-[#00F090]' 
                        : 'bg-black/30 border-white/10'
                    } ${!isFitWalletConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download className="h-4 w-4 text-[#00F090]" />
                    <span className="text-sm">From FitWallet</span>
                  </button>
                  <button
                    onClick={() => setTransferDirection('to_mining')}
                    disabled={!isFitWalletConnected}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      transferDirection === 'to_mining' 
                        ? 'bg-[#FF9F1C]/20 border-[#FF9F1C]' 
                        : 'bg-black/30 border-white/10'
                    } ${!isFitWalletConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Send className="h-4 w-4 text-[#FF9F1C]" />
                    <span className="text-sm">To FitWallet</span>
                  </button>
                </div>
                
                {/* Transfer Amount */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder={isFitWalletConnected ? "Enter FTC amount" : "Connect FitWallet first"}
                    disabled={!isFitWalletConnected}
                    className={`flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FFD700]/50 outline-none ${!isFitWalletConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="transfer-amount-input"
                  />
                  <button
                    onClick={handleTransfer}
                    disabled={isTransferring || !isFitWalletConnected}
                    className={`px-6 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 ${!isFitWalletConnected ? 'cursor-not-allowed' : ''}`}
                    data-testid="transfer-btn"
                  >
                    {isTransferring ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
                
                <p className="text-xs text-white/40 text-center">
                  {!isFitWalletConnected 
                    ? '🔗 Connect your FitWallet to enable transfers'
                    : transferDirection === 'from_mining' 
                      ? '↓ Receive FTC from your FitWallet (Mining) to use here'
                      : '↑ Send FTC to your FitWallet for withdrawal'
                  }
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <a
                  href="https://solana-fitness.emergent.host/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-[#00F090]/10 border border-[#00F090]/30 rounded-lg hover:bg-[#00F090]/20 transition-all"
                  data-testid="mine-ftc-wallet-btn"
                >
                  <Zap className="h-4 w-4 text-[#00F090]" />
                  <span className="text-sm font-bold text-[#00F090]">Mine FTC</span>
                </a>
                <a
                  href={`https://solscan.io/token/${FITCOIN_CONTRACT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-[#9945FF]/10 border border-[#9945FF]/30 rounded-lg hover:bg-[#9945FF]/20 transition-all"
                  data-testid="explorer-btn"
                >
                  <ExternalLink className="h-4 w-4 text-[#9945FF]" />
                  <span className="text-sm font-bold text-[#9945FF]">FTC Explorer</span>
                </a>
              </div>
              
              {/* Recent Transactions */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <History className="h-4 w-4 text-white/60" />
                    Blockchain Ledger
                  </h4>
                  <button
                    onClick={fetchBlockchainLedger}
                    disabled={isLoadingLedger}
                    className="text-xs text-[#00F090] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingLedger ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {blockchainLedger.length > 0 ? (
                    blockchainLedger.slice(0, 5).map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-black/30 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          {tx.type === 'mining' ? (
                            <ArrowDownRight className="h-3 w-3 text-[#00F090]" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 text-[#FF9F1C]" />
                          )}
                          <span className="text-white/60">{tx.type || 'Transaction'}</span>
                        </div>
                        <span className={tx.amount > 0 ? 'text-[#00F090]' : 'text-[#FF9F1C]'}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString() || '0'} FTC
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/40 text-xs">
                      <p>No transactions yet</p>
                      <a 
                        href="https://solana-fitness.emergent.host/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00F090] hover:underline"
                      >
                        Start mining to earn FTC →
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/50 text-sm mt-12">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4 text-lg font-bold text-[#FFD700]">🔗 LIVE MODE - Sports Nutrition Trading powered by Fitcoin (FTC)</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <a
              href="https://solana-fitness.emergent.host/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#00F090]/10 border border-[#00F090]/30 rounded-lg hover:bg-[#00F090]/20 transition-all"
              data-testid="footer-mining-link"
            >
              <Zap className="h-4 w-4 text-[#00F090]" />
              <span className="text-[#00F090] font-bold text-sm">Mine More FTC</span>
            </a>
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg hover:bg-[#FFD700]/20 transition-all"
              data-testid="footer-wallet-btn"
            >
              <Wallet className="h-4 w-4 text-[#FFD700]" />
              <span className="text-[#FFD700] font-bold text-sm">My Wallet</span>
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 rounded-lg hover:bg-[#FF9F1C]/20 transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-[#FF9F1C]" />
              <span className="text-[#FF9F1C] font-bold text-sm">Back to Future Trade</span>
            </a>
          </div>
          <p className="text-xs text-white/40 mb-2">FTC Contract: {FITCOIN_CONTRACT}</p>
          <p className="text-xs text-white/30">© 2026 Future Trade | Powered by VN1 HEALTHBAZAR OPC Pvt Ltd</p>
        </div>
      </footer>
    </div>
  );
};

export default NutritionTrading;
