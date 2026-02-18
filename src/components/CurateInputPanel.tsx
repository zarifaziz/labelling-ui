'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useCurate } from '@/context/CurateContext';
import { EditableField } from '@/components/EditableField';
import { CURATE_METADATA_FIELDS, CurateItem } from '@/types/curate';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert snake_case to Title Case with special-casing for known abbreviations */
function formatLabel(field: string): string {
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    // Keep "IDs" fully uppercase
    .replace(/\bIds\b/g, 'IDs')
    .replace(/\bId\b/g, 'ID');
}

/** Fields whose values are string arrays */
const ARRAY_FIELDS = new Set<string>(['skills', 'subtopics', 'skill_ids', 'subtopic_ids']);

function isArrayField(field: string): field is 'skills' | 'subtopics' | 'skill_ids' | 'subtopic_ids' {
  return ARRAY_FIELDS.has(field);
}

// ---------------------------------------------------------------------------
// Field groups (ordered; IDs group is collapsible)
// ---------------------------------------------------------------------------

interface FieldGroup {
  label: string;
  fields: (typeof CURATE_METADATA_FIELDS)[number][];
  collapsible?: boolean;
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    label: 'Core',
    fields: ['topic', 'node_type', 'difficulty'],
  },
  {
    label: 'Skills',
    fields: ['skills', 'skill_ids'],
  },
  {
    label: 'Location & Context',
    fields: ['class_year', 'country', 'context', 'period_number'],
  },
  {
    label: 'Subtopics',
    fields: ['subtopics', 'subtopic_ids'],
  },
  {
    label: 'IDs',
    fields: ['topic_id'],
    collapsible: true,
  },
];

// ---------------------------------------------------------------------------
// EditableTagList – inline chip editing for array fields
// ---------------------------------------------------------------------------

interface EditableTagListProps {
  values: string[];
  onSave: (newValues: string[]) => void;
}

function EditableTagList({ values, onSave }: EditableTagListProps) {
  const [tags, setTags] = useState<string[]>(values);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync when the parent value changes (e.g. item switch)
  useEffect(() => {
    setTags(values);
    setEditingIndex(null);
    setAddingNew(false);
    setNewValue('');
  }, [values]);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  useEffect(() => {
    if (addingNew && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [addingNew]);

  const commitEdit = (index: number) => {
    const trimmed = editingValue.trim();
    let next: string[];
    if (trimmed === '') {
      // Remove empty tag
      next = tags.filter((_, i) => i !== index);
    } else {
      next = tags.map((t, i) => (i === index ? trimmed : t));
    }
    setTags(next);
    setEditingIndex(null);
    onSave(next);
  };

  const commitAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed !== '') {
      const next = [...tags, trimmed];
      setTags(next);
      onSave(next);
    }
    setAddingNew(false);
    setNewValue('');
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') commitEdit(index);
    else if (e.key === 'Escape') {
      setEditingValue(tags[index]);
      setEditingIndex(null);
    }
  };

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitAdd();
    else if (e.key === 'Escape') {
      setAddingNew(false);
      setNewValue('');
    }
  };

  const removeTag = (index: number) => {
    const next = tags.filter((_, i) => i !== index);
    setTags(next);
    onSave(next);
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {tags.map((tag, index) =>
        editingIndex === index ? (
          <input
            key={index}
            ref={editInputRef}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={() => commitEdit(index)}
            onKeyDown={(e) => handleEditKeyDown(e, index)}
            className="h-6 px-2 text-xs border-2 border-[#7C3AED] rounded-full focus:outline-none bg-white text-gray-800 w-32"
          />
        ) : (
          <span
            key={index}
            className="group/tag inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
          >
            <span
              onClick={() => {
                setEditingIndex(index);
                setEditingValue(tag);
              }}
            >
              {tag}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="ml-0.5 text-purple-400 hover:text-purple-700 transition-colors leading-none"
              title="Remove"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        )
      )}

      {/* Add button / inline add input */}
      {addingNew ? (
        <input
          ref={addInputRef}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={handleAddKeyDown}
          placeholder="Add…"
          className="h-6 px-2 text-xs border-2 border-[#7C3AED] rounded-full focus:outline-none bg-white text-gray-800 w-28"
        />
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-[#7C3AED] border border-dashed border-[#7C3AED] hover:bg-purple-50 transition-colors"
          title="Add item"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldRow – renders a single metadata field (string or array)
// ---------------------------------------------------------------------------

interface FieldRowProps {
  field: (typeof CURATE_METADATA_FIELDS)[number];
  item: CurateItem;
  onSaveString: (field: string, value: string) => void;
  onSaveArray: (field: string, value: string[]) => void;
}

function FieldRow({ field, item, onSaveString, onSaveArray }: FieldRowProps) {
  const label = formatLabel(field);

  return (
    <div>
      <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
      <dd>
        {isArrayField(field) ? (
          <EditableTagList
            values={item[field] as string[]}
            onSave={(newValues) => onSaveArray(field, newValues)}
          />
        ) : (
          <EditableField
            value={(item[field as keyof CurateItem] as string) ?? ''}
            onSave={(newValue) => onSaveString(field, newValue)}
            multiline={field === 'context'}
          />
        )}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CollapsibleSection
// ---------------------------------------------------------------------------

interface CollapsibleSectionProps {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ label, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-[#7C3AED] uppercase tracking-widest">{label}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-3 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CurateInputPanel – main export
// ---------------------------------------------------------------------------

export function CurateInputPanel() {
  const { selectedItem, updateItem } = useCurate();

  if (!selectedItem) {
    return (
      <aside className="h-full bg-white border-r border-gray-200 flex items-center justify-center p-5">
        <p className="text-sm text-gray-400 text-center select-none">
          Select an example to view metadata
        </p>
      </aside>
    );
  }

  const handleSaveString = (field: string, value: string) => {
    updateItem(selectedItem.example_id, { [field]: value } as Partial<CurateItem>);
  };

  const handleSaveArray = (field: string, value: string[]) => {
    updateItem(selectedItem.example_id, { [field]: value } as Partial<CurateItem>);
  };

  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* ── Header: example_id (non-editable) ── */}
      <div className="shrink-0 px-5 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Example ID</p>
        <p
          className="text-sm font-mono text-gray-800 break-all leading-snug"
          title={selectedItem.example_id}
        >
          {selectedItem.example_id}
        </p>
        {selectedItem._modified && (
          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#7C3AED] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] inline-block" />
            Modified
          </span>
        )}
      </div>

      {/* ── Scrollable field groups ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {FIELD_GROUPS.map((group) => {
          // Filter out fields not present in CURATE_METADATA_FIELDS (safety guard)
          const fields = group.fields.filter((f) =>
            (CURATE_METADATA_FIELDS as readonly string[]).includes(f)
          );
          if (fields.length === 0) return null;

          if (group.collapsible) {
            return (
              <CollapsibleSection key={group.label} label={group.label} defaultOpen={false}>
                {fields.map((field) => (
                  <FieldRow
                    key={field}
                    field={field}
                    item={selectedItem}
                    onSaveString={handleSaveString}
                    onSaveArray={handleSaveArray}
                  />
                ))}
              </CollapsibleSection>
            );
          }

          return (
            <div key={group.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-4">
              <p className="text-sm font-bold text-[#7C3AED] uppercase tracking-widest">
                {group.label}
              </p>
              <dl className="space-y-4">
                {fields.map((field) => (
                  <FieldRow
                    key={field}
                    field={field}
                    item={selectedItem}
                    onSaveString={handleSaveString}
                    onSaveArray={handleSaveArray}
                  />
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
