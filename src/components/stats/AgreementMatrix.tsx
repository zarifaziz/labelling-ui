'use client';

import { ConfusionMatrix } from '@/lib/statsUtils';

interface AgreementMatrixProps {
  matrix: ConfusionMatrix;
}

export function AgreementMatrix({ matrix }: AgreementMatrixProps) {
  if (matrix.total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Agreement Matrix</h3>
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          No items with both model and human outcomes
        </div>
      </div>
    );
  }

  const cells = [
    { row: 'PASS', col: 'PASS', count: matrix.modelPassHumanPass, agreement: true },
    { row: 'PASS', col: 'FAIL', count: matrix.modelPassHumanFail, agreement: false },
    { row: 'FAIL', col: 'PASS', count: matrix.modelFailHumanPass, agreement: false },
    { row: 'FAIL', col: 'FAIL', count: matrix.modelFailHumanFail, agreement: true },
  ];

  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Agreement Matrix</h3>
      <div className="grid grid-cols-3 grid-rows-3 gap-1 max-w-[280px] mx-auto">
        {/* Empty corner */}
        <div />
        {/* Column headers */}
        <div className="text-center text-xs font-medium text-gray-500 pb-1">Human PASS</div>
        <div className="text-center text-xs font-medium text-gray-500 pb-1">Human FAIL</div>

        {/* Row: Model PASS */}
        <div className="flex items-center text-xs font-medium text-gray-500 pr-2 justify-end">Model PASS</div>
        <Cell count={matrix.modelPassHumanPass} total={matrix.total} maxCount={maxCount} agreement />
        <Cell count={matrix.modelPassHumanFail} total={matrix.total} maxCount={maxCount} agreement={false} />

        {/* Row: Model FAIL */}
        <div className="flex items-center text-xs font-medium text-gray-500 pr-2 justify-end">Model FAIL</div>
        <Cell count={matrix.modelFailHumanPass} total={matrix.total} maxCount={maxCount} agreement={false} />
        <Cell count={matrix.modelFailHumanFail} total={matrix.total} maxCount={maxCount} agreement />
      </div>
    </div>
  );
}

function Cell({ count, total, maxCount, agreement }: { count: number; total: number; maxCount: number; agreement: boolean }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';
  const intensity = maxCount > 0 ? count / maxCount : 0;

  const bgColor = agreement
    ? `rgba(16, 185, 129, ${0.08 + intensity * 0.25})`
    : `rgba(239, 68, 68, ${0.08 + intensity * 0.25})`;

  return (
    <div
      className="rounded-lg p-3 text-center min-h-[60px] flex flex-col items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <div className="text-lg font-bold text-gray-900">{count}</div>
      <div className="text-[10px] text-gray-500">{pct}%</div>
    </div>
  );
}
