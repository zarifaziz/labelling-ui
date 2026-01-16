'use client';

import { useEval } from '@/context/EvalContext';
import { renderLatex } from '@/lib/latex';
import { EditableField } from './EditableField';

type OnUpdateFn = (path: string[], value: string) => void;

export function OutputPanel() {
  const { selectedItem, updateItemField } = useEval();

  if (!selectedItem) {
    return (
      <main className="flex-1 bg-[#fffbf5] flex items-center justify-center">
        <p className="text-gray-500">Select an example to view output</p>
      </main>
    );
  }

  const onUpdate: OnUpdateFn = (path, value) => {
    updateItemField(selectedItem.id, ['output', ...path], value);
  };

  return (
    <main className="flex-1 bg-[#fffbf5] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <GenericOutputRenderer output={selectedItem.output} path={[]} onUpdate={onUpdate} />

        {/* Model's Decision (collapsed by default, for reference) */}
        {(selectedItem.model_outcome || selectedItem.model_critique) && (
          <details className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <summary className="p-5 cursor-pointer text-sm text-gray-600 hover:text-[#7C3AED] font-medium transition-colors">
              Model&apos;s Decision
            </summary>
            <div className="px-5 pb-5 text-sm text-gray-700 border-t border-gray-100 pt-4 space-y-4">
              {selectedItem.model_outcome && (
                <div>
                  <span className="font-medium text-gray-600">Outcome: </span>
                  <span className={`font-semibold ${selectedItem.model_outcome === 'PASS' ? 'text-green-600' : selectedItem.model_outcome === 'FAIL' ? 'text-red-600' : 'text-gray-700'}`}>
                    {selectedItem.model_outcome}
                  </span>
                </div>
              )}
              {selectedItem.model_critique && (
                <div>
                  <div className="font-medium text-gray-600 mb-2">Critique:</div>
                  <EditableField
                    value={selectedItem.model_critique}
                    onSave={(newValue) => updateItemField(selectedItem.id, ['model_critique'], newValue)}
                  />
                </div>
              )}
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
function GenericOutputRenderer({ output, path, onUpdate }: { output: any; path: string[]; onUpdate: OnUpdateFn }) {
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
              <RenderValue value={item} path={[...path, String(index)]} onUpdate={onUpdate} />
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
      return <MisconceptionCard output={output} path={path} onUpdate={onUpdate} />;
    }
    
    // Check if this looks like a question set (has easy/medium/hard)
    const hasQuestionDifficulties = 
      entries.some(([key]) => ['easy', 'medium', 'hard'].includes(key));
    
    if (hasQuestionDifficulties) {
      return <QuestionSetRenderer output={output} path={path} onUpdate={onUpdate} />;
    }

    // Generic object rendering
    return (
      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <RenderField key={key} fieldKey={key} value={value} path={[...path, key]} onUpdate={onUpdate} />
        ))}
      </div>
    );
  }

  // Primitive values
  return <RenderValue value={output} path={path} onUpdate={onUpdate} />;
}

/**
 * Render a single field (key-value pair)
 */
function RenderField({ fieldKey, value, path, onUpdate }: { fieldKey: string; value: any; path: string[]; onUpdate: OnUpdateFn }) {
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
        path={path}
        onUpdate={onUpdate}
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
        <RenderValue value={value} path={path} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

/**
 * Render any value (string, number, array, object)
 */
function RenderValue({ value, path, onUpdate }: { value: any; path: string[]; onUpdate: OnUpdateFn }) {
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
              <RenderValue value={item} path={[...path, String(i)]} onUpdate={onUpdate} />
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
              <RenderValue value={val} path={[...path, key]} onUpdate={onUpdate} />
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
        <div>
          <EditableField
            value={strValue}
            onSave={(newValue) => onUpdate(path, newValue)}
          />
        </div>
      );
    }
  }
  
  // String (with LaTeX rendering via EditableField)
  return (
    <EditableField
      value={strValue}
      onSave={(newValue) => onUpdate(path, newValue)}
    />
  );
}

/**
 * Special renderer for question sets (exitticket/warmup format)
 */
