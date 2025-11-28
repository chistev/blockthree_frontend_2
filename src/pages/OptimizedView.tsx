import React, { useState } from 'react';

// ──────────────────────────────────────────────────────────────
// Simple Primitives (replace your old ones or put in components/Primitives.tsx)
// ──────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className = '',
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-gray-900 mb-6">{children}</h2>
);

const Pill: React.FC<{ children: React.ReactNode; tone: 'green' | 'blue' | 'red' | 'amber' }> = ({
  children,
  tone,
}) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[tone]}`}>
      {children}
    </span>
  );
};

// ──────────────────────────────────────────────────────────────
// Utils (you can move to src/utils/index.ts later)
// ──────────────────────────────────────────────────────────────
const formatMoney = (value: number | undefined | null): string =>
  value == null ? '$0' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const pct = (value: number | undefined | null): string =>
  value == null ? '0.0%' : `${(value * 100).toFixed(1)}%`;

const months = (value: number | undefined | null): string =>
  value == null ? '0 mo' : `${value.toFixed(1)} mo`;

// Risk tone logic (exactly as client expects)
const riskTone = ({ ltvProb, avgDilution }: { ltvProb?: number | null; avgDilution?: number | null }) => {
  const prob = ltvProb ?? 0;
  const dil = avgDilution ?? 0;

  if (prob > 0.15 || dil > 0.08) return { tone: 'red' as const, pill: 'High Risk' };
  if (prob > 0.08 || dil > 0.05) return { tone: 'amber' as const, pill: 'Moderate Risk' };
  return { tone: 'green' as const, pill: 'Low Risk' };
};

// Human-readable structure label
const structureLabel = (params: any): string => {
  if (!params?.structure) return 'Unknown';
  if (params.structure.includes('+')) return 'Hybrid';
  if (params.structure === 'ATM') return 'ATM Equity';
  if (params.structure === 'PIPE') return 'PIPE';
  if (params.structure === 'Loan') return 'BTC-Backed Loan';
  if (params.structure === 'Convertible') return 'Convertible Note';
  return params.structure;
};

// ──────────────────────────────────────────────────────────────
// TermSheet Mini Component (shows key terms when expanded)
// ──────────────────────────────────────────────────────────────
const TermSheet: React.FC<{ results: any }> = ({ results }) => {
  const ts = results.term_sheet || {};
  const nav = results.nav || {};
  const runway = results.runway || {};

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium text-gray-600">Mean NAV:</span>{' '}
          <span className="font-semibold">{formatMoney(nav.avg_nav)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Mean Runway:</span>{' '}
          <span className="font-semibold">{months(runway.dist_mean)}</span>
        </div>
      </div>
      {ts.savings != null && (
        <div>
          <span className="font-medium text-gray-600">Est. Cost Savings:</span>{' '}
          <span className="font-semibold text-green-600">+{formatMoney(ts.savings)}</span>
        </div>
      )}
      {ts.roe_uplift != null && (
        <div>
          <span className="font-medium text-gray-600">ROE Uplift:</span>{' '}
          <span className="font-semibold text-blue-600">+{pct(ts.roe_uplift)}</span>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────
interface Candidate {
  type: string;
  params: any;
  metrics: any;
}

interface OptimizedViewProps {
  results: {
    candidates?: Candidate[];
  };
}

export default function OptimizedView({ results }: OptimizedViewProps) {
  const candidates = results?.candidates || [];
  const [expanded, setExpanded] = useState<string | null>(null);

  if (candidates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6" />
        <p className="text-xl text-gray-600">No optimized structures yet</p>
        <p className="text-gray-500 mt-2">Run the optimizer to see recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle>Recommended Structures (Balanced Risk Profile)</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {candidates.map((cand) => {
          const ts = cand.metrics.term_sheet || {};
          const dil = cand.metrics.dilution?.avg_dilution || 0;
          const roe = cand.metrics.roe?.avg_roe || 0;
          const ltvProb = cand.metrics.ltv?.exceed_prob;
          const risk = riskTone({ ltvProb, avgDilution: dil });
          const isExpanded = expanded === cand.type;

          return (
            <Card
              key={cand.type}
              onClick={() => setExpanded(isExpanded ? null : cand.type)}
              className={isExpanded ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            >
              {/* Risk bar */}
              <div className={`h-1 rounded-t-lg ${risk.tone === 'red' ? 'bg-red-500' : risk.tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {cand.type.replace(' Balanced', '')}
                  </h3>
                  <div className="flex gap-2">
                    <Pill tone="green">Dilution {pct(dil)}</Pill>
                    <Pill tone="blue">ROE {pct(roe)}</Pill>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Amount:</span> {formatMoney(ts.amount || cand.params.amount)}</p>
                  {cand.params.rate != null && <p><span className="font-medium">Rate:</span> {pct(cand.params.rate)}</p>}
                  {cand.params.ltv_cap != null && <p><span className="font-medium">LTV Cap:</span> {pct(cand.params.ltv_cap)}</p>}
                  {cand.params.premium != null && <p><span className="font-medium">Conv. Premium:</span> {pct(cand.params.premium)}</p>}
                  {ts.slippage != null && <p><span className="font-medium">Est. Slippage:</span> {pct(ts.slippage)}</p>}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Pill tone={risk.tone}>{risk.pill}</Pill>
                  {ltvProb != null && (
                    <span className="text-xs text-gray-600">
                      LTV Breach: {pct(ltvProb)}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {structureLabel(cand.params)}
                  </span>
                  <span className="font-medium text-blue-600">
                    {isExpanded ? 'Hide' : 'Show'} Details →
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t bg-gray-50 px-6 py-5">
                  <TermSheet results={cand.metrics} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}