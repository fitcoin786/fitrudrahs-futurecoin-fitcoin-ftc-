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
const FCOIN_API_URL = 'https://solana-fitness.emergent.host';
const FITCOIN_CONTRACT = '5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump';

// Sports Nutrition Products Data (Real products from Nutrabay)
const NUTRITION_PRODUCTS = [
  {
    id: 'NUT001',
    name: 'Gold Whey Protein Concentrate',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1061-05-1756463421-200x200.webp',
    weight: '1 kg',
    mrp: 3899,
    discountPrice: 2499,
    rating: 4.7,
    reviews: 1885,
    description: '24g protein per serving, Rich Chocolate flavor',
    totalUnits: 100,
    soldUnits: 32,
    isVeg: true
  },
  {
    id: 'NUT002',
    name: 'Pure Creatine Monohydrate',
    brand: 'FitNutra',
    category: 'Creatine',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1009-05-1770199222-200x200.webp',
    weight: '400g',
    mrp: 1419,
    discountPrice: 749,
    rating: 4.7,
    reviews: 4623,
    description: 'Micronized formula, Unflavoured',
    totalUnits: 100,
    soldUnits: 67,
    isVeg: true
  },
  {
    id: 'NUT003',
    name: 'Gold Pea Protein',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1102-02-1770962118-200x200.webp',
    weight: '1 kg',
    mrp: 1669,
    discountPrice: 1349,
    rating: 4.7,
    reviews: 691,
    description: 'Plant-based protein, Rich Chocolate Creme',
    totalUnits: 100,
    soldUnits: 45,
    isVeg: true
  },
  {
    id: 'NUT004',
    name: 'RageX Pre-Workout',
    brand: 'FitNutra',
    category: 'Pre-Workout',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1095-02-1767359117-200x200.webp',
    weight: '360g',
    mrp: 1399,
    discountPrice: 999,
    rating: 4.7,
    reviews: 76,
    description: 'L-Citrulline, Beta-Alanine, Caffeine, Cola flavor',
    totalUnits: 100,
    soldUnits: 28,
    isVeg: true
  },
  {
    id: 'NUT005',
    name: 'Fish Oil Omega 3 Triple Strength',
    brand: 'FitNutra',
    category: 'Vitamins',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/featured_image-NB-NUT-1027-01-1753300227-400x400.webp',
    weight: '60 Caps',
    mrp: 1199,
    discountPrice: 699,
    rating: 4.8,
    reviews: 398,
    description: '1250mg with EPA & DHA',
    totalUnits: 100,
    soldUnits: 55,
    isVeg: false
  },
  {
    id: 'NUT006',
    name: 'Mass Gainer Bulk Up',
    brand: 'FitNutra',
    category: 'Gainer',
    image: 'https://cdn.nutrabay.com/wp-content/uploads/2023/06/NB-NUT-1072-02-01-340x340.jpg',
    weight: '3 kg',
    mrp: 3899,
    discountPrice: 2199,
    rating: 4.7,
    reviews: 207,
    description: 'High calorie formula, Chocolate',
    totalUnits: 100,
    soldUnits: 41,
    isVeg: true
  },
  {
    id: 'NUT007',
    name: 'Multivitamin for Men',
    brand: 'FitNutra',
    category: 'Vitamins',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1026-04-1771595719-200x200.webp',
    weight: '120 Tabs',
    mrp: 819,
    discountPrice: 399,
    rating: 4.7,
    reviews: 771,
    description: 'Complete daily nutrition',
    totalUnits: 100,
    soldUnits: 72,
    isVeg: true
  },
  {
    id: 'NUT008',
    name: 'BCAA Energy Drink',
    brand: 'FitNutra',
    category: 'Amino',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1073-04-1772780418-200x200.webp',
    weight: '250g',
    mrp: 909,
    discountPrice: 529,
    rating: 4.7,
    reviews: 3340,
    description: 'Micronized formula, Orange flavor',
    totalUnits: 100,
    soldUnits: 38,
    isVeg: true
  },
  {
    id: 'NUT009',
    name: 'L-Carnitine Liquid',
    brand: 'FitNutra',
    category: 'Fat Burner',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1071-02-400x400.webp',
    weight: '450ml',
    mrp: 1269,
    discountPrice: 749,
    rating: 4.8,
    reviews: 155,
    description: '3000mg + Vitamin B5, Mango Strawberry',
    totalUnits: 100,
    soldUnits: 23,
    isVeg: true
  },
  {
    id: 'NUT010',
    name: 'ZMA Sleep & Recovery',
    brand: 'FitNutra',
    category: 'Recovery',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1033-02-1770723016-200x200.webp',
    weight: '60 Tabs',
    mrp: 539,
    discountPrice: 339,
    rating: 4.8,
    reviews: 139,
    description: 'Zinc + Magnesium + B6',
    totalUnits: 100,
    soldUnits: 48,
    isVeg: true
  },
  {
    id: 'NUT011',
    name: 'Pure Pea Protein Isolate',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/featured_image-NB-NUT-1048-01-1770381916-400x400.webp',
    weight: '1 kg',
    mrp: 1499,
    discountPrice: 849,
    rating: 4.7,
    reviews: 1675,
    description: '100% Plant protein, Unflavoured',
    totalUnits: 100,
    soldUnits: 61,
    isVeg: true
  },
  {
    id: 'NUT012',
    name: 'BioAbsorb Whey Protein',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1096-06-400x400.webp',
    weight: '1 kg',
    mrp: 4099,
    discountPrice: 2899,
    rating: 4.7,
    reviews: 483,
    description: '26g Protein, ProDiFi Blend, Milk Chocolate',
    totalUnits: 100,
    soldUnits: 19,
    isVeg: true
  },
  {
    id: 'NUT013',
    name: 'High Protein Oats',
    brand: 'FitNutra',
    category: 'Health Food',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1098-01-1753305037-200x200.webp',
    weight: '750g',
    mrp: 699,
    discountPrice: 499,
    rating: 4.7,
    reviews: 172,
    description: 'Dark Chocolate Raisin flavor',
    totalUnits: 100,
    soldUnits: 35,
    isVeg: true
  },
  {
    id: 'NUT014',
    name: 'Vital Whey Protein',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1064-03-1758998117-200x200.webp',
    weight: '1 kg',
    mrp: 1709,
    discountPrice: 999,
    rating: 4.7,
    reviews: 309,
    description: 'Beginner friendly, Kesar Kulfi',
    totalUnits: 100,
    soldUnits: 52,
    isVeg: true
  },
  {
    id: 'NUT015',
    name: 'Tri-Blend Whey Protein',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1014-05-400x400.webp',
    weight: '1 kg',
    mrp: 3699,
    discountPrice: 2699,
    rating: 4.7,
    reviews: 172,
    description: 'Double Chocolate flavor',
    totalUnits: 100,
    soldUnits: 29,
    isVeg: true
  },
  {
    id: 'NUT016',
    name: 'Yeast Protein Powder',
    brand: 'FitNutra',
    category: 'Protein',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1103-04-1770729316-200x200.webp',
    weight: '1 kg',
    mrp: 2399,
    discountPrice: 1899,
    rating: 4.4,
    reviews: 43,
    description: 'Rich Chocolate Creme',
    totalUnits: 100,
    soldUnits: 15,
    isVeg: true
  },
  {
    id: 'NUT017',
    name: 'Ashwagandha Extract',
    brand: 'FitNutra',
    category: 'Ayurveda',
    image: 'https://cdn2.nutrabay.com/marketing-promotions/Ashwagandha-1770189032.webp',
    weight: '60 Caps',
    mrp: 599,
    discountPrice: 349,
    rating: 4.6,
    reviews: 892,
    description: 'KSM-66 formula, Stress relief',
    totalUnits: 100,
    soldUnits: 44,
    isVeg: true
  },
  {
    id: 'NUT018',
    name: 'Marine Collagen Peptides',
    brand: 'FitNutra',
    category: 'Beauty',
    image: 'https://cdn2.nutrabay.com/uploads/variant/images/thumbnail_image-NB-NUT-1056-01-1753303187-200x200.webp',
    weight: '200g',
    mrp: 1859,
    discountPrice: 649,
    rating: 4.8,
    reviews: 16,
    description: 'Korean formula with Biotin, Mango',
    totalUnits: 100,
    soldUnits: 8,
    isVeg: false
  }
];

