'use client';

import { OverviewStats } from '@/lib/statsUtils';

interface OverviewCardsProps {
  stats: OverviewStats;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Items</div>
        <div className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</div>
        <div className="mt-1 text-xs text-gray-400">in dataset</div>
      </div>

      {/* Reviewed */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviewed</div>
        <div className="mt-1 text-3xl font-bold text-gray-900">
          {stats.completionPct.toFixed(0)}%
        </div>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-[#7C3AED] h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(stats.completionPct, 100)}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-400">{stats.reviewed} of {stats.total}</div>
      </div>

      {/* Pass Rate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pass Rate</div>
        <div className="mt-1 text-3xl font-bold text-[#10B981]">
          {stats.reviewed > 0 ? `${stats.passRate.toFixed(0)}%` : '—'}
        </div>
        <div className="mt-1 text-xs text-gray-400">of reviewed items</div>
      </div>

      {/* Agreement Rate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agreement</div>
        <div className="mt-1 text-3xl font-bold text-[#7C3AED]">
          {stats.agreementRate > 0 ? `${stats.agreementRate.toFixed(0)}%` : '—'}
        </div>
        <div className="mt-1 text-xs text-gray-400">model vs human</div>
      </div>
    </div>
  );
}
