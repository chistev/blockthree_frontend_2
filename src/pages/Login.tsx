import React, { useState, useRef, useEffect } from 'react';
import { authFetch } from '../auth';
import { Page } from '../App';

interface Props {
  onSuccess: (token: string) => void;  // Now accepts token
  setPage: (page: Page) => void;
}

export default function Login({ onSuccess, setPage }: Props) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Password required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authFetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid password');
      }

      const data = await response.json();
      const token = data.token;

      localStorage.setItem('authToken', token);
      onSuccess(token); // Pass token to App.tsx
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Block Three</h1>
          <p className="mt-4 text-lg text-gray-600">Enter access password to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                placeholder="Type your password..."
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? 'Unlocking...' : 'Unlock Calculator'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-8">
            This tool is private • Access granted to select treasury teams
          </p>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setPage('landing')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mx-auto transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}