import React, { useState } from 'react';
import { Card, SectionTitle, Button, Stat, Pill } from '../components/Primitives';
import TermSheet from '../components/TermSheet';
import { formatMoney, pct, months, riskTone, structureLabel, num } from '../utils';

interface Candidate {
  type: string;
  params: {
    structure?: string;
    amount?: number;
    rate?: number;
    ltv_cap?: number;
    premium?: number;
    discount?: number;
    loan_component_amount?: number;
    equity_component_amount?: number;
  };
  metrics: any;
}

interface OptimizedViewProps {
  results: Candidate[];
}

export default function OptimizedView({ results }: OptimizedViewProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!results || results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No optimized results available. Run the optimizer to see candidates.</p>
      </Card>
    );
  }

  const cand = results[selectedIdx];
  const candMetrics = cand.metrics || {};

  // Risk assessment based on LTV breach probability only
  const ltvBreachProb = candMetrics.ltv?.exceed_prob ?? 0;
  const riskLevel = riskTone(ltvBreachProb); // 'good' | 'neutral' | 'bad'

  // Structure pill tone
  const getStructureTone = (struct: string | undefined): 'blue' | 'gray' | 'yellow' | 'green' | 'red' => {
    const s = (struct || '').toLowerCase();
    if (s.includes('hybrid')) return 'yellow';
    if (s.includes('loan') || s.includes('convertible')) return 'blue';
    if (s.includes('pipe') || s.includes('atm')) return 'gray';
    return 'green';
  };

  const structureTone = getStructureTone(cand.params?.structure || cand.type);

  return (
    <div className="space-y-8">
      {/* Candidate Selector Pills */}
      <div className="flex flex-wrap gap-3">
        {results.map((c: Candidate, i: number) => (
          <Button
            key={i}
            variant={i === selectedIdx ? 'primary' : 'ghost'}
            onClick={() => setSelectedIdx(i)}
            className="text-sm px-5 py-2"
          >
            {c.type || `Candidate ${i + 1}`}
          </Button>
        ))}
      </div>

      <Card className="p-8">
        {/* Header with Structure Pill */}
        <div className="flex items-center justify-between mb-8">
          <SectionTitle>{cand.type || 'Optimized Candidate'}</SectionTitle>
          <Pill tone={structureTone}>
            {structureLabel(cand.params?.structure || cand.type)}
          </Pill>
        </div>

        {/* Risk Indicator Bar 
        <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-8">
          <div
            className={`h-full transition-all duration-700 ${
              riskLevel === 'good' ? 'bg-green-500 w-1/3' :
              riskLevel === 'neutral' ? 'bg-yellow-500 w-2/3' :
              'bg-red-500 w-full'
            }`}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            LTV Breach Risk: {pct(ltvBreachProb)}
          </p>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <Stat label="Expected NAV" value={formatMoney(candMetrics.nav?.avg_nav ?? 0)} />
          <Stat 
            label="LTV Breach Probability"
            value={pct(ltvBreachProb)}
            tone={riskLevel}
          />
          <Stat label="Average Dilution" value={pct(candMetrics.dilution?.avg_dilution ?? 0)} />
          <Stat label="Average ROE" value={pct(candMetrics.roe?.avg_roe ?? 0)} />
          <Stat label="Mean Runway" value={months(candMetrics.runway?.dist_mean ?? 0)} />
          <Stat label="WACC" value={pct(candMetrics.wacc ?? 0)} />
          <Stat label="BTC Retained" value={num(candMetrics.btc_holdings?.total_btc ?? 0, 4)} />
          <Stat label="BTC Purchased" value={num(candMetrics.btc_holdings?.purchased_btc ?? 0, 4)} />
        </div>

        {/* Term Sheet */}
        <div className="border-t border-gray-200 dark:border-zinc-700 pt-8">
          <SectionTitle>Proposed Term Sheet</SectionTitle>
          <TermSheet results={cand} />
        </div>

        {/* Charts Section – placeholders with exact same styling as original */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <Card className="p-6">
            <SectionTitle>NAV Distribution Fan Chart</SectionTitle>
            <div className="h-64 bg-gray-100 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">FanChart component placeholder</p>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>LTV Path Distribution</SectionTitle>
            <div className="h-64 bg-gray-100 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">HistogramWithThreshold placeholder</p>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>Sensitivity Analysis</SectionTitle>
            <div className="h-64 bg-gray-100 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">TornadoChart placeholder</p>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>Runway Distribution</SectionTitle>
            <div className="h-64 bg-gray-100 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">RunwayBox placeholder</p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}