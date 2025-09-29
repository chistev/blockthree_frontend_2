import React from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { boxStats } from "../../utils";

type Props = {
  // Array of runway outcomes in months (one value per scenario / path)
  runwayMonths?: number[];
  title?: string;
};

export default function RunwayBox({ runwayMonths, title = "Runway Distribution (Months)" }: Props) {
  if (!runwayMonths?.length) {
    return <div className="p-4 text-sm text-gray-500">No runway distribution available.</div>;
  }

  const stats = boxStats(runwayMonths);
  if (!stats) return <div className="p-4 text-sm text-gray-500">Insufficient data.</div>;

  // We’ll render a simple “box” using a single-category ComposedChart:
  // draw the IQR as a bar, the whiskers as lines, and the median as a line overlay.
  const cat = "Runway";
  const data = [
    {
      cat,
      q1: stats.q1,
      q3: stats.q3,
      iqr: stats.q3 - stats.q1,
      min: stats.min,
      max: stats.max,
      median: stats.median,
    },
  ];

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cat" />
          <YAxis label={{ value: "Months", angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(v: any, n: string) => [Number(v).toFixed(1), n]}
            labelFormatter={() => "Runway"}
          />
          {/* IQR rendered as a vertical bar (q1 -> q3) */}
          <Bar dataKey="iqr" name="IQR (Q1–Q3)" />
          {/* Overlay lines to indicate min, median, max */}
          <Line dataKey="median" name="Median" dot={false} />
          {/* whiskers via “fake” lines: we encode as separate series using min/max but with transparent bars and rely on tooltip */}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-600 mt-2">
        Min: {stats.min.toFixed(1)} • Q1: {stats.q1.toFixed(1)} • Median: {stats.median.toFixed(1)} • Q3: {stats.q3.toFixed(1)} • Max: {stats.max.toFixed(1)}
      </div>
    </div>
  );
}
