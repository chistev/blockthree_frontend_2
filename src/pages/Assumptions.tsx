import React, { useState, useEffect } from 'react';

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
  const [assumptions, setAssumptions] = useState<AssumptionsData>({
    BTC_treasury: 1000,
    BTC_purchased: 0,
    BTC_current_market_price: 117000,
    targetBTCPrice: 117000,
    IssuePrice: 117000,
    mu: 0.45,
    sigma: 0.55,
    t: 1.0,
    delta: 0.08,
    initial_equity_value: 90000000,
    new_equity_raised: 5000000,
    LoanPrincipal: 25000000,
    cost_of_debt: 0.06,
    dilution_vol_estimate: 0.55,
    LTV_Cap: 0.50,
    beta_ROE: 2.5,
    expected_return_btc: 0.45,
    risk_free_rate: 0.04,
    vol_mean_reversion_speed: 0.5,
    long_run_volatility: 0.5,
    paths: 2000,
    jump_intensity: 0.10,
    jump_mean: 0.0,
    jump_volatility: 0.20,
    min_profit_margin: 0.0,
    annual_burn_rate: 12000000,
    initial_cash: 10000000,
    shares_basic: 1000000,
    shares_fd: 1100000,
    opex_monthly: 1000000,
    tax_rate: 0.20,
    nols: 5000000,
    adv_30d: 1000000,
    atm_pct_adv: 0.05,
    pipe_discount: 0.10,
    fees_ecm: 0.03,
    fees_oid: 0.02,
    cure_period_days: 30,
    haircut_h0: 0.10,
    haircut_alpha: 0.05,
    liquidation_penalty_bps: 500,
    hedge_policy: 'none',
    hedge_intensity: 0.20,
    hedge_tenor_days: 90,
    manual_iv: 0.55,
    structure: 'Loan',
    objective_preset: 'Balanced',
    cvar_on: true,
    max_dilution: 0.25,
    min_runway_months: 6,
    max_breach_prob: 0.25,
    use_variance_reduction: true,
    bootstrap_samples: 100,
    opex_stress_volatility: 0.35,
    objective_switches: {
      max_btc: true,
      min_dilution: true,
      min_ltv_breach: true,
      max_runway: true,
      max_nav: false,
      min_wacc: false,
    },
    nsga_pop_size: 32,
    nsga_n_gen: 25,
    enable_hybrid: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [presets, setPresets] = useState<any>({});
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchPresets = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:8000/api/pres91ets/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPresets(data);
      } catch (err) {}
    };
    fetchPresets();
  }, [token]);

  const loadDefaults = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/default_params/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssumptions(prev => ({ ...prev, ...data }));
    } catch (err) {}
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
      objective_switches: { ...prev.objective_switches, [key]: !prev.objective_switches[key] },
    }));
  };

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Not authenticated');

    setIsLoading(true);
    try {
      const lockRes = await fetch('http://localhost:8000/api/lock_snapshot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, assumptions }),
      });
      const lockData = await lockRes.json();
      if (!lockData.snapshot_id) throw new Error(lockData.error || 'Snapshot failed');

      const calcRes = await fetch('http://localhost:8000/api/calculate/', {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Treasury Risk Calculator</h1>
          <button onClick={loadDefaults} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
            Load Defaults
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
              <select name="structure" value={assumptions.structure} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
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
                  <button key={p} type="button" onClick={() => applyPreset(p)}
                    className={`px-6 py-3 rounded-lg font-medium transition ${assumptions.objective_preset === p ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">

            <Section title="Bitcoin & Market">
              <Input label="BTC Treasury" name="BTC_treasury" value={assumptions.BTC_treasury} onChange={handleChange} />
              <Input label="Current BTC Price ($)" name="BTC_current_market_price" value={assumptions.BTC_current_market_price} onChange={handleChange} />
              <Input label="Target BTC Price ($)" name="targetBTCPrice" value={assumptions.targetBTCPrice} onChange={handleChange} />
              <Input label="Issue Price ($)" name="IssuePrice" value={assumptions.IssuePrice} onChange={handleChange} />
              <Input label="Drift (μ)" name="mu" value={assumptions.mu} step="0.01" onChange={handleChange} />
              <Input label="Volatility (σ)" name="sigma" value={assumptions.sigma} step="0.01" onChange={handleChange} />
              <Input label="Time Horizon (y)" name="t" value={assumptions.t} step="0.1" onChange={handleChange} />
              <Input label="Dividend Yield δ" name="delta" value={assumptions.delta} step="0.01" onChange={handleChange} />
              <Input label="Manual IV" name="manual_iv" value={assumptions.manual_iv} step="0.01" onChange={handleChange} />
            </Section>

            <Section title="Company Financials">
              <Input label="Initial Equity Value ($)" name="initial_equity_value" value={assumptions.initial_equity_value} onChange={handleChange} />
              <Input label="Initial Cash ($)" name="initial_cash" value={assumptions.initial_cash} onChange={handleChange} />
              <Input label="Shares Basic" name="shares_basic" value={assumptions.shares_basic} onChange={handleChange} />
              <Input label="Shares FD" name="shares_fd" value={assumptions.shares_fd} onChange={handleChange} />
              <Input label="Monthly OpEx ($)" name="opex_monthly" value={assumptions.opex_monthly} onChange={handleChange} />
              <Input label="Tax Rate (%)" name="tax_rate" value={assumptions.tax_rate * 100} onChange={e => setAssumptions(p => ({ ...p, tax_rate: parseFloat(e.target.value) / 100 }))} step="1" />
              <Input label="NOLs ($)" name="nols" value={assumptions.nols} onChange={handleChange} />
            </Section>

            <Section title="Funding Parameters">
              <Input label="Loan Principal ($)" name="LoanPrincipal" value={assumptions.LoanPrincipal} onChange={handleChange} />
              <Input label="New Equity Raised ($)" name="new_equity_raised" value={assumptions.new_equity_raised} onChange={handleChange} />
              <Input label="Cost of Debt (%)" name="cost_of_debt" value={assumptions.cost_of_debt * 100} onChange={e => setAssumptions(p => ({ ...p, cost_of_debt: parseFloat(e.target.value) / 100 }))} step="0.1" />
              <Input label="LTV Cap (%)" name="LTV_Cap" value={assumptions.LTV_Cap * 100} onChange={e => setAssumptions(p => ({ ...p, LTV_Cap: parseFloat(e.target.value) / 100 }))} step="1" />
              <Input label="PIPE Discount (%)" name="pipe_discount" value={assumptions.pipe_discount * 100} onChange={e => setAssumptions(p => ({ ...p, pipe_discount: parseFloat(e.target.value) / 100 }))} step="1" />
              <Input label="ADV 30d ($)" name="adv_30d" value={assumptions.adv_30d} onChange={handleChange} />
              <Input label="ATM % of ADV" name="atm_pct_adv" value={assumptions.atm_pct_adv * 100} onChange={e => setAssumptions(p => ({ ...p, atm_pct_adv: parseFloat(e.target.value) / 100 }))} step="1" />
            </Section>

            <Section title="Risk & Collateral">
              <Input label="Haircut H0 (%)" name="haircut_h0" value={assumptions.haircut_h0 * 100} onChange={e => setAssumptions(p => ({ ...p, haircut_h0: parseFloat(e.target.value) / 100 }))} step="1" />
              <Input label="Haircut Alpha" name="haircut_alpha" value={assumptions.haircut_alpha} step="0.01" onChange={handleChange} />
              <Input label="Liquidation Penalty (bps)" name="liquidation_penalty_bps" value={assumptions.liquidation_penalty_bps} onChange={handleChange} />
              <Input label="Cure Period (days)" name="cure_period_days" value={assumptions.cure_period_days} onChange={handleChange} />
            </Section>

            <Section title="Hedging">
              <div className="mb-4">
                <label className="block font-medium mb-2">Hedge Policy</label>
                <select name="hedge_policy" value={assumptions.hedge_policy} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                  <option value="none">None</option>
                  <option value="protective_put">Protective Put</option>
                </select>
              </div>
              <Input label="Hedge Intensity (%)" name="hedge_intensity" value={assumptions.hedge_intensity * 100} onChange={e => setAssumptions(p => ({ ...p, hedge_intensity: parseFloat(e.target.value) / 100 }))} step="1" />
              <Input label="Hedge Tenor (days)" name="hedge_tenor_days" value={assumptions.hedge_tenor_days} onChange={handleChange} />
            </Section>

            <Section title="Constraints & Objectives">
              <Input label="Max Dilution (%)" name="max_dilution" value={assumptions.max_dilution * 100} onChange={e => setAssumptions(p => ({ ...p, max_dilution: parseFloat(e.target.value) / 100 }))} step="1" />
              <Input label="Min Runway (months)" name="min_runway_months" value={assumptions.min_runway_months} onChange={handleChange} />
              <Input label="Max LTV Breach Prob (%)" name="max_breach_prob" value={assumptions.max_breach_prob * 100} onChange={e => setAssumptions(p => ({ ...p, max_breach_prob: parseFloat(e.target.value) / 100 }))} step="1" />
              <div className="pt-4">
                <h3 className="font-medium mb-3">Optimization Objectives</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(assumptions.objective_switches).map(key => (
                    <label key={key} className="flex items-center space-x-2">
                      <input type="checkbox" checked={assumptions.objective_switches[key as keyof ObjectiveSwitches]} onChange={() => toggleObjective(key as keyof ObjectiveSwitches)} className="w-5 h-5 text-orange-500 rounded" />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Simulation Settings">
              <Input label="Paths" name="paths" value={assumptions.paths} onChange={handleChange} />
              <Input label="NSGA Pop Size" name="nsga_pop_size" value={assumptions.nsga_pop_size} onChange={handleChange} />
              <Input label="NSGA Generations" name="nsga_n_gen" value={assumptions.nsga_n_gen} onChange={handleChange} />
              <Checkbox label="Use Variance Reduction" name="use_variance_reduction" checked={assumptions.use_variance_reduction} onChange={handleCheckbox} />
              <Checkbox label="Enable Hybrid" name="enable_hybrid" checked={assumptions.enable_hybrid} onChange={handleCheckbox} />
              <Checkbox label="CVaR On" name="cvar_on" checked={assumptions.cvar_on} onChange={handleCheckbox} />
            </Section>

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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border space-y-5">
    <h2 className="text-xl font-bold text-gray-900 border-b pb-3">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input: React.FC<{
  label: string;
  name: string;
  value: number | string;
  step?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, step = 'any', onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
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