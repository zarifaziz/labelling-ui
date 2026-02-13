'use client';

import { useRef, useState } from 'react';
import { useEval } from '@/context/EvalContext';
import { parseCSV, exportCSV, downloadCSV } from '@/lib/csv';
import { clearAllPersistedData } from '@/lib/indexedDb';
import { fetchGoogleSheet } from '@/lib/sheets';
import { parseParquet } from '@/lib/parquet';
import { TraceItem } from '@/types';
import { ImportModal } from './ImportModal';

export function Header() {
  const { items, setItems, filename, setFilename, traceAvailable, viewMode, setViewMode, setTraces } = useEval();
  const traceFileInputRef = useRef<HTMLInputElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [traceLoadError, setTraceLoadError] = useState<string | null>(null);

  const handleFileImport = async (file: File) => {
    const parsed = await parseCSV(file);
    setItems(parsed);
    setFilename(file.name);
    setTraces(new Map());
    setTraceLoadError(null);
    setViewMode('labelling');
  };

  const loadTraceFile = async (file: File) => {
    try {
      const traceItems = await parseParquet(file);
      const traceMap = new Map<string, TraceItem>();
      for (const trace of traceItems) {
        if (trace.id) {
          traceMap.set(trace.id, trace);
        }
      }
      setTraces(traceMap);
      console.log(`Loaded ${traceMap.size} traces from ${file.name}`);
    } catch (error) {
      console.error('Failed to load trace file:', error);
      setTraceLoadError('Failed to load trace file');
    }
  };

  const handleTraceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadTraceFile(file);
  };

  const handleExport = () => {
    if (items.length === 0) {
      alert('No data to export');
      return;
    }
    const csv = exportCSV(items);
    const exportName = filename
      ? filename.replace('.csv', '_labeled.csv')
      : 'labeled_data.csv';
    downloadCSV(csv, exportName);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setItems([]);
      setFilename('');
      setTraces(new Map());
      setViewMode('labelling');
      setTraceLoadError(null);
      clearAllPersistedData().catch((error) => {
        console.error('Failed to clear IndexedDB data:', error);
      });
      localStorage.removeItem('labelling-ui-data');
      localStorage.removeItem('labelling-ui-filename');
    }
  };

  const handleLoadSample = async () => {
    const response = await fetch('/sample.csv');
    if (!response.ok) throw new Error('Failed to fetch sample data');
    const text = await response.text();
    const file = new File([text], 'sample.csv', { type: 'text/csv' });
    const parsed = await parseCSV(file);
    setItems(parsed);
    setFilename('sample.csv');
  };

  const handleSheetsImport = async (url: string) => {
    const csvText = await fetchGoogleSheet(url);
    const file = new File([csvText], 'google-sheet.csv', { type: 'text/csv' });
    const parsed = await parseCSV(file);
    setItems(parsed);
    setFilename('google-sheet.csv');
  };

  const labeledCount = items.filter((i) => i.human_outcome).length;
  const totalCount = items.length;

  return (
    <>
      <header className="h-14 bg-[#4A1D96] border-b border-[#5B21B6] flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">
            Eval Labeller
          </h1>
          {filename && (
            <>
              <span className="text-purple-300">·</span>
              <span className="text-sm text-purple-200 font-mono truncate max-w-[300px]" title={filename}>
                {filename}
              </span>
            </>
          )}
          {totalCount > 0 && (
            <>
              <span className="text-purple-300">·</span>
              <span className="text-sm text-purple-200">
                {labeledCount}/{totalCount}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={traceFileInputRef}
            type="file"
            accept=".parquet"
            onChange={handleTraceFileUpload}
            className="hidden"
          />
          
          {/* View Mode Toggle - only show when data loaded */}
          {items.length > 0 && (
            <div className="flex items-center bg-white/10 rounded-md p-0.5 mr-2">
              <button
                onClick={() => setViewMode('labelling')}
                className={`px-2.5 py-1 text-xs rounded transition-all font-medium ${
                  viewMode === 'labelling'
                    ? 'bg-white text-[#4A1D96]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Label
              </button>
              <button
                onClick={() => traceAvailable ? setViewMode('trace') : traceFileInputRef.current?.click()}
                className={`px-2.5 py-1 text-xs rounded transition-all font-medium flex items-center gap-1 ${
                  viewMode === 'trace'
                    ? 'bg-white text-[#4A1D96]'
                    : traceAvailable
                      ? 'text-white hover:bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={traceAvailable ? 'View traces' : 'Click to load trace file'}
              >
                Trace
                {!traceAvailable && <span className="text-[10px]">+</span>}
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-2.5 py-1 text-xs rounded transition-all font-medium ${
                  viewMode === 'stats'
                    ? 'bg-white text-[#4A1D96]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Stats
              </button>
            </div>
          )}

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-md transition-all font-medium shadow-sm"
          >
            Import
          </button>

          <button
            onClick={handleExport}
            disabled={items.length === 0}
            className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 disabled:bg-white/20 disabled:text-purple-300 text-[#4A1D96] rounded-md transition-all font-medium"
          >
            Export
          </button>

          {items.length > 0 && (
            <button
              onClick={handleClearData}
              className="px-2 py-1.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-md transition-all"
              title="Clear all data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {showImportModal && (
        <ImportModal
          onFileSelect={handleFileImport}
          onGoogleSheetsImport={handleSheetsImport}
          onLoadSample={handleLoadSample}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </>
  );
}
