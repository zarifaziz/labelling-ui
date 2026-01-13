'use client';

import { useEval } from '@/context/EvalContext';
import { useCallback, useEffect, useState } from 'react';

export function LabelPanel() {
  const { selectedItem, updateItem, items, selectedId, setSelectedId } = useEval();
  const [critique, setCritique] = useState('');
  const [showTips, setShowTips] = useState(false);

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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Human Critique
          </h2>
          <button
            onClick={() => setShowTips(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#7C3AED] bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-lg transition-colors"
            title="View critique writing tips"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Tips
          </button>
        </div>
        <textarea
          value={critique}
          onChange={(e) => handleCritiqueChange(e.target.value)}
          placeholder="Write your critique here..."
          className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
        />
      </div>

      {/* Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-[#4A1D96] flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Critique Writing Tips
              </h3>
              <button
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Guidelines */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">
                  Write critiques that capture nuances and guide improvement:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-[#7C3AED] mt-0.5">•</span>
                    <span>Explain specific problems with actionable details</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7C3AED] mt-0.5">•</span>
                    <span><strong>For PASS:</strong> Note successes but mention areas for enhancement</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7C3AED] mt-0.5">•</span>
                    <span><strong>For FAIL:</strong> Explain why it fails but suggest how to improve</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7C3AED] mt-0.5">•</span>
                    <span>Use straightforward language, be concise but thorough</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7C3AED] mt-0.5">•</span>
                    <span>Focus on the most impactful issues first</span>
                  </li>
                </ul>
              </div>

              {/* Examples */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Examples of good critiques</h4>
                <div className="space-y-4">
                  {/* Example 1 - FAIL */}
                  <div className="bg-[#FEE2E2] border-l-4 border-[#EF4444] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#EF4444] text-white text-xs font-bold rounded">FAIL</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      This AI output fails because the application of the Batman context feels forced for the medium question. In the medium question, Batman is throwing a Batarang at a particular angle and them measuring that angle with a protractor doesn't sound very natural or engaging to students. A better example would be about measuring the angle needed to shoot his grappling gun as that's something batman is known to do. The easy and hard questions are fine. However, the medium question is very strange so it's a fail.
                    </p>
                  </div>

                  {/* Example 2 - PASS */}
                  <div className="bg-[#ECFDF5] border-l-4 border-[#10B981] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#10B981] text-white text-xs font-bold rounded">PASS</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      The AI successfully creates an exit ticket by ensuring the context is relevant to the questions being asked. Application of skill is also relevant. However, the question marked Easy has wording that is a bit clunky, but passable. Questions should only ask one thing, not multiple: "How many full boxes can be packed and how many jerseys are left over?". Also, this is a strange answer to give: "answer": "$34, 0$", it should be "$34$ r $0$" for division with remainders. Despite this, it's a good output and it passes.
                    </p>
                  </div>

                  {/* Example 3 - PASS */}
                  <div className="bg-[#ECFDF5] border-l-4 border-[#10B981] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#10B981] text-white text-xs font-bold rounded">PASS</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      The AI successfully creates a thought sparker by creating a good point of discussion on how to design a poster. Application of skill is relevant. The question could stimulate a bit more discussion by asking for reasoning behind the design chosen. This question adds a layer of thinking/thought sparking required. It's a good question and it passes.
                    </p>
                  </div>

                  {/* Example 4 - FAIL */}
                  <div className="bg-[#FEE2E2] border-l-4 border-[#EF4444] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#EF4444] text-white text-xs font-bold rounded">FAIL</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      The AI output fails as the application of the context with the skills is not natural or logical. Triangular prisms do not exist in bunkers. Designers don't classify shapes to plan, but they do use shapes in planning. Could have chosen "Distinguishing between $2$D and $3$D shapes" as a more relevant skill, and discussed how water hazards are flat, but shapes like trees are $3$D. Therefore the output fails.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => setShowTips(false)}
                className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

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
