'use client';

import { useState } from 'react';
import { useEval } from '@/context/EvalContext';
import { MarkdownRenderer } from './MarkdownRenderer';

export function TracePanel() {
  const { selectedTrace, selectedItem } = useEval();

  if (!selectedItem) {
    return (
      <main className="h-full bg-[#fffbf5] flex items-center justify-center">
        <p className="text-gray-500">Select an example to view trace</p>
      </main>
    );
  }

  if (!selectedTrace) {
    return (
      <main className="h-full bg-[#fffbf5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No trace data available for this item</p>
          <p className="text-sm text-gray-400 mt-2">ID: {selectedItem.id}</p>
        </div>
      </main>
    );
  }

  const inputData = parseJson(selectedTrace.input_trace);
  const outputData = parseJson(selectedTrace.output_trace);

  // Get additional fields
  const additionalFields = Object.entries(selectedTrace)
    .filter(([key]) => !['id', 'input_trace', 'output_trace', 'inputTrace', 'outputTrace'].includes(key));

  return (
    <main className="h-full bg-[#fffbf5] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Input Trace */}
        <StructuredSection
          title="Filtered Input"
          data={inputData}
          rawContent={selectedTrace.input_trace}
          accentColor="blue"
        />

        {/* Output Trace */}
        <StructuredSection
          title="Filtered Output"
          data={outputData}
          rawContent={selectedTrace.output_trace}
          accentColor="emerald"
        />

        {/* Additional trace fields - also use structured display */}
        {additionalFields.map(([key, value]) => {
          const parsedValue = typeof value === 'string' ? parseJson(value) : null;
          return (
            <StructuredSection
              key={key}
              title={formatKey(key)}
              data={parsedValue}
              rawContent={String(value ?? '')}
              accentColor="gray"
            />
          );
        })}
      </div>
    </main>
  );
}

function parseJson(content: string): Record<string, unknown> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content.trim());
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'text-blue-700',
    headerBg: 'bg-blue-100/50',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    header: 'text-emerald-700',
    headerBg: 'bg-emerald-100/50',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    header: 'text-gray-700',
    headerBg: 'bg-gray-100/50',
  },
};

function StructuredSection({ title, data, rawContent, accentColor }: { title: string; data: Record<string, unknown> | null; rawContent?: string; accentColor: 'blue' | 'emerald' | 'gray' }) {
  const colors = colorClasses[accentColor];
  const [isExpanded, setIsExpanded] = useState(true);

  // If no parsed data but we have raw content, show it as a single content field
  if (!data && rawContent) {
    return (
      <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-5 py-3 flex items-center justify-between ${colors.headerBg} hover:opacity-90 transition-opacity`}
        >
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${colors.header}`}>
            {title}
          </h3>
          <span className={`text-xs ${colors.header}`}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>
        {isExpanded && (
          <div className="p-4">
            <FieldCard label="Content" value={rawContent} accentColor={accentColor} />
          </div>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
        <div className={`px-5 py-3 ${colors.headerBg}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${colors.header}`}>
            {title}
          </h3>
        </div>
        <div className="p-4">
          <span className="text-gray-400 italic text-sm">Empty</span>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== '');

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-5 py-3 flex items-center justify-between ${colors.headerBg} hover:opacity-90 transition-opacity`}
      >
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${colors.header}`}>
          {title}
        </h3>
        <span className={`text-xs ${colors.header}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-3">
          {entries.map(([key, value]) => (
            <FieldCard key={key} label={key} value={value} accentColor={accentColor} />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldCard({ label, value, accentColor }: { label: string; value: unknown; accentColor: 'blue' | 'emerald' | 'gray' }) {
  const formattedLabel = formatKey(label);
  const isMarkdown = typeof value === 'string' && /^#{1,6}\s+|^\s*[-*+]\s+|\*\*[^*]+\*\*/m.test(value);
  
  const colorMap = {
    blue: { border: 'border-blue-100', bg: 'bg-blue-100/50', text: 'text-blue-600' },
    emerald: { border: 'border-emerald-100', bg: 'bg-emerald-100/50', text: 'text-emerald-600' },
    gray: { border: 'border-gray-100', bg: 'bg-gray-100/50', text: 'text-gray-600' },
  };
  const colors = colorMap[accentColor];
  
  return (
    <div className={`bg-white rounded-lg border ${colors.border} overflow-hidden`}>
      <div className={`px-4 py-2 ${colors.bg} border-b ${colors.border}`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}>
          {formattedLabel}
        </span>
      </div>
      <div className="px-4 py-3">
        {isMarkdown ? (
          <MarkdownRenderer content={String(value)} />
        ) : typeof value === 'object' ? (
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded p-2">
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{String(value)}</p>
        )}
      </div>
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
