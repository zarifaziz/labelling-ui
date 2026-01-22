'use client';

import { useEval } from '@/context/EvalContext';
import { EvalItem } from '@/types';
import { useState } from 'react';

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
  const { items, selectedId, setSelectedId, deleteItem } = useEval();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <aside className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
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
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">
          Examples ({items.length})
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`relative w-full text-left px-4 py-3 border-l-3 transition-all flex items-center gap-3 cursor-pointer ${
              selectedId === item.id
                ? 'bg-[#F3F4F6] border-l-[#7C3AED] border-l-4'
                : `hover:bg-gray-50 ${getStatusBorder(item)} border-l-2`
            }`}
            onClick={() => setSelectedId(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusColor(item)}`}
            />
            <span className={`text-sm truncate flex-1 ${
              selectedId === item.id ? 'text-gray-900 font-medium' : 'text-gray-700'
            }`}>
              {item.id || `Item ${index + 1}`}
            </span>
            {hoveredId === item.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item.id);
                }}
                className="absolute right-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete row"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
