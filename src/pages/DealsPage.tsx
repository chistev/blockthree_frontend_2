// src/pages/DealsPage.tsx
import React from 'react';
import { Button, Card, SectionTitle, Pill } from '../components/Primitives';

interface Deal {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: Record<string, any>;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
  asIsResults?: any;
  optimizedResults?: any;
  selectedCandidateIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DealsPageProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPage: (page: string) => void;
}

const DealsPage: React.FC<DealsPageProps> = ({ deals, setDeals, setPage }) => {
  const handleAddDeal = () => {
    const defaultAssumptions = {
      initial_equity_value: 100_000_000,
      initial_cash: 10_000_000,
      BTC_treasury: 1000,
      shares_basic: 100_000_000,
      shares_fd: 120_000_000,
      opex_monthly: 500_000,
      annual_burn_rate: 6_000_000,
      tax_rate: 0.21,
      nols: 5_000_000,

      BTC_current_market_price: 45_000,
      targetBTCPrice: 100_000,
      mu: 0.15,
      sigma: 0.65,
      t: 1.0,
      risk_free_rate: 0.045,
      expected_return_btc: 0.20,
      delta: 0.1,

      structure: 'loan',
      LoanPrincipal: 25_000_000,
      new_equity_raised: 0,
      cost_of_debt: 0.08,
      IssuePrice: 10,
      adv_30d: 5_000_000,
      atm_pct_adv: 0.15,
      pipe_discount: 0.10,
      fees_ecm: 0.05,
      fees_oid: 0.02,

      LTV_Cap: 0.65,
      cure_period_days: 30,
      haircut_h0: 0.15,
      haircut_alpha: 0.02,
      liquidation_penalty_bps: 200,

      jump_intensity: 0.1,
      jump_mean: -0.05,
      jump_volatility: 0.3,
      vol_mean_reversion_speed: 0.5,
      long_run_volatility: 0.6,
      use_variance_reduction: true,
      paths: 10_000,
      bootstrap_samples: 1_000,
      opex_stress_volatility: 0.2,

      objective_preset: 'balanced',
      cvar_on: true,
      nsga_pop_size: 100,
      nsga_n_gen: 50,
      wacc_cap: 0.15,
      min_profit_margin_constraint: 0.05,
      beta_ROE: 1.2,
      kappa_btc: 0.8,
      hedge_policy: 'none',
      hedge_intensity: 0.0,
      hedge_tenor_days: 90,
      dilution_vol_estimate: 0.4,
      manual_iv: 0.7,
      enable_hybrid: false,
      max_dilution: 0.25,
      min_runway_months: 12,
      max_breach_prob: 0.10,
    } as const;

    const newDeal: Deal = {
      id: crypto.randomUUID(),
      name: `Deal ${deals.length + 1}`,
      mode: 'pro-forma',
      assumptions: defaultAssumptions,
      status: 'draft',
      selectedCandidateIndex: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeals(prev => [...prev, newDeal]);
    setPage(`deal/${newDeal.id}`);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <SectionTitle>Your Deals</SectionTitle>
          {/* Fixed: removed size="lg" */}
          <Button onClick={handleAddDeal} variant="primary" className="text-lg font-semibold px-8 py-3">
            + New Deal
          </Button>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              No deals yet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
              Create your first Bitcoin treasury optimization scenario
            </p>
            {/* Fixed: removed size="lg" */}
            <Button onClick={handleAddDeal} variant="primary" className="text-lg font-semibold px-8 py-3">
              Create First Deal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-8">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-zinc-800">
                  <th className="text-left py-4 px-8 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left py-4 px-8 font-semibold text-gray-700 dark:text-gray-300">Mode</th>
                  <th className="text-left py-4 px-8 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-8 font-semibold text-gray-700 dark:text-gray-300">Treasury</th>
                  <th className="text-left py-4 px-8 font-semibold text-gray-700 dark:text-gray-300">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => setPage(`deal/${deal.id}`)}
                    className="border-b border-gray-100 dark:border-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                  >
                    <td className="py-5 px-8">
                      <div className="font-medium text-gray-900 dark:text-white">{deal.name}</div>
                    </td>
                    <td className="py-5 px-8">
                      <Pill tone={deal.mode === 'public' ? 'blue' : deal.mode === 'private' ? 'gray' : 'violet'}>
                        {deal.mode}
                      </Pill>
                    </td>
                    <td className="py-5 px-8">
                      {/* Fixed: replaced 'emerald' with 'green' */}
                      <Pill
                        tone={
                          deal.status === 'compared'
                            ? 'green'
                            : deal.status === 'draft'
                            ? 'gray'
                            : 'blue'
                        }
                      >
                        {deal.status.replace(/_/g, ' ')}
                      </Pill>
                    </td>
                    <td className="py-5 px-8">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(deal.assumptions.BTC_treasury || 0).toLocaleString()} BTC
                      </span>
                    </td>
                    <td className="py-5 px-8 text-gray-600 dark:text-gray-400">
                      {formatDate(deal.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DealsPage;