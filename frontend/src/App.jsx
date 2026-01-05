import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getUserId, setUserId, usersApi } from './utils/api';
import MarketList from './pages/MarketList';
import MarketDetail from './pages/MarketDetail';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [userId, setUserIdState] = useState(getUserId());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await usersApi.getCurrent();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (id) => {
    setUserId(id); // Save to localStorage
    setUserIdState(id); // Update state
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserIdState(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header
          user={user}
          loading={loading}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<MarketList />} />
            <Route path="/markets/:id" element={<MarketDetail user={user} onUpdate={loadUser} />} />
            <Route path="/admin" element={<AdminDashboard user={user} onUpdate={loadUser} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function Header({ user, loading, onLogin, onLogout }) {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginId.trim()) {
      onLogin(loginId.trim());
      setLoginId('');
    }
  };

  return (
    <header>
      <div className="header-content">
        <Link to="/" className="logo">
          Predict
        </Link>
        <nav>
          <Link to="/">Markets</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user ? (
            <div className="user-info">
              <div className="balance">
                {user.username} - Balance: <strong>{parseFloat(user.points_balance).toFixed(2)}</strong> points
              </div>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <input
                type="text"
                placeholder="Enter User ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="login-input"
              />
              <button type="submit" className="login-btn">Login</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

export default App;
