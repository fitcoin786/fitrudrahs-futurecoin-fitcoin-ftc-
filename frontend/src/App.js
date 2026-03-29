import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TradingDashboard from './pages/TradingDashboard';
import Portfolio from './pages/Portfolio';
import TradeHistory from './pages/TradeHistory';
import CryptoSearch from './pages/CryptoSearch';
import MarketOverview from './pages/MarketOverview';
import SendReceive from './pages/SendReceive';
import ClaimFtcCredit from './pages/ClaimFtcCredit';
import NutritionTrading from './pages/NutritionTrading';
import FtcMining from './pages/FtcMining';
import AdminPanel from './pages/AdminPanel';
import { Toaster } from './components/ui/sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    // Clear old user-specific data to prevent data mixing
    const oldUser = localStorage.getItem('user');
    if (oldUser) {
      try {
        const parsed = JSON.parse(oldUser);
        const oldKey = parsed.id || parsed.email;
        const newKey = userData.id || userData.email;
        
        // If different user, clear old mining data
        if (oldKey !== newKey) {
          console.log('Different user detected, clearing old data');
          // Don't remove old user data - just ensure new user starts fresh from backend
        }
      } catch (e) {
        console.log('Error parsing old user');
      }
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
              <Navigate to="/trade" /> : 
              <AuthPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/trade" 
            element={
              isAuthenticated ? 
              <TradingDashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              isAuthenticated ? 
              <Portfolio user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/history" 
            element={
              isAuthenticated ? 
              <TradeHistory user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/search" 
            element={
              isAuthenticated ? 
              <CryptoSearch user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/market" 
            element={
              isAuthenticated ? 
              <MarketOverview user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/send-receive" 
            element={
              isAuthenticated ? 
              <SendReceive user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route path="/claim-ftc" element={<ClaimFtcCredit />} />
          <Route path="/nutrition-trading" element={<NutritionTrading />} />
          <Route path="/ftc-mining" element={<FtcMining />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;