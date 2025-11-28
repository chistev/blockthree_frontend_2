import React from 'react';

// Simple number formatting helpers (you can move these to utils.ts later)
const formatMoney = (value: number): string => {
  if (value === undefined || value === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const pct = (value: number): string => {
  if (value === undefined || value === null) return '0%';
  return `${(value * 100).toFixed(1)}%`;
};

const months = (value: number): string => {
  if (value === undefined || value === null) return '0 mo';
  return `${value.toFixed(1)} mo`;
};

// Simple reusable Stat component (matches your design language)
const Stat: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight = false,
}) => (
  <div className="space-y-1">
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`text-2xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

export default function AsIsView({ results }: { results: any }) {
  // Safely extract nested values
  const nav = results?.nav || {};
  const ltv = results?.ltv || {};
  const dil = results?.dilution || {};
  const roe = results?.roe || {};
  const run = results?.runway || {};

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">As-Is Structure Results</h3>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <Stat label="Mean NAV" value={formatMoney(nav.avg_nav ?? 0)} />
          <Stat
            label="LTV Breach Probability"
            value={pct(ltv.exceed_prob ?? 0)}
            highlight={ltv.exceed_prob > 0.1}
          />
          <Stat label="Avg Dilution" value={pct(dil.avg_dilution ?? 0)} />
          <Stat label="Avg ROE" value={pct(roe.avg_roe ?? 0)} />
          <Stat label="Mean Runway" value={months(run.dist_mean ?? 0)} />
        </div>
      </div>

      {/* Optional: Add more detailed sections later */}
      {results?.termsheet && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-3">Active Term Sheet</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(results.termsheet, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}