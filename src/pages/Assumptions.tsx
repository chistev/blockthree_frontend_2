import React, { useState, useEffect } from 'react';
import { authFetch } from '../auth';


interface ObjectiveSwitches {
  max_btc: boolean;
  min_dilution: boolean;
  min_ltv_breach: boolean;
  max_runway: boolean;
  max_nav: boolean;
  min_wacc: boolean;
}

interface AssumptionsData {
  BTC_treasury: number;
  BTC_purchased: number;
  BTC_current_market_price: number;
  targetBTCPrice: number;
  IssuePrice: number;
  mu: number;
  sigma: number;
  t: number;
  delta: number;
  initial_equity_value: number;
  new_equity_raised: number;
  LoanPrincipal: number;
  cost_of_debt: number;
  dilution_vol_estimate: number;
  LTV_Cap: number;
  beta_ROE: number;
  expected_return_btc: number;
  risk_free_rate: number;
  vol_mean_reversion_speed: number;
  long_run_volatility: number;
  paths: number;
  jump_intensity: number;
  jump_mean: number;
  jump_volatility: number;
  min_profit_margin: number;
  annual_burn_rate: number;
  initial_cash: number;
  shares_basic: number;
  shares_fd: number;
  opex_monthly: number;
  tax_rate: number;
  nols: number;
  adv_30d: number;
  atm_pct_adv: number;
  pipe_discount: number;
  fees_ecm: number;
  fees_oid: number;
  cure_period_days: number;
  haircut_h0: number;
  haircut_alpha: number;
  liquidation_penalty_bps: number;
  hedge_policy: string;
  hedge_intensity: number;
  hedge_tenor_days: number;
  manual_iv: number;
  structure: string;
  objective_preset: string;
  cvar_on: boolean;
  max_dilution: number;
  min_runway_months: number;
  max_breach_prob: number;
  use_variance_reduction: boolean;
  bootstrap_samples: number;
  opex_stress_volatility: number;
  objective_switches: ObjectiveSwitches;
  nsga_pop_size: number;
  nsga_n_gen: number;
  enable_hybrid: boolean;
}

interface AssumptionsProps {
  onCalculationComplete: (result: any) => void;
}

