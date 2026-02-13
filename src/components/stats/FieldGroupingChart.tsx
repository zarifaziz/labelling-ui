'use client';

import { useState, useEffect, useMemo } from 'react';
import { EvalItem } from '@/types';
import {
  discoverInputFields,
  computeFieldGrouping,
  formatFieldKey,
  FieldGroupData,
} from '@/lib/statsUtils';

interface FieldGroupingChartProps {
  items: EvalItem[];
}

export function FieldGroupingChart({ items }: FieldGroupingChartProps) {
  const fields = useMemo(() => discoverInputFields(items), [items]);
  const [selectedField, setSelectedField] = useState<string>('');

  // Auto-select first field on mount or when fields change
  useEffect(() => {
    if (fields.length > 0 && (!selectedField || !fields.includes(selectedField))) {
      setSelectedField(fields[0]);
    }
  }, [fields, selectedField]);

  const groupData: FieldGroupData | null = useMemo(() => {
    if (!selectedField) return null;
    return computeFieldGrouping(items, selectedField);
  }, [items, selectedField]);

  if (fields.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Group By Field</h3>
        <div className="text-sm text-gray-400 text-center py-8">
          No groupable fields found in input data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Group By</h3>
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        >
          {fields.map((field) => (
            <option key={field} value={field}>
              {formatFieldKey(field)}
            </option>
          ))}
        </select>
      </div>

      {groupData && groupData.groups.length > 0 && (
        <div className="space-y-2.5">
          {/* Legend */}
          <div className="flex gap-4 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Pass
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Fail
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" /> Unlabeled
            </span>
          </div>

          {groupData.groups.map((group) => (
            <div key={group.value} className="flex items-center gap-3">
              <div className="w-28 flex-shrink-0 text-xs text-gray-600 truncate text-right" title={group.value}>
                {group.value}
              </div>
              <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-gray-50">
                {group.pass > 0 && (
                  <div
                    className="bg-[#10B981] transition-all duration-300"
                    style={{ width: `${(group.pass / group.total) * 100}%` }}
                    title={`Pass: ${group.pass}`}
                  />
                )}
                {group.fail > 0 && (
                  <div
                    className="bg-[#EF4444] transition-all duration-300"
                    style={{ width: `${(group.fail / group.total) * 100}%` }}
                    title={`Fail: ${group.fail}`}
                  />
                )}
                {group.unlabeled > 0 && (
                  <div
                    className="bg-[#D1D5DB] transition-all duration-300"
                    style={{ width: `${(group.unlabeled / group.total) * 100}%` }}
                    title={`Unlabeled: ${group.unlabeled}`}
                  />
                )}
              </div>
              <div className="w-8 flex-shrink-0 text-xs text-gray-500 text-right">{group.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
