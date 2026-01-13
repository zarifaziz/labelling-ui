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
  const colors = {
    easy: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    medium: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    hard: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
  };

  const badges = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    hard: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <div
      className={`rounded-lg bg-gradient-to-br ${colors[difficulty]} border p-5`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${badges[difficulty]}`}
        >
          {difficulty}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Question
          </h4>
          <p
            className="text-slate-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderLatex(question) }}
          />
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Answer
          </h4>
          <p
            className="text-slate-300 font-mono"
            dangerouslySetInnerHTML={{ __html: renderLatex(answer) }}
          />
        </div>
      </div>
    </div>
  );
}
