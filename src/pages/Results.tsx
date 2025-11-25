import React from 'react';
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
    loan_percentage?: number;
    equity_percentage?: number;
    atm_amount?: number;
    pipe_amount?: number;
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
  const token = localStorage.getItem('authToken');

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!token || !result?.snapshot_id) {
      alert('Missing authentication or snapshot ID');
      return;
    }
    try {
      const res = await authFetch('http://localhost:8000/api/calculate/', {
        method: 'POST',
        body: JSON.stringify({
          snapshot_id: result.snapshot_id,
          format,
          use_live: false,
          seed: 42,
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treasury_report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-6">No results found</p>
          <button
            onClick={goBack}
            className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Back to Assumptions
          </button>
        </div>
      </div>
    );
  }

  const renderTable = (c: Candidate) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">{c.type}</h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
        <div className="font-medium text-gray-700">Structure</div>
        <div>{c.params.structure}</div>

        <div className="font-medium text-gray-700">Amount</div>
        <div>${c.params.amount.toLocaleString()}</div>

        <div className="font-medium text-gray-700">Rate</div>
        <div>{(c.params.rate * 100).toFixed(2)}%</div>

        <div className="font-medium text-gray-700">LTV Cap</div>
        <div>{(c.params.ltv_cap * 100).toFixed(1)}%</div>

        <div className="font-medium text-gray-700">BTC Bought</div>
        <div>{c.params.btc_bought.toFixed(1)}</div>

        {c.params.loan_component_amount !== undefined && (
          <>
            <div className="font-medium text-gray-700">Loan Component</div>
            <div>${c.params.loan_component_amount.toLocaleString()}</div>

            <div className="font-medium text-gray-700">Equity Component</div>
            <div>${c.params.equity_component_amount?.toLocaleString() ?? 0}</div>

            <div className="font-medium text-gray-700">Loan %</div>
            <div>{(c.params.loan_percentage! * 100).toFixed(1)}%</div>

            <div className="font-medium text-gray-700">Equity %</div>
            <div>{(c.params.equity_percentage! * 100).toFixed(1)}%</div>
          </>
        )}

        <div className="font-medium text-gray-700">NAV Mean</div>
        <div>${c.metrics.nav.avg_nav.toLocaleString()}</div>

        <div className="font-medium text-gray-700">NAV Erosion Prob</div>
        <div>{(c.metrics.nav.erosion_prob * 100).toFixed(2)}%</div>

        <div className="font-medium text-gray-700">Dilution Avg</div>
        <div>{(c.metrics.dilution.avg_dilution * 100).toFixed(2)}%</div>

        <div className="font-medium text-gray-700">LTV Breach Prob</div>
        <div>{(c.metrics.ltv.exceed_prob * 100).toFixed(2)}%</div>

        <div className="font-medium text-gray-700">Runway</div>
        <div>{c.metrics.runway.dist_mean.toFixed(1)} months</div>

        <div className="font-medium text-gray-700">Total BTC</div>
        <div>{c.metrics.btc_holdings.total_btc.toFixed(1)}</div>

        <div className="font-medium text-gray-700">Savings</div>
        <div>${c.metrics.term_sheet.savings.toLocaleString()}</div>

        <div className="font-medium text-gray-700">ROE Uplift</div>
        <div>{c.metrics.term_sheet.roe_uplift.toFixed(1)}%</div>

        <div className="font-medium text-gray-700">Profit Margin</div>
        <div>{(c.metrics.term_sheet.profit_margin * 100).toFixed(2)}%</div>

        <div className="font-medium text-gray-700">WACC</div>
        <div>{(c.metrics.wacc * 100).toFixed(2)}%</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Simulation Results</h1>
          <div className="flex gap-4">
            <button
              onClick={() => handleExport('csv')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Export PDF
            </button>
            <button
              onClick={goBack}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Back to Assumptions
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {renderTable(result.as_is)}
          <div className="ring-4 ring-orange-500 rounded-xl">
            {renderTable(result.recommendation)}
          </div>
        </div>

        {result.candidates.length > 2 && (
          <>
            <h2 className="text-2xl font-bold mb-8 text-gray-900">Other Optimized Structures</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {result.candidates
                .filter(
                  (c) =>
                    c.type !== result.as_is.type &&
                    c.type !== result.recommendation.type
                )
                .map((c) => (
                  <div
                    key={c.type}
                    className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition"
                  >
                    <h4 className="font-semibold text-lg mb-4">{c.type}</h4>
                    <div className="text-sm space-y-2 text-gray-600">
                      <div>
                        <span className="font-medium">BTC:</span>{' '}
                        {c.params.btc_bought.toFixed(1)}
                      </div>
                      <div>
                        <span className="font-medium">Dilution:</span>{' '}
                        {(c.metrics.dilution.avg_dilution * 100).toFixed(2)}%
                      </div>
                      <div>
                        <span className="font-medium">LTV Risk:</span>{' '}
                        {(c.metrics.ltv.exceed_prob * 100).toFixed(2)}%
                      </div>
                      <div>
                        <span className="font-medium">WACC:</span>{' '}
                        {(c.metrics.wacc * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;