// App.tsx
import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Assumptions from './pages/Assumptions';  // ← Add this import
// import Results from './pages/Results';          // ← You'll create this next

export type Page = 'landing' | 'login' | 'assumptions' | 'results';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [dark] = useState(false);

  // Check for real JWT token on load
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('authToken');
  });

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && (page === 'landing' || page === 'login')) {
      setPage('assumptions');
    }
  }, [isAuthenticated, page]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage('assumptions'); // ← This is the key change!
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setPage('landing');
  };

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'dark bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="font-sans text-gray-900 dark:text-gray-100">
        <main className="min-h-screen">
          {page === 'landing' && <Landing setPage={setPage} />}
          {page === 'login' && <Login onSuccess={handleLoginSuccess} setPage={setPage} />}
          {page === 'assumptions' && isAuthenticated && (
            <Assumptions 
              onCalculationComplete={(result) => {
                // Pass results to Results page
                // You can store it in state, context, or localStorage
                localStorage.setItem('latestResults', JSON.stringify(result));
                setPage('results');
              }}
            />
          )}
          {page === 'results' && isAuthenticated && <Results />}
        </main>

        <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>© 2025 Block Three Capital LLC — For institutional clients and qualified investors only</p>
        </footer>
      </div>
    </div>
  );
}