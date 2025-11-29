import React, { useState } from 'react';
import { Card, SectionTitle, Button, Stat } from '../components/Primitives';
import TermSheet from '../components/TermSheet';
import FanChart from './charts/FanChart';
import HistogramWithThreshold from './charts/HistogramWithThreshold';
import TornadoChart from './charts/TornadoChart';
import RunwayBox from './charts/RunwayBox';
import { pct, num, months, formatMoney, riskTone, structureLabel } from '../utils';

interface CandidateViewProps {
  results: any[]; // array of 5 candidates
}

export default function OptimizedView({ results }: CandidateViewProps) {
  const [selected, setSelected] = useState(0);

  if (!results || results.length === 0) return <div>No results</div>;

  const candidate = results[selected];

  const m = candidate.metrics || candidate; // metrics object

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {results.map((c: any, i: number) => (
          <Button
            key={i}
            variant={i === selected ? 'primary' : 'ghost'}
            onClick={() => setSelected(i)}
          >
            {c.type || `Candidate ${i + 1}`}
          </Button>
        ))}
      </div>

      <Card className="p-4">
        <SectionTitle>{candidate.type || 'Selected Candidate'} Metrics</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Stat label="Expected NAV" value={formatMoney(m.nav?.avg_nav ?? 0)} />
          <Stat label="LTV Breach Prob" value={pct(m.ltv?.exceed_prob ?? 0)} tone={riskTone(m.ltv?.exceed_prob)} />
          <Stat label="Dilution Avg" value={pct(m.dilution?.avg_dilution ?? 0)} />
          <Stat label="ROE Avg" value={pct(m.roe?.avg_roe ?? 0)} />
          <Stat label="Runway Mean" value={months(m.runway?.dist_mean ?? 0)} />
          <Stat label="WACC" value={pct(m.wacc ?? 0)} />
        </div>

        <TermSheet results={candidate} />

        <SectionTitle className="mt-8">Charts</SectionTitle>
        <div className="space-y-8">
          <FanChart data={m.nav_paths || []} />
          <HistogramWithThreshold data={m.ltv?.ltv_paths || []} threshold={candidate.params.ltv_cap || 0.5} />
          <TornadoChart data={m.sensitivity || []} />
          <RunwayBox data={m.runway} />
        </div>
      </Card>
    </div>
  );
}
