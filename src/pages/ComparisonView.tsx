import React from 'react';

// ──────────────────────────────────────────────────────────────
// Reusable Stat component (with "good" tone = green arrow)
// ──────────────────────────────────────────────────────────────
const Stat: React.FC<{
  label: string;
  value: string;
  tone?: 'good' | 'neutral' | 'bad';
}> = ({ label, value, tone = 'neutral' }) => {
  const toneStyles = {
    good: 'text-green-600',
    neutral: 'text-gray-900',
    bad: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${toneStyles[tone]}`}>
        {tone === 'good' && value.startsWith('-') ? value : value}
        {tone === 'good' && !value.startsWith('-') && !value.includes('−') && ' ↑'}
      </p>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Format utilities (same as before)
// ──────────────────────────────────────────────────────────────
const formatMoney = (value: number): string => {
  if (value === 0) return '$0';
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return value < 0 ? `−${formatted}` : formatted;
};

const pct = (value: number): string => {
  if (value === 0) return '0.0%';
  const abs = Math.abs(value);
  return `${value < 0 ? '−' : ''}${(abs * 100).toFixed(1)}%`;
};

const months = (value: number): string => {
  if (value === 0) return '0 mo';
  return `${value < 0 ? '−' : ''}${Math.abs(value).toFixed(1)} mo`;
};

// ──────────────────────────────────────────────────────────────
// Main ComparisonView
// ──────────────────────────────────────────────────────────────
export default function ComparisonView({ asIs, optimized }: { asIs: any; optimized: any }) {
  const candidates = optimized.candidates || [];
  const recommended = candidates.length > 0 ? candidates[0] : null;

  if (!recommended || !asIs) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6" />
        <p className="text-xl text-gray-600">No comparison available</p>
        <p className="text-gray-500 mt-2">Run both As-Is and Optimized scenarios first</p>
      </div>
    );
  }

  // Extract metrics
  const asDil = asIs.dilution?.avg_dilution ?? 0;
  const optDil = recommended.metrics.dilution?.avg_dilution ?? 0;
  const dilutionSaved = asDil - optDil;

  const asNav = asIs.nav?.avg_nav ?? 0;
  const optNav = recommended.metrics.nav?.avg_nav ?? 0;
  const navUplift = optNav - asNav;

  const asRoe = asIs.roe?.avg_roe ?? 0;
  const optRoe = recommended.metrics.roe?.avg_roe ?? 0;
  const roeDelta = optRoe - asRoe;

  const asRunway = asIs.runway?.dist_mean ?? 0;
  const optRunway = recommended.metrics.runway?.dist_mean ?? 0;
  const runwayDelta = optRunway - asRunway;

  // Generate narrative
  const structureName = recommended.type.replace(' Balanced', '');
  const narrative = `This ${structureName} structure reduces dilution by ${pct(dilutionSaved)}, increases expected NAV by ${formatMoney(navUplift)}, lifts ROE by ${pct(roeDelta)}, and extends runway by ${months(runwayDelta)} versus the as-is approach.`;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">
        Comparison: As-Is vs Block Three Recommendation
      </h2>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Dilution Saved" value={pct(dilutionSaved)} tone="good" />
        <Stat label="NAV Uplift" value={formatMoney(navUplift)} tone="good" />
        <Stat label="ROE Improvement" value={pct(roeDelta)} tone="good" />
        <Stat label="Runway Extension" value={months(runwayDelta)} tone="good" />
      </div>

      {/* Narrative Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
        <p className="text-lg leading-relaxed text-gray-800 font-medium">
          {narrative}
        </p>
      </div>

      {/* Optional: Show recommended structure name */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
          Recommended: {structureName}
        </span>
      </div>
    </div>
  );
}