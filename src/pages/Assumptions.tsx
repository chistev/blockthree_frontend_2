import { Card, SectionTitle, Pill, Button } from '../components/Primitives';
import AssumptionGrid from './AssumptionGrid';

interface AssumptionsProps {
  assumptions: any;
  setAssumptions: (upd: any) => void;
  mode: 'public' | 'private' | 'pro-forma';
  setMode: (mode: 'public' | 'private' | 'pro-forma') => void;
  handleCalculate: () => void;
  snapshotId?: string | null;
  isLoading: boolean;
  progress: number;
  error?: string | null;
  advancedOpen?: boolean;
  setAdvancedOpen?: (open: boolean) => void;
}

export default function Assumptions({
  assumptions,
  setAssumptions,
  mode,
  setMode,
  handleCalculate,
  snapshotId,
  isLoading,
  progress,
  error,
  advancedOpen = false,
  setAdvancedOpen = () => {},
}: AssumptionsProps) {
  const groups = [
    {
      title: 'BTC Parameters',
      fields: ['BTC_treasury', 'BTC_current_market_price', 'targetBTCPrice', 'IssuePrice'],
    },
    {
      title: 'Model Parameters',
      fields: ['mu', 'sigma', 't', 'risk_free_rate', 'expected_return_btc', 'delta'],
    },
    {
      title: 'Debt & Equity Parameters',
      fields: ['LoanPrincipal', 'cost_of_debt', 'LTV_Cap', 'initial_equity_value', 'new_equity_raised', 'beta_ROE'],
    },
    {
      title: 'Balance Sheet',
      fields: ['shares_basic', 'shares_fd', 'opex_monthly', 'tax_rate', 'nols', 'annual_burn_rate', 'initial_cash'],
    },
    {
      title: 'Capital Routes',
      fields: ['adv_30d', 'atm_pct_adv', 'pipe_discount', 'fees_ecm', 'fees_oid'],
    },
    {
      title: 'Covenants / Haircuts',
      fields: ['cure_period_days', 'haircut_h0', 'haircut_alpha', 'liquidation_penalty_bps'],
    },
    {
      title: 'Hedging',
      fields: [
        'hedge_policy',
        'hedge_intensity',
        'hedge_tenor_days',
        'manual_iv',
      ],
    },
    {
      title: 'Optimizer Objectives & Constraints',
      fields: [
        'cvar_on',
        'max_dilution',
        'min_runway_months',
        'max_breach_prob',
        'objective_switches.max_btc',
        'objective_switches.min_dilution',
        'objective_switches.min_ltv_breach',
        'objective_switches.max_runway',
        'objective_switches.max_nav',
        'objective_switches.min_wacc',
      ],
    },
  ];

  const advancedGroup = {
    title: 'Advanced Parameters',
    fields: [
      'dilution_vol_estimate',
      'vol_mean_reversion_speed',
      'long_run_volatility',
      'min_profit_margin',
      'use_variance_reduction',
      'jump_intensity',
      'jump_mean',
      'jump_volatility',
      'opex_stress_volatility',
      'bootstrap_samples',
      'wacc_cap',
      'min_profit_margin_constraint',
      'kappa_btc',
      'enable_hybrid',
      'nsga_pop_size',
      'nsga_n_gen',
      'lambda_dilution',
      'lambda_runway',
      'lambda_breach',
      'lambda_wacc',
      'lambda_profit_margin',
    ],
  };

  const getModeTone = () => {
    if (mode === 'public') return 'blue';
    if (mode === 'private') return 'gray';
    return 'yellow';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SectionTitle>Assumptions</SectionTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Mode:</span>
          <Pill tone={getModeTone()}>
            {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
          </Pill>
        </div>
      </div>

      {groups.map((group) => (
        <Card key={group.title} className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5">
            {group.title}
          </h3>
          <AssumptionGrid
            assumptions={assumptions}
            setAssumptions={setAssumptions}
            groupFields={group.fields}
          />
        </Card>
      ))}

      <Card className="p-6">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Advanced Parameters
          </h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {advancedOpen && (
          <div className="mt-6">
            <AssumptionGrid
              assumptions={assumptions}
              setAssumptions={setAssumptions}
              groupFields={advancedGroup.fields}
            />
          </div>
        )}
      </Card>

      <Button
        onClick={handleCalculate}
        disabled={isLoading}
        variant="primary"
        className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Running Models ({progress}%)
          </>
        ) : (
          'Run Models'
        )}
      </Button>

      {snapshotId && (
        <div className="flex justify-center">
          <Pill tone="green">Snapshot: {snapshotId.slice(0, 8)}...</Pill>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-center">
          {error}
        </div>
      )}
    </div>
  );
}