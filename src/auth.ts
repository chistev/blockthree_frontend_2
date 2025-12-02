const API_BASE_URL = 'http://127.0.0.1:8000';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

interface HeadersInit {
  [key: string]: string;
}

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as HeadersInit),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

// NEW: Function to fetch live BTC price
export const fetchLiveBTCPrice = async (): Promise<number | null> => {
  try {
    const response = await authFetch('/api/btc_price/');
    if (!response.ok) {
      throw new Error('Failed to fetch BTC price');
    }
    const data = await response.json();
    return data.BTC_current_market_price;
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return null;
  }
};