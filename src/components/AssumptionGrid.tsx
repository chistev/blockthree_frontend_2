import React, { useState } from 'react';
import { classNames } from '../utils';

const tooltips: { [key: string]: string } = {
  // BTC Parameters
  BTC_treasury: "Total Bitcoin held in the treasury (in BTC).",
  BTC_current_market_price: "Current market price of Bitcoin (USD, read-only, fetched live).",
  targetBTCPrice: "Target Bitcoin price for drift adjustment in simulations (USD).",
  IssuePrice: "Price per share for new equity issuance (USD).",
  // Model Parameters
  mu: "Expected annual return (drift) for Bitcoin price simulations.",
  sigma: "Annualized volatility for Bitcoin price simulations.",
  t: "Time horizon for simulations (in years).",
  risk_free_rate: "Risk-free interest rate used in pricing models (e.g., Black-Scholes).",
  expected_return_btc: "Expected annual return for Bitcoin in CAPM calculations.",
  delta: "Dividend yield or equivalent for Bitcoin (used in option pricing).",
  // Debt & Equity Parameters
  LoanPrincipal: "Principal amount of the loan or convertible debt (USD).",
  cost_of_debt: "Annual interest rate on the loan or convertible debt.",
  LTV_Cap: "Maximum Loan-to-Value ratio before a margin call is triggered.",
  initial_equity_value: "Initial equity value of the company (USD).",
  new_equity_raised: "Amount of new equity raised in the capital structure (USD).",
  beta_ROE: "Beta coefficient for Return on Equity calculations (CAPM-based).",
  // Balance Sheet
  shares_basic: "Number of basic shares outstanding.",
  shares_fd: "Number of fully diluted shares outstanding.",
  opex_monthly: "Monthly operating expenses (USD).",
  tax_rate: "Effective corporate tax rate (as a decimal).",
  nols: "Net Operating Loss carryforward available for tax offsets (USD).",
  annual_burn_rate: "Annual cash burn rate, typically opex * 12 (USD).",
  initial_cash: "Initial cash balance on the balance sheet (USD).",
  // Capital Routes
  adv_30d: "Average daily trading volume over 30 days for ATM offerings (USD).",
  atm_pct_adv: "Percentage of ADV used for At-The-Market offerings.",
  pipe_discount: "Discount applied to PIPE (Private Investment in Public Equity) deals.",
  fees_ecm: "Fees for equity capital markets transactions (as a decimal).",
  fees_oid: "Fees for originated debt transactions (as a decimal).",
  // Covenants/Haircuts
  cure_period_days: "Days allowed to cure a margin call before liquidation.",
  haircut_h0: "Baseline haircut applied to BTC collateral value.",
  haircut_alpha: "Volatility adjustment factor for collateral haircuts.",
  liquidation_penalty_bps: "Penalty for forced liquidation of collateral (in basis points).",
  // Hedging
  hedge_policy: "Hedging strategy: 'none' or 'protective_put' for Bitcoin holdings.",
  hedge_intensity: "Fraction of Bitcoin holdings hedged (0 to 1).",
  hedge_tenor_days: "Tenor of the hedging options in days (e.g., 90 days).",
  deribit_iv_source: "Source of implied volatility: 'manual' or 'live' from Deribit.",
  manual_iv: "Manually specified implied volatility for option pricing (if not live).",
  // Optimizer Constraints
  objective_preset: "Optimization goal: 'Defensive', 'Balanced', or 'Growth'.",
  cvar_on: "Enable Conditional Value at Risk (CVaR) in metrics calculations.",
  max_dilution: "Maximum acceptable dilution from new equity or convertibles.",
  min_runway_months: "Minimum acceptable cash runway in months.",
  max_breach_prob: "Maximum acceptable probability of breaching LTV cap.",
  // Advanced Parameters
  dilution_vol_estimate: "Volatility estimate for dilution modeling.",
  vol_mean_reversion_speed: "Speed of mean reversion for volatility in Heston model.",
  long_run_volatility: "Long-run volatility level in Heston model simulations.",
  min_profit_margin: "Minimum acceptable profit margin for optimization.",
  use_variance_reduction: "Enable variance reduction techniques in Monte Carlo simulations.",
  jump_intensity: "Annual intensity (lambda) of jumps in the Bitcoin price process.",
  jump_mean: "Mean of the jump size (log return) in the Bitcoin price process.",
  jump_volatility: "Volatility of the jump size in the Bitcoin price process.",
};

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/Btc/g, 'BTC')
    .replace(/Ltv/g, 'LTV')
    .replace(/Pct/g, 'Pct')
    .replace(/Adv/g, 'ADV')
    .replace(/Atm/g, 'ATM')
    .replace(/Pipe/g, 'PIPE')
    .replace(/Opex/g, 'Opex')
    .replace(/Nols/g, 'NOLs')
    .replace(/Cvar/g, 'CVaR')
    .replace(/Iv/g, 'IV')
    .replace(/Roe/g, 'ROE');
};

