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
      <div className="min-h-screen bg-gray-50">
        <Header
          user={user}
          loading={loading}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<MarketList user={user} />} />
          <Route path="/markets/:id" element={<MarketDetail user={user} onUpdate={loadUser} />} />
          <Route path="/admin" element={<AdminDashboard user={user} onUpdate={loadUser} />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile/:userId" element={<Profile />} />
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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Predict
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Markets
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={`/profile/${user.id}`} className="text-gray-900 hover:text-blue-600 font-semibold transition-colors">
                  {user.username}
                </Link>
                <div className="text-sm text-gray-600">
                  Balance: <span className="font-semibold text-green-600">{parseFloat(user.points_balance).toFixed(2)}</span> points
                </div>
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/signin" 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default App;
