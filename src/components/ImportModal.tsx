'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface ImportModalProps {
  onFileSelect: (file: File) => Promise<void>;
  onGoogleSheetsImport: (url: string) => Promise<void>;
  onLoadSample: () => Promise<void>;
  onClose: () => void;
}

export function ImportModal({ onFileSelect, onGoogleSheetsImport, onLoadSample, onClose }: ImportModalProps) {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) onClose();
  }, [isLoading, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const runImport = async (fn: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await fn();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please select a .csv file');
      return;
    }
    runImport(() => onFileSelect(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Guard against flicker from child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleSheetsImport = () => {
    if (!sheetsUrl.trim()) return;
    runImport(() => onGoogleSheetsImport(sheetsUrl.trim()));
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#4A1D96]">Import Data</h2>
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
            accept=".csv"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
            className="hidden"
            disabled={isLoading}
          />
          <div className="text-3xl mb-2">📄</div>
          <p className="text-sm font-medium text-gray-700">
            Drag & drop a CSV file here
          </p>
          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or import from Google Sheets</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sheets Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={sheetsUrl}
            onChange={(e) => setSheetsUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleSheetsImport()}
            disabled={isLoading}
          />
          <button
            onClick={handleSheetsImport}
            disabled={isLoading || !sheetsUrl.trim()}
            className="px-4 py-2 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-all font-medium shadow-sm"
          >
            Import
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Sheet must be published to the web</p>

        {/* Error */}
        {error && (
          <div className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
          <button
            onClick={() => runImport(onLoadSample)}
            disabled={isLoading}
            className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Or try with sample data'}
          </button>
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
