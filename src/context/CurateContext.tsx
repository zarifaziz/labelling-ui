'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CurateItem } from '@/types/curate';
import {
  loadCurateItems,
  saveCurateItems,
  loadCurateFilename,
  saveCurateFilename,
  loadCurateSchema,
  saveCurateSchema,
  clearAllCurateData,
} from '@/lib/curateIndexedDb';

interface CurateContextType {
  items: CurateItem[];
  setItems: (items: CurateItem[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedItem: CurateItem | null;
  updateItem: (id: string, updates: Partial<CurateItem>) => void;
  updateItemField: (id: string, path: string[], value: unknown) => void;
  deleteItem: (id: string) => void;
  restoreItem: (id: string) => void;
  filename: string;
  setFilename: (name: string) => void;
  schema: string;
  setSchema: (schema: string) => void;
  clearData: () => void;
  /** Active (non-deleted) items */
  activeItems: CurateItem[];
  /** Count of soft-deleted items */
  deletedCount: number;
  /** Count of modified items */
  modifiedCount: number;
}

const CurateContext = createContext<CurateContextType | null>(null);

export function CurateProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<CurateItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filename, setFilenameState] = useState<string>('');
  const [schema, setSchemaState] = useState<string>('');

  // Load from IndexedDB on mount
  useEffect(() => {
    if (typeof indexedDB === 'undefined') return;
    (async () => {
      try {
        const [savedItems, savedFilename, savedSchema] = await Promise.all([
          loadCurateItems(),
          loadCurateFilename(),
          loadCurateSchema(),
        ]);
        if (savedItems && savedItems.length > 0) {
          setItemsState(savedItems);
          const firstActive = savedItems.find((i) => !i._deleted);
          if (firstActive) setSelectedId(firstActive.example_id);
        }
        if (savedFilename) setFilenameState(savedFilename);
        if (savedSchema) setSchemaState(savedSchema);
      } catch (error) {
        console.error('Failed to load curate data from IndexedDB:', error);
      }
    })();
  }, []);

  // Persist items
  useEffect(() => {
    if (items.length > 0 && typeof indexedDB !== 'undefined') {
      saveCurateItems(items).catch(console.error);
    }
  }, [items]);

  // Persist filename
  useEffect(() => {
    if (filename && typeof indexedDB !== 'undefined') {
      saveCurateFilename(filename).catch(console.error);
    }
  }, [filename]);

  // Persist schema
  useEffect(() => {
    if (schema && typeof indexedDB !== 'undefined') {
      saveCurateSchema(schema).catch(console.error);
    }
  }, [schema]);

  const setItems = useCallback((newItems: CurateItem[]) => {
    setItemsState(newItems);
    const firstActive = newItems.find((i) => !i._deleted);
    if (firstActive) setSelectedId(firstActive.example_id);
  }, []);

  const setFilename = useCallback((name: string) => {
    setFilenameState(name);
  }, []);

  const setSchema = useCallback((s: string) => {
    setSchemaState(s);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CurateItem>) => {
    setItemsState((prev) =>
      prev.map((item) =>
        item.example_id === id
          ? { ...item, ...updates, _modified: true }
          : item
      )
    );
  }, []);

  const updateItemField = useCallback((id: string, path: string[], value: unknown) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.example_id !== id) return item;
        const newItem = JSON.parse(JSON.stringify(item)) as CurateItem;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = newItem;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        newItem._modified = true;
        return newItem;
      })
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItemsState((prev) => {
      const newItems = prev.map((item) =>
        item.example_id === id ? { ...item, _deleted: true } : item
      );
      // If we deleted the selected item, select the next active one
      if (selectedId === id) {
        const currentIndex = prev.findIndex((i) => i.example_id === id);
        const nextActive = newItems.find(
          (i, idx) => !i._deleted && idx > currentIndex
        ) ?? newItems.find((i) => !i._deleted);
        setSelectedId(nextActive?.example_id ?? null);
      }
      return newItems;
    });
  }, [selectedId]);

  const restoreItem = useCallback((id: string) => {
    setItemsState((prev) =>
      prev.map((item) =>
        item.example_id === id ? { ...item, _deleted: false } : item
      )
    );
  }, []);

  const clearData = useCallback(() => {
    setItemsState([]);
    setSelectedId(null);
    setFilenameState('');
    setSchemaState('');
    clearAllCurateData().catch(console.error);
  }, []);

  const activeItems = items.filter((i) => !i._deleted);
  const deletedCount = items.filter((i) => i._deleted).length;
  const modifiedCount = items.filter((i) => i._modified && !i._deleted).length;
  const selectedItem = items.find((i) => i.example_id === selectedId) ?? null;

  return (
    <CurateContext.Provider
      value={{
        items,
        setItems,
        selectedId,
        setSelectedId,
        selectedItem,
        updateItem,
        updateItemField,
        deleteItem,
        restoreItem,
        filename,
        setFilename,
        schema,
        setSchema,
        clearData,
        activeItems,
        deletedCount,
        modifiedCount,
      }}
    >
      {children}
    </CurateContext.Provider>
  );
}

export function useCurate() {
  const context = useContext(CurateContext);
  if (!context) {
    throw new Error('useCurate must be used within a CurateProvider');
  }
  return context;
}
