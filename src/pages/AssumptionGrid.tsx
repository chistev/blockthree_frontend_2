import React, { useState } from 'react';

const tooltips: { [key: string]: string } = {
  // Company & Balance Sheet
  initial_equity_value: "Current equity market capitalization (USD). Used for dilution and ROE calculations.",
  initial_cash: "Cash & cash equivalents on balance sheet before any new financing.",
  BTC_treasury: "Current Bitcoin holdings in treasury (whole BTC).",
  shares_basic: "Basic shares outstanding (used for dilution).",
  shares_fd: "Fully diluted shares outstanding (including options, warrants, converts).",
  opex_monthly: "Monthly operating expenses (USD). Drives cash burn.",
  annual_burn_rate: "Annual cash burn rate (typically opex × 12). Shown for reference.",
  tax_rate: "Effective corporate tax rate (decimal, e.g., 0.21).",
  nols: "Net operating loss carryforwards available (USD).",

  // Market & BTC Process
  BTC_current_market_price: "Current Bitcoin spot price (USD). Pulled live from CoinGecko on load.",
  targetBTCPrice: "Target BTC price for drift adjustment in simulations. Leave = current for neutral drift.",
  mu: "Expected annual BTC return (drift) for GBM/Heston.",
  sigma: "Annualized BTC volatility (decimal).",
  t: "Simulation horizon in years.",
  risk_free_rate: "Risk-free rate (e.g., 10-year Treasury). Used in option pricing and WACC.",
  expected_return_btc: "Expected BTC return for CAPM/ROE calculations (often same as mu).",
  delta: "Dividend yield equivalent for BTC (typically 0 or small). Used in option pricing.",

  // Capital Structure & Routes
  structure: "Forced structure for As-Is run. Leave blank for optimizer to choose freely across all structures.",
  LoanPrincipal: "Debt principal amount (USD). Set to 0 for no debt.",
  new_equity_raised: "Equity raise amount (USD). Set to 0 for no equity.",
  cost_of_debt: "Annual interest rate on debt (decimal).",
  IssuePrice: "Share price for new equity issuance (USD/BTC equivalent).",
  adv_30d: "30-day average daily trading volume (USD). Used for ATM slippage.",
  atm_pct_adv: "Maximum % of ADV for ATM program (decimal).",
  pipe_discount: "PIPE discount to market price (decimal, negative = premium).",
  fees_ecm: "Equity capital markets fees (decimal, e.g., 0.03 = 3%).",
  fees_oid: "Debt origination/issuance fees (decimal).",

  // Risk Constraints / Covenants
  LTV_Cap: "Maximum loan-to-value ratio before margin call (decimal).",
  cure_period_days: "Days allowed to cure margin call before forced liquidation.",
  haircut_h0: "Base haircut on BTC collateral at t=0 (decimal).",
  haircut_alpha: "Volatility sensitivity of haircut (increases with realized vol).",
  liquidation_penalty_bps: "Liquidation penalty in basis points on forced sale.",

  // Hedging
  hedge_policy: "Hedging strategy: 'none' or 'protective_put'.",
  hedge_intensity: "Fraction of BTC exposure to hedge (0–1).",
  hedge_tenor_days: "Tenor of hedge instruments in days.",
  deribit_iv_source: "Deribit implied volatility source (e.g., 'BTC-27DEC24-100000-C'). Leave blank for model IV.",
  manual_iv: "Manual implied volatility override (decimal) if not using Deribit.",

  // Optimizer Objectives & Limits
  objective_preset: "Risk profile preset: Defensive, Balanced, or Growth. Sets default constraints.",
  cvar_on: "Enable Conditional Value at Risk in optimization (boolean).",
  max_dilution: "Maximum allowed dilution (decimal). Hard stop for optimizer.",
  min_runway_months: "Minimum required runway in months under stressed paths.",
  max_breach_prob: "Maximum acceptable LTV breach probability.",
  min_profit_margin: "Minimum profit margin on debt (spread over risk-free).",
  min_profit_margin_constraint: "Deprecated – use min_profit_margin.",
  wacc_cap: "Maximum acceptable WACC (decimal).",
  kappa_btc: "BTC risk premium adjustment factor in WACC.",
  nsga_pop_size: "NSGA-III population size (higher = better exploration).",
  nsga_n_gen: "NSGA-III generations (higher = better convergence).",
  lambda_dilution: "Penalty weight for dilution constraint violation.",
  lambda_runway: "Penalty weight for runway constraint.",
  lambda_breach: "Penalty weight for LTV breach constraint.",
  lambda_wacc: "Penalty weight for WACC constraint.",
  lambda_profit_margin: "Penalty weight for profit margin constraint.",
  enable_hybrid: "Enable hybrid (debt + equity) structures in optimizer (boolean).",

  // Simulation & Jumps (Advanced)
  paths: "Number of Monte Carlo paths (higher = more accurate).",
  bootstrap_samples: "Number of bootstrap samples for confidence intervals.",
  jump_intensity: "Annual frequency of price jumps (Merton model). 0 = disable jumps.",
  jump_mean: "Average jump size (log return).",
  jump_volatility: "Volatility of jump size.",
  vol_mean_reversion_speed: "Speed of mean reversion in Heston volatility (kappa).",
  long_run_volatility: "Long-run volatility level in Heston (decimal, not variance).",
  use_variance_reduction: "Use antithetic variates and Sobol sequences (boolean).",
  opex_stress_volatility: "Volatility of OPEX stress shocks (decimal).",
  dilution_vol_estimate: "Volatility estimate for dilution noise in ROE calc.",
  capex_schedule: "Monthly capex schedule as comma-separated values (12 numbers).",
};

