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

  if (loading) return <div className="loading">Loading market...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!market) return <div className="error">Market not found</div>;

  const pools = market.pools || { yes: 0, no: 0, total: 0 };
  const yesPercentage = pools.total > 0 ? (pools.yes / pools.total) * 100 : 0;
  const noPercentage = pools.total > 0 ? (pools.no / pools.total) * 100 : 0;

  return (
    <div>
      <button onClick={() => navigate('/')} className="back-btn">← Back to Markets</button>
      
      <div className="market-detail">
        <h1 className="market-detail-title">{market.title}</h1>
        {market.description && <p className="market-detail-description">{market.description}</p>}
        <div className="market-info">
          <div className="info-item">Status: <strong>{market.status}</strong></div>
          {market.resolution && <div className="info-item">Resolution: <strong>{market.resolution}</strong></div>}
          <div className="info-item">Created: {new Date(market.created_at).toLocaleString()}</div>
        </div>

        <div className="pools-section">
          <h2 className="pools-title">Pools</h2>
          <div className="pools-grid">
            <div className="pool-card">
              <div className="pool-label">YES</div>
              <div className="pool-amount">{parseFloat(pools.yes).toFixed(2)} points</div>
              <div className="pool-percentage">{yesPercentage.toFixed(1)}%</div>
            </div>
            <div className="pool-card">
              <div className="pool-label">NO</div>
              <div className="pool-amount">{parseFloat(pools.no).toFixed(2)} points</div>
              <div className="pool-percentage">{noPercentage.toFixed(1)}%</div>
            </div>
            <div className="pool-card">
              <div className="pool-label">Total</div>
              <div className="pool-amount">{parseFloat(pools.total).toFixed(2)} points</div>
            </div>
          </div>
        </div>
      </div>

      {market.status === 'open' && (
        <div className="bet-section">
          <h2 className="bet-section-title">Place a Bet</h2>
          {user ? (
            <form onSubmit={handleBet} className="bet-form">
              <div className="side-options">
                <div className="side-option">
                  <input
                    type="radio"
                    value="YES"
                    checked={betSide === 'YES'}
                    onChange={(e) => setBetSide(e.target.value)}
                    id="side-yes"
                  />
                  <label htmlFor="side-yes">YES</label>
                </div>
                <div className="side-option">
                  <input
                    type="radio"
                    value="NO"
                    checked={betSide === 'NO'}
                    onChange={(e) => setBetSide(e.target.value)}
                    id="side-no"
                  />
                  <label htmlFor="side-no">NO</label>
                </div>
              </div>
              <div className="amount-input-group">
                <input
                  type="number"
                  placeholder="Amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="amount-input"
                />
                <div className="balance-info">
                  Your balance: {parseFloat(user.points_balance).toFixed(2)} points
                </div>
              </div>
              <button type="submit" disabled={betting} className="place-bet-btn">
                {betting ? 'Placing bet...' : 'Place Bet'}
              </button>
            </form>
          ) : (
            <div className="empty-state">Please login to place a bet</div>
          )}
        </div>
      )}

      <div className="bets-section">
        <h2 className="bets-section-title">All Bets ({bets.length})</h2>
        {bets.length === 0 ? (
          <div className="empty-state">No bets yet</div>
        ) : (
          <div className="bets-list">
            {bets.map((bet) => (
              <div key={bet.id} className="bet-item">
                <div className="bet-item-header">
                  <div>
                    <span className="bet-user">{bet.user?.username || bet.user_id}</span>
                    <span className={`bet-side ${bet.side.toLowerCase()}`}>{bet.side}</span>
                  </div>
                  <div className="bet-amount">{parseFloat(bet.amount).toFixed(2)} points</div>
                </div>
                <div className="bet-date">{new Date(bet.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketDetail;
