import React from 'react';

interface AssumptionGridProps {
  assumptions: Record<string, any>;
  setAssumptions: (upd: Record<string, any>) => void;
  groupFields: string[];
}

const fieldLabels: Record<string, string> = {
  initial_equity_value: 'Initial Equity Value',
  initial_cash: 'Initial Cash',
  BTC_treasury: 'BTC Treasury',
  shares_basic: 'Shares Basic',
  shares_fd: 'Shares FD',
  opex_monthly: 'OPEX Monthly',
  annual_burn_rate: 'Annual Burn Rate',
  tax_rate: 'Tax Rate',
  nols: 'NOLs',

  BTC_current_market_price: 'BTC Current Price',
  targetBTCPrice: 'Target BTC Price',
  IssuePrice: 'Issue Price',
  mu: 'Mu (μ)',
  sigma: 'Sigma (σ)',
  t: 'Time Horizon (years)',
  risk_free_rate: 'Risk Free Rate',
  expected_return_btc: 'Expected Return BTC',
  delta: 'Delta',

  structure: 'Structure',
  forced_structure: 'Forced Structure',
  LoanPrincipal: 'Loan Principal',
  new_equity_raised: 'New Equity Raised',
  cost_of_debt: 'Cost of Debt',
  adv_30d: 'ADV 30d',
  atm_pct_adv: 'ATM % ADV',
  pipe_discount: 'PIPE Discount',
  fees_ecm: 'Fees ECM',
  fees_oid: 'Fees OID',

  LTV_Cap: 'LTV Cap',
  cure_period_days: 'Cure Period Days',
  haircut_h0: 'Haircut H0',
  haircut_alpha: 'Haircut Alpha',
  liquidation_penalty_bps: 'Liquidation Penalty (bps)',

  hedge_policy: 'Hedge Policy',
  hedge_intensity: 'Hedge Intensity',
  hedge_tenor_days: 'Hedge Tenor Days',
  manual_iv: 'Manual IV',

  jump_intensity: 'Jump Intensity',
  jump_mean: 'Jump Mean',
  jump_volatility: 'Jump Volatility',
  vol_mean_reversion_speed: 'Vol Mean Reversion Speed',
  long_run_volatility: 'Long Run Volatility',
  use_variance_reduction: 'Use Variance Reduction',
  paths: 'Simulation Paths',
  bootstrap_samples: 'Bootstrap Samples',
  opex_stress_volatility: 'OPEX Stress Volatility',
  dilution_vol_estimate: 'Dilution Vol Estimate',

  objective_preset: 'Objective Preset',
  cvar_on: 'CVaR On',
  max_dilution: 'Max Dilution',
  min_runway_months: 'Min Runway Months',
  max_breach_prob: 'Max Breach Prob',
  min_profit_margin: 'Min Profit Margin',
  min_profit_margin_constraint: 'Min Profit Margin Constraint',
  enable_hybrid: 'Enable Hybrid',

  beta_ROE: 'Beta ROE',
  kappa_btc: 'Kappa BTC',
  wacc_cap: 'WACC Cap',

  nsga_pop_size: 'NSGA Pop Size',
  nsga_n_gen: 'NSGA Generations',
  lambda_dilution: 'Lambda Dilution',
  lambda_runway: 'Lambda Runway',
  lambda_breach: 'Lambda Breach',
  lambda_wacc: 'Lambda WACC',
  lambda_profit_margin: 'Lambda Profit Margin',
};

const booleanFields = new Set<string>([
  'use_variance_reduction',
  'cvar_on',
  'enable_hybrid',
]);

const AssumptionGrid: React.FC<AssumptionGridProps> = ({
  assumptions,
  setAssumptions,
  groupFields,
}) => {
  const handleChange = (field: string, value: any) => {
    // Allow string, number, boolean, or undefined
    const finalValue = value === '' ? undefined : value;

    setAssumptions({
      ...assumptions,
      [field]: finalValue,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groupFields.map((field) => {
        const label = fieldLabels[field] ?? field.replace(/_/g, ' ');
        const rawValue = assumptions[field];
        const isBool = booleanFields.has(field);
        const displayValue = rawValue ?? (isBool ? false : '');

        return (
          <div key={field} className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 tracking-wide">
              {label}
            </label>

            {isBool ? (
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!displayValue}
                  onChange={(e) => handleChange(field, e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                  {displayValue ? 'On' : 'Off'}
                </span>
              </label>
            ) : (
              <input
                type="text"
                value={displayValue}
                onChange={(e) => {
                  const input = e.target.value.trim();
                  if (input === '') {
                    handleChange(field, '');
                    return;
                  }

                  const num = Number(input);
                  const finalValue = isNaN(num) ? input : num;

                  handleChange(field, finalValue);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={field}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AssumptionGrid;