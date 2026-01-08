import { useState, useEffect } from 'react';
import { marketsApi, usersApi } from '../utils/api';
import MarketCard from '../components/MarketCard';

function MarketList({ user }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, open, resolved
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    loadUser();
    loadMarkets();
  }, [filter]);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const loadUser = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId || token) {
        const response = await usersApi.getCurrent();
        setCurrentUser(response.data);
      }
    } catch (err) {
      // User not logged in, that's okay
      setCurrentUser(null);
    }
  };

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

  const handleBetUpdate = () => {
    loadMarkets();
    loadUser();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading markets...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Markets</h1>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'open'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'resolved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Markets Grid */}
        {markets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No markets found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {markets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                user={currentUser}
                onBetUpdate={handleBetUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketList;
