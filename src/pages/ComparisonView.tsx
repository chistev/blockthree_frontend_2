import React from 'react';
import { Card, Pill, SectionTitle, Stat } from '../components/Primitives';
import OptimizedView from './OptimizedView';
import { formatMoney, pct, months, num } from '../utils';

interface ComparisonViewProps {
  asIs: any;
  optimized: any[];
}

export default function ComparisonView({ asIs, optimized }: ComparisonViewProps) {
  const asIsMetrics = asIs.metrics || asIs;
  const bestOptimized = optimized[0]; // the optimizer always returns best first
  const optMetrics = bestOptimized?.metrics || bestOptimized;

  return (
    <div className="space-y-10">
      {/* Top Side-by-Side Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8">
          <SectionTitle>As-Is Scenario (Exact Terms)</SectionTitle>
          <div className="grid grid-cols-2 gap-6 mt-6">
            <Stat label="Expected NAV" value={formatMoney(asIsMetrics.nav?.avg_nav ?? 0)} />
            <Stat label="LTV Breach Prob" value={pct(asIsMetrics.ltv?.exceed_prob ?? 0)} />
            <Stat label="Dilution" value={pct(asIsMetrics.dilution?.avg_dilution ?? 0)} />
            <Stat
              label="ROE Uplift"
              value={`${num(asIsMetrics.term_sheet?.roe_uplift ?? 0, 2)}%`}
            />
            <Stat label="Runway" value={months(asIsMetrics.runway?.dist_mean ?? 0)} />
            <Stat label="WACC" value={pct(asIsMetrics.wacc ?? 0)} />
          </div>
        </Card>

        <Card className="p-8 border-green-900/20">
          <SectionTitle>Best Optimized Scenario</SectionTitle>
          <div className="flex items-center gap-3 mb-6">
            <Pill tone="yellow">{bestOptimized.type || 'Hybrid'}</Pill>
            <span className="text-sm text-gray-500">← unconstrained optimization</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Stat label="Expected NAV" value={formatMoney(optMetrics.nav?.avg_nav ?? 0)} />
            <Stat label="LTV Breach Prob" value={pct(optMetrics.ltv?.exceed_prob ?? 0)} />
            <Stat label="Dilution" value={pct(optMetrics.dilution?.avg_dilution ?? 0)} />
            <Stat
              label="ROE Uplift"
              value={`${num(optMetrics.term_sheet?.roe_uplift ?? 0, 2)}%`}
              tone="good"
            />
            <Stat label="Runway" value={months(optMetrics.runway?.dist_mean ?? 0)} />
            <Stat label="WACC" value={pct(optMetrics.wacc ?? 0)} />
          </div>
        </Card>
      </div>

      {/* Full Optimized Candidates Below */}
      <div>
        <SectionTitle className="mb-6">All 5 Optimized Alternatives</SectionTitle>
        <OptimizedView results={optimized} />
      </div>
    </div>
  );
}
