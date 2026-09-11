const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Lightweight wrapper around native fetch that handles:
 * - Base URL prefixing
 * - Automatic Authorization header attachment
 * - Automatic JSON stringification / parsing
 * - 401 session expiration handling
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.headers || {})
  };

  // Only set Content-Type to application/json if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Handle expired or invalid token
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};
