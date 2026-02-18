'use client';

import { useState, useMemo } from 'react';
import { useCurate } from '@/context/CurateContext';
import { CurateItem, CURATE_GROUPABLE_FIELDS } from '@/types/curate';

type GroupByField = typeof CURATE_GROUPABLE_FIELDS[number] | '(none)';

const GROUP_BY_OPTIONS: GroupByField[] = ['(none)', ...CURATE_GROUPABLE_FIELDS];

function getDisplayLabel(item: CurateItem): string {
  // Prefer node_type as the display label since it's the most meaningful short identifier
  if (item.node_type) return item.node_type;
  const id = item.example_id;
  if (!id) return 'Untitled';
  return id.length > 28 ? id.slice(0, 28) + '…' : id;
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function RestoreIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-150 ${open ? 'rotate-90' : ''} ${className ?? ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

interface ItemRowProps {
  item: CurateItem;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  deleteItem: (id: string) => void;
  restoreItem: (id: string) => void;
}

function ItemRow({ item, selectedId, setSelectedId, deleteItem, restoreItem }: ItemRowProps) {
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedId === item.example_id;
  const isDeleted = item._deleted;

  return (
    <div
      className={`relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-all select-none border-l-4 ${
        isSelected
          ? 'bg-gray-100 border-l-[#7C3AED]'
          : 'border-l-transparent hover:bg-gray-50'
      } ${isDeleted ? 'opacity-50' : ''}`}
      onClick={() => setSelectedId(item.example_id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={item.example_id}
    >
      {/* Status dot */}
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full ${
          item._modified ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      />

      {/* Label */}
      <span
        className={`text-sm flex-1 truncate ${
          isDeleted
            ? 'line-through text-gray-400'
            : isSelected
            ? 'text-gray-900 font-medium'
            : 'text-gray-700'
        }`}
      >
        {getDisplayLabel(item)}
      </span>

      {/* Action button (shown on hover) */}
      {hovered && (
        isDeleted ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              restoreItem(item.example_id);
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
            title="Restore item"
          >
            <RestoreIcon className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(item.example_id);
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete item"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        )
      )}
    </div>
  );
}

interface GroupSectionProps {
  groupKey: string;
  items: CurateItem[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  deleteItem: (id: string) => void;
  restoreItem: (id: string) => void;
}

function GroupSection({
  groupKey,
  items,
  selectedId,
  setSelectedId,
  deleteItem,
  restoreItem,
}: GroupSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        className="w-full flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronIcon open={open} className="h-3 w-3 flex-shrink-0" />
        <span className="truncate flex-1">{groupKey || '(empty)'}</span>
        <span className="ml-auto text-gray-400 font-normal normal-case tracking-normal">
          {items.length}
        </span>
      </button>
      {open && (
        <div>
          {items.map((item) => (
            <ItemRow
              key={item.example_id}
              item={item}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              deleteItem={deleteItem}
              restoreItem={restoreItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CurateSidebar() {
  const { items, activeItems, selectedId, setSelectedId, deleteItem, restoreItem, deletedCount } =
    useCurate();

  const [groupBy, setGroupBy] = useState<GroupByField>('(none)');
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Decide which items to display
  const baseItems: CurateItem[] = showDeleted ? items : activeItems;

  // Filter by search
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseItems;
    return baseItems.filter((item) => {
      if (item.example_id.toLowerCase().includes(q)) return true;
      if (item.topic?.toLowerCase().includes(q)) return true;
      if (item.skills?.some((s) => s.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [baseItems, search]);

  // Build groups
  const groups = useMemo<{ key: string; items: CurateItem[] }[]>(() => {
    if (groupBy === '(none)') {
      return [{ key: '__flat__', items: filteredItems }];
    }
    const map = new Map<string, CurateItem[]>();
    for (const item of filteredItems) {
      const raw = item[groupBy as keyof CurateItem];
      const key = Array.isArray(raw)
        ? (raw as string[]).join(', ')
        : raw != null
        ? String(raw)
        : '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, groupItems]) => ({ key, items: groupItems }));
  }, [filteredItems, groupBy]);

  const displayCount = filteredItems.length;
  const totalCount = activeItems.length;

  if (items.length === 0) {
    return (
      <aside className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Examples</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-500 text-center">
            Import a SQLite database to get started
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Examples
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {search ? `${displayCount} / ${totalCount}` : totalCount}
            </span>
          </h2>
        </div>

        {/* Group by */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-xs text-gray-500 flex-shrink-0">Group</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors"
          >
            {GROUP_BY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Filter by id, topic, skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded pl-7 pr-2 py-1 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Item list */}
      <nav className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6 px-3">No items match your filter</p>
        ) : groupBy === '(none)' ? (
          groups[0].items.map((item) => (
            <ItemRow
              key={item.example_id}
              item={item}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              deleteItem={deleteItem}
              restoreItem={restoreItem}
            />
          ))
        ) : (
          groups.map(({ key, items: groupItems }) => (
            <GroupSection
              key={key}
              groupKey={key}
              items={groupItems}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              deleteItem={deleteItem}
              restoreItem={restoreItem}
            />
          ))
        )}
      </nav>

      {/* Footer: show deleted toggle */}
      {deletedCount > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 px-3 py-2">
          <button
            onClick={() => setShowDeleted((v) => !v)}
            className={`w-full flex items-center gap-2 text-xs rounded px-2 py-1.5 transition-colors ${
              showDeleted
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${
                showDeleted ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-gray-400'
              }`}
            >
              {showDeleted && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            Show deleted
            <span className="ml-auto font-medium text-red-400">{deletedCount}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
