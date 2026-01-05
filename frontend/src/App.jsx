import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getUserId, setUserId, usersApi } from './utils/api';
import MarketList from './pages/MarketList';
import MarketDetail from './pages/MarketDetail';
import AdminDashboard from './pages/AdminDashboard';

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
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <Header
          user={user}
          loading={loading}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<MarketList />} />
          <Route path="/markets/:id" element={<MarketDetail user={user} onUpdate={loadUser} />} />
          <Route path="/admin" element={<AdminDashboard user={user} onUpdate={loadUser} />} />
        </Routes>
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
    <header style={{ marginBottom: '30px', padding: '20px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
            Polymarket
          </Link>
        </div>
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/">Markets</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span>
                {user.username} - Balance: {parseFloat(user.points_balance).toFixed(2)} points
              </span>
              <button onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter User ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                style={{ padding: '5px' }}
              />
              <button type="submit">Login</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

export default App;
