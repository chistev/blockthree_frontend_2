import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, SectionTitle, Stat, Pill } from '../components/Primitives';
import TermSheet from './TermSheet';

interface AsIsViewProps {
  results: any;
}

const AsIsView: React.FC<AsIsViewProps> = ({ results }) => {
  const nav = results?.nav || {};
  const ltv = results?.ltv || {};
  const dilution = results?.dilution || {};
  const runway = results?.runway || {};
  const termSheet = results?.term_sheet || {};
  const btcHoldings = results?.btc_holdings || {};
  const businessImpact = results?.business_impact || {};

  // Risk tone: only returns allowed StatTone values
  const getRiskTone = (prob: number): 'red' | 'green' | 'gray' => {
    if (prob >= 0.20) return 'red';
    if (prob >= 0.05) return 'gray';
    return 'green';
  };

  const formatMoney = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '$0.0M';
    return `$${(val / 1e6).toFixed(1)}M`;
  };

  const pct = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.00%';
    return `${(val * 100).toFixed(2)}%`;
  };

  const months = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.0 mo';
    return `${val.toFixed(1)} mo`;
  };

  const navPathData = useMemo(() => {
    if (!results?.nav?.nav_paths?.length) return [];
    const paths = results.nav.nav_paths as number[];
    const months = 12;
    const step = Math.max(1, Math.floor(paths.length / months));
    return Array.from({ length: months }, (_, i) => {
      const slice = paths.slice(i * step, (i + 1) * step);
      const avg = slice.length > 0
        ? slice.reduce((a: number, b: number) => a + b, 0) / slice.length
        : (nav.avg_nav ?? 0);
      return {
        month: i + 1,
        nav: avg,
        lower: nav.ci_lower ?? avg * 0.9,
        upper: nav.ci_upper ?? avg * 1.1,
      };
    });
  }, [results?.nav]);

  const btcPriceData = useMemo(() => {
    const dist = results?.distribution_metrics?.price_distribution;
    if (!dist) return [];
    return [
      { name: '5th', value: dist['5th'], label: 'Severe Bear' },
      { name: '25th', value: dist['25th'], label: 'Bear' },
      { name: '50th', value: dist['50th'], label: 'Median' },
      { name: '75th', value: dist['75th'], label: 'Bull' },
      { name: '95th', value: dist['95th'], label: 'Extreme Bull' },
    ];
  }, [results?.distribution_metrics]);

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="NAV (Mean)" value={formatMoney(nav.avg_nav)} tone="gray" />
        <Stat
          label="NAV Erosion Risk"
          value={pct(nav.erosion_prob)}
          tone={getRiskTone(nav.erosion_prob ?? 0)}
        />
        <Stat
          label="LTV Breach Prob"
          value={pct(ltv.exceed_prob)}
          tone={getRiskTone(ltv.exceed_prob ?? 0)}
        />
        <Stat label="Dilution (Avg)" value={pct(dilution.avg_dilution)} tone="gray" />
        <Stat label="Runway (Mean)" value={months(runway.dist_mean)} tone="gray" />
        <Stat label="Total BTC" value={(btcHoldings.total_btc ?? 0).toFixed(0)} tone="gray" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="ROE Uplift"
          value={pct((termSheet.roe_uplift ?? 0) / 100)}
          tone={(termSheet.roe_uplift ?? 0) > 0 ? 'green' : 'red'}
        />
        <Stat
          label="Profit Margin"
          value={pct(termSheet.profit_margin)}
          tone={termSheet.profit_margin > 0.03 ? 'green' : termSheet.profit_margin > 0 ? 'gray' : 'red'}
        />
        <Stat label="WACC" value={pct(results?.wacc)} tone="gray" />
        <Stat
          label="Cost Savings"
          value={formatMoney(businessImpact.savings)}
          tone={(businessImpact.savings ?? 0) > 0 ? 'green' : 'gray'}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionTitle>NAV Projection (12 Months)</SectionTitle>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={navPathData}>
              <defs>
                <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                formatter={(value: number) => formatMoney(value)}
              />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#navGradient)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="url(#navGradient)" fillOpacity={0.2} />
              <Line type="monotone" dataKey="nav" stroke="#3B82F6" strokeWidth={3} dot={false} name="Expected NAV" />
            </AreaChart>
          </ResponsiveContainer>
          {nav.cvar != null && (
            <div className="mt-3 text-xs text-red-400">
              CVaR (5%): {formatMoney(nav.cvar)}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle>BTC Price Scenarios (1 Year)</SectionTitle>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={btcPriceData} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" stroke="#374151" opacity={0.3} />
              <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="label" type="category" stroke="#9CA3AF" tick={{ fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.4} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
            <Pill tone="red">
              Bear: ${(results?.distribution_metrics?.price_distribution?.['5th'] ?? 0) / 1000 > 0 ? Math.round(results.distribution_metrics.price_distribution['5th'] / 1000) : 0}k
            </Pill>
            <Pill tone="green">
              Bull: ${(results?.distribution_metrics?.price_distribution?.['95th'] ?? 0) / 1000 > 0 ? Math.round(results.distribution_metrics.price_distribution['95th'] / 1000) : 0}k
            </Pill>
          </div>
        </Card>
      </div>

      {/* Selected Structure */}
      <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        {/* Fixed: className removed from SectionTitle */}
        <SectionTitle>
          <span className="text-white">Selected Structure</span>
        </SectionTitle>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Fixed: size="lg" removed from Pill */}
          <Pill tone="green">
            {termSheet.structure?.replace('+', ' + ') || 'None'}
            {termSheet.structure?.includes('+') && ' Hybrid'}
          </Pill>
          {termSheet.structure?.includes('Convertible') && <Pill tone="violet">Convertible</Pill>}
        </div>

        {/* Fixed: pass selectedCandidateIndex={null} since As-Is shows only the main result */}
        <TermSheet results={results} selectedCandidateIndex={null} />
      </Card>

      {/* Scenario Outcomes */}
      {results?.scenario_metrics && (
        <Card className="p-6">
          <SectionTitle>Scenario Outcomes</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {Object.entries(results.scenario_metrics).map(([name, data]: [string, any]) => (
              <div key={name}>
                <div className="text-sm font-medium text-gray-400">{name}</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatMoney((btcHoldings.total_btc || 0) * data.btc_price - (termSheet.amount || 0))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  BTC @ ${data.btc_price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AsIsView;