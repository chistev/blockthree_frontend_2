import React, { useEffect, useState } from 'react';
import { Card, SectionTitle, Pill, Button, Stat } from './Primitives';
import { pct, num, months, formatMoney, riskTone, structureLabel } from '../utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, CartesianGrid, Legend, ScatterChart, Scatter, ReferenceLine
} from 'recharts';

interface Candidate {
  type: string;
  params: {
    structure?: string;
    amount?: number;
    rate?: number;
    ltv_cap?: number;
    premium?: number;
  };
  metrics: {
    dilution?: { avg_dilution?: number };
    ltv?: { exceed_prob?: number };
    term_sheet?: {
      slippage?: number;
      profit_margin?: number;
      roe_uplift?: number;
      savings?: number;
    };
    scenario_metrics?: { bull?: { nav?: number }; bear?: { ltv_exceed_prob?: number } };
    distribution_metrics?: {
      expected_shortfall?: number;
      bull_market_prob?: number;
      bear_market_prob?: number;
      stress_test_prob?: number;
      var_95?: number;
      price_distribution?: { mean?: number };
    };
    nav?: { avg_nav?: number; erosion_prob?: number; cvar?: number };
    roe?: { avg_roe?: number; sharpe?: number };
    runway?: { dist_mean?: number };
    cure_success_rate?: number;
    hedge_pnl_avg?: number;
  };
}

interface DecisionViewProps {
  results: {
    candidates?: Candidate[];
    nav?: { avg_nav?: number; erosion_prob?: number; cvar?: number; nav_paths?: number[] };
    ltv?: { exceed_prob?: number; ltv_paths?: number[] };
    dilution?: { avg_dilution?: number; base_dilution?: number; dilution_paths?: number[] };
    roe?: { avg_roe?: number; sharpe?: number };
    runway?: { dist_mean?: number; p95?: number };
    cure_success_rate?: number;
    hedge_pnl_avg?: number;
    distribution_metrics?: { bull_market_prob?: number };
    scenario_metrics?: { [key: string]: { nav?: number } };
  };
  assumptions: { LTV_Cap?: number; LoanPrincipal?: number };
  setPage: (page: string) => void;
  debouncedWhatIf: (params: { param: string; value: number }) => void;
  isWhatIfOpen: boolean;
  setIsWhatIfOpen: (open: boolean) => void;
  handleExport: (format: string) => void;
  fetchAudit: () => Promise<void>;
  auditTrail: any[];
}

