const tooltips: Record<string, string> = {
  BTC_treasury: 'Total Bitcoin held in corporate treasury (in BTC).',
  BTC_current_market_price: 'Current market price of Bitcoin (USD, fetched live or editable).',
  targetBTCPrice: 'Target Bitcoin price used for drift adjustment in simulations (USD).',
  IssuePrice: 'Share price for new equity issuances (USD).',
  mu: 'Expected annual drift/return of Bitcoin price process.',
  sigma: 'Annualized volatility of Bitcoin returns.',
  t: 'Simulation time horizon in years.',
  risk_free_rate: 'Risk-free interest rate (e.g., U.S. Treasury yield).',
  expected_return_btc: 'Expected annual return of Bitcoin (used in CAPM/ROE calculations).',
  delta: 'Dividend yield equivalent for Bitcoin (typically 0).',
  LoanPrincipal: 'Principal amount of debt/convertible instrument (USD).',
  cost_of_debt: 'Annual coupon/interest rate on the debt component.',
  LTV_Cap: 'Maximum Loan-to-Value ratio allowed before margin call (e.g., 0.50 = 50%).',
  initial_equity_value: 'Current equity market capitalization (USD).',
  new_equity_raised: 'Amount of new equity capital raised (USD).',
  beta_ROE: 'Equity beta used in CAPM-based ROE calculations.',
  shares_basic: 'Basic shares outstanding.',
  shares_fd: 'Fully diluted shares outstanding (incl. options, converts, etc.).',
  opex_monthly: 'Monthly operating expenses (USD).',
  tax_rate: 'Effective corporate tax rate (decimal).',
  nols: 'Net Operating Losses available for tax shield (USD).',
  annual_burn_rate: 'Annual cash burn rate (typically opex_monthly × 12).',
  initial_cash: 'Starting cash balance on balance sheet (USD).',
  adv_30d: '30-day average daily trading volume in dollars (for ATM sizing).',
  atm_pct_adv: 'Percentage of 30-day ADV used in At-The-Market offerings.',
  pipe_discount: 'Discount to market price for PIPE transactions.',
  fees_ecm: 'Equity capital markets / placement agent fees (% of raise).',
  fees_oid: 'Original issue discount on debt instruments (%).',
  cure_period_days: 'Number of days allowed to cure LTV breach before liquidation.',
  haircut_h0: 'Initial haircut applied to BTC collateral value.',
  haircut_alpha: 'Rate at which haircut increases with LTV.',
  liquidation_penalty_bps: 'Penalty fee on liquidation (basis points).',
  hedge_policy: 'Hedging strategy: None (no hedge) or Protective Put.',
  hedge_intensity: 'Percentage of exposure hedged (0.0–1.0).',
  hedge_tenor_days: 'Tenor of hedge instruments in days.',
  manual_iv: 'Manual implied volatility override for hedging.',
  cvar_on: 'Enable Conditional Value at Risk in optimization constraints.',
  max_dilution: 'Maximum allowed shareholder dilution (%).',
  min_runway_months: 'Minimum required cash runway in months.',
  max_breach_prob: 'Maximum acceptable LTV breach probability.',
  'objective_switches.max_btc': 'Maximize BTC purchased/retained.',
  'objective_switches.min_dilution': 'Minimize shareholder dilution.',
  'objective_switches.min_ltv_breach': 'Minimize probability of LTV breach.',
  'objective_switches.max_runway': 'Maximize cash runway in months.',
  'objective_switches.max_nav': 'Maximize expected NAV per share.',
  'objective_switches.min_wacc': 'Minimize weighted average cost of capital.',
  dilution_vol_estimate: 'Estimated volatility of dilution impact.',
  vol_mean_reversion_speed: 'Speed of mean reversion in Heston volatility process.',
  long_run_volatility: 'Long-term average volatility in Heston model.',
  min_profit_margin: 'Minimum lender profit margin enforced.',
  use_variance_reduction: 'Enable antithetic variates / control variates for faster convergence.',
  jump_intensity: 'Annual frequency of price jumps (Merton jump-diffusion).',
  jump_mean: 'Average size of jumps (log-return).',
  jump_volatility: 'Volatility of jump size.',
  opex_stress_volatility: 'Volatility applied to opex in stress scenarios.',
  wacc_cap: 'Upper bound on acceptable WACC in optimization.',
  min_profit_margin_constraint: 'Hard minimum profit margin for lenders.',
  kappa_btc: 'Weighting factor for BTC retention in hybrid scoring.',
  enable_hybrid: 'Allow hybrid loan + equity structures in optimization.',
  nsga_pop_size: 'NSGA-III population size per generation.',
  nsga_n_gen: 'Number of generations for NSGA-III optimizer.',
  lambda_dilution: 'Penalty weight for dilution constraint violation.',
  lambda_runway: 'Penalty weight for runway constraint.',
  lambda_breach: 'Penalty weight for LTV breach constraint.',
  lambda_wacc: 'Penalty weight for WACC constraint.',
  lambda_profit_margin: 'Penalty weight for lender margin constraint.',
};

