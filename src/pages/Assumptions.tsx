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
}: any) {

  const groups = [
    { title: 'BTC Parameters', fields: ['BTC_treasury', 'BTC_current_market_price', 'targetBTCPrice', 'IssuePrice'] },
    { title: 'Model Parameters', fields: ['mu', 'sigma', 't', 'risk_free_rate', 'expected_return_btc', 'delta'] },
    { title: 'Debt & Equity Parameters', fields: ['LoanPrincipal', 'cost_of_debt', 'LTV_Cap', 'initial_equity_value', 'new_equity_raised', 'beta_ROE'] },
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
    ],
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ticker) {
      handleTickerSubmit(ticker);
    }
  };
  return (
    <div className="space-y-6">
      <SectionTitle right={<Pill tone={mode === 'public' ? 'blue' : mode === 'private' ? 'gray' : 'violet'}>Mode: {mode}</Pill>}>
        Assumptions
      </SectionTitle>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-800 dark:border-zinc-600"
      >
        <option value="public">Public (SEC)</option>
        <option value="private">Private</option>
        <option value="pro-forma">Pro-Forma</option>
      </select>
      {mode === 'public' && (
        <input
          placeholder="Ticker (e.g., AMZN)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-800 dark:border-zinc-600"
        />
      )}
      <input
        type="file"
        onChange={handleUpload}
        className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-800 dark:border-zinc-600"
      />
      {groups.map((g: any) => (
        <Card key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <AssumptionGrid assumptions={assumptions} setAssumptions={setAssumptions} groupFields={g.fields} />
        </Card>
      ))}
      <Card>
        <div className="cursor-pointer" onClick={() => setAdvancedOpen(!advancedOpen)}>
          <SectionTitle>{advancedOpen ? 'Hide' : 'Show'} Advanced Parameters</SectionTitle>
        </div>
        {advancedOpen && (
          <div onClick={(e) => e.stopPropagation()}>
            <AssumptionGrid assumptions={assumptions} setAssumptions={setAssumptions} groupFields={advancedGroup.fields} />
          </div>
        )}
      </Card>
      <Button onClick={handleCalculate} disabled={isLoading} variant="primary" className="flex items-center justify-center gap-2">
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
      {snapshotId && <Pill tone="green">Snapshot: {snapshotId}</Pill>}
      {error && <p className="text-red-500 text-[14px]">{error}</p>}
    </div>
  );
}