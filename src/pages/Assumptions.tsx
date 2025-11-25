// src/components/Assumptions.tsx
import React, { useState } from 'react';
import { Card, SectionTitle, Pill, Button } from '../components/Primitives';
import AssumptionGrid from '../components/AssumptionGrid'

interface AssumptionsProps {
  assumptions: Record<string, any>;
  setAssumptions: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  mode: string;
  setMode: (mode: string) => void;
  ticker?: string;
  setTicker?: (ticker: string) => void;
  handleUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTickerSubmit?: (ticker: string) => void;
  isTickerLoading?: boolean;
  handleCalculate: () => void;
  snapshotId?: string | null;
  isLoading?: boolean;
  progress?: number;
  error?: string | null;
}

const Assumptions: React.FC<AssumptionsProps> = ({
  assumptions,
  setAssumptions,
  mode,
  setMode,
  ticker = '',
  setTicker = () => {},
  handleUpload,
  handleTickerSubmit = () => {},
  isTickerLoading = false,
  handleCalculate,
  snapshotId,
  isLoading = false,
  progress = 0,
  error,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    company: true,
    market: true,
    capital: true,
    risk: true,
    simulation: false,
    optimization: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const groups = [
    {
      id: 'company',
      title: 'Company & Balance Sheet',
      fields: [
        'initial_equity_value',
        'initial_cash',
        'BTC_treasury',
        'shares_basic',
        'shares_fd',
        'opex_monthly',
        'annual_burn_rate',
        'tax_rate',
        'nols',
      ],
    },
    {
      id: 'market',
      title: 'Market & BTC Process',
      fields: [
        'BTC_current_market_price',
        'targetBTCPrice',
        'mu',
        'sigma',
        't',
        'risk_free_rate',
        'expected_return_btc',
        'delta',
        'manual_iv',
      ],
    },
    {
      id: 'capital',
      title: 'Capital Structure & Routes',
      fields: [
        'structure',
        'LoanPrincipal',
        'new_equity_raised',
        'cost_of_debt',
        'IssuePrice',
        'adv_30d',
        'atm_pct_adv',
        'pipe_discount',
        'fees_ecm',
        'fees_oid',
        'enable_hybrid',
      ],
    },
    {
      id: 'risk',
      title: 'Risk Constraints / Covenants',
      fields: [
        'LTV_Cap',
        'cure_period_days',
        'haircut_h0',
        'haircut_alpha',
        'liquidation_penalty_bps',
        'beta_ROE',
        'dilution_vol_estimate',
      ],
    },
    {
      id: 'simulation',
      title: 'Simulation & Advanced Volatility',
      fields: [
        'jump_intensity',
        'jump_mean',
        'jump_volatility',
        'vol_mean_reversion_speed',
        'long_run_volatility',
        'use_variance_reduction',
        'paths',
        'bootstrap_samples',
        'opex_stress_volatility',
      ],
    },
    {
      id: 'optimization',
      title: 'Optimization, Objectives & Hedging',
      fields: [
        'objective_preset',
        'objective_switches',
        'cvar_on',
        'max_dilution',
        'min_runway_months',
        'max_breach_prob',
        'min_profit_margin_constraint',
        'wacc_cap',
        'kappa_btc',
        'lambda_dilution',
        'lambda_runway',
        'lambda_breach',
        'lambda_wacc',
        'lambda_profit_margin',
        'nsga_pop_size',
        'nsga_n_gen',
        'hedge_policy',
        'hedge_intensity',
        'hedge_tenor_days',
      ],
    },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-0">
      <SectionTitle
        right={
          <Pill tone={mode === 'public' ? 'blue' : mode === 'private' ? 'gray' : 'violet'}>
            Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Pill>
        }
      >
        Assumptions
      </SectionTitle>

      {/* Mode Selector */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="public">Public (SEC)</option>
        <option value="private">Private</option>
        <option value="pro-forma">Pro-Forma</option>
      </select>

      {/* Public Mode: Ticker Fetch */}
      {mode === 'public' && (
        <div className="flex gap-3">
          <input
            placeholder="Ticker (e.g., MSTR, TSLA)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && ticker && handleTickerSubmit(ticker)}
            className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={() => ticker && handleTickerSubmit(ticker)}
            disabled={!ticker || isTickerLoading}
            variant="danger"
            className="px-6"
          >
            {isTickerLoading ? 'Fetching...' : 'Fetch Data'}
          </Button>
        </div>
      )}

      {/* File Upload */}
      {handleUpload && (
        <input
          type="file"
          accept=".json"
          onChange={handleUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-100"
        />
      )}

      {/* Collapsible Field Groups */}
      {groups.map((group) => (
        <Card key={group.id} className="p-5">
          <button
            onClick={() => toggleSection(group.id)}
            className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>{group.title}</span>
            <span className="text-2xl">{expandedSections[group.id] ? '−' : '+'}</span>
          </button>

          {expandedSections[group.id] && (
            <div className="mt-4">
              <AssumptionGrid
                assumptions={assumptions}
                setAssumptions={setAssumptions}
                groupFields={group.fields}
              />
            </div>
          )}
        </Card>
      ))}

      {/* Run Button */}
      <Button
        onClick={handleCalculate}
        disabled={isLoading}
        variant="primary"
        className="w-full py-4 text-lg font-bold flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Running Simulation ({progress}%)</span>
          </>
        ) : (
          'Run Treasury Models'
        )}
      </Button>

      {/* Snapshot ID */}
      {snapshotId && (
        <div className="text-center">
          <Pill tone="green">Snapshot Locked: {snapshotId}</Pill>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-center font-medium">{error}</p>}
    </div>
  );
};

export default Assumptions;