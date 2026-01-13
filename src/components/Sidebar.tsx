'use client';

import { useEval } from '@/context/EvalContext';
import { EvalItem } from '@/types';

function getStatusColor(item: EvalItem): string {
  if (item.human_outcome === 'PASS') return 'bg-[#10B981]';
  if (item.human_outcome === 'FAIL') return 'bg-[#EF4444]';
  return 'bg-gray-300';
}

function getStatusBorder(item: EvalItem): string {
  if (item.human_outcome === 'PASS') return 'border-l-[#10B981]';
  if (item.human_outcome === 'FAIL') return 'border-l-[#EF4444]';
  return 'border-l-transparent';
}

export function Sidebar() {
  const { items, selectedId, setSelectedId } = useEval();

  if (items.length === 0) {
    return (
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Examples</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-500 text-center">
            Import a CSV file to get started
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">
          Examples ({items.length})
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`w-full text-left px-4 py-3 border-l-3 transition-all flex items-center gap-3 ${
              selectedId === item.id
                ? 'bg-[#F3F4F6] border-l-[#7C3AED] border-l-4'
                : `hover:bg-gray-50 ${getStatusBorder(item)} border-l-2`
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusColor(item)}`}
            />
            <span className={`text-sm truncate ${
              selectedId === item.id ? 'text-gray-900 font-medium' : 'text-gray-700'
            }`}>
              {item.id || `Item ${index + 1}`}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
