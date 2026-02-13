'use client';

import { useMemo } from 'react';
import { useEval } from '@/context/EvalContext';
import {
  computeOverviewStats,
  computeOutcomeDistribution,
  computeConfusionMatrix,
} from '@/lib/statsUtils';
import { OverviewCards } from './OverviewCards';
import { OutcomeDonut } from './OutcomeDonut';
import { AgreementMatrix } from './AgreementMatrix';
import { FieldGroupingChart } from './FieldGroupingChart';

export function StatsPanel() {
  const { items } = useEval();

  const overviewStats = useMemo(() => computeOverviewStats(items), [items]);
  const distribution = useMemo(() => computeOutcomeDistribution(items), [items]);
  const confusionMatrix = useMemo(() => computeConfusionMatrix(items), [items]);

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#fffbf5]">
        <p className="text-sm text-gray-400">Import data to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fffbf5]">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <OverviewCards stats={overviewStats} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OutcomeDonut distribution={distribution} />
          <AgreementMatrix matrix={confusionMatrix} />
        </div>

        <FieldGroupingChart items={items} />
      </div>
    </div>
  );
}
