import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Assumptions from './pages/Assumptions';
import Results from './pages/Results';

export type Page = 'landing' | 'login' | 'assumptions' | 'results';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [latestResult, setLatestResult] = useState<any>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('authToken');
  });

  // Restore result on page refresh
  useEffect(() => {
    const saved = localStorage.getItem('latestResult');
    if (saved) {
      setLatestResult(JSON.parse(saved));
      if (isAuthenticated) setPage('results');
    }
  }, [isAuthenticated]);

  // Auto-skip login if already authenticated
  useEffect(() => {
    if (isAuthenticated && (page === 'landing' || page === 'login')) {
      setPage('assumptions');
    }
  }, [isAuthenticated, page]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage('assumptions');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('latestResult');
    setIsAuthenticated(false);
    setLatestResult(null);
    setPage('landing');
  };

  const goToResults = (result: any) => {
    setLatestResult(result);
    localStorage.setItem('latestResult', JSON.stringify(result));
    setPage('results');
  };

  const goToAssumptions = () => {
    setPage('assumptions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="font-sans text-gray-900">
        <main className="min-h-screen">
          {page === 'landing' && <Landing setPage={setPage} />}
          {page === 'login' && <Login onSuccess={handleLoginSuccess} setPage={setPage} />}
          {page === 'assumptions' && isAuthenticated && (
            <Assumptions onCalculationComplete={goToResults} />
          )}
          {page === 'results' && isAuthenticated && (
            <Results result={latestResult} goBack={goToAssumptions} />
          )}
        </main>

        {isAuthenticated && page !== 'landing' && page !== 'login' && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        )}

        <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>© 2025 Block Three Capital LLC — For institutional clients and qualified investors only</p>
        </footer>
      </div>
    </div>
  );
}