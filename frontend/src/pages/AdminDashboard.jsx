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
    return <div>Access denied. Admin only.</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const openMarkets = markets.filter((m) => m.status === 'open');

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back to Markets
      </button>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
        <h2>Create New Market</h2>
        <form onSubmit={handleCreateMarket}>
          <div style={{ marginBottom: '15px' }}>
            <label>
              Title (required)
              <input
                type="text"
                value={marketTitle}
                onChange={(e) => setMarketTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>
              Description (optional)
              <textarea
                value={marketDescription}
                onChange={(e) => setMarketDescription(e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px', minHeight: '100px' }}
              />
            </label>
          </div>
          <button type="submit" disabled={creatingMarket}>
            {creatingMarket ? 'Creating...' : 'Create Market'}
          </button>
        </form>
      </div>

      <div>
        <h2>Open Markets ({openMarkets.length})</h2>
        {openMarkets.length === 0 ? (
          <div>No open markets</div>
        ) : (
          <div>
            {openMarkets.map((market) => (
              <div
                key={market.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '15px',
                  marginBottom: '15px',
                  borderRadius: '5px',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{market.title}</h3>
                {market.description && <p style={{ margin: '0 0 10px 0' }}>{market.description}</p>}
                <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                  Created: {new Date(market.created_at).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleResolveMarket(market.id, 'YES')}
                    disabled={resolvingMarket === market.id}
                    style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    {resolvingMarket === market.id ? 'Resolving...' : 'Resolve as YES'}
                  </button>
                  <button
                    onClick={() => handleResolveMarket(market.id, 'NO')}
                    disabled={resolvingMarket === market.id}
                    style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    {resolvingMarket === market.id ? 'Resolving...' : 'Resolve as NO'}
                  </button>
                  <button
                    onClick={() => navigate(`/markets/${market.id}`)}
                    style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}
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

