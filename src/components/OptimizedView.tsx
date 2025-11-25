// src/components/results/OptimizedView.tsx
import React, { useMemo, useState } from 'react';
import { Card, SectionTitle, Stat, Pill } from '../components/Primitives';
import TermSheet from './TermSheet';

// Reuse the FULL Deal type from DealDetail
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

interface Candidate {
  type: string;
  params: {
    structure?: string;
    amount?: number;
    btc_bought?: number;
    rate?: number;
    discount?: number;
    ltv_cap?: number;
    [key: string]: any;
  };
  metrics: {
    nav?: { avg_nav?: number };
    dilution?: { avg_dilution?: number };
    roe?: { avg_roe?: number };
    runway?: { dist_mean?: number };
    term_sheet?: {
      profit_margin?: number;
      roe_uplift?: number;
      savings?: number;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

interface OptimizedViewProps {
  results: {
    candidates?: Candidate[];
    nav?: { avg_nav?: number };
    ltv?: { exceed_prob?: number };
    dilution?: { avg_dilution?: number };
    roe?: { avg_roe?: number };
    [key: string]: any;
  };
  deal: Deal;
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  deals: Deal[];
}

const OptimizedView: React.FC<OptimizedViewProps> = ({ results, deal, setDeals, deals }) => {
  const candidates = results?.candidates || [];
  const [expanded, setExpanded] = useState<number | null>(null);

  const topCandidates = useMemo(() => {
    if (candidates.length === 0) return [];

    const scored = candidates.map((cand: Candidate, idx: number) => {
      const nav = cand.metrics?.nav?.avg_nav ?? 0;
      const dilution = cand.metrics?.dilution?.avg_dilution ?? 1;
      const roe = cand.metrics?.roe?.avg_roe ?? 0;
      const score = (nav / 1e6) + (roe * 100) - (dilution * 100);

      return { ...cand, originalIndex: idx, score };
    });

    const sorted = [...scored].sort((a, b) => b.score - a.score);
    const top5 = sorted.slice(0, 5);

    const selected: typeof scored = [];
    const usedStructures = new Set<string>();

    const priority = ['Loan', 'Convertible', 'PIPE', 'ATM', 'Hybrid'];

    for (const struct of priority) {
      const match = top5.find((c) => {
        const s = c.params?.structure ?? '';
        return s.includes(struct) && !usedStructures.has(s);
      });
      if (match) {
        selected.push(match);
        usedStructures.add(match.params.structure ?? '');
        if (selected.length === 3) break;
      }
    }

    if (selected.length < 3) {
      for (const cand of top5) {
        if (!selected.includes(cand)) {
          selected.push(cand);
          if (selected.length === 3) break;
        }
      }
    }

    return selected.slice(0, 3);
  }, [candidates]);

  const nav = results?.nav ?? {};
  const ltv = results?.ltv ?? {};
  const dilution = results?.dilution ?? {};
  const roe = results?.roe ?? {};

  const formatMoney = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '$0M';
    return `$${(val / 1e6).toFixed(1)}M`;
  };

  const pct = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.00%';
    return `${(val * 100).toFixed(2)}%`;
  };

  const months = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.0 mo';
    return `${val.toFixed(1)} mo`;
  };

  const structureLabel = (structure: string = ''): string => {
    const map: Record<string, string> = {
      Loan: 'BTC-Backed Loan',
      Convertible: 'Convertible Note',
      PIPE: 'PIPE Equity',
      ATM: 'At-The-Market',
    };
    if (structure.includes('+')) {
      return structure.split('+').map(s => map[s] || s).join(' + ') + ' Hybrid';
    }
    return map[structure] || structure || 'Unknown';
  };

  const getRiskTone = (prob: number): 'red' | 'green' | 'gray' => {
    if (prob >= 0.20) return 'red';
    if (prob >= 0.05) return 'gray';
    return 'green';
  };

  const handleCandidateSelect = (originalIndex: number) => {
    const updatedDeal = { ...deal, selectedCandidateIndex: originalIndex };
    setDeals(prev => prev.map(d => (d.id === deal.id ? updatedDeal : d)));
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Best NAV" value={formatMoney(nav.avg_nav)} tone="gray" />
        <Stat
          label="LTV Breach Risk"
          value={pct(ltv.exceed_prob)}
          tone={getRiskTone(ltv.exceed_prob ?? 0)}
        />
        <Stat label="Avg Dilution" value={pct(dilution.avg_dilution)} tone="gray" />
        <Stat label="ROE" value={pct(roe.avg_roe)} tone="gray" />
      </div>

      {/* Top 3 Candidates */}
      <Card className="p-6">
        <SectionTitle>Top 3 Optimized Structures</SectionTitle>
        <div className="space-y-4">
          {topCandidates.map((cand, i) => {
            const isSelected = deal?.selectedCandidateIndex === cand.originalIndex;
            const metrics = cand.metrics || {};
            const params = cand.params || {};
            const termSheet = metrics.term_sheet || {};

            const rate = params.rate ?? 0;
            const discount = params.discount ?? 0;
            const hasDebtRate = rate > 0;

            return (
              <div
                key={i}
                className={`p-5 rounded-xl border-[1px] cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-md'
                    : 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
                onClick={() => {
                  handleCandidateSelect(cand.originalIndex);
                  setExpanded(expanded === i ? null : i);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {structureLabel(params.structure)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Raise: {formatMoney(params.amount)}
                      {' • '}
                      BTC Bought: {(params.btc_bought ?? 0).toFixed(0)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Pill tone="green">
                      Dilution: {pct(metrics.dilution?.avg_dilution)}
                    </Pill>
                    <Pill tone="blue">
                      ROE: {pct(metrics.roe?.avg_roe)}
                    </Pill>
                  </div>
                </div>

                {expanded === i && (
                  <div className="mt-5 pt-5 border-t border-gray-200 dark:border-zinc-700 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rate/Discount:</span>
                      <span className="ml-2 font-medium">
                        {hasDebtRate ? pct(rate) : pct(discount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">LTV Cap:</span>
                      <span className="ml-2 font-medium">{pct(params.ltv_cap ?? 0)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Runway:</span>
                      <span className="ml-2 font-medium">{months(metrics.runway?.dist_mean)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit Margin:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {pct(termSheet.profit_margin)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">ROE Uplift:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        +{pct(termSheet.roe_uplift ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Savings vs ATM:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatMoney(termSheet.savings)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Term Sheet */}
      <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <SectionTitle>
          <span className="text-white">Selected Deal Structure</span>
        </SectionTitle>
        <TermSheet
          results={results}
          selectedCandidateIndex={deal?.selectedCandidateIndex ?? null}
        />
      </Card>
    </div>
  );
};

export default OptimizedView;