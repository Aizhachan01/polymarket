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

  if (loading) return <div>Loading markets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Markets</h1>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{ marginRight: '10px', fontWeight: filter === 'all' ? 'bold' : 'normal' }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('open')}
          style={{ marginRight: '10px', fontWeight: filter === 'open' ? 'bold' : 'normal' }}
        >
          Open
        </button>
        <button
          onClick={() => setFilter('resolved')}
          style={{ fontWeight: filter === 'resolved' ? 'bold' : 'normal' }}
        >
          Resolved
        </button>
      </div>
      <div>
        {markets.length === 0 ? (
          <div>No markets found</div>
        ) : (
          markets.map((market) => (
            <div
              key={market.id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '15px',
                borderRadius: '5px',
              }}
            >
              <Link
                to={`/markets/${market.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h2 style={{ margin: '0 0 10px 0' }}>{market.title}</h2>
              </Link>
              {market.description && <p style={{ margin: '0 0 10px 0' }}>{market.description}</p>}
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                <span>Status: {market.status}</span>
                {market.resolution && <span>Resolution: {market.resolution}</span>}
                <span>Created: {new Date(market.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MarketList;

