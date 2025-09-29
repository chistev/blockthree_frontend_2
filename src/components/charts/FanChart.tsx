// charts/FanChart.tsx
import React from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { formatMoney, quantilesByStep } from "../../utils";

type Props = {
  // Preferred: matrix of NAV simulations: [nPaths][nSteps]
  navMatrix?: number[][];
  // Fallback (existing in your mock): single path series, plotted as a line if matrix absent
  navPaths?: number[]; 
  title?: string;
  yLabel?: string; // e.g., "NAV ($)"
  showBaseline?: number; // optional baseline NAV ref line
};

export default function FanChart({ navMatrix, navPaths, title = "NAV Fan (Median, 50%, 90%)", yLabel = "NAV ($)", showBaseline }: Props) {
  const hasMatrix = Array.isArray(navMatrix) && navMatrix.length > 1 && (navMatrix[0]?.length ?? 0) > 1;

  if (!hasMatrix && !navPaths?.length) {
    return <div className="p-4 text-sm text-gray-500">No NAV data available.</div>;
  }

  if (hasMatrix) {
    // Compute median + 50% and 90% bands
    const qs = [0.05, 0.25, 0.5, 0.75, 0.95];
    const bands = quantilesByStep(navMatrix!, qs);
    const steps = bands["0.5"].length;
    const data = new Array(steps).fill(0).map((_, i) => ({
      t: i,
      p05: bands["0.05"][i],
      p25: bands["0.25"][i],
      p50: bands["0.5"][i],
      p75: bands["0.75"][i],
      p95: bands["0.95"][i],
    }));

    return (
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" label={{ value: "Time (steps)", position: "insideBottom", dy: 10 }} />
            <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(val) => formatMoney(Number(val))} />
            {/* 90% band */}
            <Area dataKey="p95" stroke="none" fill="#10b981" fillOpacity={0.12} />
            <Area dataKey="p05" stroke="none" fill="#ffffff" fillOpacity={1} />
            {/* 50% band */}
            <Area dataKey="p75" stroke="none" fill="#10b981" fillOpacity={0.2} />
            <Area dataKey="p25" stroke="none" fill="#ffffff" fillOpacity={1} />
            {/* Median line */}
            <Line dataKey="p50" stroke="#10b981" strokeWidth={2} dot={false} name="Median" />
            {typeof showBaseline === "number" && <ReferenceLine y={showBaseline} stroke="#64748b" strokeDasharray="4 4" label="Baseline" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback: simple line (keeps compatibility with your current mock results)
  const data = navPaths!.map((v, i) => ({ t: i, nav: v }));
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" label={{ value: "Time (steps)", position: "insideBottom", dy: 10 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(val) => formatMoney(Number(val))} />
          <Line type="monotone" dataKey="nav" stroke="#10b981" strokeWidth={2} dot={false} />
          {typeof showBaseline === "number" && <ReferenceLine y={showBaseline} stroke="#64748b" strokeDasharray="4 4" label="Baseline" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
