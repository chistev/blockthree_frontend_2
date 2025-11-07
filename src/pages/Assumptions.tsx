import React from 'react';
import { Card, SectionTitle, Pill, Button } from '../components/Primitives';
import AssumptionGrid from '../components/AssumptionGrid';

export default function Assumptions({
  assumptions,
  setAssumptions,
  mode,
  setMode,
  ticker,
  setTicker,
  handleUpload,
  advancedOpen,
  setAdvancedOpen,
  handleCalculate,
  snapshotId,
  isLoading,
  progress,
  error,
  handleTickerSubmit,
  isTickerLoading,
}: any) {
  const groups = [
    { title: 'BTC Parameters', fields: ['BTC_treasury', 'BTC_current_market_price', 'targetBTCPrice', 'IssuePrice'] },
    { title: 'Model Parameters', fields: ['mu', 'sigma', 't', 'risk_free_rate', 'expected_return_btc', 'delta'] },
    { title: 'Debt & Equity Parameters', fields: ['LoanPrincipal', 'cost_of_debt', 'LTV_Cap', 'initial_equity_value', 'new_equity_raised', 'beta_ROE'] },
    { title: 'Structure Parameters', fields: ['structure'] },
    { title: 'Balance Sheet', fields: ['shares_basic', 'shares_fd', 'opex_monthly', 'tax_rate', 'nols', 'annual_burn_rate', 'initial_cash'] },
    { title: 'Capital Routes', fields: ['adv_30d', 'atm_pct_adv', 'pipe_discount', 'fees_ecm', 'fees_oid'] },
    { title: 'Covenants/Haircuts', fields: ['cure_period_days', 'haircut_h0', 'haircut_alpha', 'liquidation_penalty_bps'] },
    { title: 'Hedging', fields: ['hedge_policy', 'hedge_intensity', 'hedge_tenor_days', 'deribit_iv_source', 'manual_iv'] },
    { title: 'Optimizer Constraints', fields: ['objective_preset', 'cvar_on', 'max_dilution', 'min_runway_months', 'max_breach_prob'] },
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
    ],
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ticker) {
      handleTickerSubmit(ticker);
    }
  };

  const handleTickerClick = () => {
    if (ticker) {
      handleTickerSubmit(ticker);
    }
  };

  return (
    <div className="space-y-4 px-4 sm:px-6 md:px-0">
      <SectionTitle right={<Pill tone={mode === 'public' ? 'blue' : mode === 'private' ? 'gray' : 'violet'}>Mode: {mode}</Pill>}>
        Assumptions
      </SectionTitle>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="public">Public (SEC)</option>
        <option value="private">Private</option>
        <option value="pro-forma">Pro-Forma</option>
      </select>
      {mode === 'public' && (
        <div className="flex gap-2">
          <input
            placeholder="Ticker (e.g., AMZN)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleTickerClick}
            disabled={!ticker || isTickerLoading}
            variant="danger"
            className="whitespace-nowrap px-4"
          >
            {isTickerLoading ? (
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Fetch Data'
            )}
          </Button>
        </div>
      )}
      <input
        type="file"
        onChange={handleUpload}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-700 dark:file:text-zinc-100 dark:hover:file:bg-zinc-600"
      />
      {groups.map((g: any) => (
        <Card key={g.title} className="p-4">
          <SectionTitle>{g.title}</SectionTitle>
          <AssumptionGrid assumptions={assumptions} setAssumptions={setAssumptions} groupFields={g.fields} />
        </Card>
      ))}
      <Card className="p-4">
        <div className="cursor-pointer" onClick={() => setAdvancedOpen(!advancedOpen)}>
          <SectionTitle>{advancedOpen ? 'Hide' : 'Show'} Advanced Parameters</SectionTitle>
        </div>
        {advancedOpen && (
          <div onClick={(e) => e.stopPropagation()}>
            <AssumptionGrid assumptions={assumptions} setAssumptions={setAssumptions} groupFields={advancedGroup.fields} />
          </div>
        )}
      </Card>
      <Button
        onClick={handleCalculate}
        disabled={isLoading}
        variant="primary"
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Running Models ({progress}%)</span>
          </>
        ) : (
          'Run Models'
        )}
      </Button>
      {snapshotId && (
        <div className="mt-4">
          <Pill tone="green">Snapshot: {snapshotId}</Pill>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
}