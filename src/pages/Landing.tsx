import React from 'react';
import { Button, Card, SectionTitle } from '../components/Primitives';

interface LandingProps {
  setPage: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ setPage }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-32">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div>
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white leading-none">
              Block Three
            </h1>
            <h2 className="mt-6 text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              Intelligence for Bitcoin Capital Markets
            </h2>
            <p className="mt-8 text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              Structured finance, risk analytics, and capital solutions for institutional treasuries.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <Button
              onClick={() => setPage('login')}
              variant="primary"
              className="text-lg font-medium px-10 py-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              Request Mandate
            </Button>
            <Button
              onClick={() => setPage('login')}
              variant="outline"
              className="text-lg font-medium px-10 py-4 border-2"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Platform Snapshot */}
        <Card className="p-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800 border border-gray-200 dark:border-zinc-800 shadow-2xl">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-8">
            Platform Snapshot
          </div>
          <div className="space-y-10">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-wide">Treasury Holdings</div>
              <div className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
                14,500 BTC
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-wide">Financed Notional</div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">$425M</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-wide">Dilution Improvement</div>
                <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">−320 bps</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-wide">Runway Extension</div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400">+9.4 mo</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Narrative */}
      <div className="text-center py-20 border-y border-gray-200 dark:border-zinc-800">
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Institutional Finance. Bitcoin-Native.
        </h2>
        <p className="mt-8 text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          We transform treasury data into clarity, strategy, and execution — with discipline and precision.
        </p>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { title: 'Model', desc: 'Deep risk insight for dynamic treasuries.' },
          { title: 'Optimize', desc: 'Capital efficiency engineered for Bitcoin exposure.' },
          { title: 'Structure', desc: 'Bespoke financing across credit, convertibles, and hybrid capital.' },
        ].map((item) => (
          <Card
            key={item.title}
            className="p-10 text-center hover:shadow-2xl transition-shadow duration-300 border border-gray-200 dark:border-zinc-800"
          >
            <h3 className="text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {item.desc}
            </p>
          </Card>
        ))}
      </div>

      {/* Solutions */}
      <div className="space-y-16">
        <div className="text-center">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Boutique Investment Banking for Bitcoin Treasuries
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            'NAV Risk Audit',
            'Treasury Optimization',
            'BTC-Backed Lending',
            'Adaptive Convertibles',
            'Preferred & Hybrid Equity',
            'Secondary Capabilities',
          ].map((title) => (
            <Card
              key={title}
              className="p-8 border-l-4 border-blue-600 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20"
            >
              <h3 className="text-xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {title === 'Secondary Capabilities' ? (
                  <ul className="space-y-2 text-sm">
                    <li>• Senior, stacked, and mezzanine credit</li>
                    <li>• Repo and BTC-secured liquidity facilities</li>
                    <li>• ATM, PIPE, and private placement execution</li>
                    <li>• Treasury strategy & capital structure advisory</li>
                  </ul>
                ) : (
                  `Institutional-grade ${title.toLowerCase()} tailored to Bitcoin-native balance sheets.`
                )}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* The Block Three Stack */}
      <div className="py-20 border-y border-gray-200 dark:border-zinc-800">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold tracking-tight mb-4">The Block Three Stack</h2>
          <p className="text-2xl text-gray-600 dark:text-gray-400">Analyze → Optimize → Execute</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { num: '1', title: 'Intelligence', desc: 'Live market data, risk simulation, and treasury diagnostics.' },
            { num: '2', title: 'Optimization', desc: 'Capital structure modeling and strategy design across instruments.' },
            { num: '3', title: 'Execution', desc: 'Mandate preparation, pricing, negotiation, and syndication.' },
          ].map((item) => (
            <div key={item.num} className="text-center space-y-6">
              <div className="text-8xl font-bold text-blue-600 dark:text-blue-500 tracking-tighter">
                {item.num}
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center py-20 border-y border-gray-200 dark:border-zinc-800">
        {[
          { value: '$2.5B+', label: 'Assets Analyzed' },
          { value: '50+', label: 'Institutional Treasuries' },
          { value: '10k+', label: 'Simulations per Mandate' },
          { value: '99.9%', label: 'Uptime & Monitoring' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-5xl lg:text-6xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
              {stat.value}
            </div>
            <div className="mt-4 text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium tracking-wide uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="text-center py-24 space-y-10">
        <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
          Ready to institutionalize your Bitcoin treasury?
        </h2>
        <p className="text-2xl text-gray-600 dark:text-gray-400">
          Begin your mandate with Block Three.
        </p>
        <Button
          onClick={() => setPage('login')}
          variant="primary"
          className="text-xl font-semibold px-16 py-5 shadow-2xl hover:shadow-3xl transition-shadow"
        >
          Request Mandate
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center py-12 border-t border-gray-200 dark:border-zinc-800 text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <div className="font-semibold tracking-wider">Block Three Capital LLC</div>
        <div>© 2025 Block Three. All rights reserved.</div>
        <div className="text-xs mt-4 opacity-75">
          This site is for institutional clients and qualified investors only.
        </div>
      </div>
    </div>
  );
};

export default Landing;