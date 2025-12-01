import React from 'react';
import { formatMoney, num, pct, structureLabel } from '../utils';

interface TermSheetProps {
  results: any; // Full candidate object from backend
}

export default function TermSheet({ results }: TermSheetProps) {
  const params = results?.params || {};
  const metrics = results?.metrics || {};
  const term = metrics.term_sheet || {};

  return (
    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {structureLabel(params.structure || results.type || 'Structure')} Term Sheet
      </h3>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Structure</span>
          <p className="font-medium">{structureLabel(params.structure || results.type)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Amount Raised</span>
          <p className="font-medium">{formatMoney(params.amount || params.LoanPrincipal || params.new_equity_raised || 0)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Cost of Capital</span>
          <p className="font-medium">{pct(params.rate || params.cost_of_debt || 0)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">LTV Cap</span>
          <p className="font-medium">{pct(params.ltv_cap || 0)}</p>
        </div>
        {params.premium && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Premium/Discount</span>
            <p className="font-medium">{pct(params.premium || params.discount || 0)}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500 dark:text-gray-400">Expected Slippage</span>
          <p className="font-medium">{formatMoney(term.slippage || 0)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Lender Profit Margin</span>
          <p className="font-medium">{pct(term.profit_margin || 0)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">ROE Uplift</span>
          <p className="font-medium">{num(term.roe_uplift || 0, 2)}%</p>
        </div>
      </div>
    </div>
  );
}