export default function AssumptionGrid({ assumptions, setAssumptions, groupFields }: { assumptions: any, setAssumptions: (a: any) => void, groupFields?: string[] }) {
  if (!assumptions) return null;
  const keys = groupFields || Object.keys(assumptions || {}).filter(k => ['number', 'string', 'boolean'].includes(typeof assumptions[k]));
  
  const Field = ({ k }: { k: string }) => {
    const [inputValue, setInputValue] = useState(assumptions[k] ?? '');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInputValue(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    };
    const handleCommit = () => {
      const value = typeof assumptions[k] === 'number' ? Number(inputValue) : inputValue;
      setAssumptions({ ...assumptions, [k]: value });
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCommit();
      }
    };
    const val = assumptions[k];
    
    // Common label component with question mark icon and tooltip
    const LabelWithTooltip = () => (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">{formatFieldName(k)}</span>
        {tooltips[k] && (
          <div className="relative group">
            <span className="text-gray-500 dark:text-gray-400 cursor-help text-sm" aria-label={`Tooltip for ${k}`}>
              ?
            </span>
            <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded-md py-2 px-3 w-48 sm:w-64 -left-4 top-6">
              {tooltips[k]}
            </div>
          </div>
        )}
      </div>
    );

    // Special case for hedge_policy
    if (k === 'hedge_policy') {
      return (
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <LabelWithTooltip />
          <select
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-full sm:w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm text-right bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={`${k}-tooltip`}
          >
            <option value="none">None</option>
            <option value="protective_put">Protective Put</option>
          </select>
        </label>
      );
    }
    // Special case for objective_preset
    if (k === 'objective_preset') {
      return (
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <LabelWithTooltip />
          <select
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-full sm:w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm text-right bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={`${k}-tooltip`}
          >
            <option value="Defensive">Defensive</option>
            <option value="Balanced">Balanced</option>
            <option value="Growth">Growth</option>
          </select>
        </label>
      );
    }
    // Special case for deribit_iv_source
    if (k === 'deribit_iv_source') {
      return (
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <LabelWithTooltip />
          <select
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-full sm:w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm text-right bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={`${k}-tooltip`}
          >
            <option value="manual">Manual</option>
            <option value="live">Live</option>
          </select>
        </label>
      );
    }
    // Read-only field for BTC_current_market_price
    if (k === 'BTC_current_market_price') {
      return (
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <LabelWithTooltip />
          <input
            type="number"
            value={inputValue}
            readOnly
            className="w-full sm:w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm text-right bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
            aria-describedby={`${k}-tooltip`}
          />
        </label>
      );
    }
    if (typeof val === 'number') {
      return (
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <LabelWithTooltip />
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className="w-full sm:w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm text-right bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={`${k}-tooltip`}
            step={k.includes('jump') ? '0.01' : 'any'}
          />
        </label>
      );
    }
    if (typeof val === 'boolean') {
      return (
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <LabelWithTooltip />
          <input
            type="checkbox"
            checked={!!inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-6 h-6 rounded border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={`${k}-tooltip`}
          />
        </label>
      );
    }
    return (
      <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
        <LabelWithTooltip />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="w-full sm:w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm text-right bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={`${k}-tooltip`}
        />
      </label>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {keys.map((k) => <Field key={k} k={k} />)}
    </div>
  );
}