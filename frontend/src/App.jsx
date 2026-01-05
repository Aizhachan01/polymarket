import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getToken, getUserId, setUserId, removeToken, usersApi } from './utils/api';
import MarketList from './pages/MarketList';
import MarketDetail from './pages/MarketDetail';
import AdminDashboard from './pages/AdminDashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [userId, setUserIdState] = useState(getUserId());
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId, token]);

  const loadUser = async () => {
    if (!userId && !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await usersApi.getCurrent();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
      // Clear invalid auth
      removeToken();
      localStorage.removeItem('userId');
      setUserIdState(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (id) => {
    setUserId(id); // Save to localStorage
    setUserIdState(id); // Update state
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('userId');
    setUserIdState(null);
    setTokenState(null);
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
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile/:userId" element={<Profile />} />
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
              <Link to={`/profile/${user.id}`} className="profile-link">
                {user.username}
              </Link>
              <div className="balance">
                Balance: <strong>{parseFloat(user.points_balance).toFixed(2)}</strong> points
              </div>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/signin" className="signin-link">Sign In</Link>
              <Link to="/signup" className="signup-link">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default App;
