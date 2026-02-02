'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { EvalItem, TraceItem } from '@/types';
import {
  loadItems,
  saveItems,
  loadFilename,
  saveFilename,
  loadViewMode,
  saveViewMode,
} from '@/lib/indexedDb';

export type ViewMode = 'labelling' | 'trace';

interface EvalContextType {
  items: EvalItem[];
  setItems: (items: EvalItem[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedItem: EvalItem | null;
  updateItem: (id: string, updates: Partial<EvalItem>) => void;
  updateItemField: (id: string, path: string[], value: string) => void;
  deleteItem: (id: string) => void;
  filename: string;
  setFilename: (name: string) => void;
  // Trace-related state
  traces: Map<string, TraceItem>;
  setTraces: (traces: Map<string, TraceItem>) => void;
  traceAvailable: boolean;
  selectedTrace: TraceItem | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const EvalContext = createContext<EvalContextType | null>(null);

const STORAGE_KEY = 'labelling-ui-data';
const FILENAME_KEY = 'labelling-ui-filename';
const VIEW_MODE_KEY = 'labelling-ui-view-mode';

export function EvalProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<EvalItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filename, setFilenameState] = useState<string>('');
  const [traces, setTracesState] = useState<Map<string, TraceItem>>(new Map());
  const [viewMode, setViewModeState] = useState<ViewMode>('labelling');

  // Load from persistence on mount
  useEffect(() => {
    if (typeof indexedDB !== 'undefined') {
      (async () => {
        try {
          const [savedItems, savedFilename, savedViewMode] = await Promise.all([
            loadItems(),
            loadFilename(),
            loadViewMode(),
          ]);
          if (savedItems && savedItems.length > 0) {
            setItemsState(savedItems);
            setSelectedId(savedItems[0].id);
          }
          if (savedFilename) {
            setFilenameState(savedFilename);
          }
          if (savedViewMode === 'trace' || savedViewMode === 'labelling') {
            setViewModeState(savedViewMode);
          }
        } catch (error) {
          console.error('Failed to load data from IndexedDB:', error);
        }
      })();
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    const savedFilename = localStorage.getItem(FILENAME_KEY);
    const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItemsState(parsed);
        if (parsed.length > 0) {
          setSelectedId(parsed[0].id);
        }
      } catch {
        // ignore
      }
    }
    if (savedFilename) {
      setFilenameState(savedFilename);
    }
    if (savedViewMode === 'trace' || savedViewMode === 'labelling') {
      setViewModeState(savedViewMode);
    }
  }, []);

  // Save to persistence when items change
  useEffect(() => {
    if (items.length > 0) {
      if (typeof indexedDB !== 'undefined') {
        saveItems(items).catch((error) => {
          console.error('Failed to persist data to IndexedDB:', error);
        });
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to persist data to localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [items]);

  useEffect(() => {
    if (filename) {
      if (typeof indexedDB !== 'undefined') {
        saveFilename(filename).catch((error) => {
          console.error('Failed to persist filename to IndexedDB:', error);
        });
        return;
      }

      try {
        localStorage.setItem(FILENAME_KEY, filename);
      } catch (error) {
        console.error('Failed to persist filename to localStorage:', error);
        localStorage.removeItem(FILENAME_KEY);
      }
    }
  }, [filename]);

  useEffect(() => {
    if (typeof indexedDB !== 'undefined') {
      saveViewMode(viewMode).catch((error) => {
        console.error('Failed to persist view mode to IndexedDB:', error);
      });
      return;
    }

    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch (error) {
      console.error('Failed to persist view mode to localStorage:', error);
      localStorage.removeItem(VIEW_MODE_KEY);
    }
  }, [viewMode]);

  const setTraces = useCallback((newTraces: Map<string, TraceItem>) => {
    setTracesState(newTraces);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  const setItems = useCallback((newItems: EvalItem[]) => {
    setItemsState(newItems);
    if (newItems.length > 0 && !selectedId) {
      setSelectedId(newItems[0].id);
    }
  }, [selectedId]);

  const setFilename = useCallback((name: string) => {
    setFilenameState(name);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<EvalItem>) => {
    setItemsState((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const updateItemField = useCallback((id: string, path: string[], value: string) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newItem = JSON.parse(JSON.stringify(item));
        let current: Record<string, unknown> = newItem;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]] as Record<string, unknown>;
        }
        current[path[path.length - 1]] = value;
        return newItem;
      })
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItemsState((prev) => {
      const newItems = prev.filter((item) => item.id !== id);
      // If we deleted the selected item, select the next available one
      if (selectedId === id && newItems.length > 0) {
        const deletedIndex = prev.findIndex((item) => item.id === id);
        const newSelectedIndex = Math.min(deletedIndex, newItems.length - 1);
        setSelectedId(newItems[newSelectedIndex]?.id || null);
      } else if (newItems.length === 0) {
        setSelectedId(null);
      }
      return newItems;
    });
  }, [selectedId]);

  const selectedItem = items.find((item) => item.id === selectedId) || null;
  const traceAvailable = traces.size > 0;
  const selectedTrace = selectedId ? traces.get(selectedId) || null : null;

  return (
    <EvalContext.Provider
      value={{
        items,
        setItems,
        selectedId,
        setSelectedId,
        selectedItem,
        updateItem,
        updateItemField,
        deleteItem,
        filename,
        setFilename,
        traces,
        setTraces,
        traceAvailable,
        selectedTrace,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </EvalContext.Provider>
  );
}

export function useEval() {
  const context = useContext(EvalContext);
  if (!context) {
    throw new Error('useEval must be used within an EvalProvider');
  }
  return context;
}
