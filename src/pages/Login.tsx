import React, { useState, useRef, useEffect } from 'react';
import { authFetch } from '../auth';

interface Props {
  onSuccess: () => void;
  setPage: (page: 'landing') => void;
}

export default function Login({ onSuccess, setPage }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add this useEffect to inject the styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
        20%, 40%, 60%, 80% { transform: translateX(8px); }
      }
      .shake { animation: shake 0.6s ease-in-out; }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      .animate-fade-in { animation: fade-in 0.3s ease-out; }
      
      input[type="password"] {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #111827 !important;
        letter-spacing: 0.1em !important;
      }
      
      input[type="text"] {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #111827 !important;
        letter-spacing: 0.05em !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    try {
      const response = await authFetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        onSuccess();
      } else {
        setError(true);
        setPassword('');
        setIsLoading(false);
        // Refocus on error
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">BTC</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Block Three Capital</h1>
          </div>
          <p className="mt-4 text-lg text-gray-600">Enter access password to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              
              {/* Enhanced Password Input Container */}
              <div 
                className={`relative w-full border-2 rounded-lg transition-all duration-200 ${
                  error 
                    ? 'border-red-500 bg-red-50 shake' 
                    : isFocused 
                    ? 'border-orange-500 bg-white ring-2 ring-orange-200' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
                }`}
                onClick={() => inputRef.current?.focus()}
              >
                <input
                  ref={inputRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full px-4 py-3 bg-transparent text-lg font-mono tracking-wider focus:outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Type your password..."
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                
                {/* Password visibility toggle */}
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.848 3.848M9.88 9.88l-3.85-3.85m9.02 9.02l3.847-3.848M4.24 4.24l3.85 3.85" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Character count and strength indicator */}
              {password && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className={`font-medium ${
                    password.length < 4 ? 'text-red-500' : 
                    password.length < 8 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {password.length} character{password.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-1 rounded-full ${
                          password.length >= level * 3 
                            ? level === 1 ? 'bg-red-500' : level === 2 ? 'bg-orange-500' : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className={`w-full py-4 rounded-lg text-white font-medium text-lg transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl ${
                isLoading || !password
                  ? 'bg-orange-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Unlock Calculator'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            This tool is private • Access granted to select treasury teams
          </p>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setPage('landing')} 
            className="text-gray-600 hover:text-gray-900 text-sm underline flex items-center justify-center mx-auto"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}