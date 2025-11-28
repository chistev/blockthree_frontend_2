// src/pages/DealsPage.tsx
import React from 'react';
import { Deal } from '../App';
import { authFetch } from '../auth';
import { toast } from 'react-toastify';

interface Props {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPage: (dealId: string) => void;
  token: string | null;
}

export default function DealsPage({ deals, setDeals, setPage }: Props) {
  const addDeal = async () => {
    try {
      // Step 1: Fetch live BTC price from your backend
      const btcResponse = await authFetch('/api/btc_price/');
      if (!btcResponse.ok) {
        throw new Error('Failed to fetch live BTC price');
      }
      const btcData = await btcResponse.json();
      const liveBtcPrice = btcData.BTC_current_market_price;

      // Step 2: Fetch default assumptions
      const paramsResponse = await authFetch('/api/default_params/');
      if (!paramsResponse.ok) {
        throw new Error('Failed to fetch default parameters');
      }
      const defaultAssumptions = await paramsResponse.json();

      // Step 3: Override BTC prices — keep targetBTCPrice synced only if it's still default
      const finalAssumptions = {
        ...defaultAssumptions,
        BTC_current_market_price: liveBtcPrice,
        targetBTCPrice:
          defaultAssumptions.targetBTCPrice === defaultAssumptions.BTC_current_market_price ||
          defaultAssumptions.targetBTCPrice === 0
            ? liveBtcPrice
            : defaultAssumptions.targetBTCPrice,
      };

      // Step 4: Create new deal
      const newDeal: Deal = {
        id: crypto.randomUUID(),
        name: `New Scenario — ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
        mode: 'pro-forma',
        assumptions: finalAssumptions,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDeals((prev) => [...prev, newDeal]);
      setPage(newDeal.id);

      toast.success(`New scenario created with live BTC price: $${liveBtcPrice.toLocaleString()}`);
    } catch (error) {
      console.error('Error creating new deal:', error);
      toast.error('Failed to create new scenario. Check connection and try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Your Scenarios</h1>
          <p className="text-gray-600 mt-2">Create and compare Bitcoin treasury structures</p>
        </div>
        <button
          onClick={addDeal}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          + New Scenario
        </button>
      </div>

      {/* Empty State */}
      {deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-28 h-28 mx-auto mb-8 bg-gray-200 border-2 border-dashed rounded-xl" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No scenarios yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Start modeling your first Bitcoin treasury structure with Monte Carlo precision and live BTC pricing.
          </p>
          <button
            onClick={addDeal}
            className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Create Your First Scenario
          </button>
        </div>
      ) : (
        /* List of Existing Deals */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => setPage(deal.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-200 p-7 hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {deal.name}
                </h3>
                <span className="text-2xl opacity-0 group-hover:opacity-100 transition">→</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {deal.mode === 'pro-forma' ? 'Pro Forma' : 'Live'}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    deal.status === 'compared'
                      ? 'bg-green-100 text-green-700'
                      : deal.status.includes('run')
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {deal.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                Updated {new Date(deal.updatedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}