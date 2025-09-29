// charts/TornadoChart.tsx
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatMoney } from "../../utils";

export type SensitivityItem = {
  name: string;            // e.g., "BTC Price", "Volatility", "ADV"
  impactOnNav?: number;    // absolute delta on NAV in dollars (+/-)
  impactOnRoePct?: number; // optional: percentage points on ROE (e.g., +2.3)
};

type Props = {
  sensitivities: SensitivityItem[];
  metric: "NAV" | "ROE"; // which metric to plot
  title?: string;
};

export default function TornadoChart({ sensitivities, metric, title = "Sensitivity (Tornado)" }: Props) {
  const rows = useMemo(() => {
    const mapped = sensitivities.map((s) => ({
      name: s.name,
      value: metric === "NAV" ? (s.impactOnNav ?? 0) : (s.impactOnRoePct ?? 0),
    }));
    // Sort by magnitude desc
    mapped.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    return mapped;
  }, [sensitivities, metric]);

  if (!rows.length) {
    return <div className="p-4 text-sm text-gray-500">No sensitivity data.</div>;
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(v) => (metric === "NAV" ? formatMoney(Number(v)) : `${Number(v).toFixed(1)} pp`)}
            label={{ value: metric === "NAV" ? "Impact on NAV ($)" : "Impact on ROE (pp)", position: "insideBottom", dy: 10 }}
          />
          <YAxis dataKey="name" type="category" width={140} />
          <Tooltip
            formatter={(val: any) => (metric === "NAV" ? formatMoney(Number(val)) : `${Number(val).toFixed(2)} pp`)}
          />
          <Bar dataKey="value" name={metric === "NAV" ? "Δ NAV" : "Δ ROE (pp)"} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
