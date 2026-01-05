const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get user ID from localStorage
export const getUserId = () => {
  return localStorage.getItem('userId');
};

// Set user ID in localStorage
export const setUserId = (userId) => {
  localStorage.setItem('userId', userId);
};

// API request helper
const request = async (endpoint, options = {}) => {
  const userId = getUserId();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add user ID header if available
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

// Markets API
export const marketsApi = {
  getAll: (status) => {
    const query = status ? `?status=${status}` : '';
    return request(`/markets${query}`);
  },
  getById: (id) => request(`/markets/${id}`),
  getBets: (id) => request(`/markets/${id}/bets`),
};

// Bets API
export const betsApi = {
  create: (marketId, side, amount) =>
    request('/bets', {
      method: 'POST',
      body: JSON.stringify({ market_id: marketId, side, amount }),
    }),
};

// Users API
export const usersApi = {
  getCurrent: () => request('/users/me'),
  getById: (id) => request(`/users/${id}`),
  getBets: (userId, marketId) => {
    const query = marketId ? `?market_id=${marketId}` : '';
    return request(`/users/${userId}/bets${query}`);
  },
};

// Admin API
export const adminApi = {
  createMarket: (title, description) =>
    request('/admin/markets', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),
  resolveMarket: (marketId, resolution) =>
    request(`/admin/markets/${marketId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    }),
  addPoints: (userId, amount) =>
    request('/admin/users/add-points', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, amount }),
    }),
};

