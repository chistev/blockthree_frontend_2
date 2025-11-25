import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, SectionTitle } from '../components/Primitives';

interface Candidate {
  params: { structure?: string };
  metrics: {
    nav?: { avg_nav?: number };
    dilution?: { avg_dilution?: number };
    roe?: { avg_roe?: number };
  };
}

interface Results {
  nav?: { avg_nav?: number };
  dilution?: { avg_dilution?: number };
  roe?: { avg_roe?: number };
  candidates?: Candidate[];
}

interface ComparisonViewProps {
  asIs: Results;
  optimized: Results;
  selectedCandidateIndex: number | null;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  asIs,
  optimized,
  selectedCandidateIndex,
}) => {
  const candidates = optimized?.candidates || [];

  // Use selected candidate, fallback to first candidate, then aggregate
  const selectedCandidate =
    selectedCandidateIndex != null && candidates[selectedCandidateIndex]
      ? candidates[selectedCandidateIndex]
      : candidates[0];

  // As-Is metrics
  const asIsNav = asIs?.nav?.avg_nav ?? 0;
  const asIsDil = asIs?.dilution?.avg_dilution ?? 0;
  const asIsRoe = asIs?.roe?.avg_roe ?? 0;

  // Optimized metrics from selected candidate (or fallback)
  const optNav =
    selectedCandidate?.metrics?.nav?.avg_nav ??
    optimized?.nav?.avg_nav ??
    0;
  const optDil =
    selectedCandidate?.metrics?.dilution?.avg_dilution ??
    optimized?.dilution?.avg_dilution ??
    0;
  const optRoe =
    selectedCandidate?.metrics?.roe?.avg_roe ??
    optimized?.roe?.avg_roe ??
    0;

  // Safe percentage improvement
  const improvement = {
    nav: asIsNav !== 0 ? ((optNav - asIsNav) / asIsNav) * 100 : 0,
    dilution: asIsDil !== 0 ? ((asIsDil - optDil) / asIsDil) * 100 : 0,
    roe: asIsRoe !== 0 ? ((optRoe - asIsRoe) / asIsRoe) * 100 : 0,
  };

  // Format helpers
  const formatMoney = (val: number): string => {
    if (val === 0) return '$0M';
    return `$${(val / 1e6).toFixed(1)}M`;
  };

  const pct = (val: number): string => {
    return `${(val * 100).toFixed(2)}%`;
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

  // Bar chart data
  const comparisonData = [
    { metric: 'NAV ($M)', asIs: asIsNav / 1e6, optimized: optNav / 1e6 },
    { metric: 'Dilution (%)', asIs: asIsDil * 100, optimized: optDil * 100 },
    { metric: 'ROE (%)', asIs: asIsRoe * 100, optimized: optRoe * 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Improvement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 tracking-wider uppercase">
            NAV Improvement
          </div>
          <div
            className={`text-3xl font-bold tracking-tight ${
              improvement.nav > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {improvement.nav > 0 ? '+' : ''}
            {improvement.nav.toFixed(1)}%
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 tracking-wider uppercase">
            Dilution Reduction
          </div>
          <div
            className={`text-3xl font-bold tracking-tight ${
              improvement.dilution > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {improvement.dilution > 0 ? '+' : ''}
            {improvement.dilution.toFixed(1)}%
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 tracking-wider uppercase">
            ROE Improvement
          </div>
          <div
            className={`text-3xl font-bold tracking-tight ${
              improvement.roe > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {improvement.roe > 0 ? '+' : ''}
            {improvement.roe.toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <SectionTitle>As-Is vs Optimized Structure</SectionTitle>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="metric"
              stroke="#9CA3AF"
              style={{ fontSize: '13px' }}
              tickMargin={10}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
              formatter={(value: number) =>
                value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)
              }
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="asIs" fill="#6B7280" name="As-Is" radius={[8, 8, 0, 0]} />
            <Bar dataKey="optimized" fill="#3B82F6" name="Optimized" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Side-by-Side Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-5 text-gray-800 dark:text-white">
            Current Structure (As-Is)
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
              <span className="text-gray-600 dark:text-gray-400">NAV</span>
              <span className="font-medium">{formatMoney(asIsNav)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
              <span className="text-gray-600 dark:text-gray-400">Dilution</span>
              <span className="font-medium">{pct(asIsDil)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">ROE</span>
              <span className="font-medium">{pct(asIsRoe)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
          <h3 className="font-bold text-lg mb-5 text-green-700 dark:text-green-400">
            Optimized Structure
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-800">
              <span className="text-gray-700 dark:text-gray-300">NAV</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatMoney(optNav)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-800">
              <span className="text-gray-700 dark:text-gray-300">Dilution</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {pct(optDil)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700 dark:text-gray-300">ROE</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {pct(optRoe)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Candidate Note */}
      {selectedCandidate && (
        <Card className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-300">
            Comparison uses selected structure:{' '}
            <span className="font-bold">
              {structureLabel(selectedCandidate.params?.structure)}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ComparisonView;