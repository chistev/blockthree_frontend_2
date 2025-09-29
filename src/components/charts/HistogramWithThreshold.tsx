// charts/HistogramWithThreshold.tsx
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { makeHistogram, pct } from "../../utils";

type Props = {
  // Accepts either raw LTV samples or array of objects {ltv:number}
  ltvSamples?: number[];
  ltvObjects?: { ltv: number }[];
  cap?: number; // LTV cap to draw as a ref line
  bins?: number;
  title?: string;
};

export default function HistogramWithThreshold({ ltvSamples, ltvObjects, cap = 0.7, bins = 20, title = "LTV Histogram" }: Props) {
  const samples = useMemo(() => {
    if (ltvSamples?.length) return ltvSamples.filter((x) => Number.isFinite(x));
    if (ltvObjects?.length) return ltvObjects.map((d) => d.ltv).filter((x) => Number.isFinite(x));
    return [];
  }, [ltvSamples, ltvObjects]);

  if (!samples.length) {
    return <div className="p-4 text-sm text-gray-500">No LTV samples available.</div>;
  }

  const { bins: histBins, min, max } = makeHistogram(samples, bins);
  const data = histBins.map((b) => ({
    mid: (b.x0 + b.x1) / 2,
    label: ((b.x0 + b.x1) / 2),
    count: b.n,
  }));

  const breachPct = samples.filter((v) => v > cap).length / samples.length;

  return (
    <div className="w-full h-[320px] relative">
      <div className="absolute top-2 right-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
        Breach &gt; Cap: {pct(breachPct, 1)}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            label={{ value: "LTV (%)", position: "insideBottom", dy: 10 }}
            type="number"
            domain={[min, max]}
          />
          <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(val: any, name: string, props: any) => [val, name === "count" ? "Count" : ""]}
            labelFormatter={(v: number) => `LTV ~ ${pct(v, 0)}`}
          />
          <Bar dataKey="count" name="Count" />
          <ReferenceLine x={cap} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "LTV Cap", position: "insideTopRight" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
