import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DealsPage from './pages/DealsPage';
import { Button } from './components/Primitives';
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
  const [page, setPage] = useState('landing');
  const [dark, setDark] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('deals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    if (token && page === 'landing') {
      setPage('deals');
    } else if (!token && !['landing', 'login'].includes(page)) {
      setPage('login');
    }
  }, [token, page]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setPage('landing');
  };

  const currentPage = page.startsWith('deal/') ? 'dealDetail' : page;
  const dealId = page.startsWith('deal/') ? page.split('/')[1] : null;

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'dark bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="font-sans text-gray-900 dark:text-gray-100">
        {/* REMOVED NAVBAR SECTION */}

        {/* Main Content */}
        <main className="min-h-screen"> {/* Removed pt-20 since navbar is gone */}
          {currentPage === 'landing' && <Landing setPage={setPage} />}
          {currentPage === 'login' && <Login setToken={setToken} setPage={setPage} />}
          {currentPage === 'deals' && token && (
            <DealsPage deals={deals} setDeals={setDeals} setPage={setPage} />
          )}
          {currentPage === 'dealDetail' && token && dealId && (
            <DealDetail
              dealId={dealId}
              deals={deals}
              setDeals={setDeals}
              setPage={setPage}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800">
          <p>© 2025 Block Three Capital LLC — For institutional clients and qualified investors only</p>
        </footer>
      </div>
    </div>
  );
}