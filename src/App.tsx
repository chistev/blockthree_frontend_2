// App.tsx
import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DealsPage from './pages/DealsPage';
import DealDetail from './components/DealDetail';

interface Deal {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: Record<string, any>;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
  asIsResults?: any;
  optimizedResults?: any;
  selectedCandidateIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [page, setPage] = useState<'landing' | 'login' | 'deals' | `deal/${string}`>('landing');
  const [dark] = useState(true);
  
  // Simple password-based auth — no token needed
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('btc-treasury-auth') === 'authenticated';
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('deals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deals', JSON.stringify(deals));
  }, [deals]);

  // Auto-redirect logic
  useEffect(() => {
    if (isAuthenticated && page === 'landing') {
      setPage('deals');
    } else if (!isAuthenticated && !['landing', 'login'].includes(page)) {
      setPage('login');
    }
  }, [isAuthenticated, page]);

  const handleLoginSuccess = () => {
    localStorage.setItem('btc-treasury-auth', 'authenticated');
    setIsAuthenticated(true);
    setPage('deals');
  };

  const handleLogout = () => {
    localStorage.removeItem('btc-treasury-auth');
    setIsAuthenticated(false);
    setPage('landing');
  };

  const currentPage = page.startsWith('deal/') ? 'dealDetail' : page;
  const dealId = page.startsWith('deal/') ? page.split('/')[1] : null;

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'dark bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="font-sans text-gray-900 dark:text-gray-100">
        <main className="min-h-screen">
          {currentPage === 'landing' && <Landing setPage={setPage} />}
          {currentPage === 'login' && <Login onSuccess={handleLoginSuccess} setPage={setPage} />}
          {currentPage === 'deals' && isAuthenticated && (
            <DealsPage 
              deals={deals} 
              setDeals={setDeals} 
              setPage={setPage}
              onLogout={handleLogout}
            />
          )}
          {currentPage === 'dealDetail' && isAuthenticated && dealId && (
            <DealDetail
              dealId={dealId}
              deals={deals}
              setDeals={setDeals}
              setPage={setPage}
              onLogout={handleLogout}
            />
          )}
        </main>

        <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800">
          <p>© 2025 Block Three Capital LLC — For institutional clients and qualified investors only</p>
        </footer>
      </div>
    </div>
  );
}