import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RunwayBoxProps {
  data: any;
}

export default function RunwayBox({ data }: RunwayBoxProps) {
  const runway = data?.runway || {};
  
  // Extract runway percentiles - note: backend doesn't send p10/p90, only dist_mean, p50, p95
  const values = [runway.dist_mean, runway.p50, runway.p95].filter(Boolean);
  
  if (values.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No runway data</div>;
  }

  const chartData = [
    { name: 'Mean', value: runway.dist_mean ?? 0 },
    { name: 'Median', value: runway.p50 ?? 0 },
    { name: '95th', value: runway.p95 ?? 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" label={{ value: 'Months', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)} months`} />
        <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}