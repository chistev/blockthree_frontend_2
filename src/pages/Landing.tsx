import React from 'react';

export type Page = 'landing' | 'login' | 'deals' | `deal/${string}`;

interface Props {
  setPage: (page: Page) => void;
}

// ============================================================================
// PRIMITIVE COMPONENTS – exactly matching the rest of the app
// ============================================================================

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'outline'; 
  className?: string;
}) => {
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-lg hover:shadow-xl',
    outline: 'bg-transparent hover:bg-blue-900/20 text-blue-400 border border-blue-400',
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${className}`}
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
// LANDING PAGE – FINAL VERSION (exactly as requested)
// ============================================================================

export default function Landing({ setPage }: Props) {
  const handleRequestAccess = () => {
    setPage('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-20">

        {/* Header */}
        <header className="flex justify-between items-center pt-6">
          <h1 className="text-2xl font-bold tracking-tight">Block Three</h1>
        </header>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Block Three
            </h1>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-200">
              Treasury Risk & Capital Structure Intelligence
            </h2>
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              The only institutional-grade modeling platform purpose-built for public company Bitcoin treasuries. 
              Simulate thousands of BTC price paths, stress-test every financing structure, and optimize for your exact risk mandate — all in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="primary" onClick={handleRequestAccess} className="text-lg px-10 py-4">
                Request Access
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'https://blockthree.capital'}>
                Learn More →
              </Button>
            </div>
          </div>

          {/* Placeholder for future hero visual */}
          <div className="hidden lg:flex justify-center">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-zinc-800 rounded-2xl w-full max-w-lg h-96 blur-3xl absolute"></div>
            <div className="relative z-10 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-12 text-center">
              <div className="text-6xl font-bold text-blue-500 mb-4">5</div>
              <div className="text-xl text-gray-300">Optimized Structures</div>
              <div className="text-sm text-gray-500 mt-2">Returned Every Run</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <Card className="p-8 space-y-4">
            <div className="text-blue-500 text-4xl mb-4">⟳</div>
            <h3 className="text-xl font-semibold">Full Path Monte Carlo</h3>
            <p className="text-gray-400">
              10,000+ BTC price paths with Heston stochastic volatility, jumps, and mean reversion.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="text-blue-500 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold">6 Capital Structures</h3>
            <p className="text-gray-400">
              Loan, Convertible, PIPE, ATM, Hybrid, and Custom — compared side-by-side with real market terms.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="text-blue-500 text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold">NSGA-III Multi-Objective Optimization</h3>
            <p className="text-gray-400">
              Maximize BTC retained · Minimize dilution · Minimize LTV breach · Maximize runway · Minimize WACC — choose any 4.
            </p>
          </Card>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-16 border-y border-zinc-800">
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-blue-500 tracking-tight mb-2">10,000+</div>
            <div className="text-sm text-gray-400 tracking-wide uppercase">Paths per Simulation</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-blue-500 tracking-tight mb-2">6</div>
            <div className="text-sm text-gray-400 tracking-wide uppercase">Structure Types Compared</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-blue-500 tracking-tight mb-2">5</div>
            <div className="text-sm text-gray-400 tracking-wide uppercase">Optimization Objectives</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-bold text-blue-500 tracking-tight mb-2">100%</div>
            <div className="text-sm text-gray-400 tracking-wide uppercase">Exportable Analysis</div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-8 py-20">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight max-w-4xl mx-auto">
            Model your next treasury decision.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See the math before you commit to the structure.
          </p>
          <Button 
            variant="primary" 
            onClick={handleRequestAccess} 
            className="text-xl px-12 py-5 shadow-2xl hover:shadow-blue-500/25"
          >
            Request Access
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-zinc-800 text-sm text-gray-500 space-y-3">
          <div className="font-semibold tracking-wide text-gray-300">Block Three</div>
          <div>© 2025 Block Three Capital. All rights reserved.</div>
          <div className="text-xs max-w-2xl mx-auto mt-4">
            Treasury simulation, optimization, and mandate preparation software — not lending, brokerage, or advisory services.
          </div>
        </footer>

      </div>
    </div>
  );
}