interface AssumptionGridProps {
  assumptions: any;
  setAssumptions: (assumptions: any) => void;
  groupFields: string[];
}

export default function AssumptionGrid({ assumptions, setAssumptions, groupFields }: AssumptionGridProps) {
  const handleChange = (key: string, value: any) => {
    // Special handling for capex_schedule
    if (key === 'capex_schedule') {
      const arr = value.split(',').map((v: string) => parseFloat(v.trim()) || 0);
      // Pad or trim to 12 months
      while (arr.length < 12) arr.push(0);
      value = arr.slice(0, 12);
    }

    setAssumptions({ ...assumptions, [key]: value });
  };

  const renderInput = (k: string, val: any) => {
    const [inputValue, setInputValue] = useState(() => {
      if (Array.isArray(val)) return val.join(', ');
      if (typeof val === 'number') return val.toLocaleString('en-US');
      return val ?? '';
    });

    const commitValue = () => {
      let committed: any = inputValue;
      if (k === 'capex_schedule') {
        committed = inputValue.split(',').map((v: string) => parseFloat(v.trim()) || 0);
        while (committed.length < 12) committed.push(0);
        committed = committed.slice(0, 12);
      } else if (typeof val === 'number' || (!isNaN(val) && val !== '')) {
        committed = parseFloat(String(inputValue).replace(/,/g, '')) || 0;
      } else if (typeof val === 'boolean') {
        committed = inputValue === true || inputValue === 'true' || inputValue === '1';
      }
      handleChange(k, committed);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
    };

    // Special selects
    if (k === 'structure') {
      return (
        <select
          value={val ?? ''}
          onChange={(e) => handleChange(k, e.target.value || '')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Optimizer chooses (free)</option>
          <option value="Loan">Loan</option>
          <option value="Convertible">Convertible</option>
          <option value="PIPE">PIPE</option>
          <option value="ATM">ATM</option>
        </select>
      );
    }

    if (k === 'hedge_policy') {
      return (
        <select
          value={val ?? 'none'}
          onChange={(e) => handleChange(k, e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="none">None</option>
          <option value="protective_put">Protective Put</option>
        </select>
      );
    }

    if (k === 'objective_preset') {
      return (
        <select
          value={val ?? 'Balanced'}
          onChange={(e) => handleChange(k, e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Defensive">Defensive</option>
          <option value="Balanced">Balanced</option>
          <option value="Growth">Growth</option>
        </select>
      );
    }

    // Boolean checkbox
    if (typeof val === 'boolean' || val === true || val === false || ['cvar_on', 'use_variance_reduction', 'enable_hybrid'].includes(k)) {
      return (
        <input
          type="checkbox"
          checked={!!val}
          onChange={(e) => handleChange(k, e.target.checked)}
          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
        />
      );
    }

    // Default text input
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitValue}
        onKeyDown={handleKeyDown}
        placeholder={k === 'capex_schedule' ? '0, 0, 0, ... (12 values)' : ''}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groupFields.map((k) => (
        <div key={k} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {k.replace(/_/g, ' ')}
            <span className="text-xs text-gray-500 cursor-help" title={tooltips[k] || ''}>
              ⓘ
            </span>
          </label>
          <div className="flex items-center gap-2">
            {renderInput(k, assumptions[k])}
          </div>
        </div>
      ))}
    </div>
  );
}