function DecisionView({
  results,
  assumptions,
  setPage,
  debouncedWhatIf,
  isWhatIfOpen,
  setIsWhatIfOpen,
  handleExport,
  fetchAudit,
  auditTrail,
}: DecisionViewProps) {
  useEffect(() => {
    async function doFetchAudit() {
      await fetchAudit();
    }
    doFetchAudit();
  }, [fetchAudit]);

  const candidates = results?.candidates || [];
  const [expanded, setExpanded] = useState<number | null>(null);

  // Use results.metrics for calculate endpoint; fallback to results for what_if
  const nav = results?.metrics?.nav || results?.nav || {};
  const ltv = results?.metrics?.ltv || results?.ltv || {};
  const dil = results?.metrics?.dilution || results?.dilution || {};
  const roe = results?.metrics?.roe || results?.roe || {};
  const run = results?.metrics?.runway || results?.runway || {};

  // Holistic Comparison Table with guarded metrics
  const comparisonData = candidates.map((cand: Candidate, i: number) => {
    console.log(`Candidate ${i} metrics.nav.avg_nav:`, cand?.metrics?.nav?.avg_nav);
    const m = cand?.metrics || {};
    const nav = m.nav || {};
    const ltv = m.ltv || {};
    const dil = m.dilution || {};
    const roe = m.roe || {};
    const run = m.runway || {};
    const ts = m.term_sheet || {};
    const sm = m.scenario_metrics || {};
    const dm = m.distribution_metrics || {};
    const row: any = {
      Type: cand.type,
      Structure: cand.params?.structure ?? '',
    };
    if (nav.avg_nav != null) row['NAV Avg'] = formatMoney(nav.avg_nav);
    if (nav.erosion_prob != null) row['Erosion Prob'] = pct(nav.erosion_prob);
    if (nav.cvar != null) row['CVaR'] = formatMoney(nav.cvar);
    if (ltv.exceed_prob != null) row['LTV Breach Prob'] = pct(ltv.exceed_prob);
    if (dil.avg_dilution != null) row['Dilution Avg'] = pct(dil.avg_dilution);
    if (roe.avg_roe != null) row['ROE Avg'] = pct(roe.avg_roe);
    if (roe.sharpe != null) row['Sharpe'] = num(roe.sharpe);
    if (run.dist_mean != null) row['Runway Mean'] = months(run.dist_mean);
    if (m.cure_success_rate != null) row['Cure Success'] = pct(m.cure_success_rate);
    if (m.hedge_pnl_avg != null) row['Hedge PnL Avg'] = formatMoney(m.hedge_pnl_avg);
    if (sm?.bull?.nav != null) row['Bull NAV'] = formatMoney(sm.bull.nav);
    if (sm?.bear?.ltv_exceed_prob != null) row['Bear Breach Prob'] = pct(sm.bear.ltv_exceed_prob);
    if (dm?.expected_shortfall != null) row['Stress ES'] = formatMoney(dm.expected_shortfall);
    if (dm?.bull_market_prob != null) row['Bull Prob'] = pct(dm.bull_market_prob);
    if (dm?.bear_market_prob != null) row['Bear Prob'] = pct(dm.bear_market_prob);
    if (dm?.stress_test_prob != null) row['Stress Prob'] = pct(dm.stress_test_prob);
    if (dm?.var_95 != null) row['VaR 95'] = formatMoney(dm.var_95);
    if (dm?.price_distribution?.mean != null) row['Price Mean'] = formatMoney(dm.price_distribution.mean);
    if (ts?.slippage != null && cand.params?.structure === 'ATM') row['Slippage'] = pct(ts.slippage);
    if (cand.params?.structure === 'Convertible' && cand.params?.premium != null) row['Premium'] = cand.params.premium;
    if (ts?.profit_margin != null) row['Profit Margin'] = pct(ts.profit_margin);
    if (ts?.roe_uplift != null) row['ROE Uplift'] = pct(ts.roe_uplift / 100);
    if (ts?.savings != null) row['Savings'] = formatMoney(ts.savings);
    return row;
  });

  return (
    <div className="space-y-6">
      <SectionTitle>Decision View</SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <>
          <Stat
            label="NAV Avg"
            value={formatMoney(nav.avg_nav ?? 0)}
            hint={nav.erosion_prob != null ? `Erosion: ${pct(nav.erosion_prob)}` : undefined}
            tone={nav.erosion_prob && nav.erosion_prob > 0.1 ? 'warn' : 'good'}
          />
          <Stat
            label="LTV Breach"
            value={pct(ltv.exceed_prob ?? 0)}
            hint={nav.cvar != null ? `CVaR: ${formatMoney(nav.cvar)}` : undefined}
            tone={ltv.exceed_prob && ltv.exceed_prob > 0.1 ? 'warn' : 'good'}
          />
          <Stat
            label="Dilution Avg"
            value={pct(dil.avg_dilution ?? 0)}
            hint={dil.base_dilution != null ? `Base: ${pct(dil.base_dilution)}` : undefined}
          />
          <Stat
            label="ROE Avg"
            value={pct(roe.avg_roe ?? 0)}
            hint={roe.sharpe != null ? `Sharpe: ${num(roe.sharpe)}` : undefined}
            tone={roe.avg_roe && roe.avg_roe > 0.1 ? 'good' : 'neutral'}
          />
          <Stat
            label="Runway Mean"
            value={months(run.dist_mean ?? 0)}
            hint={run.p95 != null ? `P95: ${months(run.p95)}` : undefined}
          />
          <Stat
            label="Cure Success"
            value={pct(results?.metrics?.cure_success_rate ?? results?.cure_success_rate ?? 0)}
          />
          <Stat
            label="Hedge PnL"
            value={formatMoney(results?.metrics?.hedge_pnl_avg ?? results?.hedge_pnl_avg ?? 0)}
          />
          <Stat
            label="Bull Prob"
            value={pct(results?.metrics?.distribution_metrics?.bull_market_prob ?? results?.distribution_metrics?.bull_market_prob ?? 0)}
          />
        </>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
          <thead className="bg-emerald-500 text-white">
            <tr>
              {Object.keys(comparisonData[0] || {}).map(key => (
                <th key={key} className="p-2 text-[14px]">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-zinc-700">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="p-2 text-[14px]">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
            {comparisonData.length === 0 && (
              <tr>
                <td colSpan={20} className="p-2 text-center text-gray-500">
                  No candidates available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {candidates.map((cand: Candidate, i: number) => {
          const dil = cand.metrics?.dilution || {};
          const ltv = cand.metrics?.ltv || {};
          const term_sheet = cand.metrics?.term_sheet || {};
          const risk = riskTone({ ltvProb: ltv.exceed_prob, avgDilution: dil.avg_dilution });
          const tag = structureLabel(cand.params || {});
          return (
            <Card key={i} className={expanded === i ? 'border-emerald-500 border-2' : ''}>
              <div
                className={`h-1 mb-2 rounded ${
                  risk.tone === 'red' ? 'bg-red-500' : risk.tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <div className="flex items-center justify-between">
                <h3 className="font-inter-tight text-[18px]">Option {String.fromCharCode(65 + i)}</h3>
                <Pill tone={tag.tone}>{tag.label}</Pill>
              </div>
              <p className="text-[14px]">Amount: {formatMoney(cand.params?.amount ?? 0)}</p>
              <p className="text-[14px]">Rate: {pct(cand.params?.rate ?? 0)}</p>
              <p className="text-[14px]">LTV Cap: {cand.params?.ltv_cap ?? 'N/A'}</p>
              {cand.params?.structure === 'ATM' && (
                <p className="text-[14px]">Slippage: {pct(term_sheet.slippage ?? 0)}</p>
              )}
              {cand.params?.structure === 'Convertible' && (
                <p className="text-[14px]">Premium: {cand.params?.premium ?? 'N/A'}</p>
              )}
              <p className="text-[14px]">Profit Margin: {pct(term_sheet.profit_margin ?? 0)}</p>
              <p className="text-[14px]">ROE Uplift: {pct((term_sheet.roe_uplift ?? 0) / 100)}</p>
              <p className="text-[14px]">Savings: {formatMoney(term_sheet.savings ?? 0)}</p>
              <div className="mt-2 flex items-center gap-2">
                <Pill tone={risk.tone === 'red' ? 'red' : risk.tone === 'amber' ? 'amber' : 'green'}>{risk.pill}</Pill>
                {ltv.exceed_prob != null && (
                  <span className="text-[12px] text-gray-500">LTV&gt;Cap {pct(ltv.exceed_prob)}</span>
                )}
              </div>
              <Button onClick={() => setExpanded(expanded === i ? null : i)} variant="ghost" className="mt-2">
                Toggle Details
              </Button>
              {expanded === i && <TermSheet results={cand.metrics} setPage={setPage} handleExport={handleExport} />}
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(results?.metrics?.nav?.nav_paths || results?.nav?.nav_paths || []).map((v: number, i: number) => ({ time: i, nav: v }))}>
              <XAxis dataKey="time" tickFormatter={num} />
              <YAxis tickFormatter={formatMoney} />
              <Tooltip formatter={formatMoney} />
              <Line type="monotone" dataKey="nav" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(results?.metrics?.ltv?.ltv_paths || results?.ltv?.ltv_paths || []).map((ltv: number, i: number) => ({ index: i, ltv }))}>
              <XAxis dataKey="index" hide />
              <YAxis tickFormatter={pct} />
              <Tooltip formatter={pct} />
              <Area type="monotone" dataKey="ltv" stroke="#82ca9d" fill="#82ca9d" />
              <ReferenceLine y={assumptions.LTV_Cap || 0} stroke="red" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              data={(results?.metrics?.dilution?.dilution_paths || results?.dilution?.dilution_paths || []).map((d: number, i: number) => ({
                debt: (assumptions.LoanPrincipal || 0) * (i / ((results?.metrics?.ltv?.ltv_paths || results?.ltv?.ltv_paths || []).length || 1)),
                dil: d,
              }))}
            >
              <XAxis type="number" dataKey="debt" name="Debt" tickFormatter={formatMoney} />
              <YAxis type="number" dataKey="dil" name="Dilution" tickFormatter={pct} />
              <Tooltip formatter={pct} />
              <Scatter name="Dil vs Debt" dataKey="dil" fill="#ff7300" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(results?.metrics?.scenario_metrics || results?.scenario_metrics || {}).map(([k, v]: [string, any]) => ({
                name: k,
                delta: (v as any).nav || 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatMoney} />
              <Tooltip formatter={formatMoney} />
              <Legend />
              <Bar dataKey="delta" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex space-x-4">
        <Button onClick={() => setIsWhatIfOpen(true)} variant="primary">
          What-If / Stress
        </Button>
        <Button onClick={() => handleExport('pdf')} variant="primary">
          Export PDF
        </Button>
        <Button onClick={() => setPage('audit')} variant="primary">
          Audit
        </Button>
      </div>
    </div>
  );
}

function TermSheet({ results, setPage, handleExport }: { results: any; setPage: (page: string) => void; handleExport: (format: string) => void }) {
  const ts = results?.term_sheet || {};
  const bi = results?.business_impact || {};
  const sm = results?.scenario_metrics || {};
  const dm = results?.distribution_metrics || {};

  return (
    <Card>
      <SectionTitle right={<Button onClick={() => handleExport('pdf')} variant="ghost">Export</Button>}>
        Term Sheet
      </SectionTitle>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="p-2 text-[14px]">Structure</td>
            <td className="p-2 text-[14px]">{ts.structure ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Amount</td>
            <td className="p-2 text-[14px]">{formatMoney(ts.amount) ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Rate</td>
            <td className="p-2 text-[14px]">{pct(ts.rate) ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Term</td>
            <td className="p-2 text-[14px]">{ts.term ? `${ts.term} years` : 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">LTV Cap</td>
            <td className="p-2 text-[14px]">{ts.ltv_cap ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Collateral Value</td>
            <td className="p-2 text-[14px]">{formatMoney(ts.collateral) ?? 'N/A'}</td>
          </tr>
          {ts.structure === 'Convertible' && (
            <tr>
              <td className="p-2 text-[14px]">Conversion Premium</td>
              <td className="p-2 text-[14px]">{ts.conversion_premium ?? 'N/A'}</td>
            </tr>
          )}
          <tr>
            <td className="p-2 text-[14px]">BTC Bought</td>
            <td className="p-2 text-[14px]">{ts.btc_bought ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Total BTC Treasury</td>
            <td className="p-2 text-[14px]">{ts.total_btc_treasury ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Savings vs. Base</td>
            <td className="p-2 text-[14px]">{formatMoney(ts.savings) ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">ROE Uplift</td>
            <td className="p-2 text-[14px]">{pct((ts.roe_uplift ?? 0) / 100) ?? 'N/A'}</td>
          </tr>
          <tr>
            <td className="p-2 text-[14px]">Profit Margin</td>
            <td className="p-2 text-[14px]">{pct(ts.profit_margin) ?? 'N/A'}</td>
          </tr>
          {ts.structure === 'ATM' && (
            <tr>
              <td className="p-2 text-[14px]">Slippage Est.</td>
              <td className="p-2 text-[14px]">{pct(ts.slippage) ?? 'N/A'}</td>
            </tr>
          )}
        </tbody>
      </table>
      <SectionTitle>Business Impact</SectionTitle>
      <p className="text-[14px]">BTC Could Buy: {bi.btc_could_buy ?? 'N/A'}</p>
      <p className="text-[14px]">Savings: {formatMoney(bi.savings) ?? 'N/A'}</p>
      <p className="text-[14px]">Kept Money: {formatMoney(bi.kept_money) ?? 'N/A'}</p>
      <p className="text-[14px]">ROE Uplift: {pct((bi.roe_uplift ?? 0) / 100) ?? 'N/A'}</p>
      <p className="text-[14px]">Reduced Risk: {bi.reduced_risk ?? 'N/A'}</p>
      <p className="text-[14px]">Profit Margin: {pct(bi.profit_margin) ?? 'N/A'}</p>
      <SectionTitle>Scenario Metrics</SectionTitle>
      <p className="text-[14px]">
        Bull NAV: {formatMoney(sm.bull?.nav) ?? 'N/A'} (Prob: {pct(dm.bull_market_prob) ?? 'N/A'})
      </p>
      <p className="text-[14px]">
        Base ROE: {pct(sm.base?.roe) ?? 'N/A'}
      </p>
      <p className="text-[14px]">
        Bear Breach: {pct(sm.bear?.ltv_exceed_prob) ?? 'N/A'} (Prob: {pct(dm.bear_market_prob) ?? 'N/A'})
      </p>
      <p className="text-[14px]">
        Stress ES: {formatMoney(dm.expected_shortfall) ?? 'N/A'} (Prob: {pct(dm.stress_test_prob) ?? 'N/A'})
      </p>
      <div className="mt-4 flex space-x-4">
        <Button onClick={() => setPage('decision')} variant="ghost">
          Back
        </Button>
        <Button onClick={() => handleExport('pdf')} variant="primary">
          Export
        </Button>
      </div>
    </Card>
  );
}

export default DecisionView;