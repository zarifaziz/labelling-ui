'use client';

import { useRef, useState } from 'react';
import { useEval } from '@/context/EvalContext';
import { parseCSV, exportCSV, downloadCSV } from '@/lib/csv';
import { fetchGoogleSheet } from '@/lib/sheets';
import { parseParquet } from '@/lib/parquet';
import { TraceItem } from '@/types';

export function Header() {
  const { items, setItems, filename, setFilename, traceAvailable, viewMode, setViewMode, setTraces } = useEval();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const traceFileInputRef = useRef<HTMLInputElement>(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [traceLoadError, setTraceLoadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseCSV(file);
      setItems(parsed);
      setFilename(file.name);
      
      // Reset trace state
      setTraces(new Map());
      setTraceLoadError(null);
      setViewMode('labelling');
      
      // Try to load trace file from same directory
      // This works when the file input includes the full path (webkitRelativePath)
      // or when we have access to the file system
      await tryLoadTraceFile(file);
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      alert('Failed to parse CSV file');
    }
  };

  const tryLoadTraceFile = async (csvFile: File) => {
    // Try to find a trace file in the file list
    // The user needs to select both files, or we need to prompt
    const traceFilename = csvFile.name.replace(/\.csv$/, '.traces.parquet');
    
    // Check if there's a trace file in the same selection
    const input = fileInputRef.current;
    if (input?.files) {
      for (let i = 0; i < input.files.length; i++) {
        const f = input.files[i];
        if (f.name === traceFilename || f.name.endsWith('.traces.parquet')) {
          await loadTraceFile(f);
          return;
        }
      }
    }
    
    // Trace file not found in selection - that's okay, trace mode just won't be available
    console.log(`Trace file ${traceFilename} not found in selection`);
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
      localStorage.removeItem('labelling-ui-data');
      localStorage.removeItem('labelling-ui-filename');
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample.csv');
      const text = await response.text();
      const file = new File([text], 'sample.csv', { type: 'text/csv' });
      const parsed = await parseCSV(file);
      setItems(parsed);
      setFilename('sample.csv');
    } catch (error) {
      console.error('Failed to load sample:', error);
    }
  };

  const handleLoadFromSheets = async () => {
    if (!sheetsUrl.trim()) {
      alert('Please enter a Google Sheets URL');
      return;
    }

    setIsLoading(true);
    try {
      const csvText = await fetchGoogleSheet(sheetsUrl);
      const file = new File([csvText], 'google-sheet.csv', { type: 'text/csv' });
      const parsed = await parseCSV(file);
      setItems(parsed);
      setFilename('google-sheet.csv');
      setShowSheetsModal(false);
      setSheetsUrl('');
    } catch (error) {
      console.error('Failed to load Google Sheet:', error);
      alert(error instanceof Error ? error.message : 'Failed to load Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const labeledCount = items.filter((i) => i.human_outcome).length;
  const totalCount = items.length;
  const [showImportMenu, setShowImportMenu] = useState(false);

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
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
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
            </div>
          )}

          {/* Import dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              className="px-3 py-1.5 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-md transition-all font-medium shadow-sm flex items-center gap-1"
            >
              Import
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showImportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowImportMenu(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => { fileInputRef.current?.click(); setShowImportMenu(false); }}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    CSV File
                  </button>
                  <button
                    onClick={() => { setShowSheetsModal(true); setShowImportMenu(false); }}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Google Sheets
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => { handleLoadSample(); setShowImportMenu(false); }}
                    className="w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 text-left"
                  >
                    Load Sample
                  </button>
                </div>
              </>
            )}
          </div>

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

      {/* Google Sheets Import Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-[#4A1D96] mb-4">
              Import from Google Sheets
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Sheets URL
                </label>
                <input
                  type="text"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadFromSheets()}
                />
              </div>

              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4">
                <p className="text-sm text-[#92400E] font-medium">
                  <strong>Note:</strong> The sheet must be published to the web or publicly accessible.
                </p>
                <p className="text-xs text-[#92400E]/80 mt-1">
                  In Google Sheets: File → Share → Publish to web
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSheetsModal(false);
                    setSheetsUrl('');
                  }}
                  disabled={isLoading}
                  className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoadFromSheets}
                  disabled={isLoading || !sheetsUrl.trim()}
                  className="px-5 py-2.5 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-all font-medium shadow-sm"
                >
                  {isLoading ? 'Loading...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
