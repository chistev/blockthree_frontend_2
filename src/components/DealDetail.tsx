// DealDetail.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card, SectionTitle, Pill } from '../components/Primitives';
import ComparisonView from './ComparisonView';
import OptimizedView from './OptimizedView';
import AsIsView from './AsIsView';
import Assumptions from '../pages/Assumptions';
import { API } from '../utils'; // ← your existing helper

interface Deal {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: Record<string, any>;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
  asIsResults?: any;
  optimizedResults?: any;
  selectedCandidateIndex: number | null;
  updatedAt?: string;
}

interface DealDetailProps {
  dealId: string;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPage: (page: 'deals' | 'detail') => void;
}

const DealDetail: React.FC<DealDetailProps> = ({ dealId, deals, setDeals, setPage }) => {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-2xl text-gray-500">Deal not found</p>
      </div>
    );
  }

  const [tab, setTab] = useState<'assumptions' | 'as-is' | 'optimized' | 'comparison'>('assumptions');
  const [name, setName] = useState(deal.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  // Load token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jwt_token');
    if (saved) setToken(saved);
  }, []);

  const updateDeal = (updates: Partial<Deal>) => {
    setDeals(prev =>
      prev.map(d =>
        d.id === dealId
          ? { ...d, ...updates, updatedAt: new Date().toISOString() }
          : d
      )
    );
  };

  const loginIfNeeded = async () => {
    if (token) return token;
    const password = prompt('Enter access password:');
    if (!password) throw new Error('Password required');

    const resp = await fetch(API('/api/login/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!resp.ok) throw new Error('Login failed');
    const data = await resp.json();
    localStorage.setItem('jwt_token', data.token);
    setToken(data.token);
    return data.token;
  };

  const lockSnapshot = async () => {
    const t = await loginIfNeeded();
    const resp = await fetch(API('/api/lock_snapshot/'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: deal.mode,
        assumptions: deal.assumptions,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Lock failed: ${err}`);
    }
    return (await resp.json()).snapshot_id;
  };

  const runCalculation = async (snapshotId: string, format: 'json' | 'csv' | 'pdf' = 'json') => {
    const t = token || await loginIfNeeded();
    const resp = await fetch(API('/api/calculate/'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snapshot_id: snapshotId,
        format,
        use_live: false,
        seed: 42,
        paths: 3000,
        use_variance_reduction: true,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Calculation failed: ${err}`);
    }

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      return await resp.json();
    } else {
      // CSV or PDF
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'treasury_report.csv' : 'treasury_report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      return null;
    }
  };

  const runAsIs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tempAssumptions = {
        ...deal.assumptions,
        LoanPrincipal: 0,
        new_equity_raised: 0,
        BTC_purchased: 0,
        structure: 'None',
      };
      // Temporarily override assumptions for "As-Is"
      const original = deal.assumptions;
      updateDeal({ assumptions: tempAssumptions });

      const snapshotId = await lockSnapshot();
      const result = await runCalculation(snapshotId, 'json');

      if (result) {
        updateDeal({
          asIsResults: result,
          status: deal.optimizedResults ? 'compared' : 'as_is_run',
          assumptions: original, // restore
        });
        setTab('as-is');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runOptimized = async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    setIsLoading(true);
    setError(null);
    try {
      const snapshotId = await lockSnapshot();
      const result = await runCalculation(snapshotId, format);

      if (result) {
        updateDeal({
          optimizedResults: result,
          status: deal.asIsResults ? 'compared' : 'optimized_run',
          selectedCandidateIndex: 0,
        });
        if (format === 'json') setTab('optimized');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runBoth = async () => {
    await runAsIs();
    await runOptimized('json');
    setTab('comparison');
  };

  const handleModeChange = (newMode: string) => {
    if (['public', 'private', 'pro-forma'].includes(newMode)) {
      updateDeal({ mode: newMode as any });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Button onClick={() => setPage('deals')} variant="ghost">
            Back to Deals
          </Button>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => updateDeal({ name })}
            className="text-3xl font-bold bg-transparent border-b-4 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Unnamed Deal"
          />
        </div>
        <div className="flex gap-3">
          <Pill tone="blue">{deal.mode}</Pill>
          <Pill tone={deal.status === 'compared' ? 'green' : deal.status.includes('run') ? 'violet' : 'gray'}>
            {deal.status.replace('_', ' ')}
          </Pill>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={runAsIs} disabled={isLoading} variant="secondary">
          {isLoading ? 'Running...' : 'Run As-Is'}
        </Button>
        <Button onClick={() => runOptimized('json')} disabled={isLoading} variant="outline">
          {isLoading ? 'Optimizing...' : 'Run Optimizer'}
        </Button>
        <Button onClick={runBoth} disabled={isLoading} variant="primary">
          {isLoading ? 'Analyzing...' : 'Run Both & Compare'}
        </Button>
        {deal.status.includes('run') && (
          <>
            <Button onClick={() => runOptimized('csv')} disabled={isLoading} variant="outline">
              Download CSV
            </Button>
            <Button onClick={() => runOptimized('pdf')} disabled={isLoading} variant="outline">
              Download PDF
            </Button>
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left: Assumptions */}
        <div className="order-2 xl:order-1">
          <Assumptions
            assumptions={deal.assumptions}
            setAssumptions={(newAssumptions) => updateDeal({ assumptions: newAssumptions })}
            mode={deal.mode}
            setMode={handleModeChange}
            handleCalculate={() => runOptimized('json')}
            isLoading={isLoading}
            progress={isLoading ? 75 : 0}
          />
        </div>

        {/* Right: Results */}
        <div className="order-1 xl:order-2">
          <Card className="h-full">
            <div className="border-b border-gray-200 dark:border-zinc-800">
              <div className="flex -mb-px">
                {[
                  { key: 'assumptions', label: 'Overview' },
                  { key: 'as-is', label: 'As-Is' },
                  { key: 'optimized', label: 'Optimized' },
                  { key: 'comparison', label: 'Comparison' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key as any)}
                    disabled={isLoading}
                    className={`px-6 py-3 font-medium text-sm tracking-wider transition-all border-b-2 ${
                      tab === key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 min-h-96">
              {tab === 'assumptions' && (
                <div className="flex flex-col items-center justify-center h-80 text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Ready to Run</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                    Adjust assumptions and click a run button to generate real results from the risk engine.
                  </p>
                </div>
              )}

              {tab === 'as-is' && (deal.asIsResults ? <AsIsView results={deal.asIsResults} /> : <div className="text-center py-20 text-gray-500">Run As-Is first</div>)}
              {tab === 'optimized' && (deal.optimizedResults ? <OptimizedView results={deal.optimizedResults} deal={deal} setDeals={setDeals} deals={deals} /> : <div className="text-center py-20 text-gray-500">Run Optimizer first</div>)}
              {tab === 'comparison' && (deal.asIsResults && deal.optimizedResults ? <ComparisonView asIs={deal.asIsResults} optimized={deal.optimizedResults} selectedCandidateIndex={deal.selectedCandidateIndex} /> : <div className="text-center py-20 text-gray-500">Run both scenarios</div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealDetail;