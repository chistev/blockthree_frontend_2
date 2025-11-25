import React, { useState } from 'react';

interface Props {
  setPage: (page: 'login') => void;
}

export default function Landing({ setPage }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const handleOpenCalculator = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setPage('login');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">BTC</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Block Three Capital</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Optimize Bitcoin Treasury
            <span className="block text-orange-500">Without Destroying Equity</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Model PIPE, ATM, BTC-backed loans, convertibles, and hybrid structures with 
            <strong> Monte Carlo precision</strong> — compare dilution, LTV breach risk, runway, 
            ROE uplift, and profit margin in seconds.
          </p>

          <div className="mt-10 flex justify-center">
            <button
              onClick={handleOpenCalculator}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isCalculating ? 'Launching Calculator...' : 'Open Risk Calculator'}
              <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "5 Funding Structures", items: ["BTC-Backed Loan", "Convertible Note", "PIPE", "ATM Equity", "Hybrid Blends"], icon: "Building" },
              { title: "Advanced Modeling", items: ["Heston + Jump Diffusion", "Antithetic Variates", "NSGA-III Optimization", "Haircut & Cure Logic"], icon: "Gear" },
              { title: "Key Outputs", items: ["LTV Breach Probability", "Dilution vs Savings", "Runway Distribution", "ROE Uplift & WACC", "CVaR & Stress Tests"], icon: "Chart" }
            ].map((col, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{col.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{col.title}</h3>
                <ul className="space-y-2 text-gray-600">
                  {col.items.map((item, j) => (
                    <li key={j} className="flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rest of your sections (Presets, CTA, etc.) */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900">Start with Risk Presets</h3>
          <p className="mt-4 text-lg text-gray-600">Defensive • Balanced • Growth</p>
          <div className="mt-10 flex justify-center gap-6 flex-wrap">
            {["Defensive", "Balanced", "Growth"].map((preset) => (
              <div key={preset} className="bg-white px-8 py-5 rounded-xl shadow-sm border border-gray-200 text-lg font-medium text-gray-800 hover:shadow-md transition">
                {preset}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-600">Used by public company treasurers & Bitcoin-native finance teams</p>
          <button onClick={handleOpenCalculator} className="mt-6 inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}