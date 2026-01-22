'use client';

import { useEval } from '@/context/EvalContext';
import { EditableField } from './EditableField';

export function InputPanel() {
  const { selectedItem, updateItemField } = useEval();

  if (!selectedItem) {
    return (
      <aside className="h-full bg-gray-50 border-r border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Inputs</h2>
        <p className="text-sm text-gray-500">Select an example to view inputs</p>
      </aside>
    );
  }

  const inputEntries = Object.entries(selectedItem.input).filter(
    ([, value]) => value !== undefined && value !== ''
  );

  return (
    <aside className="h-full bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Inputs</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {inputEntries.map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
            <dt className="text-xs font-bold text-[#7C3AED] uppercase tracking-wide">
              {formatKey(key)}
            </dt>
            <dd className="mt-2 text-sm text-gray-800">
              {Array.isArray(value) ? (
                <ul className="space-y-2.5">
                  {value.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#7C3AED] font-bold text-lg leading-none mt-0.5">•</span>
                      <span className="flex-1">{String(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EditableField
                  value={formatValue(value)}
                  onSave={(newValue) => updateItemField(selectedItem.id, ['input', key], newValue)}
                />
              )}
            </dd>
          </div>
        ))}
      </div>
    </aside>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatValue(value: string | boolean | number | undefined): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return '';
}
