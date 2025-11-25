import React from 'react';
import { Card, SectionTitle } from '../components/Primitives'

// ============================================================================
// Helper formatters
// ============================================================================

const formatMoney = (value: number | null | undefined, decimals = 0): string => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`;
  return `$${value.toFixed(decimals)}`;
};

const pct = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  return `${(value * 100).toFixed(decimals)}%`;
};

const structureLabel = (structure: string | undefined): string => {
  if (!structure) return 'N/A';
  const map: Record<string, string> = {
    Loan: 'Debt (BTC-Backed Loan)',
    PIPE: 'PIPE Equity',
    ATM: 'At-The-Market (ATM)',
    Convertible: 'Convertible Note',
  };
  return (
    map[structure.split('+')[0]] || // Handle hybrid like "Loan+ATM"
    structure
      .split('+')
      .map((s) => map[s] || s)
      .join(' + ')
  );
};

// ============================================================================
// Main TermSheet Component
// ============================================================================

interface TermSheetProps {
  results: any; // You can tighten this later with proper Result type
  selectedCandidateIndex: number | null;
}

const TermSheet: React.FC<TermSheetProps> = ({ results, selectedCandidateIndex }) => {
  const candidates = results?.candidates || [];
  const candidate =
    selectedCandidateIndex != null && candidates[selectedCandidateIndex]
      ? candidates[selectedCandidateIndex]
      : candidates[0];

  if (!candidate) {
    return (
      <Card className="p-6 mt-4">
        <SectionTitle>Term Sheet Summary</SectionTitle>
        <p className="text-sm text-gray-500">No candidate selected</p>
      </Card>
    );
  }

  const params = candidate.params || {};
  const termSheet = candidate.metrics?.term_sheet || {};

  // Hybrid breakdown (if exists)
  const isHybrid = params.structure?.includes('+');
  const loanPct = params.loan_percentage ?? 0;
  const equityPct = params.equity_percentage ?? 0;

  return (
    <Card className="p-6 mt-4 shadow-lg border border-gray-200 dark:border-zinc-700">
      <SectionTitle>Term Sheet Summary</SectionTitle>

      <div className="space-y-4 text-sm">
        {/* Structure */}
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
          <span className="text-gray-600 dark:text-gray-400">Structure</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {structureLabel(params.structure)}
          </span>
        </div>

        {/* Hybrid Breakdown */}
        {isHybrid && (
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Loan Component</span>
              <span className="font-medium">{pct(loanPct)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Equity Component</span>
              <span className="font-medium">{pct(equityPct)}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
          <span className="text-gray-600 dark:text-gray-400">Raise Amount</span>
          <span className="font-bold text-lg">{formatMoney(params.amount)}</span>
        </div>

        {/* BTC Bought */}
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
          <span className="text-gray-600 dark:text-gray-400">BTC Purchased</span>
          <span className="font-semibold">
            {params.btc_bought?.toFixed?.(2) ?? '0.00'} BTC
          </span>
        </div>

        {/* Rate / Discount */}
        {(params.rate > 0 || params.discount != null) && (
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
            <span className="text-gray-600 dark:text-gray-400">
              {params.rate > 0 ? 'Debt Rate' : 'Equity Discount'}
            </span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {params.rate > 0 ? pct(params.rate) : pct(params.discount ?? 0)}
            </span>
          </div>
        )}

        {/* Profit Margin */}
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
          <span className="text-gray-600 dark:text-gray-400">Profit Margin</span>
          <span className={`font-bold ${termSheet.profit_margin > 0.05 ? 'text-green-600' : 'text-amber-600'}`}>
            {pct(termSheet.profit_margin)}
          </span>
        </div>

        {/* ROE Uplift */}
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700">
          <span className="text-gray-600 dark:text-gray-400">ROE Uplift</span>
          <span className="font-bold text-green-600">
            +{pct(termSheet.roe_uplift || 0)}
          </span>
        </div>

        {/* Savings vs ATM */}
        <div className="flex justify-between py-3 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 rounded-lg px-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Dilution Savings vs ATM</span>
          <span className="font-bold text-xl text-green-600 dark:text-green-400">
            {formatMoney(termSheet.savings)}
          </span>
        </div>

        {/* Candidate Type Badge */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {candidate.type || 'Candidate'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default TermSheet;