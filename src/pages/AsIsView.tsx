import React from 'react';
import { Stat } from '../components/Primitives';
import TermSheet from '../components/TermSheet';  // Assume extracted from DecisionView

interface AsIsViewProps {
  results: any;
}

export default function AsIsView({ results }: AsIsViewProps) {
  // Assume As-Is is single structure – use aggregate metrics + TermSheet
  const nav = results?.nav || {};
  const ltv = results?.ltv || {};
  const dil = results?.dilution || {};
  const roe = results?.roe || {};
  const run = results?.runway || {};

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="NAV Avg" value={formatMoney(nav.avg_nav ?? 0)} />
        <Stat label="LTV Breach" value={pct(ltv.exceed_prob ?? 0)} />
        <Stat label="Dilution Avg" value={pct(dil.avg_dilution ?? 0)} />
        <Stat label="ROE Avg" value={pct(roe.avg_roe ?? 0)} />
        <Stat label="Runway Mean" value={months(run.dist_mean ?? 0)} />
      </div>
      <TermSheet results={results} />  // Or results.candidates[0] if array
    </div>
  );
}
