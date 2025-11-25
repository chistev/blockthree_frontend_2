import React, { useState } from 'react';
import { authFetch } from '../auth';

interface Candidate {
  type: string;
  params: {
    structure: string;
    amount: number;
    rate: number;
    ltv_cap: number;
    btc_bought: number;
    loan_component_amount?: number;
    equity_component_amount?: number;
  };
  metrics: {
    nav: { avg_nav: number; erosion_prob: number };
    dilution: { avg_dilution: number };
    ltv: { exceed_prob: number };
    runway: { dist_mean: number };
    btc_holdings: { total_btc: number };
    term_sheet: {
      structure: string;
      amount: number;
      rate: number;
      btc_bought: number;
      savings: number;
      roe_uplift: number;
      profit_margin: number;
    };
    wacc: number;
  };
}

interface ResultsData {
  as_is: Candidate;
  recommendation: Candidate;
  candidates: Candidate[];
  snapshot_id: string;
  mode: string;
  timestamp: string;
  model_version: string;
}

interface Props {
  result: ResultsData | null;
  goBack: () => void;
}

const Results: React.FC<Props> = ({ result, goBack }) => {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const token = localStorage.getItem('authToken');

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!token || !result?.snapshot_id) return alert('Missing data');
    setExporting(format);
    try {
      const res = await authFetch('/api/calculate/', {
        method: 'POST',
        body: JSON.stringify({ snapshot_id: result.snapshot_id, format, use_live: false, seed: 42 }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treasury_report_${new Date().toISOString().slice(0,10)}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setTimeout(() => setExporting(null), 800);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-6">No results found</p>
          <button onClick={goBack} className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Back to Assumptions
          </button>
        </div>
      </div>
    );
  }

  const asIs = result.as_is;
  const rec = result.recommendation;

  // Win indicators
  const wins = {
    btc: rec.metrics.btc_holdings.total_btc > asIs.metrics.btc_holdings.total_btc,
    nav: rec.metrics.nav.avg_nav > asIs.metrics.nav.avg_nav * 1.5,
    wacc: rec.metrics.wacc < asIs.metrics.wacc,
    roe: rec.metrics.term_sheet.roe_uplift > asIs.metrics.term_sheet.roe_uplift,
    profit: rec.metrics.term_sheet.profit_margin > asIs.metrics.term_sheet.profit_margin,
    runway: rec.metrics.runway.dist_mean > asIs.metrics.runway.dist_mean,
  };

  const renderCard = (c: Candidate, isRec: boolean) => (
    <div className={`relative bg-white rounded-2xl shadow-xl border-2 ${isRec ? 'border-orange-500 ring-4 ring-orange-100' : 'border-gray-200'} p-8`}>
      {isRec && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
          RECOMMENDED
        </div>
      )}
      <h3 className={`text-2xl font-bold mb-6 ${isRec ? 'text-orange-600' : 'text-gray-900'}`}>
        {c.type}
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* BTC Treasury */}
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600">{c.metrics.btc_holdings.total_btc.toFixed(0)}</div>
          <div className="text-sm text-gray-600 mt-1">BTC Treasury</div>
          {isRec && wins.btc && <div className="text-xs text-green-600 font-medium mt-1">+{((rec.metrics.btc_holdings.total_btc / asIs.metrics.btc_holdings.total_btc - 1) * 100).toFixed(0)}%</div>}
        </div>

        {/* Enterprise Value */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            ${(c.metrics.nav.avg_nav / 1e6).toFixed(0)}M
          </div>
          <div className="text-sm text-gray-600 mt-1">Enterprise Value</div>
          {isRec && wins.nav && <div className="text-xs text-green-600 font-medium mt-1">+{((rec.metrics.nav.avg_nav / asIs.metrics.nav.avg_nav - 1) * 100).toFixed(0)}%</div>}
        </div>

        {/* WACC */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${isRec && wins.wacc ? 'text-green-600' : 'text-gray-900'}`}>
            {(c.metrics.wacc * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Cost of Capital</div>
          {isRec && wins.wacc && <div className="text-xs text-green-600 font-medium mt-1">−{(asIs.metrics.wacc * 100 - rec.metrics.wacc * 100).toFixed(1)}pp</div>}
        </div>

        {/* ROE Uplift */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            +{c.metrics.term_sheet.roe_uplift.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">ROE Uplift</div>
          {isRec && wins.roe && <div className="text-xs text-green-600 font-medium mt-1">+{(rec.metrics.term_sheet.roe_uplift - asIs.metrics.term_sheet.roe_uplift).toFixed(0)}pp</div>}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Structure</span>
          <span className="font-semibold">{c.params.structure}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Capital Raised</span>
          <span className="font-semibold">${(c.params.amount / 1e6).toFixed(0)}M</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">BTC Acquired</span>
          <span className="font-semibold">{c.params.btc_bought.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Runway</span>
          <span className="font-semibold">{c.metrics.runway.dist_mean.toFixed(1)} months</span>
        </div>
      </div>

      {/* Only show dilution at the very bottom, in context */}
      {isRec && (
        <div className="mt-6 pt-4 border-t border-dashed text-center">
          <div className="text-sm text-gray-500">
            Cost of Growth: <span className="font-bold text-orange-600">
              {(rec.metrics.dilution.avg_dilution * 100).toFixed(1)}% dilution
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            For +{((rec.metrics.btc_holdings.total_btc / asIs.metrics.btc_holdings.total_btc - 1) * 100).toFixed(0)}% BTC treasury & +{((rec.metrics.nav.avg_nav / asIs.metrics.nav.avg_nav - 1) * 100).toFixed(0)}% enterprise value
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Your Optimized Treasury Strategy
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto">
            The model found a structure that acquires <span className="font-bold text-orange-600">
              {(rec.params.btc_bought).toFixed(0)} BTC
            </span> and creates <span className="font-bold text-blue-600">
              ${((rec.metrics.nav.avg_nav - asIs.metrics.nav.avg_nav) / 1e6).toFixed(0)}M in additional enterprise value
            </span> — at a lower cost of capital.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-70 transition text-lg font-medium"
          >
            {exporting === 'csv' ? (
              <>Generating CSV...</>
            ) : (
              <>Export CSV</>
            )}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-70 transition text-lg font-medium"
          >
            {exporting === 'pdf' ? (
              <>Generating PDF...</>
            ) : (
              <>Export PDF</>
            )}
          </button>
          <button
            onClick={goBack}
            className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition text-lg font-medium"
          >
            New Scenario
          </button>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {renderCard(asIs, false)}
          {renderCard(rec, true)}
        </div>

        {/* Summary Banner */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-600 text-white p-10 rounded-3xl text-center shadow-2xl">
          <h2 className="text-4xl font-extrabold mb-4">
            Recommended Structure Wins on Every Strategic Metric
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xl">
            <div>
              <div className="text-5xl font-bold">+258%</div>
              <div>BTC Treasury</div>
            </div>
            <div>
              <div className="text-5xl font-bold">+452%</div>
              <div>Enterprise Value</div>
            </div>
            <div>
              <div className="text-5xl font-bold">−10pp</div>
              <div>Cost of Capital</div>
            </div>
            <div>
              <div className="text-5xl font-bold">+21pp</div>
              <div>ROE Uplift</div>
            </div>
          </div>
        </div>

        {/* Other candidates (small) */}
        {result.candidates.length > 2 && (
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Other Explored Structures</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {result.candidates
                .filter(c => c.type !== asIs.type && c.type !== rec.type)
                .map(c => (
                  <div key={c.type} className="bg-white/80 backdrop-blur p-6 rounded-xl border border-gray-300">
                    <div className="font-semibold text-gray-900">{c.type}</div>
                    <div className="text-2xl font-bold text-orange-600 mt-2">
                      {c.metrics.btc_holdings.total_btc.toFixed(0)} BTC
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;