function QuestionSetRenderer({ output, path, onUpdate }: { output: any; path: string[]; onUpdate: OnUpdateFn }) {
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
        <RenderField key={key} fieldKey={key} value={value} path={[...path, key]} onUpdate={onUpdate} />
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
          path={[...path, difficulty]}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

interface QuestionAnswerCardProps {
  difficulty?: string;
  question: string;
  answer?: string;
  answerOptions?: string[];
  nodeType?: string;
  path: string[];
  onUpdate: OnUpdateFn;
}

function QuestionAnswerCard({
  difficulty,
  question,
  answer,
  answerOptions,
  nodeType,
  path,
  onUpdate,
}: QuestionAnswerCardProps) {
  const difficultyColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    easy: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
    hard: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100' },
  };

  const colors = difficulty && difficultyColors[difficulty]
    ? difficultyColors[difficulty]
    : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100' };

  const showMultipleChoice = answerOptions && answerOptions.length > 0;
  const isMultipleChoice = nodeType === 'multiple_choice';

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6 space-y-4`}>
      {/* Header with difficulty badge */}
      <div className="flex items-center gap-3">
        {difficulty && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.badge} ${colors.text}`}>
            {difficulty}
          </span>
        )}
        {nodeType && (
          <span className="px-2 py-0.5 rounded text-xs text-gray-500 bg-white border border-gray-200">
            {formatFieldName(nodeType)}
          </span>
        )}
      </div>

      {/* Question */}
      <div>
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
          Question
        </h4>
        <div className="text-gray-900 text-lg font-medium">
          <EditableField
            value={question}
            onSave={(newValue) => onUpdate([...path, 'question'], newValue)}
          />
        </div>
      </div>

      {/* Multiple choice options */}
      {showMultipleChoice && (
        <div>
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
            Options
          </h4>
          <div className="space-y-2">
            {answerOptions.map((option, idx) => {
              const isCorrect = isMultipleChoice && answer && 
                option.toLowerCase().includes(answer.toLowerCase());
              return (
                <div 
                  key={idx}
                  className={`flex items-start gap-3 p-2 rounded-lg ${
                    isCorrect ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'
                  }`}
                >
                  <span className="text-sm font-mono text-gray-500 mt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <div className="prose prose-sm max-w-none inline flex-1">
                    <EditableField
                      value={option}
                      onSave={(newValue) => onUpdate([...path, 'answerOptions', String(idx)], newValue)}
                    />
                  </div>
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
          <div className="text-gray-800 text-sm bg-white/60 rounded-lg p-3 border border-gray-200">
            <EditableField
              value={answer}
              onSave={(newValue) => onUpdate([...path, 'answer'], newValue)}
            />
          </div>
        </div>
      )}
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
function MisconceptionCard({ output, path, onUpdate }: { output: any; path: string[]; onUpdate: OnUpdateFn }) {
  const questionKey = findOutputKey(output, ['question', 'exampleQuestion']);
  const misconceptionKey = findOutputKey(output, ['misconception']);
  const incorrectExampleKey = findOutputKey(output, ['incorrectExample', 'incorrect_example']);
  const correctConceptKey = findOutputKey(output, ['correctConcept', 'correct_concept']);
  const correctExampleKey = findOutputKey(output, ['correctExample', 'correct_example']);

  const question = toOptionalString(questionKey ? output[questionKey] : undefined);
  const misconception = toOptionalString(misconceptionKey ? output[misconceptionKey] : undefined);
  const incorrectExample = toOptionalString(incorrectExampleKey ? output[incorrectExampleKey] : undefined);
  const correctConcept = toOptionalString(correctConceptKey ? output[correctConceptKey] : undefined);
  const correctExample = toOptionalString(correctExampleKey ? output[correctExampleKey] : undefined);

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
        <div className="text-xl font-semibold text-gray-900">
          <EditableField
            value={question}
            onSave={(newValue) => onUpdate([...path, questionKey || 'question'], newValue)}
          />
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
        {/* Top Left - Misconception */}
        <div className="bg-red-50 p-5 border-r border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-lg">⊖</span>
            <h4 className="text-sm font-bold text-red-500">Misconception</h4>
          </div>
          <div className="text-gray-800 text-lg font-semibold">
            <EditableField
              value={misconception}
              onSave={(newValue) => onUpdate([...path, misconceptionKey || 'misconception'], newValue)}
            />
          </div>
        </div>

        {/* Top Right - Correct Concept */}
        <div className="bg-green-50 p-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 text-lg">👍</span>
            <h4 className="text-sm font-bold text-amber-600">Correct Concept</h4>
          </div>
          <div className="text-gray-800 text-lg font-semibold">
            <EditableField
              value={correctConcept}
              onSave={(newValue) => onUpdate([...path, correctConceptKey || 'correctConcept'], newValue)}
            />
          </div>
        </div>

        {/* Bottom Left - Incorrect Answer */}
        <div className="bg-red-50 p-5 border-r border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-lg">❌</span>
            <h4 className="text-sm font-bold text-red-500">Incorrect Answer</h4>
          </div>
          <div className="text-gray-800 text-lg font-medium">
            <EditableField
              value={incorrectExample}
              onSave={(newValue) => onUpdate([...path, incorrectExampleKey || 'incorrectExample'], newValue)}
            />
          </div>
        </div>

        {/* Bottom Right - Correct Answer */}
        <div className="bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 text-lg">✅</span>
            <h4 className="text-sm font-bold text-green-600">Correct Answer</h4>
          </div>
          <div className="text-gray-800 text-lg font-medium">
            <EditableField
              value={correctExample}
              onSave={(newValue) => onUpdate([...path, correctExampleKey || 'correctExample'], newValue)}
            />
          </div>
        </div>
      </div>

      {/* Other fields (if any) */}
      {Object.keys(otherFields).length > 0 && (
        <div className="space-y-4">
          {Object.entries(otherFields).map(([key, value]) => (
            <RenderField key={key} fieldKey={key} value={value} path={[...path, key]} onUpdate={onUpdate} />
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
                <div className="text-sm text-gray-700 mt-1">
                  <EditableField
                    value={pickedMisconception}
                    onSave={(newValue) => onUpdate([...path, 'pickedMisconception'], newValue)}
                  />
                </div>
              </div>
            )}
            {candidateBrainstorm && (
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Candidate Brainstorm:</span>
                <div className="text-sm text-gray-700 mt-1">
                  <EditableField
                    value={candidateBrainstorm}
                    onSave={(newValue) => onUpdate([...path, 'candidateBrainstorm'], newValue)}
                  />
                </div>
              </div>
            )}
            {reasoning && (
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Reasoning:</span>
                <div className="text-sm text-gray-700 mt-1">
                  <EditableField
                    value={reasoning}
                    onSave={(newValue) => onUpdate([...path, 'reasoning'], newValue)}
                  />
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function findOutputKey(output: Record<string, unknown>, keys: string[]): string | undefined {
  const normalizedMap = new Map(
    Object.keys(output).map((key) => [normalizeFieldKey(key), key])
  );

  for (const key of keys) {
    const normalized = normalizeFieldKey(key);
    if (normalizedMap.has(normalized)) {
      return normalizedMap.get(normalized);
    }
  }

  return undefined;
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
