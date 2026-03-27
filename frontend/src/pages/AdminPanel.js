import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Check, X, Clock, Zap, RefreshCw,
  Eye, EyeOff, Lock, Mail, Key, Wallet, Copy
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'FITRUDRAH',
  password: '786786',
  secretCode: '0000'
};

// FTC Logo URL - New Meditation Logo
const FTC_LOGO = 'https://customer-assets.emergentagent.com/job_8ab2343f-b785-4283-8178-10a5f0187955/artifacts/aghohvl9_998.jpg';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', secretCode: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCopied, setOtpCopied] = useState(false);
  
  const [subscriptionRequests, setSubscriptionRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  const [totalFtcReceived, setTotalFtcReceived] = useState(0);
  const [totalUsdReceived, setTotalUsdReceived] = useState(0);

  // Check if admin is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === 'authenticated') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  // Fetch admin data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/mining-requests`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionRequests(data.requests || []);
        setUsers(data.users || []);
        
        // Calculate total received
        const approvedRequests = (data.requests || []).filter(r => r.status === 'active');
        const ftcTotal = approvedRequests.filter(r => r.payment_method === 'FTC').reduce((sum, r) => sum + (r.price || 0), 0);
        const usdTotal = approvedRequests.filter(r => r.payment_method === 'USD').reduce((sum, r) => sum + (r.price || 0), 0);
        setTotalFtcReceived(ftcTotal);
        setTotalUsdReceived(usdTotal);
      }
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (
      loginForm.username.toUpperCase() === ADMIN_CREDENTIALS.username &&
      loginForm.password === ADMIN_CREDENTIALS.password &&
      loginForm.secretCode === ADMIN_CREDENTIALS.secretCode
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', 'authenticated');
      toast.success('Welcome Admin FITRUDRAH!');
      fetchData();
    } else {
      toast.error('Invalid credentials');
    }
  };

  // Handle forgot password - Generate OTP
  const handleForgotPassword = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    toast.success('OTP Generated! Copy and use it below');
  };

  // Copy OTP to clipboard
  const copyOtpToClipboard = () => {
    navigator.clipboard.writeText(generatedOtp);
    setOtpCopied(true);
    toast.success('OTP copied to clipboard!');
  };

  // Handle reset password
  const handleResetPassword = () => {
    if (otp === generatedOtp && newPassword.length >= 6) {
      toast.success('Password reset successful! Login with new password');
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setGeneratedOtp('');
      setOtpCopied(false);
    } else if (otp !== generatedOtp) {
      toast.error('Invalid OTP');
    } else {
      toast.error('Password must be at least 6 characters');
    }
  };

  // Activate subscription
  const activateSubscription = async (requestId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/activate-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });
      
      if (response.ok) {
        toast.success('Subscription activated!');
        fetchData();
      } else {
        toast.error('Activation failed');
      }
    } catch (error) {
      toast.error('Activation failed');
    }
  };

  // Reject subscription
  const rejectSubscription = async (requestId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/reject-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });
      
      if (response.ok) {
        toast.success('Request rejected');
        fetchData();
      }
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <img 
              src={FTC_LOGO} 
              alt="Fitcoin" 
              className="h-20 w-20 rounded-full mx-auto mb-4 border-2 border-[#00F090]"
            />
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00F090] to-[#FFD700]">
              ADMIN CONTROL PANEL
            </h1>
            <p className="text-white/60 text-sm mt-2">FTC Mining Administration</p>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Username</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#00F090]/50 outline-none uppercase"
                    placeholder="Enter username (FITRUDRAH)"
                    data-testid="admin-username"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#00F090]/50 outline-none"
                    placeholder="Enter password"
                    data-testid="admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-white/40" /> : <Eye className="h-4 w-4 text-white/40" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Secret Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="password"
                    value={loginForm.secretCode}
                    onChange={(e) => setLoginForm({ ...loginForm, secretCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#00F090]/50 outline-none"
                    placeholder="Enter secret code"
                    data-testid="admin-secret"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                data-testid="admin-login-btn"
              >
                LOGIN TO ADMIN PANEL
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-sm text-[#00F090] hover:underline"
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <p className="text-white/60 text-sm text-center">
                    Click below to generate OTP for password reset
                  </p>
                  <button
                    onClick={handleForgotPassword}
                    className="w-full py-4 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                  >
                    Generate OTP
                  </button>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-sm text-white/60 hover:text-white"
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  {/* OTP Display Box */}
                  <div className="p-4 bg-[#00F090]/10 border-2 border-[#00F090] rounded-lg">
                    <p className="text-xs text-white/60 mb-2 text-center">Your OTP (Copy this)</p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-3xl font-black text-[#00F090] tracking-widest">{generatedOtp}</p>
                      <button
                        onClick={copyOtpToClipboard}
                        className={`p-2 rounded-lg transition-all ${otpCopied ? 'bg-[#00F090] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {otpCopied ? <Check className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                      </button>
                    </div>
                    {otpCopied && <p className="text-xs text-[#00F090] text-center mt-2">OTP Copied!</p>}
                  </div>

                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Paste OTP Here</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#00F090]/50 outline-none text-center tracking-widest text-xl"
                      placeholder="Enter OTP"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#00F090]/50 outline-none"
                      placeholder="Enter new password"
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-4 bg-gradient-to-r from-[#00F090] to-[#FFD700] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                  >
                    Reset Password
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setOtpSent(false);
                }}
                className="w-full text-sm text-white/60 hover:text-white"
              >
                Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={FTC_LOGO} alt="FTC" className="h-10 w-10 rounded-full border-2 border-[#00F090]" />
            <div>
              <span className="text-xl font-black text-[#00F090]">ADMIN CONTROL PANEL</span>
              <span className="block text-xs text-white/50">FTC Mining Management | FITRUDRAH</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#FF2E50] text-white font-bold rounded-lg hover:brightness-110 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <Clock className="h-6 w-6 text-[#FFD700] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#FFD700]">
              {subscriptionRequests.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-xs text-white/60">Pending Requests</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Check className="h-6 w-6 text-[#00F090] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#00F090]">
              {subscriptionRequests.filter(r => r.status === 'active').length}
            </p>
            <p className="text-xs text-white/60">Active Subscriptions</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Users className="h-6 w-6 text-[#FF9F1C] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#FF9F1C]">{users.length}</p>
            <p className="text-xs text-white/60">Total Users</p>
          </div>
          <div className="glass-card p-4 text-center border border-[#00F090]/30">
            <Zap className="h-6 w-6 text-[#00F090] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#00F090]">{totalFtcReceived.toLocaleString()}</p>
            <p className="text-xs text-white/60">FTC Received</p>
          </div>
          <div className="glass-card p-4 text-center border border-[#FFD700]/30">
            <Wallet className="h-6 w-6 text-[#FFD700] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#FFD700]">${totalUsdReceived.toLocaleString()}</p>
            <p className="text-xs text-white/60">USD Received</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'requests' ? 'bg-[#00F090] text-black' : 'bg-white/10 text-white'
            }`}
          >
            Subscription Requests
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'users' ? 'bg-[#00F090] text-black' : 'bg-white/10 text-white'
            }`}
          >
            All Users
          </button>
        </div>

        {/* Content */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {subscriptionRequests.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Clock className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No subscription requests yet</p>
              </div>
            ) : (
              subscriptionRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={FTC_LOGO} alt="FTC" className="h-8 w-8 rounded-full" />
                        <span className="font-bold text-white">{request.user_email || request.user_id}</span>
                        {request.is_free_trial || request.payment_method === 'FREE' ? (
                          <span className="px-2 py-1 text-xs font-bold rounded bg-[#00BFFF] text-black">
                            FREE TRIAL
                          </span>
                        ) : null}
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          request.status === 'pending' ? 'bg-[#FFD700] text-black' :
                          request.status === 'active' ? 'bg-[#00F090] text-black' :
                          'bg-[#FF2E50] text-white'
                        }`}>
                          {request.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-white/60">Plan</p>
                          <p className="font-bold text-white">{request.plan_name}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Calories</p>
                          <p className="font-bold text-white">{request.calories}</p>
                        </div>
                        <div>
                          <p className="text-white/60">FTC Limit</p>
                          <p className="font-bold text-[#00F090]">{request.ftc_limit}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Payment</p>
                          <p className="font-bold text-[#FFD700]">
                            {request.is_free_trial || request.payment_method === 'FREE' 
                              ? <span className="text-[#00BFFF]">FREE TRIAL</span>
                              : request.payment_method === 'USD' ? `$${request.price}` : `${request.price} FTC`
                            }
                          </p>
                        </div>
                      </div>
                      {/* Transaction Hash - Hide for Free Trial */}
                      {request.transaction_hash && !request.is_free_trial && request.payment_method !== 'FREE' && (
                        <div className="p-2 bg-black/50 rounded-lg border border-white/10">
                          <p className="text-xs text-white/60 mb-1">Transaction Hash:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[#00F090] font-mono break-all">{request.transaction_hash}</code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(request.transaction_hash);
                                toast.success('Hash copied!');
                              }}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Copy className="h-4 w-4 text-white/60" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => activateSubscription(request.id)}
                          className="p-3 bg-[#00F090] text-black rounded-lg hover:brightness-110 transition-all"
                          title="Activate Now"
                          data-testid={`approve-${request.id}`}
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => rejectSubscription(request.id)}
                          className="p-3 bg-[#FF2E50] text-white rounded-lg hover:brightness-110 transition-all"
                          title="Reject"
                          data-testid={`reject-${request.id}`}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/60">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/60">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/60">FTC Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/60">Subscription</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id || idx} className="border-t border-white/5">
                    <td className="px-6 py-4 text-white">{user.full_name || user.username}</td>
                    <td className="px-6 py-4 text-white/60">{user.email}</td>
                    <td className="px-6 py-4 text-[#00F090] font-bold">{user.ftc_balance || 0} FTC</td>
                    <td className="px-6 py-4">
                      {user.active_subscription ? (
                        <span className="px-2 py-1 bg-[#00F090] text-black text-xs font-bold rounded">
                          {user.active_subscription.plan_name}
                        </span>
                      ) : (
                        <span className="text-white/40">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
