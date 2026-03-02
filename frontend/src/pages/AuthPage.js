import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Key, Lock, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthPage = ({ onLogin }) => {
  // Auth mode: 'login' | 'register' | 'forgot' | 'otp' | 'reset'
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    otp: '',
    new_password: '',
    confirm_password: ''
  });
  const [demoOtp, setDemoOtp] = useState(null); // For demo mode
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const response = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        const { token, user } = response.data;
        toast.success('Welcome back!');
        onLogin(token, user);
        navigate('/trade');
      } else if (authMode === 'register') {
        const response = await axios.post(`${API}/auth/register`, {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        });
        const { token, user } = response.data;
        toast.success('Account created successfully!');
        onLogin(token, user);
        navigate('/trade');
      } else if (authMode === 'forgot') {
        const response = await axios.post(`${API}/auth/forgot-password`, {
          email: formData.email
        });
        toast.success('OTP sent to your email!');
        // Check for demo mode
        if (response.data.demo_otp) {
          setDemoOtp(response.data.demo_otp);
          toast.info(`Demo Mode: Your OTP is ${response.data.demo_otp}`, { duration: 10000 });
        }
        setAuthMode('otp');
      } else if (authMode === 'otp') {
        await axios.post(`${API}/auth/verify-otp`, {
          email: formData.email,
          otp: formData.otp
        });
        toast.success('OTP verified!');
        setAuthMode('reset');
      } else if (authMode === 'reset') {
        if (formData.new_password !== formData.confirm_password) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.new_password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await axios.post(`${API}/auth/reset-password`, {
          email: formData.email,
          otp: formData.otp,
          new_password: formData.new_password
        });
        toast.success('Password reset successfully! Please login.');
        setAuthMode('login');
        setFormData({ ...formData, password: '', otp: '', new_password: '', confirm_password: '' });
        setDemoOtp(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login': return 'WELCOME BACK';
      case 'register': return 'JOIN FITCOIN';
      case 'forgot': return 'FORGOT PASSWORD';
      case 'otp': return 'VERIFY OTP';
      case 'reset': return 'RESET PASSWORD';
      default: return 'WELCOME';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'login': return 'Sign in to continue trading';
      case 'register': return 'Create your trading account';
      case 'forgot': return 'Enter your email to receive OTP';
      case 'otp': return 'Enter the 6-digit code sent to your email';
      case 'reset': return 'Create your new password';
      default: return '';
    }
  };

  const renderBackButton = () => {
    if (authMode === 'login' || authMode === 'register') return null;
    
    return (
      <button
        onClick={() => {
          if (authMode === 'otp') setAuthMode('forgot');
          else if (authMode === 'reset') setAuthMode('otp');
          else setAuthMode('login');
          setDemoOtp(null);
        }}
        className="flex items-center gap-2 text-white/60 hover:text-[#FF9F1C] transition-colors mb-6"
        data-testid="auth-back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="spiritual-aura absolute inset-0 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={authMode}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src="https://customer-assets.emergentagent.com/job_98e4db14-814c-417e-af31-affa0c6b97bc/artifacts/7fxj3a88_1000161961.webp" 
              alt="Fitcoin Spirit" 
              className="h-24 w-24 mx-auto mb-6 object-contain"
              data-testid="auth-logo"
            />
          </Link>
          <h1 className="text-4xl font-black font-unbounded tracking-tighter uppercase mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFD700] to-[#FF9F1C]">
              {getTitle()}
            </span>
          </h1>
          <p className="text-white/70 font-medium">
            {getSubtitle()}
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8">
          {renderBackButton()}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Register - Full Name */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                  data-testid="auth-fullname-input"
                />
              </div>
            )}
            
            {/* Email - Show for login, register, forgot */}
            {(authMode === 'login' || authMode === 'register' || authMode === 'forgot') && (
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                  <Mail className="inline h-3 w-3 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                  data-testid="auth-email-input"
                />
              </div>
            )}

            {/* Password - Show for login, register */}
            {(authMode === 'login' || authMode === 'register') && (
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                  <Lock className="inline h-3 w-3 mr-1" />
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                  placeholder="Enter password"
                  required
                  data-testid="auth-password-input"
                />
              </div>
            )}

            {/* OTP Input */}
            {authMode === 'otp' && (
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                  <Key className="inline h-3 w-3 mr-1" />
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({...formData, otp: value});
                  }}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#00F090]/50 text-white placeholder:text-white/20 rounded-none h-14 px-4 outline-none transition-colors text-center text-2xl font-mono tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                  data-testid="auth-otp-input"
                />
                {demoOtp && (
                  <div className="mt-3 p-3 bg-[#00F090]/10 border border-[#00F090]/30 rounded">
                    <p className="text-xs text-[#00F090] font-mono">
                      <CheckCircle className="inline h-3 w-3 mr-1" />
                      Demo Mode: Your OTP is <span className="font-bold">{demoOtp}</span>
                    </p>
                  </div>
                )}
                <p className="text-xs text-white/40 mt-2">
                  Sent to: {formData.email}
                </p>
              </div>
            )}

            {/* Reset Password Fields */}
            {authMode === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                    <Lock className="inline h-3 w-3 mr-1" />
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                    data-testid="auth-new-password-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/60 mb-2">
                    <Lock className="inline h-3 w-3 mr-1" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#FF9F1C]/50 text-white placeholder:text-white/20 rounded-none h-12 px-4 outline-none transition-colors"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                    data-testid="auth-confirm-password-input"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm px-8 py-3 bg-gradient-to-r from-[#FF9F1C] to-[#FFD700] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,159,28,0.4)] hover:shadow-[0_0_25px_rgba(255,159,28,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="auth-submit-btn"
            >
              {loading ? 'LOADING...' : (
                authMode === 'login' ? 'SIGN IN' :
                authMode === 'register' ? 'CREATE ACCOUNT' :
                authMode === 'forgot' ? 'SEND OTP' :
                authMode === 'otp' ? 'VERIFY OTP' :
                'RESET PASSWORD'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3 text-center">
            {/* Forgot Password Link - Show on login */}
            {authMode === 'login' && (
              <button
                onClick={() => setAuthMode('forgot')}
                className="block w-full text-[#00F090] hover:text-[#00F090]/80 transition-colors font-medium text-sm"
                data-testid="auth-forgot-btn"
              >
                Forgot Password?
              </button>
            )}
            
            {/* Toggle Login/Register */}
            {(authMode === 'login' || authMode === 'register') && (
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-white/60 hover:text-[#FF9F1C] transition-colors font-medium"
                data-testid="auth-toggle-btn"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}

            {/* Resend OTP */}
            {authMode === 'otp' && (
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await axios.post(`${API}/auth/forgot-password`, {
                      email: formData.email
                    });
                    toast.success('New OTP sent!');
                    if (response.data.demo_otp) {
                      setDemoOtp(response.data.demo_otp);
                      toast.info(`Demo Mode: Your new OTP is ${response.data.demo_otp}`, { duration: 10000 });
                    }
                  } catch (error) {
                    toast.error('Failed to resend OTP');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="text-[#00F090] hover:text-[#00F090]/80 transition-colors font-medium text-sm disabled:opacity-50"
                data-testid="auth-resend-otp-btn"
              >
                Didn't receive OTP? Resend
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
