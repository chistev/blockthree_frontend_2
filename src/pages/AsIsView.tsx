import { Stat } from '../components/Primitives';
import TermSheet from '../components/TermSheet'; // This component exists separately – see note below
import { formatMoney, pct, months, riskTone } from '../utils';

interface AsIsViewProps {
  results: any; // Single candidate object from backend (as-is run)
}

export default function AsIsView({ results }: AsIsViewProps) {
  // Safe extraction with fallbacks
  const nav = results?.nav || {};
  const ltv = results?.ltv || {};
  const dil = results?.dilution || {};
  const roe = results?.roe || {};
  const run = results?.runway || {};
  const wacc = results?.wacc || 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <Stat label="Expected NAV" value={formatMoney(nav.avg_nav ?? 0)} />
        <Stat 
          label="LTV Breach Prob" 
          value={pct(ltv.exceed_prob ?? 0)} 
          tone={riskTone(ltv.exceed_prob ?? 0)} 
        />
        <Stat label="Avg Dilution" value={pct(dil.avg_dilution ?? 0)} />
        <Stat label="ROE Avg" value={pct(roe.avg_roe ?? 0)} />
        <Stat label="Runway (Mean)" value={months(run.dist_mean ?? 0)} />
        <Stat label="WACC" value={pct(wacc)} />
      </div>

      {/* Term Sheet Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Current Structure Term Sheet
        </h3>
        <TermSheet results={results} />
      </div>

      {/* Optional: Add charts if available in as-is results */}
      {results.nav_paths && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            NAV Distribution
          </h3>
          {/* You can reuse FanChart or Histogram here if desired */}
        </div>
      )}
    </div>
  );
}