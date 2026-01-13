'use client';

import { useEval } from '@/context/EvalContext';

export function StatusBar() {
  const { items } = useEval();

  const passes = items.filter((item) => item.human_outcome === 'PASS').length;
  const fails = items.filter((item) => item.human_outcome === 'FAIL').length;
  const reviewed = passes + fails;
  const total = items.length;

  return (
    <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-center gap-8 text-sm font-medium px-4">
      <div className="flex items-center gap-2">
        <span className="text-green-600">✓ Passes:</span>
        <span className="text-green-700 font-semibold">{passes}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-red-600">✗ Fails:</span>
        <span className="text-red-700 font-semibold">{fails}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Reviewed:</span>
        <span className="text-gray-800 font-semibold">{reviewed} / {total}</span>
      </div>
    </div>
  );
}
