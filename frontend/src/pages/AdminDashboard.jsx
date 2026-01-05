import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, marketsApi } from '../utils/api';

function AdminDashboard({ user, onUpdate }) {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingMarket, setCreatingMarket] = useState(false);
  const [resolvingMarket, setResolvingMarket] = useState(null);

  // Form state
  const [marketTitle, setMarketTitle] = useState('');
  const [marketDescription, setMarketDescription] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadMarkets();
  }, [user]);

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketsApi.getAll();
      setMarkets(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    if (!marketTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    setCreatingMarket(true);
    try {
      await adminApi.createMarket(marketTitle, marketDescription || null);
      setMarketTitle('');
      setMarketDescription('');
      await loadMarkets();
      alert('Market created successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCreatingMarket(false);
    }
  };

  const handleResolveMarket = async (marketId, resolution) => {
    if (!confirm(`Are you sure you want to resolve this market as ${resolution}?`)) {
      return;
    }

    setResolvingMarket(marketId);
    try {
      await adminApi.resolveMarket(marketId, resolution);
      await loadMarkets();
      if (onUpdate) onUpdate();
      alert('Market resolved successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setResolvingMarket(null);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="error">Access denied. Admin only.</div>;
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const openMarkets = markets.filter((m) => m.status === 'open');

  return (
    <div>
      <button onClick={() => navigate('/')} className="back-btn">← Back to Markets</button>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="admin-section">
        <h2 className="admin-section-title">Create New Market</h2>
        <form onSubmit={handleCreateMarket} className="create-market-form">
          <div className="form-group">
            <label>Title (required)</label>
            <input
              type="text"
              value={marketTitle}
              onChange={(e) => setMarketTitle(e.target.value)}
              required
              className="form-input"
              placeholder="Enter market title"
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={marketDescription}
              onChange={(e) => setMarketDescription(e.target.value)}
              className="form-input form-textarea"
              placeholder="Enter market description"
            />
          </div>
          <button type="submit" disabled={creatingMarket} className="create-btn">
            {creatingMarket ? 'Creating...' : 'Create Market'}
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title">Open Markets ({openMarkets.length})</h2>
        {openMarkets.length === 0 ? (
          <div className="empty-state">No open markets</div>
        ) : (
          <div className="markets-grid">
            {openMarkets.map((market) => (
              <div key={market.id} className="admin-market-card">
                <h3 className="admin-market-title">{market.title}</h3>
                {market.description && (
                  <p className="admin-market-description">{market.description}</p>
                )}
                <div className="admin-market-meta">
                  Created: {new Date(market.created_at).toLocaleString()}
                </div>
                <div className="admin-market-actions">
                  <button
                    onClick={() => handleResolveMarket(market.id, 'YES')}
                    disabled={resolvingMarket === market.id}
                    className="resolve-btn yes"
                  >
                    {resolvingMarket === market.id ? 'Resolving...' : 'Resolve as YES'}
                  </button>
                  <button
                    onClick={() => handleResolveMarket(market.id, 'NO')}
                    disabled={resolvingMarket === market.id}
                    className="resolve-btn no"
                  >
                    {resolvingMarket === market.id ? 'Resolving...' : 'Resolve as NO'}
                  </button>
                  <button
                    onClick={() => navigate(`/markets/${market.id}`)}
                    className="view-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