const Assumptions: React.FC<AssumptionsProps> = ({ onCalculationComplete }) => {
  const [mode, setMode] = useState<'public' | 'private' | 'pro-forma'>('pro-forma');
  const [assumptions, setAssumptions] = useState<Partial<AssumptionsData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);
  const [presets, setPresets] = useState<any>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'bitcoin-market': true,
    'company-financials': true,
    'funding-parameters': true,
    'risk-collateral': true,
    'hedging': true,
    'constraints-objectives': true,
  });
  const token = localStorage.getItem('authToken');

  // Fetch defaults
  useEffect(() => {
    const fetchDefaults = async () => {
      if (!token) {
        setIsLoadingDefaults(false);
        return;
      }
      try {
        const res = await authFetch('/api/default_params/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAssumptions(data);
        }
      } catch (err) {
        console.error('Error fetching defaults:', err);
      } finally {
        setIsLoadingDefaults(false);
      }
    };
    fetchDefaults();
  }, [token]);

  // Fetch presets
  useEffect(() => {
    const fetchPresets = async () => {
      if (!token) return;
      try {
        const res = await authFetch('/api/presets/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPresets(data);
      } catch (err) {
        console.error('Error fetching presets:', err);
      }
    };
    fetchPresets();
  }, [token]);

  // AUTO-FETCH LIVE BTC PRICE once after defaults load
  useEffect(() => {
    if (isLoadingDefaults || !token || Object.keys(assumptions).length === 0) return;

    const fetchLivePrice = async () => {
      try {
        const res = await authFetch('/api/btc_price/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const price = Math.round(data.BTC_current_market_price || 0);
          if (price > 1000) {
            setAssumptions(prev => ({
              ...prev,
              BTC_current_market_price: price,
              targetBTCPrice: price,
            }));
          }
        }
      } catch (err) {
        console.warn('Live BTC price fetch failed, using defaults');
      }
    };

    fetchLivePrice();
  }, [isLoadingDefaults, token]);

  const loadDefaults = async () => {
    if (!token) return;
    try {
      setIsLoadingDefaults(true);
      const res = await authFetch('/api/default_params/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssumptions(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Error loading defaults:', err);
    } finally {
      setIsLoadingDefaults(false);
    }
  };

  const applyPreset = (presetName: string) => {
    const p = presets[presetName];
    if (!p) return;
    setAssumptions(prev => ({
      ...prev,
      LTV_Cap: p.LTV_Cap,
      min_profit_margin: p.min_profit_margin,
      mu: p.mu,
      sigma: p.sigma,
      objective_preset: presetName,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    setAssumptions(prev => ({
      ...prev,
      [name]: isNaN(numValue) ? value : numValue,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAssumptions(prev => ({ ...prev, [name]: checked }));
  };

  const toggleObjective = (key: keyof ObjectiveSwitches) => {
    setAssumptions(prev => ({
      ...prev,
      objective_switches: {
        ...prev.objective_switches,
        [key]: !prev.objective_switches?.[key]
      },
    }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Not authenticated');

    setIsLoading(true);
    try {
      const lockRes = await authFetch('/api/lock_snapshot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, assumptions }),
      });
      const lockData = await lockRes.json();
      if (!lockData.snapshot_id) throw new Error(lockData.error || 'Snapshot failed');

      const calcRes = await authFetch('/api/calculate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          snapshot_id: lockData.snapshot_id,
          format: 'json',
          use_live: false,
          seed: 42,
          use_variance_reduction: assumptions.use_variance_reduction,
          paths: assumptions.paths,
        }),
      });

      const result = await calcRes.json();
      if (result.error) throw new Error(result.error);
      onCalculationComplete(result);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingDefaults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parameters...</p>
        </div>
      </div>
    );
  }

  if (Object.keys(assumptions).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load assumptions data.</p>
          <button onClick={loadDefaults} className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Treasury Risk Calculator</h1>
          <button
            onClick={loadDefaults}
            disabled={isLoadingDefaults}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
          >
            Reload Defaults
          </button>
        </div>

        <form onSubmit={runSimulation} className="space-y-10">

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow border">
              <label className="block text-lg font-semibold mb-3">Calculation Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value as any)} className="w-full px-4 py-3 border rounded-lg">
                <option value="pro-forma">Pro-Forma</option>
                <option value="public">Public Company</option>
                <option value="private">Private Company</option>
              </select>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <label className="block text-lg font-semibold mb-3">Primary Funding Structure</label>
              <select name="structure" value={assumptions.structure || ''} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                <option value="Loan">BTC-Backed Loan</option>
                <option value="Convertible">Convertible Note</option>
                <option value="PIPE">PIPE</option>
                <option value="ATM">ATM Equity Line</option>
              </select>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <label className="block text-lg font-semibold mb-3">Risk Preset</label>
              <div className="flex gap-3 flex-wrap">
                {['Defensive', 'Balanced', 'Growth'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`px-6 py-3 rounded-lg font-medium transition ${assumptions.objective_preset === p ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">

            <CollapsibleSection 
              title="Bitcoin & Market" 
              sectionId="bitcoin-market"
              isExpanded={expandedSections['bitcoin-market']}
              onToggle={toggleSection}
            >
              <Input label="Current BTC Price ($)" name="BTC_current_market_price" value={assumptions.BTC_current_market_price || 0} onChange={handleChange} tooltip="Current market price of Bitcoin in USD." />
              <Input label="Target BTC Price ($)" name="targetBTCPrice" value={assumptions.targetBTCPrice || 0} onChange={handleChange} tooltip="Expected target price of Bitcoin at the end of the time horizon." />
              <Input label="BTC Treasury" name="BTC_treasury" value={assumptions.BTC_treasury || 0} onChange={handleChange} tooltip="The amount of Bitcoin currently held in the company's treasury." />
              <Input label="Issue Price ($)" name="IssuePrice" value={assumptions.IssuePrice || 0} onChange={handleChange} tooltip="The price at which new securities are issued." />
              <Input label="Drift (μ)" name="mu" value={assumptions.mu || 0} step="0.01" onChange={handleChange} tooltip="Expected annual return (drift) of Bitcoin." />
              <Input label="Volatility (σ)" name="sigma" value={assumptions.sigma || 0} step="0.01" onChange={handleChange} tooltip="Annualized volatility of Bitcoin returns." />
              <Input label="Time Horizon (y)" name="t" value={assumptions.t || 0} step="0.1" onChange={handleChange} tooltip="Time horizon for the simulation in years." />
              <Input label="Dividend Yield δ" name="delta" value={assumptions.delta || 0} step="0.01" onChange={handleChange} tooltip="Dividend yield for Bitcoin (usually 0 for non-dividend assets)." />
              <Input label="Manual IV" name="manual_iv" value={assumptions.manual_iv || 0} step="0.01" onChange={handleChange} tooltip="Manual implied volatility override for option pricing." />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Company Financials" 
              sectionId="company-financials"
              isExpanded={expandedSections['company-financials']}
              onToggle={toggleSection}
            >
              <Input label="Initial Equity Value ($)" name="initial_equity_value" value={assumptions.initial_equity_value || 0} onChange={handleChange} tooltip="Initial market value of the company's equity." />
              <Input label="Initial Cash ($)" name="initial_cash" value={assumptions.initial_cash || 0} onChange={handleChange} tooltip="Initial cash balance of the company." />
              <Input label="Shares Basic" name="shares_basic" value={assumptions.shares_basic || 0} onChange={handleChange} tooltip="Number of basic shares outstanding." />
              <Input label="Shares FD" name="shares_fd" value={assumptions.shares_fd || 0} onChange={handleChange} tooltip="Number of fully diluted shares." />
              <Input label="Monthly OpEx ($)" name="opex_monthly" value={assumptions.opex_monthly || 0} onChange={handleChange} tooltip="Monthly operating expenses." />
              <Input label="Tax Rate (%)" name="tax_rate" value={(assumptions.tax_rate || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, tax_rate: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Corporate tax rate as a percentage." />
              <Input label="NOLs ($)" name="nols" value={assumptions.nols || 0} onChange={handleChange} tooltip="Net operating losses carryforward." />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Funding Parameters" 
              sectionId="funding-parameters"
              isExpanded={expandedSections['funding-parameters']}
              onToggle={toggleSection}
            >
              <Input label="Loan Principal ($)" name="LoanPrincipal" value={assumptions.LoanPrincipal || 0} onChange={handleChange} tooltip="Principal amount of the loan." />
              <Input label="New Equity Raised ($)" name="new_equity_raised" value={assumptions.new_equity_raised || 0} onChange={handleChange} tooltip="Amount of new equity to be raised." />
              <Input label="Cost of Debt (%)" name="cost_of_debt" value={(assumptions.cost_of_debt || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, cost_of_debt: parseFloat(e.target.value) / 100 }))} step="0.1" tooltip="Annual cost of debt as a percentage." />
              <Input label="LTV Cap (%)" name="LTV_Cap" value={(assumptions.LTV_Cap || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, LTV_Cap: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Maximum loan-to-value ratio cap." />
              <Input label="PIPE Discount (%)" name="pipe_discount" value={(assumptions.pipe_discount || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, pipe_discount: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Discount applied to PIPE transactions." />
              <Input label="ADV 30d ($)" name="adv_30d" value={assumptions.adv_30d || 0} onChange={handleChange} tooltip="Average daily volume over the last 30 days." />
              <Input label="ATM % of ADV" name="atm_pct_adv" value={(assumptions.atm_pct_adv || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, atm_pct_adv: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Percentage of ADV for ATM equity issuance." />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Risk & Collateral" 
              sectionId="risk-collateral"
              isExpanded={expandedSections['risk-collateral']}
              onToggle={toggleSection}
            >
              <Input label="Haircut H0 (%)" name="haircut_h0" value={(assumptions.haircut_h0 || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, haircut_h0: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Base haircut percentage for collateral." />
              <Input label="Haircut Alpha" name="haircut_alpha" value={assumptions.haircut_alpha || 0} step="0.01" onChange={handleChange} tooltip="Sensitivity of haircut to volatility." />
              <Input label="Liquidation Penalty (bps)" name="liquidation_penalty_bps" value={assumptions.liquidation_penalty_bps || 0} onChange={handleChange} tooltip="Penalty in basis points for forced liquidation." />
              <Input label="Cure Period (days)" name="cure_period_days" value={assumptions.cure_period_days || 0} onChange={handleChange} tooltip="Number of days to cure a breach before liquidation." />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Hedging" 
              sectionId="hedging"
              isExpanded={expandedSections['hedging']}
              onToggle={toggleSection}
            >
              <div className="mb-4">
                <label className="block font-medium mb-2">Hedge Policy</label>
                <select name="hedge_policy" value={assumptions.hedge_policy || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                  <option value="none">None</option>
                  <option value="protective_put">Protective Put</option>
                </select>
              </div>
              <Input label="Hedge Intensity (%)" name="hedge_intensity" value={(assumptions.hedge_intensity || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, hedge_intensity: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Percentage of portfolio to hedge." />
              <Input label="Hedge Tenor (days)" name="hedge_tenor_days" value={assumptions.hedge_tenor_days || 0} onChange={handleChange} tooltip="Duration of the hedge in days." />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Constraints & Objectives" 
              sectionId="constraints-objectives"
              isExpanded={expandedSections['constraints-objectives']}
              onToggle={toggleSection}
            >
              <Input label="Max Dilution (%)" name="max_dilution" value={(assumptions.max_dilution || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, max_dilution: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Maximum allowed dilution percentage." />
              <Input label="Min Runway (months)" name="min_runway_months" value={assumptions.min_runway_months || 0} onChange={handleChange} tooltip="Minimum required cash runway in months." />
              <Input label="Max LTV Breach Prob (%)" name="max_breach_prob" value={(assumptions.max_breach_prob || 0) * 100} onChange={e => setAssumptions(p => ({ ...p, max_breach_prob: parseFloat(e.target.value) / 100 }))} step="1" tooltip="Maximum probability of LTV breach." />
              <div className="pt-4">
                <h3 className="font-medium mb-3">Optimization Objectives</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(assumptions.objective_switches || {}).map(key => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={assumptions.objective_switches?.[key as keyof ObjectiveSwitches] || false}
                        onChange={() => toggleObjective(key as keyof ObjectiveSwitches)}
                        className="w-5 h-5 text-orange-500 rounded"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CollapsibleSection>

          </div>

          <div className="flex justify-center mt-12">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-16 py-6 text-2xl font-bold text-white rounded-xl shadow-lg transition ${isLoading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {isLoading ? 'Running Simulation...' : 'Run Optimization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  sectionId: string;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
  children: React.ReactNode;
}> = ({ title, sectionId, isExpanded, onToggle, children }) => (
  <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${
    isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-16 opacity-90'
  } overflow-hidden`}>
    <button
      type="button"
      onClick={() => onToggle(sectionId)}
      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
    >
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div className={`transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
      <div className="px-6 pb-6 space-y-4">
        {children}
      </div>
    </div>
  </div>
);

const Input: React.FC<{
  label: string;
  name: string;
  value: number | string;
  step?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltip?: string;
}> = ({ label, name, value, step = 'any', onChange, tooltip }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 flex items-center">
      {label}
      {tooltip && (
        <span className="ml-2 text-gray-400 cursor-help text-xs w-4 h-4 flex items-center justify-center rounded-full border border-gray-400" title={tooltip}>
          ?
        </span>
      )}
    </label>
    <input
      type="number"
      name={name}
      value={value}
      step={step}
      onChange={onChange}
      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
);

const Checkbox: React.FC<{ label: string; name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, checked, onChange }) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-5 h-5 text-orange-500 rounded" />
    <span>{label}</span>
  </label>
);

export default Assumptions;