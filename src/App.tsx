import React, { useEffect, useMemo, useState } from 'react';
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import DealsPage from './pages/DealsPage';
import DealDetail from './pages/DealDetail';

import { Button } from './components/Primitives';

interface MachineContext {
  progress: number;
}

type MachineEvent =
  | { type: 'RUN' }
  | { type: 'LOCKED' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR' }
  | { type: 'RETRY' };

const runModelMachine = createMachine({
  id: 'runModel',
  initial: 'idle',
  context: { progress: 0 } as MachineContext,
  types: {} as {
    context: MachineContext;
    events: MachineEvent;
  },
  states: {
    idle: {
      on: { RUN: 'locking' },
    },
    locking: {
      on: {
        LOCKED: 'running',
        ERROR: 'error',
      },
      after: {
        500: {
          actions: assign({
            progress: () => 30,
          }),
        },
      },
    },
    running: {
      on: {
        SUCCESS: 'success',
        ERROR: 'error',
      },
      after: {
        200: {
          actions: assign({
            progress: () => 70,
          }),
        },
      },
    },
    success: { type: 'final' },
    error: {
      on: { RETRY: 'locking' },
    },
  },
});

type Deal = {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: any;
  asIsResults?: any;
  optimizedResults?: any;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
};

export default function App() {
  const [page, setPage] = useState<string>('landing');
  const [token, setToken] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean>(false);
  const [deals, setDeals] = useState<Deal[]>([]);

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('authToken');
    if (stored) {
      setToken(stored);
    }
  }, []);

  // Auto-redirect logic – force login when needed
  useEffect(() => {
    if (token && (page === 'landing' || page === 'login')) {
      setPage('deals');
    } else if (!token && page !== 'landing' && page !== 'login') {
      setPage('login');
    }
  }, [token, page]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    setDeals([]);
    setPage('landing');
    toast.success('Logged out successfully');
  };

  const currentPage = page.startsWith('deal/') ? 'dealDetail' : page;
  const dealId = page.startsWith('deal/') ? page.split('/')[1] : null;

  // Apply dark mode class to document root
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="min-h-screen p-6 bg-slate-100 dark:bg-slate-900 font-ibm-plex-sans text-gray-900 dark:text-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={dark ? 'dark' : 'light'}
      />

      <header className="mb-6 flex justify-between items-center">
        <h1 className="font-inter-tight text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white">
          Block Three Capital
        </h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => setDark(!dark)} variant="ghost" className="text-gray-700 dark:text-gray-300">
            {dark ? 'Light Mode' : 'Dark Mode'}
          </Button>
          {token && (
            <Button onClick={handleLogout} variant="danger">
              Logout
            </Button>
          )}
        </div>
      </header>

      {currentPage === 'landing' && <Landing setPage={setPage} />}
      {currentPage === 'login' && <Login onSuccess={setToken} setPage={setPage} />}
      {currentPage === 'deals' && token && (
        <DealsPage
          deals={deals}
          setDeals={setDeals}
          setPage={setPage}
          token={token}
        />
      )}
      {currentPage === 'dealDetail' && token && dealId && (
        <DealDetail
          dealId={dealId}
          deals={deals}
          setDeals={setDeals}
          setPage={setPage}
          token={token}
        />
      )}
    </div>
  );
}
