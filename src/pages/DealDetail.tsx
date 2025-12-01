import React, { useState } from 'react';
import Assumptions from './Assumptions';
import AsIsView from './AsIsView';
import OptimizedView from './OptimizedView';  // ← Now matches the simplified version we use
import ComparisonView from './ComparisonView';
import { Card, SectionTitle, Button, Pill } from '../components/Primitives';
import { authFetch } from '../auth';

interface Deal {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: any;
  asIsResults?: any;
  optimizedResults?: any[];  // Array because backend returns 5 candidates
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
  const [error, setError] = useState<string | null>(null);

  const updateDeal = (updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      )
    );
  };

  const runCalculation = async (type: 'as-is' | 'optimized' | 'both') => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Lock snapshot (unchanged)
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

      // 2. Run calculation (unchanged)
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

      // Parse the full response object
      const data = await calcRes.json();

      // Extract as-is (it's a single object under 'as_is')
      const asIsResult = data.as_is;

      // Extract optimized candidates (array under 'candidates')
      const optimizedResults = data.candidates || [];  // Fallback to empty array if missing

      // Optional: The 'recommendation' is one of the candidates (e.g., "Hybrid Balanced").
      // You could use it as the default selected in OptimizedView if needed.
      // const recommended = data.recommendation;

      // Validate we have data
      if (!asIsResult || optimizedResults.length === 0) {
        throw new Error('Invalid response structure from backend');
      }

      // Update state
      if (type === 'as-is' || type === 'both') {
        updateDeal({ asIsResults: asIsResult, snapshotId: snapshotIdStr });
      }
      if (type === 'optimized' || type === 'both') {
        updateDeal({ optimizedResults: optimizedResults, snapshotId: snapshotIdStr });
      }
      updateDeal({ status: type === 'both' ? 'compared' : type === 'as-is' ? 'as_is_run' : 'optimized_run' });

      // Auto switch tab (unchanged)
      setTab(type === 'as-is' ? 'as-is' : type === 'optimized' ? 'optimized' : 'comparison');

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
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

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => runCalculation('as-is')} disabled={isLoading}>
          Run As-Is
        </Button>
        <Button onClick={() => runCalculation('optimized')} disabled={isLoading}>
          Run Optimized (5 Candidates)
        </Button>
        <Button onClick={() => runCalculation('both')} disabled={isLoading}>
          Run Both & Compare
        </Button>
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
        {/* Assumptions – always visible */}
        <div>
          <Assumptions
            assumptions={deal.assumptions}
            setAssumptions={(newAssumptions: any) => updateDeal({ assumptions: newAssumptions })}
            mode={deal.mode}
            setMode={(newMode: string) => updateDeal({ mode: newMode as Deal['mode'] })}
            handleCalculate={() => runCalculation('optimized')}
            snapshotId={deal.snapshotId}
            isLoading={isLoading}
            progress={0} // not used in current Assumptions, safe
            error={error}
          />
        </div>

        {/* Results Panel */}
        <Card className="p-6">
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-zinc-700 pb-3">
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

          {tab === 'as-is' && deal.asIsResults && <AsIsView results={deal.asIsResults} />}
          {tab === 'optimized' && deal.optimizedResults && <OptimizedView results={deal.optimizedResults} />}
          {tab === 'comparison' && deal.asIsResults && deal.optimizedResults && (
            <ComparisonView asIs={deal.asIsResults} optimized={deal.optimizedResults} />
          )}
          {!deal.asIsResults && !deal.optimizedResults && tab !== 'as-is' && (
            <p className="text-center text-gray-500 py-12">Run a scenario to see results</p>
          )}
        </Card>
      </div>
    </div>
  );
}
