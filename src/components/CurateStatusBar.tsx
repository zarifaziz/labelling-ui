'use client';

import { useCurate } from '@/context/CurateContext';

export function CurateStatusBar() {
  const { activeItems, deletedCount, modifiedCount } = useCurate();

  return (
    <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-center gap-8 text-sm font-medium px-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Total:</span>
        <span className="text-gray-800 font-semibold">{activeItems.length}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-blue-600">Modified:</span>
        <span className="text-blue-700 font-semibold">{modifiedCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-red-600">Deleted:</span>
        <span className="text-red-700 font-semibold">{deletedCount}</span>
      </div>
    </div>
  );
}
