'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { EvalItem } from '@/types';

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
}

const EvalContext = createContext<EvalContextType | null>(null);

const STORAGE_KEY = 'labelling-ui-data';
const FILENAME_KEY = 'labelling-ui-filename';

export function EvalProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<EvalItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filename, setFilenameState] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedFilename = localStorage.getItem(FILENAME_KEY);
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
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    if (filename) {
      localStorage.setItem(FILENAME_KEY, filename);
    }
  }, [filename]);

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
