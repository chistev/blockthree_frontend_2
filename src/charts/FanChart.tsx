import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMoney } from '../utils';

interface FanChartProps {
  data: number[]; // array of terminal NAV values from simulation
}

export default function FanChart({ data }: FanChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No NAV paths available</div>;
  }
  
  // Calculate percentiles
  const sorted = [...data].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(0.1 * sorted.length)];
  const p25 = sorted[Math.floor(0.25 * sorted.length)];
  const p50 = sorted[Math.floor(0.5 * sorted.length)];
  const p75 = sorted[Math.floor(0.75 * sorted.length)];
  const p90 = sorted[Math.floor(0.9 * sorted.length)];

  const chartData = [
    { name: '10th', value: p10 },
    { name: '25th', value: p25 },
    { name: 'Median', value: p50 },
    { name: '75th', value: p75 },
    { name: '90th', value: p90 },
  ];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis tickFormatter={(v) => formatMoney(v, 0)} stroke="#9CA3AF" />
        <Tooltip formatter={(v: number) => formatMoney(v)} labelStyle={{ color: '#fff' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
