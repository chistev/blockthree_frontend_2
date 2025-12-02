import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { pct } from '../utils';

interface HistogramProps {
  data: number[]; // LTV terminal values
  threshold: number; // LTV_Cap (e.g. 0.5)
}

export default function HistogramWithThreshold({ data, threshold = 0.5 }: HistogramProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No LTV data available</div>;
  }

  // Check if all values are zero (equity structure)
  const allZeros = data.every(v => v === 0);
  if (allZeros) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-500 p-4">
        <div className="text-center mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Equity-Only Structure</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">No LTV (Loan-to-Value) risk</p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700 pt-3">
          <p>This is an equity offering (ATM/PIPE) with no debt component.</p>
          <p className="mt-1">LTV = 0 for all simulation paths.</p>
        </div>
      </div>
    );
  }

  // Check if all values are the same (not just zero)
  const uniqueValues = new Set(data);
  if (uniqueValues.size === 1) {
    const constantValue = data[0];
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-500 p-4">
        <div className="text-center mb-4">
          <svg className="w-12 h-12 mx-auto text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Constant LTV</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">All paths: {pct(constantValue)}</p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700 pt-3">
          <p>All simulation paths result in the same LTV value.</p>
          <p className="mt-1">This could indicate fixed parameters or simplified modeling.</p>
        </div>
      </div>
    );
  }

  // Normal histogram calculation for varied data
  const bins = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  // Handle case where min = max (should be caught above, but just in case)
  if (min === max) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="font-medium">Constant LTV Value: {pct(min)}</p>
          <p className="text-sm mt-1">No distribution to display</p>
        </div>
      </div>
    );
  }

  const binSize = (max - min) / bins;

  const histogram = Array(bins).fill(0).map((_, i) => {
    const binMin = min + i * binSize;
    const binMax = min + (i + 1) * binSize;
    const count = data.filter(v => v >= binMin && v < binMax).length;
    return {
      range: `${(binMin * 100).toFixed(0)}-${(binMax * 100).toFixed(0)}%`,
      count,
      isBreach: binMin >= threshold,
    };
  });

  const breachCount = data.filter(v => v >= threshold).length;
  const breachPct = (breachCount / data.length) * 100;

  return (
    <div>
      <div className="mb-4 text-right">
        <span className="text-sm text-red-500 font-medium">
          Breach Probability: {pct(breachPct / 100)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={histogram} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="range" 
            stroke="#9CA3AF" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            formatter={(v: number) => [`${v} paths`, 'Count']}
            labelFormatter={(label) => `LTV Range: ${label}`}
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {histogram.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isBreach ? '#ef4444' : '#3b82f6'} 
                strokeWidth={1}
                stroke={entry.isBreach ? '#dc2626' : '#1d4ed8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center mr-4">
          <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span>
          Safe: LTV &lt; {pct(threshold)}
        </span>
        <span className="inline-flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-sm mr-1"></span>
          Breach: LTV ≥ {pct(threshold)}
        </span>
      </div>
    </div>
  );
}