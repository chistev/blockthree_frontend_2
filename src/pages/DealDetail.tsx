import React, { useState } from 'react';
import Assumptions from './Assumptions';
import AsIsView from './AsIsView';
import OptimizedView from './OptimizedView';
import ComparisonView from './ComparisonView';
import { Deal } from '../App';
import { authFetch } from '../auth';
import { toast } from 'react-toastify';

interface Props {
  dealId: string;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPage: (dealId: string) => void;
  token: string | null;
}

export default function DealDetail({ dealId, deals, setDeals, token }: Props) {
  const deal = deals.find((d) => d.id === dealId);
  if (!deal) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-gray-500 text-lg">
        Scenario not found.
      </div>
    );
  }

  const [tab, setTab] = useState<'as-is' | 'optimized' | 'comparison'>('optimized');
  const [name, setName] = useState(deal.name);
  const [isRunning, setIsRunning] = useState(false);

  const updateDeal = (updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      )
    );
  };

  const runAsIs = async () => {
    setIsRunning(true);
    try {
      const lockRes = await authFetch('/api/lock_snapshot/', {
        method: 'POST',
        body: JSON.stringify({ assumptions: deal.assumptions, mode: deal.mode }),
      });
      const { snapshot_id } = await lockRes.json();

      const calcRes = await authFetch('/api/calculate/', {
        method: 'POST',
        body: JSON.stringify({ snapshot_id, format: 'json', use_live: false }),
      });
      const data = await calcRes.json();

      updateDeal({
        asIsResults: data,
        status: deal.optimizedResults ? 'compared' : 'as_is_run',
      });
      toast.success('As-Is scenario complete');
    } catch {
      toast.error('As-Is simulation failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runOptimized = async () => {
    setIsRunning(true);
    try {
      const optAssumptions = { ...deal.assumptions, structure: '' };
      const lockRes = await authFetch('/api/lock_snapshot/', {
        method: 'POST',
        body: JSON.stringify({ assumptions: optAssumptions, mode: deal.mode }),
      });
      const { snapshot_id } = await lockRes.json();

      const calcRes = await authFetch('/api/calculate/', {
        method: 'POST',
        body: JSON.stringify({ snapshot_id, format: 'json', use_live: false }),
      });
      const data = await calcRes.json();

      updateDeal({
        optimizedResults: data,
        status: deal.asIsResults ? 'compared' : 'optimized_run',
      });
      toast.success('Optimization complete');
      setTab('optimized');
    } catch {
      toast.error('Optimization failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runBoth = async () => {
    await runAsIs();
    if (!deal.optimizedResults) await runOptimized();
    setTab('comparison');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => updateDeal({ name })}
            className="text-4xl font-bold bg-transparent border-b-4 border-transparent hover:border-gray-300 focus:border-blue-600 outline-none transition-all"
          />
          <div className="flex gap-4 mt-5">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {deal.mode === 'pro-forma' ? 'Pro Forma' : 'Live'}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                deal.status === 'compared'
                  ? 'bg-green-100 text-green-700'
                  : deal.status.includes('run')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {deal.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={runAsIs}
            disabled={isRunning}
            className="px-5 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {isRunning ? 'Running...' : 'Run As-Is'}
          </button>
          <button
            onClick={runOptimized}
            disabled={isRunning}
            className="px-5 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            Run Optimized
          </button>
          <button
            onClick={runBoth}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 shadow-md"
          >
            Run Both & Compare
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assumptions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-5 text-gray-800">Assumptions</h2>
            <Assumptions
              assumptions={deal.assumptions}
              setAssumptions={(a) => updateDeal({ assumptions: a })}
              mode={deal.mode}
              setMode={(m) => updateDeal({ mode: m })}
            />
          </div>
        </div>

        {/* Results Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-10">
              {(['as-is', 'optimized', 'comparison'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-4 px-2 border-b-3 font-medium capitalize transition-all ${
                    tab === t
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'as-is' ? 'As-Is' : t === 'optimized' ? 'Optimized' : 'Comparison'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-96">
            {tab === 'as-is' && deal.asIsResults && <AsIsView results={deal.asIsResults} />}
            {tab === 'optimized' && deal.optimizedResults && <OptimizedView results={deal.optimizedResults} />}
            {tab === 'comparison' && deal.asIsResults && deal.optimizedResults && (
              <ComparisonView asIs={deal.asIsResults} optimized={deal.optimizedResults} />
            )}

            {/* Empty State */}
            {((tab === 'as-is' && !deal.asIsResults) ||
              (tab === 'optimized' && !deal.optimizedResults) ||
              (tab === 'comparison' && (!deal.asIsResults || !deal.optimizedResults))) && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 border-2 border-dashed rounded-xl" />
                <p className="text-lg text-gray-600">No results yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Run the simulation to see detailed outputs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}