'use client';

import { useState } from 'react';
import { useCurate } from '@/context/CurateContext';
import { EditableField } from '@/components/EditableField';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function formatNodeType(nodeType: string): string {
  return nodeType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type SaveFn = (path: string[], value: unknown) => void;

function difficultyBadgeClass(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'mild':
      return 'bg-emerald-100 text-emerald-700';
    case 'moderate':
      return 'bg-amber-100 text-amber-700';
    case 'extension':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

/** Section label — small uppercase header used throughout all renderers. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
      {children}
    </h3>
  );
}

/** A white card with a subtle border — the standard content container. */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

/** Difficulty badge */
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${difficultyBadgeClass(difficulty)}`}>
      {difficulty}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Editable list — used for teacherTips, steps, answerOptions, etc.
// ---------------------------------------------------------------------------

interface EditableListProps {
  items: string[];
  path: string[];
  onSave: SaveFn;
  /** Render each item with a leading letter (A/B/C/D) instead of a bullet */
  lettered?: boolean;
  /** Highlight item whose text matches this value */
  correctAnswer?: string;
}

function EditableList({ items, path, onSave, lettered = false, correctAnswer }: EditableListProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const handleDeleteItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onSave(path, next);
  };

  const handleAddItem = () => {
    onSave(path, [...items, '']);
  };

  const handleUpdateItem = (index: number, value: string) => {
    const next = items.map((item, i) => (i === index ? value : item));
    onSave(path, next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isCorrect =
          correctAnswer !== undefined &&
          item.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

        return (
          <div
            key={index}
            className={`flex items-start gap-3 group relative rounded-lg px-3 py-2 border transition-colors ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-gray-50 border-gray-200'
            }`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Leading label */}
            <span
              className={`min-w-[20px] text-sm font-bold mt-0.5 flex-shrink-0 ${
                isCorrect ? 'text-emerald-600' : 'text-[#7C3AED]'
              }`}
            >
              {lettered ? `${String.fromCharCode(65 + index)}.` : `${index + 1}.`}
            </span>

            {/* Editable content */}
            <div className="flex-1 text-sm text-gray-800">
              <EditableField
                value={item}
                onSave={(newValue) => handleUpdateItem(index, newValue)}
                multiline={false}
              />
            </div>

            {/* Correct answer tick */}
            {isCorrect && (
              <span className="text-emerald-600 font-bold text-sm mt-0.5 flex-shrink-0">
                ✓
              </span>
            )}

            {/* Delete button — shows on hover */}
            {hovered === index && (
              <button
                onClick={() => handleDeleteItem(index)}
                className="absolute top-1 right-1 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove item"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}

      {/* Add item */}
      <button
        onClick={handleAddItem}
        className="flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors border border-dashed border-purple-300 w-full justify-center mt-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question-answer card — shared by EXIT_TICKET, WARM_UP, SCAFFOLDED
// ---------------------------------------------------------------------------

interface QAItem {
  question: string;
  answer: string;
}

interface QACardProps {
  index: number;
  qa: QAItem;
  path: string[]; // path to this specific question object
  onSave: SaveFn;
}

function QuestionAnswerCard({ index, qa, path, onSave }: QACardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <SectionLabel>Question</SectionLabel>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-gray-900 text-base font-medium">
            <EditableField
              value={qa.question}
              onSave={(v) => onSave([...path, 'question'], v)}
            />
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <SectionLabel>Answer</SectionLabel>
          <div className="text-gray-800 text-sm">
            <EditableField
              value={qa.answer}
              onSave={(v) => onSave([...path, 'answer'], v)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Node type badge
// ---------------------------------------------------------------------------

function NodeTypeBadge({ nodeType }: { nodeType: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 uppercase tracking-wide">
        {formatNodeType(nodeType)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// THOUGHT_SPARKER renderer
// ---------------------------------------------------------------------------

interface ThoughtSparkerJson {
  firstSentenceHeader: string;
  firstSentence: string;
  secondSentenceHeader: string;
  secondSentence: string;
  teacherTips: string[];
}

function ThoughtSparkerRenderer({
  data,
  onSave,
}: {
  data: ThoughtSparkerJson;
  onSave: SaveFn;
}) {
  return (
    <div className="space-y-5">
      {/* First sentence */}
      <Card>
        <div className="space-y-3">
          {data.firstSentenceHeader !== undefined && (
            <div>
              <SectionLabel>Header</SectionLabel>
              <EditableField
                value={data.firstSentenceHeader}
                onSave={(v) => onSave(['firstSentenceHeader'], v)}
                multiline={false}
              />
            </div>
          )}
          <div>
            <SectionLabel>Prompt</SectionLabel>
            <div className="text-gray-900 text-base font-medium">
              <EditableField
                value={data.firstSentence}
                onSave={(v) => onSave(['firstSentence'], v)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Second sentence — only render if non-empty */}
      {(data.secondSentenceHeader || data.secondSentence) && (
        <Card>
          <div className="space-y-3">
            {data.secondSentenceHeader !== undefined && (
              <div>
                <SectionLabel>Second Header</SectionLabel>
                <EditableField
                  value={data.secondSentenceHeader}
                  onSave={(v) => onSave(['secondSentenceHeader'], v)}
                  multiline={false}
                />
              </div>
            )}
            <div>
              <SectionLabel>Second Sentence</SectionLabel>
              <div className="text-gray-900 text-base">
                <EditableField
                  value={data.secondSentence}
                  onSave={(v) => onSave(['secondSentence'], v)}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Teacher tips */}
      <Card>
        <SectionLabel>Teacher Tips</SectionLabel>
        <EditableList
          items={data.teacherTips ?? []}
          path={['teacherTips']}
          onSave={onSave}
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// APPLICATION renderer
// ---------------------------------------------------------------------------

interface ApplicationJson {
  title: string;
  example1Header: string;
  example1Body: string;
  example2Header: string;
  example2Body: string;
}

function ApplicationRenderer({
  data,
  onSave,
}: {
  data: ApplicationJson;
  onSave: SaveFn;
}) {
  const hasExample2 = data.example2Header || data.example2Body;

  return (
    <div className="space-y-5">
      {/* Title */}
      <Card>
        <SectionLabel>Title</SectionLabel>
        <div className="text-gray-900 text-lg font-semibold">
          <EditableField
            value={data.title}
            onSave={(v) => onSave(['title'], v)}
            multiline={false}
          />
        </div>
      </Card>

      {/* Example 1 */}
      <Card>
        <div className="space-y-3">
          <div>
            <SectionLabel>Example 1 — Header</SectionLabel>
            <EditableField
              value={data.example1Header}
              onSave={(v) => onSave(['example1Header'], v)}
              multiline={false}
            />
          </div>
          <div>
            <SectionLabel>Example 1 — Body</SectionLabel>
            <EditableField
              value={data.example1Body}
              onSave={(v) => onSave(['example1Body'], v)}
            />
          </div>
        </div>
      </Card>

      {/* Example 2 — only if non-empty */}
      {hasExample2 && (
        <Card>
          <div className="space-y-3">
            <div>
              <SectionLabel>Example 2 — Header</SectionLabel>
              <EditableField
                value={data.example2Header}
                onSave={(v) => onSave(['example2Header'], v)}
                multiline={false}
              />
            </div>
            <div>
              <SectionLabel>Example 2 — Body</SectionLabel>
              <EditableField
                value={data.example2Body}
                onSave={(v) => onSave(['example2Body'], v)}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONTEMPLATIVE_QUESTION renderer
// ---------------------------------------------------------------------------

interface ContemplativeQuestionJson {
  question: string;
  teacherTips: string[];
  difficulty: string;
}

function ContemplativeQuestionRenderer({
  data,
  onSave,
}: {
  data: ContemplativeQuestionJson;
  onSave: SaveFn;
}) {
  return (
    <div className="space-y-5">
      {/* Question */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-3">
          <SectionLabel>Question</SectionLabel>
          {data.difficulty && <DifficultyBadge difficulty={data.difficulty} />}
        </div>
        <div className="text-gray-900 text-xl font-semibold leading-snug">
          <EditableField
            value={data.question}
            onSave={(v) => onSave(['question'], v)}
          />
        </div>
        {data.difficulty !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <SectionLabel>Difficulty</SectionLabel>
            <EditableField
              value={data.difficulty}
              onSave={(v) => onSave(['difficulty'], v)}
              multiline={false}
            />
          </div>
        )}
      </Card>

      {/* Teacher tips */}
      <Card>
        <SectionLabel>Teacher Tips</SectionLabel>
        <EditableList
          items={data.teacherTips ?? []}
          path={['teacherTips']}
          onSave={onSave}
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXIT_TICKET renderer
// ---------------------------------------------------------------------------

interface ExitTicketJson {
  questions: QAItem[];
}

function ExitTicketRenderer({
  data,
  onSave,
}: {
  data: ExitTicketJson;
  onSave: SaveFn;
}) {
  const questions = data.questions ?? [];

  const handleAddQuestion = () => {
    onSave(['questions'], [...questions, { question: '', answer: '' }]);
  };

  return (
    <div className="space-y-4">
      {questions.map((qa, index) => (
        <QuestionAnswerCard
          key={index}
          index={index}
          qa={qa}
          path={['questions', String(index)]}
          onSave={onSave}
        />
      ))}

      <button
        onClick={handleAddQuestion}
        className="flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors border border-dashed border-purple-300 w-full justify-center"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add question
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTIVITY renderer
// ---------------------------------------------------------------------------

interface ActivityJson {
  header: string;
  scenario: string;
  steps: string[];
  discussion: string[];
  differentiation: {
    support: string;
    extend: string;
  };
}

function ActivityRenderer({
  data,
  onSave,
}: {
  data: ActivityJson;
  onSave: SaveFn;
}) {
  const hasDifferentiation =
    data.differentiation &&
    (data.differentiation.support || data.differentiation.extend);

  const hasDiscussion = data.discussion && data.discussion.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <SectionLabel>Header</SectionLabel>
        <div className="text-gray-900 text-lg font-semibold">
          <EditableField
            value={data.header}
            onSave={(v) => onSave(['header'], v)}
            multiline={false}
          />
        </div>
      </Card>

      {/* Scenario */}
      <Card>
        <SectionLabel>Scenario</SectionLabel>
        <EditableField
          value={data.scenario}
          onSave={(v) => onSave(['scenario'], v)}
        />
      </Card>

      {/* Steps */}
      <Card>
        <SectionLabel>Steps</SectionLabel>
        <EditableList
          items={data.steps ?? []}
          path={['steps']}
          onSave={onSave}
        />
      </Card>

      {/* Discussion — only if non-empty */}
      {hasDiscussion && (
        <Card>
          <SectionLabel>Discussion</SectionLabel>
          <EditableList
            items={data.discussion}
            path={['discussion']}
            onSave={onSave}
          />
        </Card>
      )}

      {/* Differentiation — only if non-empty */}
      {hasDifferentiation && (
        <Card>
          <SectionLabel>Differentiation</SectionLabel>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <SectionLabel>Support</SectionLabel>
              <EditableField
                value={data.differentiation.support}
                onSave={(v) => onSave(['differentiation', 'support'], v)}
              />
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <SectionLabel>Extend</SectionLabel>
              <EditableField
                value={data.differentiation.extend}
                onSave={(v) => onSave(['differentiation', 'extend'], v)}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WARM_UP_QUESTIONS_WITH_CONTEXT renderer
// ---------------------------------------------------------------------------

interface WarmUpJson {
  situation: string;
  questions: QAItem[];
}

function WarmUpRenderer({
  data,
  onSave,
}: {
  data: WarmUpJson;
  onSave: SaveFn;
}) {
  const questions = data.questions ?? [];

  const handleAddQuestion = () => {
    onSave(['questions'], [...questions, { question: '', answer: '' }]);
  };

  return (
    <div className="space-y-5">
      {/* Situation */}
      <Card>
        <SectionLabel>Situation</SectionLabel>
        <div className="text-gray-900 text-base">
          <EditableField
            value={data.situation}
            onSave={(v) => onSave(['situation'], v)}
          />
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((qa, index) => (
          <QuestionAnswerCard
            key={index}
            index={index}
            qa={qa}
            path={['questions', String(index)]}
            onSave={onSave}
          />
        ))}

        <button
          onClick={handleAddQuestion}
          className="flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors border border-dashed border-purple-300 w-full justify-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add question
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MULTIPLE_CHOICE_QUESTION renderer
// ---------------------------------------------------------------------------

interface MultipleChoiceJson {
  question: string;
  answerOptions: string[];
  answer: string;
  difficulty: string;
}

function MultipleChoiceRenderer({
  data,
  onSave,
}: {
  data: MultipleChoiceJson;
  onSave: SaveFn;
}) {
  return (
    <div className="space-y-5">
      {/* Question */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-3">
          <SectionLabel>Question</SectionLabel>
          {data.difficulty && <DifficultyBadge difficulty={data.difficulty} />}
        </div>
        <div className="text-gray-900 text-xl font-semibold leading-snug">
          <EditableField
            value={data.question}
            onSave={(v) => onSave(['question'], v)}
          />
        </div>
        {data.difficulty !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <SectionLabel>Difficulty</SectionLabel>
            <EditableField
              value={data.difficulty}
              onSave={(v) => onSave(['difficulty'], v)}
              multiline={false}
            />
          </div>
        )}
      </Card>

      {/* Answer options */}
      <Card>
        <SectionLabel>Answer Options</SectionLabel>
        <EditableList
          items={data.answerOptions ?? []}
          path={['answerOptions']}
          onSave={onSave}
          lettered={true}
          correctAnswer={data.answer}
        />
      </Card>

      {/* Correct answer */}
      <Card>
        <SectionLabel>Correct Answer</SectionLabel>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <EditableField
            value={data.answer}
            onSave={(v) => onSave(['answer'], v)}
            multiline={false}
          />
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCAFFOLDED_QUESTION renderer
// ---------------------------------------------------------------------------

interface ScaffoldedJson {
  headline: string;
  questions: QAItem[];
  difficulty: string;
}

function ScaffoldedQuestionRenderer({
  data,
  onSave,
}: {
  data: ScaffoldedJson;
  onSave: SaveFn;
}) {
  const questions = data.questions ?? [];

  const handleAddQuestion = () => {
    onSave(['questions'], [...questions, { question: '', answer: '' }]);
  };

  return (
    <div className="space-y-5">
      {/* Headline + difficulty */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-3">
          <SectionLabel>Headline</SectionLabel>
          {data.difficulty && <DifficultyBadge difficulty={data.difficulty} />}
        </div>
        <div className="text-gray-900 text-lg font-semibold">
          <EditableField
            value={data.headline}
            onSave={(v) => onSave(['headline'], v)}
            multiline={false}
          />
        </div>
        {data.difficulty !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <SectionLabel>Difficulty</SectionLabel>
            <EditableField
              value={data.difficulty}
              onSave={(v) => onSave(['difficulty'], v)}
              multiline={false}
            />
          </div>
        )}
      </Card>

      {/* Numbered Q&A cards */}
      <div className="space-y-4">
        {questions.map((qa, index) => (
          <QuestionAnswerCard
            key={index}
            index={index}
            qa={qa}
            path={['questions', String(index)]}
            onSave={onSave}
          />
        ))}

        <button
          onClick={handleAddQuestion}
          className="flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors border border-dashed border-purple-300 w-full justify-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add question
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic / fallback renderer
// ---------------------------------------------------------------------------

function GenericOutputRenderer({
  output,
  onSave,
}: {
  output: Record<string, unknown>;
  onSave: SaveFn;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(output).map(([key, value]) => (
        <Card key={key}>
          <SectionLabel>{formatNodeType(key)}</SectionLabel>
          <GenericValue value={value} path={[key]} onSave={onSave} />
        </Card>
      ))}
    </div>
  );
}

function GenericValue({
  value,
  path,
  onSave,
}: {
  value: unknown;
  path: string[];
  onSave: SaveFn;
}) {
  if (value == null) {
    return <span className="text-gray-400 italic text-sm">—</span>;
  }

  if (Array.isArray(value)) {
    // Array of objects
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return (
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="mb-2 last:mb-0">
                  <SectionLabel>{formatNodeType(k)}</SectionLabel>
                  <GenericValue value={v} path={[...path, String(i), k]} onSave={onSave} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Array of primitives
    return (
      <EditableList
        items={(value as unknown[]).map(String)}
        path={path}
        onSave={onSave}
      />
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="space-y-3 pl-3 border-l-2 border-gray-200">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <SectionLabel>{formatNodeType(k)}</SectionLabel>
            <GenericValue value={v} path={[...path, k]} onSave={onSave} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <EditableField
      value={String(value)}
      onSave={(v) => onSave(path, v)}
    />
  );
}

// ---------------------------------------------------------------------------
// Main router — dispatches on node_type
// ---------------------------------------------------------------------------

function OutputRenderer({
  nodeType,
  output,
  onSave,
}: {
  nodeType: string;
  output: Record<string, unknown>;
  onSave: SaveFn;
}) {
  switch (nodeType) {
    case 'THOUGHT_SPARKER':
      return (
        <ThoughtSparkerRenderer
          data={output as unknown as ThoughtSparkerJson}
          onSave={onSave}
        />
      );

    case 'APPLICATION':
      return (
        <ApplicationRenderer
          data={output as unknown as ApplicationJson}
          onSave={onSave}
        />
      );

    case 'CONTEMPLATIVE_QUESTION':
      return (
        <ContemplativeQuestionRenderer
          data={output as unknown as ContemplativeQuestionJson}
          onSave={onSave}
        />
      );

    case 'EXIT_TICKET':
      return (
        <ExitTicketRenderer
          data={output as unknown as ExitTicketJson}
          onSave={onSave}
        />
      );

    case 'ACTIVITY':
      return (
        <ActivityRenderer
          data={output as unknown as ActivityJson}
          onSave={onSave}
        />
      );

    case 'WARM_UP_QUESTIONS_WITH_CONTEXT':
      return (
        <WarmUpRenderer
          data={output as unknown as WarmUpJson}
          onSave={onSave}
        />
      );

    case 'MULTIPLE_CHOICE_QUESTION':
      return (
        <MultipleChoiceRenderer
          data={output as unknown as MultipleChoiceJson}
          onSave={onSave}
        />
      );

    case 'SCAFFOLDED_QUESTION':
      return (
        <ScaffoldedQuestionRenderer
          data={output as unknown as ScaffoldedJson}
          onSave={onSave}
        />
      );

    default:
      return <GenericOutputRenderer output={output} onSave={onSave} />;
  }
}

// ---------------------------------------------------------------------------
// Public export — the panel itself
// ---------------------------------------------------------------------------

export function CurateOutputPanel() {
  const { selectedItem, updateItemField } = useCurate();

  if (!selectedItem) {
    return (
      <main className="h-full bg-[#fffbf5] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Select an example to view output</p>
      </main>
    );
  }

  const onSave: SaveFn = (path, value) => {
    updateItemField(selectedItem.example_id, ['example_output_json', ...path], value);
  };

  return (
    <main className="h-full bg-[#fffbf5] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <NodeTypeBadge nodeType={selectedItem.node_type} />
        <OutputRenderer
          nodeType={selectedItem.node_type}
          output={selectedItem.example_output_json}
          onSave={onSave}
        />
      </div>
    </main>
  );
}