const HEDGE_POLICY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'protective_put', label: 'Protective Put' },
] as const;

// Smart label formatter — handles camelCase, snake_case, and keeps acronyms uppercase
const formatLabel = (key: string): string => {
  // Insert spaces between camelCase parts and handle acronyms
  let spaced = key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')  // BTCPrice → BTC Price
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')      // LoanPrincipal → Loan Principal
    .replace(/_/g, ' ')
    .trim();

  return spaced
    .split(' ')
    .map((word) => {
      const upper = word.toUpperCase();
      const acronyms = [
        'BTC', 'LTV', 'NAV', 'WACC', 'CAPM', 'ROE', 'NOL', 'NOLS', 'ATM', 'PIPE',
        'CVAR', 'NSGA', 'OID', 'ECM', 'H0', 'ADV', 'BPS', 'IV', 'FD'
      ];
      if (acronyms.includes(upper)) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export default function AssumptionGrid({
  assumptions,
  setAssumptions,
  groupFields,
}: {
  assumptions: any;
  setAssumptions: (upd: any) => void;
  groupFields: string[];
}) {
  const getValue = (key: string): any => {
    if (key.includes('.')) {
      return key.split('.').reduce((o, k) => (o || {})[k], assumptions);
    }
    return assumptions[key];
  };

  const updateValue = (key: string, value: any) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      const newAssumps = JSON.parse(JSON.stringify(assumptions));
      let current: any = newAssumps;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      setAssumptions(newAssumps);
    } else {
      setAssumptions({ ...assumptions, [key]: value });
    }
  };

  const formatDisplay = (val: any): string => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return val.toString();
      return val.toString();
    }
    return String(val);
  };

  const parseInput = (input: string): number | string => {
    const val = input.trim();
    if (val === '' || val === '-' || val === '.' || val === '-.' || val === '0.' || val === '-0.') {
      return val;
    }

    let normalized = val;
    if (normalized.startsWith('.')) normalized = '0' + normalized;
    if (normalized.startsWith('-.')) normalized = '-0.' + normalized.slice(2);

    const num = parseFloat(normalized);
    return isNaN(num) ? normalized : num;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groupFields.map((key) => {
        if (key === 'deribit_iv_source' || key === 'objective_preset') return null;

        const rawValue = getValue(key);
        const isBoolean = typeof rawValue === 'boolean';

        if (key === 'hedge_policy') {
          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 bg-gray-50/50 dark:bg-zinc-800/50"
            >
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hedge Policy
                </label>
                {tooltips[key] && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tooltips[key]}</p>
                )}
              </div>
              <select
                value={rawValue || 'none'}
                onChange={(e) => updateValue(key, e.target.value)}
                className="w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {HEDGE_POLICY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div
            key={key}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 bg-gray-50/50 dark:bg-zinc-800/50"
          >
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatLabel(key)}
              </label>
              {tooltips[key] && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tooltips[key]}</p>
              )}
            </div>

            {isBoolean ? (
              <input
                type="checkbox"
                checked={!!rawValue}
                onChange={(e) => updateValue(key, e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={formatDisplay(rawValue)}
                onChange={(e) => {
                  const parsed = parseInput(e.target.value);
                  updateValue(key, parsed);
                }}
                onBlur={() => {
                  const current = getValue(key);
                  if (typeof current === 'string') {
                    const num = parseFloat(current);
                    if (!isNaN(num) && isFinite(num)) {
                      updateValue(key, num);
                    }
                  }
                }}
                className="w-32 px-3 py-2 text-right rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm tabular-nums"
                placeholder="0.00"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}