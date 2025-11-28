// src/pages/Landing.tsx
import React from 'react';
import { Page } from '../App';

interface Props {
  setPage: (page: Page) => void;
}

// ============================================================================
// PRIMITIVE COMPONENTS (same as client provided)
// ============================================================================

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const variants: any = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500',
    outline: 'bg-transparent hover:bg-blue-900/20 text-blue-400 border border-blue-400',
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 ${className}`}>
    {children}
  </div>
);

// ============================================================================
// NEW LANDING PAGE (exactly as client wants)
// ============================================================================

export default function Landing({ setPage }: Props) {
  const handleRequestAccess = () => {
    setPage('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-20">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Block Three</h1>
        </header>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Block Three
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-6 text-gray-200">
                Bitcoin Treasury Intelligence
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Simulation, optimization, and mandate preparation for institutional BTC treasuries. Model your capital structure before committing to it.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={handleRequestAccess}>
                Request Access
              </Button>
              <Button variant="outline">
                View Demo
              </Button>
            </div>
          </div>

          {/* Platform Snapshot Card */}
          <Card className="p-6 lg:p-8">
            <div className="text-xs text-gray-400 mb-6 tracking-widest uppercase">
              Example Scenario Analysis
            </div>
            <div className="space-y-6">
              <div>
                <div className="text-xs text-gray-400 mb-1 tracking-wide">Treasury Modeled (BTC)</div>
                <div className="text-4xl font-bold tracking-tight">14,500</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1 tracking-wide">Notional Simulated</div>
                  <div className="text-2xl font-semibold tracking-tight">$425M</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 tracking-wide">Dilution Delta</div>
                  <div className="text-2xl font-semibold tracking-tight text-green-500">−320 bps</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1 tracking-wide">Runway Extension (Modeled)</div>
                <div className="text-2xl font-semibold tracking-tight text-blue-400">+9.4 mo</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Narrative */}
        <div className="text-center space-y-4 py-12 border-y border-zinc-800">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            See the full impact of every treasury decision.
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Compare structures using real math, not assumptions. Prepare lender-ready or investor-ready analysis with quantified trade-offs and scenario surfaces.
          </p>
        </div>

        {/* Three-Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold tracking-tight mb-3">Simulate</h3>
            <p className="text-gray-400 leading-relaxed">
              Model BTC price paths, LTV breach probabilities, NAV drawdowns, and runway under thousands of scenarios.
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold tracking-tight mb-3">Optimize</h3>
            <p className="text-gray-400 leading-relaxed">
              Multi-objective optimization across structures. Minimize dilution, maximize runway, reduce breach probability.
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold tracking-tight mb-3">Prepare</h3>
            <p className="text-gray-400 leading-relaxed">
              Generate board-ready, lender-ready, or investor-ready analysis packages with clear constraint documentation.
            </p>
          </Card>
        </div>

        {/* Modules Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Treasury Intelligence Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Treasury Simulation Engine",
              "Structure Comparison Studio",
              "Multi-Objective Optimizer",
              "Mandate Preparation Workflow",
              "Risk Analytics Dashboard",
              "Term Sheet Analyzer"
            ].map((title, i) => (
              <Card key={i} className="p-5 border-l-4 border-l-blue-600">
                <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {i === 0 && "Monte Carlo simulation of BTC price paths. Outputs LTV breach probability, NAV drawdown distributions, and runway projections under volatility stress."}
                  {i === 1 && "Side-by-side comparison of loan, convertible, preferred, and hybrid capital structures. Import real term sheets to quantify trade-offs."}
                  {i === 2 && "Pareto-optimal structure selection across competing objectives: max BTC accumulation, min dilution, min WACC, max runway, min breach probability."}
                  {i === 3 && "Exportable analysis packages for treasury committees, boards, lenders, or investors. Constraint documentation and sensitivity reporting included."}
                  {i === 4 && "Real-time treasury diagnostics. Volatility sensitivity, LTV monitoring, covenant headroom, and scenario surface visualization."}
                  {i === 5 && "Import proposed terms from lenders or investors. Model economic outcomes under each structure. Compare risk-adjusted costs."}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="space-y-10 py-12 border-y border-zinc-800">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
              Software-First Treasury Analysis
            </h2>
            <p className="text-lg text-gray-400">Simulate → Optimize → Prepare</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Input Assumptions", desc: "Define treasury size, price targets, risk tolerances, and structure constraints. Import existing term sheets if available." },
              { num: "2", title: "Run Optimization", desc: "Execute multi-objective optimization. Compare structures across NAV, dilution, runway, LTV breach probability, and WACC." },
              { num: "3", title: "Export Analysis", desc: "Generate presentation-ready reports for management, boards, lenders, or investors with full sensitivity documentation." }
            ].map((step) => (
              <div key={step.num} className="text-center space-y-3">
                <div className="text-5xl font-bold text-blue-500 tracking-tight">{step.num}</div>
                <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quantified Trade-Offs */}
        <div className="text-center space-y-4 py-12">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Quantified Trade-Offs. Clear Decisions.
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Block Three is a treasury intelligence platform. We provide simulation, optimization, and mandate preparation software — not lending, brokerage, or advisory services.
          </p>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-12 border-y border-zinc-800">
          <div><div className="text-3xl lg:text-4xl font-bold text-blue-500 tracking-tight mb-1">10,000+</div><div className="text-xs text-gray-400 tracking-wide uppercase">Paths per Simulation</div></div>
          <div><div className="text-3xl lg:text-4xl font-bold text-blue-500 tracking-tight mb-1">6</div><div className="text-xs text-gray-400 tracking-wide uppercase">Structure Types Compared</div></div>
          <div><div className="text-3xl lg:text-4xl font-bold text-blue-500 tracking-tight mb-1">5</div><div className="text-xs text-gray-400 tracking-wide uppercase">Optimization Objectives</div></div>
          <div><div className="text-3xl lg:text-4xl font-bold text-blue-500 tracking-tight mb-1">100%</div><div className="text-xs text-gray-400 tracking-wide uppercase">Exportable Analysis</div></div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-6 py-16">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Model your next treasury decision.
          </h2>
          <p className="text-lg text-gray-400">
            See the math before you commit to the structure.
          </p>
          <Button variant="primary" onClick={handleRequestAccess} className="text-lg px-8 py-4">
            Request Access
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-zinc-800 text-sm text-gray-400 space-y-2">
          <div className="font-semibold tracking-wide text-gray-300">Block Three</div>
          <div>© 2025 Block Three. All rights reserved.</div>
          <div className="text-xs">Treasury simulation and optimization software. Block Three does not provide lending, brokerage, or investment advisory services.</div>
        </footer>

      </div>
    </div>
  );
}