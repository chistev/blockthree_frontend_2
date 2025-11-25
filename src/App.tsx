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
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1
              className="text-2xl font-bold tracking-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => (token ? setPage('deals') : setPage('landing'))}
            >
              Block Three Capital
            </h1>
            <div className="flex items-center gap-4">
              <Button onClick={() => setDark(!dark)} variant="ghost" className="text-sm">
                {dark ? 'Light Mode' : 'Dark Mode'}
              </Button>
              {token && (
                <Button onClick={handleLogout} variant="danger" className="text-sm">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 min-h-screen">
          {currentPage === 'landing' && <Landing setPage={setPage} />}
          {currentPage === 'login' && <Login setToken={setToken} setPage={setPage} />}
          {currentPage === 'deals' && token && (
            <DealsPage deals={deals} setDeals={setDeals} setPage={setPage} />
          )}
          {currentPage === 'dealDetail' && token && dealId && (
            // Fixed: Removed token prop — DealDetail doesn't need it
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