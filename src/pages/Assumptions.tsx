// src/pages/Assumptions.tsx
import React, { useState } from 'react';
import AssumptionGrid from './AssumptionGrid';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
);

const groups = [
  {
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
    ],
  },
  {
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
    ],
  },
  {
    title: 'Risk Constraints / Covenants',
    fields: [
      'LTV_Cap',
      'cure_period_days',
      'haircut_h0',
      'haircut_alpha',
      'liquidation_penalty_bps',
    ],
  },
  {
    title: 'Hedging',
    fields: [
      'hedge_policy',
      'hedge_intensity',
      'hedge_tenor_days',
      'deribit_iv_source',
      'manual_iv',
    ],
  },
  {
    title: 'Optimizer Objectives & Limits',
    fields: [
      'objective_preset',
      'cvar_on',
      'max_dilution',
      'min_runway_months',
      'max_breach_prob',
      'min_profit_margin',
      'min_profit_margin_constraint',
      'wacc_cap',
      'kappa_btc',
      'lambda_dilution',
      'lambda_runway',
      'lambda_breach',
      'lambda_wacc',
      'lambda_profit_margin',
    ],
  },
  {
    title: 'Simulation & Jumps (Advanced)',
    fields: [
      'jump_intensity',
      'jump_mean',
      'jump_volatility',
      'vol_mean_reversion_speed',
      'long_run_volatility',
      'use_variance_reduction',
      'opex_stress_volatility',
      'dilution_vol_estimate',
    ],
  },
];

export default function Assumptions({
  assumptions,
  setAssumptions,
  mode,
  setMode,
}: {
  assumptions: any;
  setAssumptions: (a: any) => void;
  mode: 'pro-forma' | 'live';
  setMode: (m: 'pro-forma' | 'live') => void;
}) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([
      'Company & Balance Sheet',
      'Market & BTC Process',
      'Capital Structure & Routes',
    ])
  );

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-3">
        {(['pro-forma', 'live'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {m === 'pro-forma' ? 'Pro Forma' : 'Live'}
          </button>
        ))}
      </div>

      {/* Sections */}
      {groups.map((group) => (
        <Card key={group.title} className="overflow-hidden">
          <button
            onClick={() => toggleSection(group.title)}
            className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
          >
            <SectionTitle className="m-0">
              {group.title}
            </SectionTitle>
            <span className="text-2xl font-light">
              {openSections.has(group.title) ? '−' : '+'}
            </span>
          </button>

          {openSections.has(group.title) && (
            <div className="p-6 border-t border-gray-100">
              <AssumptionGrid
                key={group.title} 
                assumptions={assumptions}
                setAssumptions={setAssumptions}
                groupFields={group.fields}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}