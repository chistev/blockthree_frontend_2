import React from 'react';
import { toast } from 'react-toastify';

import { Card, SectionTitle, Button } from '../components/Primitives';
import { authFetch } from '../auth';

interface Deal {
  id: string;
  name: string;
  mode: 'public' | 'private' | 'pro-forma';
  assumptions: any;
  asIsResults?: any;
  optimizedResults?: any[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'as_is_run' | 'optimized_run' | 'compared';
  snapshotId?: string;
}

interface DealsPageProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPage: (page: string) => void;
  token: string | null;
}

export default function DealsPage({ deals, setDeals, setPage, token }: DealsPageProps) {
  const handleAddDeal = async () => {
    try {
      const res = await authFetch('/api/default_params/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch default parameters');
      }

      const defaultAssumptions = await res.json();

      const newDeal: Deal = {
        id: crypto.randomUUID(),
        name: `Deal ${deals.length + 1}`,
        mode: 'pro-forma',
        assumptions: defaultAssumptions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
      };

      setDeals((prev) => [...prev, newDeal]);
      setPage(`deal/${newDeal.id}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create new deal');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="p-8">
        <div className="flex justify-between items-center mb-8">
          <SectionTitle>My Deals</SectionTitle>
          <Button onClick={handleAddDeal} variant="primary" className="text-lg px-6 py-3">
            + Add New Deal
          </Button>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-6">No deals yet.</p>
            <Button onClick={handleAddDeal} variant="primary">
              Create Your First Deal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-400">Ticker</th>
                  <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-400">Mode</th>
                  <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-400">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => setPage(`deal/${deal.id}`)}
                    className="border-b border-gray-100 dark:border-zinc-800 hover:bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-medium">{deal.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {deal.assumptions.ticker || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {deal.mode}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          deal.status === 'draft'
                            ? 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {deal.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-sm">
                      {new Date(deal.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
