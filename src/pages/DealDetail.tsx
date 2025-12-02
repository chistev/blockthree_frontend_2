// DealDetail.tsx
import React, { useState, useEffect } from 'react';
import Assumptions from './Assumptions';
import AsIsView from './AsIsView';
import OptimizedView from './OptimizedView';
import ComparisonView from './ComparisonView';
import { Card, SectionTitle, Button, Pill } from '../components/Primitives';
import { authFetch } from '../auth';
import { toastSuccess, toastError } from '../utils';

interface Deal {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: any;
  asIsResults?: any;
  optimizedResults?: any[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
  snapshotId?: string | null;
}

interface DealDetailProps {
  dealId: string;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPage: (page: string) => void;
  token: string | null;
}

export default function DealDetail({ dealId, deals, setDeals, setPage, token }: DealDetailProps) {
  const deal = deals.find((d) => d.id === dealId);
  if (!deal) return <div className="text-center py-12 text-gray-500">Deal not found</div>;

  const [tab, setTab] = useState<'as-is' | 'optimized' | 'comparison'>('as-is');
  const [name, setName] = useState(deal.name);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDeal = (updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      )
    );
  };

  // Auto-fetch live BTC price on mount or when deal changes
  useEffect(() => {
    const fetchLiveBtcPrice = async () => {
      try {
        const res = await authFetch('/api/btc_price/');
        if (!res.ok) return;
        const data = await res.json();
        const livePrice = Math.round(data.BTC_current_market_price);

        updateDeal({
          assumptions: {
            ...deal.assumptions,
            BTC_current_market_price: livePrice,
            targetBTCPrice: livePrice,
          },
        });

        if (deal.assumptions.BTC_current_market_price !== livePrice) {
          toastSuccess?.(`Live BTC Price Updated: $${livePrice.toLocaleString()}`);
        }
      } catch (err) {
        console.warn('Failed to fetch live BTC price (non-critical)');
      }
    };

    fetchLiveBtcPrice();
  }, [dealId]);

  const runCalculation = async (type: 'as-is' | 'optimized' | 'both') => {
    setIsLoading(true);
    setError(null);

    try {
      const lockRes = await authFetch('/api/lock_snapshot/', {
        method: 'POST',
        body: JSON.stringify({
          assumptions: deal.assumptions,
          mode: deal.mode,
        }),
      });

      if (!lockRes.ok) {
        const err = await lockRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to lock snapshot');
      }

      const { snapshot_id } = await lockRes.json();
      const snapshotIdStr = String(snapshot_id);

      const calcRes = await authFetch('/api/calculate/', {
        method: 'POST',
        body: JSON.stringify({
          snapshot_id,
          format: 'json',
          use_live: false,
          seed: 42,
        }),
      });

      if (!calcRes.ok) {
        const err = await calcRes.json().catch(() => ({}));
        throw new Error(err.error || 'Calculation failed');
      }

      const data = await calcRes.json();
      const asIsResult = data.as_is;
      const optimizedResults = data.candidates || [];

      if (!asIsResult || optimizedResults.length === 0) {
        throw new Error('Invalid response structure');
      }

      if (type === 'as-is' || type === 'both') {
        updateDeal({ asIsResults: asIsResult, snapshotId: snapshotIdStr });
      }
      if (type === 'optimized' || type === 'both') {
        updateDeal({ optimizedResults: optimizedResults, snapshotId: snapshotIdStr });
      }
      updateDeal({
        status: type === 'both' ? 'compared' : type === 'as-is' ? 'as_is_run' : 'optimized_run',
      });

      setTab(type === 'as-is' ? 'as-is' : type === 'optimized' ? 'optimized' : 'comparison');
      toastSuccess('Calculation completed!');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toastError(err.message || 'Calculation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = async () => {
    if (!deal.snapshotId) {
      toastError('Run a calculation first');
      return;
    }

    setIsExporting(true);
    try {
      const res = await authFetch('/api/calculate/', {
        method: 'POST',
        body: JSON.stringify({
          snapshot_id: deal.snapshotId,
          format: 'csv',
          use_live: false,
          seed: 42,
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deal.name.replace(/\s+/g, '-')}-${tab}-export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toastSuccess('CSV exported!');
    } catch {
      toastError('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const refreshBtcPrice = async () => {
    try {
      const res = await authFetch('/api/btc_price/');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const livePrice = Math.round(data.BTC_current_market_price);

      updateDeal({
        assumptions: {
          ...deal.assumptions,
          BTC_current_market_price: livePrice,
          targetBTCPrice: livePrice,
        },
      });

      toastSuccess(`BTC Price Refreshed: $${livePrice.toLocaleString()}`);
    } catch {
      toastError('Failed to refresh price');
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => updateDeal({ name })}
          className="bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none text-2xl font-semibold w-auto min-w-[300px]"
        />
        <Pill tone="blue" className="ml-4">{deal.mode}</Pill>
        <Pill tone={deal.status === 'draft' ? 'gray' : 'green'} className="ml-2">
          {deal.status.replace('_', ' ')}
        </Pill>
      </SectionTitle>

      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={() => runCalculation('as-is')} disabled={isLoading}>
          Run As-Is
        </Button>
        <Button onClick={() => runCalculation('optimized')} disabled={isLoading}>
          Run Optimized (5 Candidates)
        </Button>
        <Button onClick={() => runCalculation('both')} disabled={isLoading}>
          Run Both & Compare
        </Button>

        {/* Live BTC Price + Refresh */}
        <div className="flex items-center gap-3 ml-6">
          <span className="text-sm text-gray-600 dark:text-gray-400">Live BTC:</span>
          <Pill tone="green">
            ${Number(deal.assumptions.BTC_current_market_price || 0).toLocaleString()}
          </Pill>
          <Button
            variant="secondary"
            onClick={refreshBtcPrice}
            className="px-3 py-1.5 text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Running models...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Assumptions
            assumptions={deal.assumptions}
            setAssumptions={(newAssumptions: any) => updateDeal({ assumptions: newAssumptions })}
            mode={deal.mode}
            setMode={(newMode: string) => updateDeal({ mode: newMode as Deal['mode'] })}
            handleCalculate={() => runCalculation('optimized')}
            snapshotId={deal.snapshotId}
            isLoading={isLoading}
            progress={0}
            error={error}
          />
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-zinc-700 pb-3">
            <div className="flex gap-2">
              <Button
                variant={tab === 'as-is' ? 'primary' : 'ghost'}
                onClick={() => setTab('as-is')}
                disabled={!deal.asIsResults}
              >
                As-Is
              </Button>
              <Button
                variant={tab === 'optimized' ? 'primary' : 'ghost'}
                onClick={() => setTab('optimized')}
                disabled={!deal.optimizedResults}
              >
                Optimized
              </Button>
              <Button
                variant={tab === 'comparison' ? 'primary' : 'ghost'}
                onClick={() => setTab('comparison')}
                disabled={!deal.asIsResults || !deal.optimizedResults}
              >
                Comparison
              </Button>
            </div>

            <Button
              onClick={exportToCSV}
              disabled={!deal.snapshotId || isExporting || !(deal.asIsResults || deal.optimizedResults)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export CSV
                </>
              )}
            </Button>
          </div>

          {tab === 'as-is' && deal.asIsResults && <AsIsView results={deal.asIsResults} />}
          {tab === 'optimized' && deal.optimizedResults && <OptimizedView results={deal.optimizedResults} />}
          {tab === 'comparison' && deal.asIsResults && deal.optimizedResults && (
            <ComparisonView asIs={deal.asIsResults} optimized={deal.optimizedResults} />
          )}
          {!deal.asIsResults && !deal.optimizedResults && (
            <p className="text-center text-gray-500 py-12">Run a scenario to see results</p>
          )}
        </Card>
      </div>
    </div>
  );
}