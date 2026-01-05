import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketsApi, betsApi } from '../utils/api';

function MarketDetail({ user, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [betSide, setBetSide] = useState('YES');
  const [betting, setBetting] = useState(false);

  useEffect(() => {
    loadMarket();
    loadBets();
  }, [id]);

  const loadMarket = async () => {
    try {
      const response = await marketsApi.getById(id);
      setMarket(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBets = async () => {
    try {
      const response = await marketsApi.getBets(id);
      setBets(response.data || []);
    } catch (err) {
      console.error('Failed to load bets:', err);
    }
  };

  const handleBet = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to place a bet');
      return;
    }

    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > parseFloat(user.points_balance)) {
      alert('Insufficient balance');
      return;
    }

    setBetting(true);
    try {
      await betsApi.create(id, betSide, amount);
      setBetAmount('');
      await loadMarket();
      await loadBets();
      if (onUpdate) onUpdate();
      alert('Bet placed successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setBetting(false);
    }
  };

  if (loading) return <div>Loading market...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!market) return <div>Market not found</div>;

  const pools = market.pools || { yes: 0, no: 0, total: 0 };
  const yesPercentage = pools.total > 0 ? (pools.yes / pools.total) * 100 : 0;
  const noPercentage = pools.total > 0 ? (pools.no / pools.total) * 100 : 0;

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back to Markets
      </button>
      <h1>{market.title}</h1>
      {market.description && <p>{market.description}</p>}
      <div style={{ marginBottom: '20px' }}>
        <div>Status: {market.status}</div>
        {market.resolution && <div>Resolution: {market.resolution}</div>}
        <div>Created: {new Date(market.created_at).toLocaleString()}</div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Pools</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div>YES: {parseFloat(pools.yes).toFixed(2)} points</div>
            <div>Percentage: {yesPercentage.toFixed(1)}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <div>NO: {parseFloat(pools.no).toFixed(2)} points</div>
            <div>Percentage: {noPercentage.toFixed(1)}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <div>Total: {parseFloat(pools.total).toFixed(2)} points</div>
          </div>
        </div>
      </div>

      {market.status === 'open' && (
        <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
          <h2>Place a Bet</h2>
          {user ? (
            <form onSubmit={handleBet}>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="radio"
                    value="YES"
                    checked={betSide === 'YES'}
                    onChange={(e) => setBetSide(e.target.value)}
                    style={{ marginRight: '5px' }}
                  />
                  YES
                </label>
                <label style={{ marginLeft: '15px' }}>
                  <input
                    type="radio"
                    value="NO"
                    checked={betSide === 'NO'}
                    onChange={(e) => setBetSide(e.target.value)}
                    style={{ marginRight: '5px' }}
                  />
                  NO
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="number"
                  placeholder="Amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  style={{ padding: '5px', width: '200px' }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Your balance: {parseFloat(user.points_balance).toFixed(2)} points
                </div>
              </div>
              <button type="submit" disabled={betting}>
                {betting ? 'Placing bet...' : 'Place Bet'}
              </button>
            </form>
          ) : (
            <div>Please login to place a bet</div>
          )}
        </div>
      )}

      <div>
        <h2>All Bets ({bets.length})</h2>
        {bets.length === 0 ? (
          <div>No bets yet</div>
        ) : (
          <div>
            {bets.map((bet) => (
              <div
                key={bet.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <div>
                  <strong>{bet.user?.username || bet.user_id}</strong> bet{' '}
                  <strong>{bet.side}</strong> - {parseFloat(bet.amount).toFixed(2)} points
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(bet.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketDetail;

