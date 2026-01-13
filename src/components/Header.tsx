'use client';

import { useRef, useState } from 'react';
import { useEval } from '@/context/EvalContext';
import { parseCSV, exportCSV, downloadCSV } from '@/lib/csv';
import { fetchGoogleSheet } from '@/lib/sheets';
import Papa from 'papaparse';

export function Header() {
  const { items, setItems, filename, setFilename } = useEval();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseCSV(file);
      setItems(parsed);
      setFilename(file.name);
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      alert('Failed to parse CSV file');
    }
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

  return (
    <>
      <header className="h-16 bg-[#4A1D96] border-b border-[#5B21B6] flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Eval Labeller
          </h1>
          {filename && (
            <span className="text-sm text-purple-200 font-mono bg-white/10 px-2 py-1 rounded-md">
              {filename}
            </span>
          )}
          {totalCount > 0 && (
            <span className="text-sm text-purple-200">
              {labeledCount}/{totalCount} labeled
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
          >
            Load Sample
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-lg transition-all font-medium shadow-sm"
          >
            Import CSV
          </button>
          <button
            onClick={() => setShowSheetsModal(true)}
            className="px-4 py-2 text-sm bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-lg transition-all font-medium shadow-sm"
          >
            Import Sheets
          </button>
          <button
            onClick={handleExport}
            disabled={items.length === 0}
            className="px-4 py-2 text-sm bg-white hover:bg-gray-50 disabled:bg-white/10 disabled:text-purple-300 text-[#4A1D96] rounded-lg transition-all font-medium shadow-sm"
          >
            Export CSV
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearData}
              className="px-4 py-2 text-sm bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#EF4444] rounded-lg transition-all font-medium"
            >
              Clear
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
