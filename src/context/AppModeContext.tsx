'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type AppMode = 'landing' | 'evaluation' | 'curate';

interface AppModeContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

const APP_MODE_KEY = 'labelling-ui-app-mode';

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppModeState] = useState<AppMode>('landing');

  useEffect(() => {
    const saved = localStorage.getItem(APP_MODE_KEY);
    if (saved === 'evaluation' || saved === 'curate') {
      setAppModeState(saved);
    }
  }, []);

  const setAppMode = useCallback((mode: AppMode) => {
    setAppModeState(mode);
    if (mode === 'landing') {
      localStorage.removeItem(APP_MODE_KEY);
    } else {
      localStorage.setItem(APP_MODE_KEY, mode);
    }
  }, []);

  return (
    <AppModeContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
