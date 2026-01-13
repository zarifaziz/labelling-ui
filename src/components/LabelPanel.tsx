'use client';

import { useEval } from '@/context/EvalContext';
import { useCallback, useEffect, useState } from 'react';

export function LabelPanel() {
  const { selectedItem, updateItem, items, selectedId, setSelectedId } = useEval();
  const [critique, setCritique] = useState('');

  // Sync critique with selected item
  useEffect(() => {
    setCritique(selectedItem?.human_critique || '');
  }, [selectedItem?.id, selectedItem?.human_critique]);

  const handleOutcomeChange = useCallback(
    (outcome: 'PASS' | 'FAIL') => {
      if (!selectedItem) return;
      updateItem(selectedItem.id, { human_outcome: outcome });
    },
    [selectedItem, updateItem]
  );

  const handleCritiqueChange = useCallback(
    (value: string) => {
      setCritique(value);
      if (!selectedItem) return;
      updateItem(selectedItem.id, { human_critique: value });
    },
    [selectedItem, updateItem]
  );

  const handleNext = useCallback(() => {
    const currentIndex = items.findIndex((i) => i.id === selectedId);
    if (currentIndex < items.length - 1) {
      setSelectedId(items[currentIndex + 1].id);
    }
  }, [items, selectedId, setSelectedId]);

  const handlePrevious = useCallback(() => {
    const currentIndex = items.findIndex((i) => i.id === selectedId);
    if (currentIndex > 0) {
      setSelectedId(items[currentIndex - 1].id);
    }
  }, [items, selectedId, setSelectedId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in textarea
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'p' || e.key === 'P') {
        handleOutcomeChange('PASS');
      } else if (e.key === 'f' || e.key === 'F') {
        handleOutcomeChange('FAIL');
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOutcomeChange, handleNext, handlePrevious]);

  if (!selectedItem) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Label</h2>
        <p className="text-sm text-gray-500">Select an example to label</p>
      </aside>
    );
  }

  const currentIndex = items.findIndex((i) => i.id === selectedId);

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Outcome Toggle */}
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Outcome</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleOutcomeChange('PASS')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              selectedItem.human_outcome === 'PASS'
                ? 'bg-[#ECFDF5] text-[#10B981] border-2 border-[#A7F3D0] shadow-sm'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            ✓ PASS
            <span className="ml-1 text-xs opacity-70">(P)</span>
          </button>
          <button
            onClick={() => handleOutcomeChange('FAIL')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              selectedItem.human_outcome === 'FAIL'
                ? 'bg-[#FEE2E2] text-[#EF4444] border-2 border-[#FCA5A5] shadow-sm'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            ✗ FAIL
            <span className="ml-1 text-xs opacity-70">(F)</span>
          </button>
        </div>
      </div>

      {/* Critique */}
      <div className="flex-1 p-5 flex flex-col min-h-0">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Human Critique
        </h2>
        <textarea
          value={critique}
          onChange={(e) => handleCritiqueChange(e.target.value)}
          placeholder="Write your critique here..."
          className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
        />
      </div>

      {/* Navigation */}
      <div className="p-5 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= items.length - 1}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Use ↑↓ or J/K to navigate
        </p>
      </div>
    </aside>
  );
}
