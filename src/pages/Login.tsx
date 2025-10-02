import React, { useState } from 'react';
import { Button, SectionTitle } from '../components/Primitives';
import { API } from '../utils';
import { toast } from 'react-toastify';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
  setPage: (page: string) => void;
}

export default function Login({ setIsAuthenticated, setPage }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading('Authenticating...');
    try {
      const res = await fetch(API('/api/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      toast.update(toastId, {
        render: 'Login successful',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setPage('assumptions'); // Redirect to assumptions after login
    } catch (e: any) {
      setError(e.message);
      toast.update(toastId, {
        render: `Error: ${e.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center px-4">
      <SectionTitle>Login to Block Three Capital</SectionTitle>
      <p className="font-ibm-plex-sans text-[16px] mb-6 max-w-md leading-relaxed text-gray-700 dark:text-gray-300">
        Enter your access password to optimize your Bitcoin treasury.
      </p>
      <div className="w-full max-w-sm">
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          variant="primary"
          className="w-full py-3 text-sm font-semibold"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Logging in...</span>
            </>
          ) : (
            'Login'
          )}
        </Button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}