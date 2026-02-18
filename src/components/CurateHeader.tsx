'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useCurate } from '@/context/CurateContext';
import { useAppMode } from '@/context/AppModeContext';
import { importSqlite, exportSqlite, downloadSqlite } from '@/lib/sqlite';

// ---------------------------------------------------------------------------
// Inline SQLite import modal
// ---------------------------------------------------------------------------

interface SqliteImportModalProps {
  onImport: (file: File) => Promise<void>;
  onClose: () => void;
}

function SqliteImportModal({ onImport, onClose }: SqliteImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    },
    [isLoading, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const runImport = async (file: File) => {
    if (!file.name.endsWith('.sqlite') && !file.name.endsWith('.db')) {
      setError('Please select a .sqlite file');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onImport(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) runImport(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#4A1D96]">Import SQLite</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isLoading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : isDragOver
                ? 'border-[#7C3AED] bg-[#7C3AED]/5'
                : 'border-gray-300 hover:border-[#7C3AED] hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".sqlite,.db"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) runImport(f);
              e.target.value = '';
            }}
            className="hidden"
            disabled={isLoading}
          />
          <svg
            className="w-10 h-10 mx-auto mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          {isLoading ? (
            <p className="text-sm font-medium text-gray-500">Loading...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                Drag &amp; drop a .sqlite file here
              </p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CurateHeader
// ---------------------------------------------------------------------------

export function CurateHeader() {
  const { items, filename, setFilename, setItems, setSchema, schema, clearData, activeItems, deletedCount, modifiedCount } =
    useCurate();
  const { setAppMode } = useAppMode();
  const [showImportModal, setShowImportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImport = async (file: File) => {
    const result = await importSqlite(file);
    setItems(result.items);
    setSchema(result.schema);
    setFilename(file.name);
  };

  const handleExport = async () => {
    if (activeItems.length === 0) {
      alert('No data to export');
      return;
    }
    setIsExporting(true);
    try {
      const bytes = await exportSqlite(items, schema);
      const exportName = filename
        ? filename.replace(/\.sqlite$/i, '_curated.sqlite').replace(/\.db$/i, '_curated.db')
        : 'curated.sqlite';
      downloadSqlite(bytes, exportName);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearData();
    }
  };

  return (
    <>
      <header className="h-14 bg-[#4A1D96] border-b border-[#5B21B6] flex items-center justify-between px-4 shadow-md">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => setAppMode('landing')}
            className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-md transition-all"
            title="Back to mode selector"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-lg font-bold text-white tracking-tight">
            Curate Examples
          </h1>

          {filename && (
            <>
              <span className="text-purple-300">·</span>
              <span
                className="text-sm text-purple-200 font-mono truncate max-w-[260px]"
                title={filename}
              >
                {filename}
              </span>
            </>
          )}

          {items.length > 0 && (
            <>
              <span className="text-purple-300">·</span>
              <span className="text-sm text-purple-200">
                {activeItems.length} items
                <span className="text-purple-400 mx-1">·</span>
                <span className="text-red-300">{deletedCount} deleted</span>
                <span className="text-purple-400 mx-1">·</span>
                <span className="text-blue-300">{modifiedCount} modified</span>
              </span>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-md transition-all font-medium shadow-sm"
          >
            Import
          </button>

          <button
            onClick={handleExport}
            disabled={activeItems.length === 0 || isExporting}
            className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 disabled:bg-white/20 disabled:text-purple-300 text-[#4A1D96] rounded-md transition-all font-medium"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="px-2 py-1.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-md transition-all"
              title="Clear all data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {showImportModal && (
        <SqliteImportModal
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </>
  );
}
