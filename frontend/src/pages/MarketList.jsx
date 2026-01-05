import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketsApi } from '../utils/api';

function MarketList() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, open, resolved

  useEffect(() => {
    loadMarkets();
  }, [filter]);

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? null : filter;
      const response = await marketsApi.getAll(status);
      setMarkets(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading markets...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h1 className="page-title">Markets</h1>
      <div className="filter-buttons">
        <button
          onClick={() => setFilter('all')}
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
        >
          Resolved
        </button>
      </div>
      <div className="markets-list">
        {markets.length === 0 ? (
          <div className="empty-state">No markets found</div>
        ) : (
          markets.map((market) => (
            <div key={market.id} className="market-card">
              <h2 className="market-card-title">
                <Link to={`/markets/${market.id}`}>{market.title}</Link>
              </h2>
              {market.description && (
                <p className="market-card-description">{market.description}</p>
              )}
              <div className="market-card-meta">
                <span className="meta-item">
                  <span className={`status-badge ${market.status}`}>{market.status}</span>
                </span>
                {market.resolution && (
                  <span className="meta-item">
                    <span className="resolution-badge">Resolution: {market.resolution}</span>
                  </span>
                )}
                <span className="meta-item">Created: {new Date(market.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MarketList;
