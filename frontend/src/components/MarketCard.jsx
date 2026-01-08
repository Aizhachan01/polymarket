import { useState } from 'react';
import { Link } from 'react-router-dom';

function MarketCard({ market, user, onBetUpdate }) {
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState(null);
  const [showBetInput, setShowBetInput] = useState(false);
  const [betting, setBetting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Calculate percentages
  const yesCount = parseFloat(market.yes_count || 0);
  const noCount = parseFloat(market.no_count || 0);
  const total = yesCount + noCount;
  const yesPercentage = total > 0 ? (yesCount / total) * 100 : 0;
  const noPercentage = total > 0 ? (noCount / total) * 100 : 0;

  // Format volume
  const formatVolume = (volume) => {
    const vol = parseFloat(volume || 0);
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(1)}m`;
    } else if (vol >= 1000) {
      return `$${(vol / 1000).toFixed(1)}k`;
    }
    return `$${vol.toFixed(0)}`;
  };

  // Calculate potential winnings
  const calculatePotentialWinnings = (amount, side) => {
    if (!amount || amount <= 0) return 0;
    const betAmount = parseFloat(amount);
    const selectedPool = side === 'YES' ? yesCount : noCount;
    const oppositePool = side === 'YES' ? noCount : yesCount;
    
    if (selectedPool === 0) return betAmount;
    
    const totalPool = selectedPool + oppositePool + betAmount;
    const payout = (totalPool / (selectedPool + betAmount)) * betAmount;
    return payout;
  };

  const handleBetClick = (side) => {
    if (!user) {
      alert('Please login to place a bet');
      return;
    }
    if (market.status !== 'open') {
      alert('This market is closed');
      return;
    }
    setSelectedSide(side);
    setShowBetInput(true);
  };

  const handleBetSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedSide) return;

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': localStorage.getItem('userId') || '',
        },
        body: JSON.stringify({
          market_id: market.id,
          side: selectedSide,
          amount: amount
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to place bet');
      }

      setBetAmount('');
      setShowBetInput(false);
      setSelectedSide(null);
      if (onBetUpdate) {
        onBetUpdate();
      }
      alert('Bet placed successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setBetting(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const displayPercentage = yesPercentage;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header: Image, Title, and Percentage */}
          <div className="flex items-start gap-3 mb-4">
            {/* Image */}
            <div className="flex-shrink-0">
              {market.image_url ? (
                <img
                  src={market.image_url}
                  alt={market.title}
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>

            {/* Title and Percentage */}
            <div className="flex-1 min-w-0">
              <Link to={`/markets/${market.id}`} className="block group">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {market.title}
                </h3>
              </Link>
              
              {/* Percentage Circle */}
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={displayPercentage > 50 ? "#f97316" : "#ef4444"}
                      strokeWidth="2.5"
                      strokeDasharray={`${displayPercentage}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">{displayPercentage.toFixed(0)}%</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">chance</span>
              </div>
            </div>
          </div>

          {/* Yes/No Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleBetClick('YES')}
              disabled={market.status !== 'open' || betting}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold text-white transition-all ${
                market.status === 'open' && !betting
                  ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleBetClick('NO')}
              disabled={market.status !== 'open' || betting}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold text-white transition-all ${
                market.status === 'open' && !betting
                  ? 'bg-red-500 hover:bg-red-600 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              No
            </button>
          </div>

          {/* Footer: Volume and Bookmark */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="font-semibold">{formatVolume(market.total_volume || 0)}</span>
              <span>Vol.</span>
            </div>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                isBookmarked ? 'text-yellow-500' : 'text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bet Input Modal */}
      {showBetInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4">Place Bet - {selectedSide}</h3>
            <form onSubmit={handleBetSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoFocus
                />
                {user && (
                  <p className="text-sm text-gray-500 mt-1">
                    Your balance: {parseFloat(user.points_balance).toFixed(2)} points
                  </p>
                )}
              </div>

              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Potensi Kemenangan:
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    Jika menang, Anda akan mendapatkan{' '}
                    {calculatePotentialWinnings(betAmount, selectedSide).toFixed(2)} poin
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    (Termasuk taruhan awal Anda)
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBetInput(false);
                    setBetAmount('');
                    setSelectedSide(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={betting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {betting ? 'Placing...' : 'Place Bet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MarketCard;