// FTC Price conversion (1 FTC = ₹0.50 for demo)
const FTC_TO_INR = 0.50;

const NutritionTrading = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(NUTRITION_PRODUCTS);
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

  // Categories
  const categories = ['All', 'Protein', 'Creatine', 'Pre-Workout', 'Vitamins', 'Gainer', 'Amino', 'Fat Burner', 'Recovery', 'Health Food', 'Ayurveda', 'Beauty'];

  // Check login status and grant first-time 10,000 FTC bonus
  useEffect(() => {
    const checkLoginAndBonus = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const savedFitWalletToken = localStorage.getItem('fitWalletToken');
      const savedWalletAddress = localStorage.getItem('nutrition_wallet_address');
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
        
        if (savedFitWalletToken) {
          setFitWalletToken(savedFitWalletToken);
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
        
        // Check if user already received promotional FTC (first-time login only)
        const hasReceivedBonus = localStorage.getItem('ftc_nutrition_bonus_received');
        if (!hasReceivedBonus) {
          // Grant 10,000 FTC first-time bonus
          setFtcBalance(10000);
          localStorage.setItem('ftc_nutrition_bonus_received', 'true');
          localStorage.setItem('ftc_nutrition_balance', '10000');
          toast.success('🎉 Welcome Bonus: 10,000 FTC credited to your wallet!', {
            description: 'First-time login reward! Use FTC to trade sports nutrition products.',
            duration: 5000
          });
        } else {
          // Load existing balance
          const savedBalance = localStorage.getItem('ftc_nutrition_balance');
          setFtcBalance(savedBalance ? parseFloat(savedBalance) : 0);
        }
        
        // Load user holdings
        const savedHoldings = localStorage.getItem('ftc_nutrition_holdings');
        if (savedHoldings) {
          setUserHoldings(JSON.parse(savedHoldings));
        }
        
        // Fetch blockchain ledger
        fetchBlockchainLedger();
      }
    };
    
    checkLoginAndBonus();
  }, []);
  
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
  
  // Transfer FTC between Mining Wallet and Nutrition Wallet
  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsTransferring(true);
    
    try {
      if (transferDirection === 'from_mining') {
        // Transfer from Mining Wallet to Nutrition Wallet
        if (amount > miningWalletBalance) {
          toast.error('Insufficient balance in Mining Wallet');
          setIsTransferring(false);
          return;
        }
        
        // Simulate API call to transfer
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setMiningWalletBalance(prev => prev - amount);
        setFtcBalance(prev => {
          const newBalance = prev + amount;
          localStorage.setItem('ftc_nutrition_balance', newBalance.toString());
          return newBalance;
        });
        
        toast.success(`✅ ${amount.toLocaleString()} FTC transferred to Nutrition Wallet!`);
      } else {
        // Transfer from Nutrition Wallet to Mining Wallet
        if (amount > ftcBalance) {
          toast.error('Insufficient balance in Nutrition Wallet');
          setIsTransferring(false);
          return;
        }
        
        // Simulate API call to transfer
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setFtcBalance(prev => {
          const newBalance = prev - amount;
          localStorage.setItem('ftc_nutrition_balance', newBalance.toString());
          return newBalance;
        });
        setMiningWalletBalance(prev => prev + amount);
        
        toast.success(`✅ ${amount.toLocaleString()} FTC transferred to Mining Wallet!`);
      }
      
      setTransferAmount('');
      fetchBlockchainLedger();
    } catch (error) {
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

  // Calculate prices
  const calculatePrices = (product) => {
    const baseDiscountPrice = product.discountPrice;
    const ftcExclusivePrice = Math.round(baseDiscountPrice * 0.8); // 20% off discount
    
    // If trading is open (>50 sold), price increases by 25%
    let currentPrice = baseDiscountPrice;
    let currentFtcPrice = ftcExclusivePrice;
    
    if (product.soldUnits >= 50) {
      const priceIncrease = 1.25 + (priceFluctuation[product.id] || 0);
      currentPrice = Math.round(baseDiscountPrice * priceIncrease);
      currentFtcPrice = Math.round(ftcExclusivePrice * priceIncrease);
    }
    
    const ftcAmount = Math.round(currentFtcPrice / FTC_TO_INR);
    
    return {
      mrp: product.mrp,
      discountPrice: currentPrice,
      ftcExclusivePrice: currentFtcPrice,
      ftcAmount,
      isTradingOpen: product.soldUnits >= 50,
      priceChange: priceFluctuation[product.id] || 0
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
  const confirmBuy = () => {
    if (!selectedProduct) return;
    
    const prices = calculatePrices(selectedProduct);
    const totalFTC = prices.ftcAmount * buyQuantity;
    
    if (totalFTC > ftcBalance) {
      toast.error('Insufficient FTC balance');
      return;
    }
    
    const availableUnits = selectedProduct.totalUnits - selectedProduct.soldUnits;
    if (buyQuantity > availableUnits) {
      toast.error(`Only ${availableUnits} units available`);
      return;
    }
    
    // Deduct FTC
    setFtcBalance(prev => prev - totalFTC);
    
    // Add to holdings
    setUserHoldings(prev => ({
      ...prev,
      [selectedProduct.id]: (prev[selectedProduct.id] || 0) + buyQuantity
    }));
    
    // Update sold units
    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, soldUnits: p.soldUnits + buyQuantity }
        : p
    ));
    
    toast.success(`✅ Bought ${buyQuantity} unit(s) of ${selectedProduct.name} for ${totalFTC.toLocaleString()} FTC`);
    setShowBuyModal(false);
  };

  // Confirm Sell
  const confirmSell = () => {
    if (!selectedProduct) return;
    
    const prices = calculatePrices(selectedProduct);
    
    if (!prices.isTradingOpen) {
      toast.error('Trading not open yet. Wait until 50 units are sold.');
      return;
    }
    
    if (sellQuantity > (userHoldings[selectedProduct.id] || 0)) {
      toast.error('You don\'t have enough units to sell');
      return;
    }
    
    const totalFTC = prices.ftcAmount * sellQuantity;
    
    // Add FTC
    setFtcBalance(prev => prev + totalFTC);
    
    // Remove from holdings
    setUserHoldings(prev => ({
      ...prev,
      [selectedProduct.id]: prev[selectedProduct.id] - sellQuantity
    }));
    
    toast.success(`✅ Sold ${sellQuantity} unit(s) of ${selectedProduct.name} for ${totalFTC.toLocaleString()} FTC`);
    setShowSellModal(false);
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
              <h2 className="text-2xl md:text-3xl font-black font-unbounded text-[#FFD700] mb-2 text-center">FTC NUTRITION TRADING</h2>
              <p className="text-sm text-white/70 mb-4 text-center">Trade Sports Nutrition Products with Fitcoin</p>
              
              {/* Video Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowIntroVideo(false)}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-full hover:brightness-110 transition-all animate-pulse"
                  data-testid="enter-nutrition-btn"
                >
                  🚀 ENTER FTC NUTRITION TRADING
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
              <span className="text-xl font-black text-[#FF9F1C]">FTC NUTRITION</span>
              <span className="block text-xs text-white/50">LIVE MODE</span>
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
          <span className="text-sm text-white/80">Trade Sports Nutrition with FTC | Buyers become Sellers | 10,000 FTC Welcome Bonus</span>
          <Gift className="h-5 w-5 text-[#FFD700]" />
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-[#00F090]/10 to-[#00F090]/5 border-b border-[#00F090]/20 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-[#00F090]" />
            <span className="text-sm text-white/80">100% Authentic Products | POBC Verified</span>
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
                <p className="text-white/60 text-sm">Earn FTC by mining with the FTC Mining App</p>
              </div>
            </div>
            <a
              href="https://solana-fitness.emergent.host/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold rounded-lg hover:brightness-110 transition-all"
              data-testid="earn-ftc-mining-btn"
            >
              <span>Mine FTC Now</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
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
            const availableUnits = product.totalUnits - product.soldUnits;
            
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
                      <span className="text-white/50">Stock: {availableUnits}/{product.totalUnits}</span>
                      <span className="text-white/50">{product.soldUnits} sold</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${product.soldUnits >= 50 ? 'bg-[#00F090]' : 'bg-[#FFD700]'}`}
                        style={{ width: `${(product.soldUnits / product.totalUnits) * 100}%` }}
                      />
                    </div>
                    {product.soldUnits >= 50 && (
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
                <div className="p-4 bg-gradient-to-br from-[#00F090]/20 to-[#00F090]/10 rounded-lg border border-[#00F090]/30">
                  <p className="text-xs text-white/60 mb-1">Mining Wallet</p>
                  <p className="text-2xl font-black text-[#00F090]">{miningWalletBalance.toLocaleString()}</p>
                  <p className="text-xs text-white/40">FTC</p>
                </div>
              </div>
              
              {/* Wallet Address */}
              <div className="mb-6 p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-xs text-white/60 mb-2 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  YOUR WALLET ADDRESS
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
                </h4>
                
                {/* Transfer Direction */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setTransferDirection('from_mining')}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      transferDirection === 'from_mining' 
                        ? 'bg-[#00F090]/20 border-[#00F090]' 
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <Download className="h-4 w-4 text-[#00F090]" />
                    <span className="text-sm">From Mining</span>
                  </button>
                  <button
                    onClick={() => setTransferDirection('to_mining')}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      transferDirection === 'to_mining' 
                        ? 'bg-[#FF9F1C]/20 border-[#FF9F1C]' 
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <Send className="h-4 w-4 text-[#FF9F1C]" />
                    <span className="text-sm">To Mining</span>
                  </button>
                </div>
                
                {/* Transfer Amount */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter FTC amount"
                    className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FFD700]/50 outline-none"
                    data-testid="transfer-amount-input"
                  />
                  <button
                    onClick={handleTransfer}
                    disabled={isTransferring}
                    className="px-6 py-3 bg-gradient-to-r from-[#00F090] to-[#00F090]/80 text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                    data-testid="transfer-btn"
                  >
                    {isTransferring ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
                
                <p className="text-xs text-white/40 text-center">
                  {transferDirection === 'from_mining' 
                    ? '↓ Receive FTC from your Mining Wallet to use here'
                    : '↑ Send FTC to your Mining Wallet for withdrawal'
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
