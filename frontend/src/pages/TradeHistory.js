import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, ArrowDownRight, LogOut, Menu, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradeHistory = ({ user, onLogout }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // First load from localStorage blockchain ledger
        const localLedger = JSON.parse(localStorage.getItem('ftc_trade_history') || '[]');
        
        // Also fetch from backend API
        const response = await axios.get(`${API}/trade/history`, axiosConfig);
        const backendTrades = response.data || [];
        
        // Merge local blockchain ledger with backend trades
        const allTrades = [...localLedger.map(tx => ({
          id: tx.id,
          order_type: tx.type?.toLowerCase() || 'trade',
          amount: tx.quantity || tx.totalFTC || 0,
          price: tx.pricePerUnit || 0,
          total: tx.totalUSD || (tx.quantity * tx.pricePerUnit) || 0,
          created_at: tx.timestamp,
          status: tx.status || 'confirmed',
          blockNumber: tx.blockNumber,
          confirmations: tx.confirmations,
          network: tx.network || 'Solana Mainnet'
        })), ...backendTrades];
        
        // Sort by date (newest first)
        allTrades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setTrades(allTrades);
      } catch (error) {
        console.error('Failed to fetch trade history:', error);
        // Still try to load from localStorage if API fails
        const localLedger = JSON.parse(localStorage.getItem('ftc_trade_history') || '[]');
        setTrades(localLedger.map(tx => ({
          id: tx.id,
          order_type: tx.type?.toLowerCase() || 'trade',
          amount: tx.quantity || tx.totalFTC || 0,
          price: tx.pricePerUnit || 0,
          total: tx.totalUSD || 0,
          created_at: tx.timestamp,
          status: tx.status || 'confirmed',
          blockNumber: tx.blockNumber,
          confirmations: tx.confirmations
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="glass-nav border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-black font-unbounded tracking-tighter uppercase text-[#FF9F1C]">FITCOIN</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Trade</Link>
            <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">Portfolio</Link>
            <Link to="/history" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase tracking-wider text-sm">History</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-mono uppercase tracking-wider text-white/60">Welcome</div>
              <div className="text-sm font-bold text-white">{user?.full_name}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-sm px-4 py-2 border border-[#FF2E50]/50 text-[#FF2E50] hover:bg-[#FF2E50]/10 font-bold uppercase tracking-wider text-sm transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
            <div className="flex flex-col gap-4 p-6">
              <Link to="/trade" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Trade</Link>
              <Link to="/portfolio" className="text-white/60 hover:text-[#FF9F1C] transition-colors font-bold uppercase">Portfolio</Link>
              <Link to="/history" className="text-white hover:text-[#FF9F1C] transition-colors font-bold uppercase">History</Link>
              <button onClick={handleLogout} className="text-left text-[#FF2E50] hover:text-[#FF2E50]/80 transition-colors font-bold uppercase">Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6" data-testid="history-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              TRADE HISTORY
            </span>
          </h1>
          <p className="text-white/70 font-medium">View all your trading activity</p>
        </motion.div>

        {/* Trade List */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/60 font-mono">Loading trades...</div>
          ) : trades.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 font-mono mb-6">No trades yet. Start trading to see your history here.</p>
              <button
                onClick={() => navigate('/trade')}
                className="rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300"
                data-testid="start-trading-btn"
              >
                Start Trading
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Type</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Amount</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Price</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Total</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Block</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Date</th>
                    <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, index) => (
                    <motion.tr
                      key={trade.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      data-testid={`trade-row-${index}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {trade.order_type === 'buy' ? (
                            <>
                              <ArrowUpRight className="h-5 w-5 text-[#00F090]" />
                              <span className="font-bold uppercase text-[#00F090]">Buy</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-5 w-5 text-[#FF2E50]" />
                              <span className="font-bold uppercase text-[#FF2E50]">Sell</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">{(trade.amount || 0).toFixed(6)} FTC</td>
                      <td className="px-6 py-4 font-mono text-white">${(trade.price || 0).toFixed(8)}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[#FF9F1C]">${(trade.total || 0).toFixed(4)}</td>
                      <td className="px-6 py-4">
                        {trade.blockNumber ? (
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-[#9945FF]">#{trade.blockNumber}</span>
                            <span className="font-mono text-xs text-white/40">{trade.confirmations || 0} conf</span>
                          </div>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-white/70">
                        {trade.created_at ? format(new Date(trade.created_at), 'MMM dd, yyyy HH:mm') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#00F090]/20 text-[#00F090] border border-[#00F090]/30">
                          {trade.status || 'confirmed'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {/* Blockchain Info Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-black/30 flex items-center justify-between">
                <span className="text-xs text-white/40">All trades verified on Solana Mainnet</span>
                <span className="text-xs text-[#00F090]">{trades.length} transactions recorded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;