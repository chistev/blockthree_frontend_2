import React, { useState, useRef, useEffect } from 'react';
import { authFetch } from '../auth';

export type Page = 'landing' | 'login' | 'deals' | `deal/${string}`;

interface Props {
  onSuccess: (token: string) => void;
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
      onSuccess(token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-12 h-12 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Block Three Capital
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Treasury Optimization Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="Enter your password..."
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white font-semibold py-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? 'Unlocking...' : 'Unlock Calculator'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          This tool is private • Access granted to select treasury teams
        </p>

        <div className="text-center mt-10">
          <button
            onClick={() => setPage('landing')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2 mx-auto transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
