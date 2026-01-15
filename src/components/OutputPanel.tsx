'use client';

import { useEval } from '@/context/EvalContext';
import { renderLatex } from '@/lib/latex';

export function OutputPanel() {
  const { selectedItem } = useEval();

  if (!selectedItem) {
    return (
      <main className="flex-1 bg-[#fffbf5] flex items-center justify-center">
        <p className="text-gray-500">Select an example to view output</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#fffbf5] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <GenericOutputRenderer output={selectedItem.output} />

        {/* Model Critique (collapsed by default, for reference) */}
        {selectedItem.model_critique && (
          <details className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <summary className="p-5 cursor-pointer text-sm text-gray-600 hover:text-[#7C3AED] font-medium transition-colors">
              Model Critique
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

/**
 * Generic renderer that can handle any JSON structure
 * Renders objects, arrays, strings, numbers, etc. recursively
 */
function GenericOutputRenderer({ output }: { output: any }) {
  // Handle null/undefined
  if (output == null) {
    return <div className="text-gray-400 italic">No output</div>;
  }

  // Handle arrays
  if (Array.isArray(output)) {
    return (
      <div className="space-y-2">
        {output.map((item, index) => (
          <div key={index} className="flex gap-3">
            <span className="text-[#7C3AED] font-medium min-w-[24px]">
              {index + 1}.
            </span>
            <div className="flex-1">
              <RenderValue value={item} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle objects
  if (typeof output === 'object') {
    const entries = Object.entries(output);
    
    // Check if this looks like a misconception output
    if (isMisconceptionOutput(output)) {
      return <MisconceptionCard output={output} />;
    }
    
    // Check if this looks like a question set (has easy/medium/hard)
    const hasQuestionDifficulties = 
      entries.some(([key]) => ['easy', 'medium', 'hard'].includes(key));
    
    if (hasQuestionDifficulties) {
      return <QuestionSetRenderer output={output} />;
    }

    // Generic object rendering
    return (
      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <RenderField key={key} fieldKey={key} value={value} />
        ))}
      </div>
    );
  }

  // Primitive values
  return <RenderValue value={output} />;
}

/**
 * Render a single field (key-value pair)
 */
function RenderField({ fieldKey, value }: { fieldKey: string; value: any }) {
  const label = formatFieldName(fieldKey);
  
  // Special handling for certain field patterns
  const isArray = Array.isArray(value);
  const isObject = value && typeof value === 'object' && !isArray;
  const isQuestionAnswer = 
    isObject && 'question' in value && 'answer' in value;

  // Question-answer pairs (from exitticket, scaffolded subquestions, multiple_choice, etc)
  if (isQuestionAnswer) {
    return (
      <QuestionAnswerCard
        difficulty={fieldKey}
        question={value.question}
        answer={value.answer}
        answerOptions={value.answerOptions}
        nodeType={value.nodeType}
      />
    );
  }

  // Regular field rendering
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <h3 className="text-sm font-bold text-[#7C3AED] mb-3 uppercase tracking-wide">
        {label}
      </h3>
      <div className="text-gray-700">
        <RenderValue value={value} />
      </div>
    </div>
  );
}

/**
 * Render any value (string, number, array, object)
 */
function RenderValue({ value }: { value: any }) {
  // Null/undefined
  if (value == null) {
    return <span className="text-gray-400 italic">—</span>;
  }

  // Boolean
  if (typeof value === 'boolean') {
    return (
      <span className={value ? 'text-green-600' : 'text-red-600'}>
        {value ? '✓' : '✗'}
      </span>
    );
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">Empty list</span>;
    }
    
    return (
      <ul className="space-y-2.5">
        {value.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-[#7C3AED] font-bold text-lg leading-none mt-0.5">•</span>
            <div className="flex-1 text-gray-700">
              <RenderValue value={item} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // Nested object
  if (typeof value === 'object') {
    return (
      <div className="space-y-3 pl-4 border-l-2 border-gray-200">
        {Object.entries(value).map(([key, val]) => (
          <div key={key}>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {formatFieldName(key)}:
            </span>
            <div className="mt-1">
              <RenderValue value={val} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // String with newlines - render as bullet list
  const strValue = String(value);
  if (strValue.includes('\n')) {
    const items = strValue.split('\n').filter(item => item.trim());
    if (items.length > 1) {
      return (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[#7C3AED] font-bold text-lg leading-none mt-0.5">•</span>
              <div
                className="flex-1 text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderLatex(item.trim()) }}
              />
            </li>
          ))}
        </ul>
      );
    }
  }
  
  // String (with LaTeX rendering)
  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: renderLatex(strValue) }}
    />
  );
}

/**
 * Special renderer for question sets (exitticket/warmup format)
 */
function QuestionSetRenderer({ output }: { output: any }) {
  const difficulties = ['easy', 'medium', 'hard'] as const;
  const questions = difficulties
    .map(d => ({ difficulty: d, data: output[d] }))
    .filter(q => q.data && typeof q.data === 'object' && 'question' in q.data);

  // Also render other fields that aren't questions
  const otherFields = Object.entries(output).filter(
    ([key]) => !['easy', 'medium', 'hard'].includes(key)
  );

  return (
    <div className="space-y-6">
      {/* Other fields first (like prerequisitesChosen) */}
      {otherFields.map(([key, value]) => (
        <RenderField key={key} fieldKey={key} value={value} />
      ))}

      {/* Question cards */}
      {questions.map(({ difficulty, data }) => (
        <QuestionAnswerCard
          key={difficulty}
          difficulty={difficulty}
          question={data.question}
          answer={data.answer}
          answerOptions={data.answerOptions}
          nodeType={data.nodeType}
        />
      ))}
    </div>
  );
}

/**
 * Styled card for question-answer pairs
 * Supports answerOptions (for multiple choice) and nodeType (for scaffolded subquestions)
 */
function QuestionAnswerCard({
  difficulty,
  question,
  answer,
  answerOptions,
  nodeType,
}: {
  difficulty: string;
  question: string;
  answer: string;
  answerOptions?: string[] | null;
  nodeType?: string;
}) {
  const difficultyLower = difficulty.toLowerCase();
  
  const styles: Record<string, any> = {
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
    extension: {
      bg: 'bg-[#EDE9FE]',
      border: 'border-[#C4B5FD]',
      badgeBg: 'bg-[#7C3AED]',
      badgeText: 'text-white',
    },
  };

  // Node type styles for subquestion badges
  const nodeTypeStyles: Record<string, { bg: string; text: string }> = {
    multiplechoice: { bg: 'bg-blue-100', text: 'text-blue-700' },
    shortanswer: { bg: 'bg-amber-100', text: 'text-amber-700' },
    openended: { bg: 'bg-purple-100', text: 'text-purple-700' },
  };

  const style = styles[difficultyLower] || {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badgeBg: 'bg-gray-600',
    badgeText: 'text-white',
  };

  const nodeTypeStyle = nodeType 
    ? nodeTypeStyles[nodeType.toLowerCase().replace(/\s+/g, '')] || { bg: 'bg-gray-100', text: 'text-gray-600' }
    : null;

  return (
    <div
      className={`rounded-xl ${style.bg} border-2 ${style.border} p-6 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${style.badgeBg} ${style.badgeText}`}
        >
          {difficulty}
        </span>
        {nodeType && nodeTypeStyle && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${nodeTypeStyle.bg} ${nodeTypeStyle.text}`}
          >
            {nodeType}
          </span>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
            Question
          </h4>
          <div
            className="text-gray-900 leading-relaxed text-base prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderLatex(question) }}
          />
        </div>

        {/* Answer Options (for multiple choice questions) */}
        {answerOptions && answerOptions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Answer Options
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {answerOptions.map((option, index) => {
                const isCorrect = option === answer;
                return (
                  <div
                    key={index}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      isCorrect
                        ? 'bg-green-50 border-green-300 text-green-800 font-medium'
                        : 'bg-white/60 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="font-semibold text-gray-500 mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span
                      className="prose prose-sm max-w-none inline"
                      dangerouslySetInnerHTML={{ __html: renderLatex(option) }}
                    />
                    {isCorrect && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {answer && (
          <div>
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Answer
            </h4>
            <div
              className="text-gray-800 text-sm bg-white/60 rounded-lg p-3 border border-gray-200 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderLatex(answer) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Check if output looks like a misconception slide output
 */
function isMisconceptionOutput(output: any): boolean {
  if (!output || typeof output !== 'object') return false;

  const normalizedKeys = new Set(
    Object.keys(output).map((key) => normalizeFieldKey(key))
  );

  // Presence of misconception is the strongest signal
  if (normalizedKeys.has('misconception')) {
    return true;
  }

  // Fallback: enough of the signature fields exist
  const signatureFields = [
    'incorrectexample',
    'correctconcept',
    'correctexample',
  ];
  const matches = signatureFields.filter((field) => normalizedKeys.has(field));
  return matches.length >= 2;
}

/**
 * Misconception card with 2x2 grid layout matching platform design
 */
function MisconceptionCard({ output }: { output: any }) {
  const question = toOptionalString(
    getOutputField(output, ['question', 'exampleQuestion'])
  );
  const misconception = toOptionalString(
    getOutputField(output, ['misconception'])
  );
  const incorrectExample = toOptionalString(
    getOutputField(output, ['incorrectExample', 'incorrect_example'])
  );
  const correctConcept = toOptionalString(
    getOutputField(output, ['correctConcept', 'correct_concept'])
  );
  const correctExample = toOptionalString(
    getOutputField(output, ['correctExample', 'correct_example'])
  );

  const { candidateBrainstorm, reasoning, pickedMisconception } = output;
  const otherFields = Object.fromEntries(
    Object.entries(output).filter(([key]) => {
      const normalized = normalizeFieldKey(key);
      return ![
        'question',
        'examplequestion',
        'misconception',
        'incorrectexample',
        'correctconcept',
        'correctexample',
        'candidatebrainstorm',
        'reasoning',
        'pickedmisconception',
      ].includes(normalized);
    })
  );

  return (
    <div className="space-y-4">
      {/* Question at top */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Question
          </h3>
        </div>
        <div
          className="text-xl font-semibold text-gray-900 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderLatex(question) }}
        />
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
        {/* Top Left - Correct Answer */}
        <div className="bg-green-50 p-5 border-r border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 text-lg">✅</span>
            <h4 className="text-sm font-bold text-green-600">Correct Answer</h4>
          </div>
          <div
            className="text-gray-800 prose prose-sm max-w-none text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: renderLatex(correctExample) }}
          />
        </div>

        {/* Top Right - Incorrect Answer */}
        <div className="bg-red-50 p-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-lg">❌</span>
            <h4 className="text-sm font-bold text-red-500">Incorrect Answer</h4>
          </div>
          <div
            className="text-gray-800 prose prose-sm max-w-none text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: renderLatex(incorrectExample) }}
          />
        </div>

        {/* Bottom Left - Correct Concept */}
        <div className="bg-green-50 p-5 border-r border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 text-lg">👍</span>
            <h4 className="text-sm font-bold text-amber-600">Correct Concept</h4>
          </div>
          <div
            className="text-gray-800 prose prose-sm max-w-none text-lg font-semibold"
            dangerouslySetInnerHTML={{ __html: renderLatex(correctConcept) }}
          />
        </div>

        {/* Bottom Right - Misconception */}
        <div className="bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-lg">⊖</span>
            <h4 className="text-sm font-bold text-red-500">Misconception</h4>
          </div>
          <div
            className="text-gray-800 prose prose-sm max-w-none text-lg font-semibold"
            dangerouslySetInnerHTML={{ __html: renderLatex(misconception) }}
          />
        </div>
      </div>

      {/* Other fields (if any) */}
      {Object.keys(otherFields).length > 0 && (
        <div className="space-y-4">
          {Object.entries(otherFields).map(([key, value]) => (
            <RenderField key={key} fieldKey={key} value={value} />
          ))}
        </div>
      )}

      {/* Internal reasoning fields (collapsed) */}
      {(candidateBrainstorm || reasoning || pickedMisconception) && (
        <details className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <summary className="p-4 cursor-pointer text-sm text-gray-500 hover:text-[#7C3AED] font-medium transition-colors">
            AI Reasoning Details
          </summary>
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {pickedMisconception && (
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Picked Misconception:</span>
                <p className="text-sm text-gray-700 mt-1">{pickedMisconception}</p>
              </div>
            )}
            {candidateBrainstorm && (
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Candidate Brainstorm:</span>
                <p className="text-sm text-gray-700 mt-1">{candidateBrainstorm}</p>
              </div>
            )}
            {reasoning && (
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Reasoning:</span>
                <p className="text-sm text-gray-700 mt-1">{reasoning}</p>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function getOutputField(output: Record<string, unknown>, keys: string[]) {
  const normalizedMap = new Map(
    Object.entries(output).map(([key, value]) => [
      normalizeFieldKey(key),
      value,
    ])
  );

  for (const key of keys) {
    const normalized = normalizeFieldKey(key);
    if (normalizedMap.has(normalized)) {
      return normalizedMap.get(normalized);
    }
  }

  return undefined;
}

function toOptionalString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

function normalizeFieldKey(key: string) {
  return key
    .replace(/_/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * Format field names: camelCase or snake_case to Title Case
 */
function formatFieldName(key: string): string {
  return key
    // Handle camelCase: insert space before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Handle snake_case: replace underscores with spaces
    .replace(/_/g, ' ')
    // Handle numbers
    .replace(/(\d+)/g, ' $1 ')
    // Capitalize first letter of each word
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}
