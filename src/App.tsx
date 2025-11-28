import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DealsPage from './pages/DealsPage';
import DealDetail from './pages/DealDetail';

export type Page = 'landing' | 'login' | 'deals' | 'deal';

export interface Deal {
  id: string;
  name: string;
  mode: 'pro-forma' | 'live';
  assumptions: any;
  asIsResults?: any;
  optimizedResults?: any;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [currentDealId, setCurrentDealId] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const isAuthenticated = !!token;

  // Auto-skip to deals if logged in
  useEffect(() => {
    if (isAuthenticated) {
      setPage(deals.length > 0 ? 'deals' : 'deals');
    } else {
      setPage('landing');
    }
  }, [isAuthenticated, deals.length]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setDeals([]);
    setPage('landing');
  };

  const navigateToDeal = (dealId: string) => {
    setCurrentDealId(dealId);
    setPage('deal');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="font-sans text-gray-900">
        {/* Authenticated Header Bar */}
        {isAuthenticated && page !== 'landing' && page !== 'login' && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Block Three</h1>
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </header>
        )}

        <main className="min-h-screen">
          {page === 'landing' && <Landing setPage={setPage} />}
          {page === 'login' && <Login onSuccess={handleLoginSuccess} setPage={setPage} />}
          {page === 'deals' && isAuthenticated && (
            <DealsPage deals={deals} setDeals={setDeals} setPage={navigateToDeal} token={token} />
          )}
          {page === 'deal' && isAuthenticated && currentDealId && (
            <DealDetail
              dealId={currentDealId}
              deals={deals}
              setDeals={setDeals}
              setPage={navigateToDeal}
              token={token}
            />
          )}
        </main>

        {!isAuthenticated && (
          <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 mt-auto">
            <p>© 2025 Block Three. Treasury simulation software.</p>
          </footer>
        )}
      </div>
    </div>
  );
}