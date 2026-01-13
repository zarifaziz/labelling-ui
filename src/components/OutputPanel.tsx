'use client';

import { useEval } from '@/context/EvalContext';
import { renderLatex } from '@/lib/latex';
import { QuestionAnswer } from '@/types';

export function OutputPanel() {
  const { selectedItem } = useEval();

  if (!selectedItem) {
    return (
      <main className="flex-1 bg-[#fffbf5] flex items-center justify-center">
        <p className="text-gray-500">Select an example to view output</p>
      </main>
    );
  }

  const { output } = selectedItem;
  const difficulties = ['easy', 'medium', 'hard'] as const;

  return (
    <main className="flex-1 bg-[#fffbf5] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Prerequisites if present */}
        {output.prerequisitesChosen && output.prerequisitesChosen.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-[#7C3AED] mb-3 uppercase tracking-wide">
              Prerequisites Chosen
            </h3>
            <ul className="space-y-2">
              {output.prerequisitesChosen.map((prereq, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-[#7C3AED]">•</span>
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions by difficulty */}
        {difficulties.map((difficulty) => {
          const qa = output[difficulty] as QuestionAnswer | undefined;
          if (!qa) return null;

          return (
            <QuestionCard
              key={difficulty}
              difficulty={difficulty}
              question={qa.question}
              answer={qa.answer}
            />
          );
        })}

        {/* Model Critique (collapsed by default, for reference) */}
        {selectedItem.model_critique && (
          <details className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <summary className="p-5 cursor-pointer text-sm text-gray-600 hover:text-[#7C3AED] font-medium transition-colors">
              Model Critique ({selectedItem.model_outcome || 'No outcome'})
            </summary>
            <div className="px-5 pb-5 text-sm text-gray-700 whitespace-pre-wrap border-t border-gray-100 pt-4">
              {selectedItem.model_critique}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}

function QuestionCard({
  difficulty,
  question,
  answer,
}: {
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
}) {
  const styles = {
    easy: {
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
      badgeBg: 'bg-[#10B981]',
      badgeText: 'text-white',
    },
    medium: {
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FCD34D]',
      badgeBg: 'bg-[#F59E0B]',
      badgeText: 'text-white',
    },
    hard: {
      bg: 'bg-[#FEE2E2]',
      border: 'border-[#FCA5A5]',
      badgeBg: 'bg-[#EF4444]',
      badgeText: 'text-white',
    },
  };

  const style = styles[difficulty];

  return (
    <div
      className={`rounded-xl ${style.bg} border-2 ${style.border} p-6 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${style.badgeBg} ${style.badgeText}`}
        >
          {difficulty}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
            Question
          </h4>
          <p
            className="text-gray-900 leading-relaxed text-base"
            dangerouslySetInnerHTML={{ __html: renderLatex(question) }}
          />
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
            Answer
          </h4>
          <p
            className="text-gray-800 font-mono text-sm bg-white/60 rounded-lg p-3 border border-gray-200"
            dangerouslySetInnerHTML={{ __html: renderLatex(answer) }}
          />
        </div>
      </div>
    </div>
  );
}
