import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '../utils/api';

function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(userId);
      setProfile(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div className="error-message">Profile not found</div>;
  }

  const { stats, bets } = profile || {};

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{profile.username}'s Profile</h1>
        <div className="profile-info">
          <div className="info-item">
            <span className="label">Email:</span>
            <span>{profile.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Balance:</span>
            <span className="balance-amount">{parseFloat(profile.points_balance || 0).toFixed(2)} points</span>
          </div>
          <div className="info-item">
            <span className="label">Role:</span>
            <span className={`role-badge ${profile.role}`}>{profile.role}</span>
          </div>
        </div>
      </div>

      {stats ? (
        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalBets}</div>
              <div className="stat-label">Total Bets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{parseFloat(stats.totalWagered).toFixed(2)}</div>
              <div className="stat-label">Total Wagered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.wonBets}</div>
              <div className="stat-label">Won</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.lostBets}</div>
              <div className="stat-label">Lost</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.pendingBets}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.resolvedBets}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Bets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0.00</div>
              <div className="stat-label">Total Wagered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Won</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Lost</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>
      )}

      <div className="bets-section">
        <h2>Bet History</h2>
        {bets && Array.isArray(bets) && bets.length > 0 ? (
          <div className="bets-list">
            {bets.map((bet) => (
              <div key={bet.id} className="bet-item">
                <div className="bet-header">
                  <Link to={`/markets/${bet.market_id}`} className="bet-market">
                    {bet.market?.title || 'Market'}
                  </Link>
                  <span className={`bet-side ${bet.side.toLowerCase()}`}>{bet.side}</span>
                </div>
                <div className="bet-details">
                  <div className="bet-amount">Amount: {parseFloat(bet.amount).toFixed(2)} points</div>
                  <div className="bet-status">
                    {bet.market?.status === 'resolved' ? (
                      bet.market?.resolution === bet.side ? (
                        <span className="status-won">✓ Won</span>
                      ) : (
                        <span className="status-lost">✗ Lost</span>
                      )
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}
                  </div>
                  <div className="bet-date">
                    {new Date(bet.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No bets yet</div>
        )}
      </div>
    </div>
  );
}

export default Profile;

