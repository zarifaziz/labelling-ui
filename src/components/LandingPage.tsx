'use client';

import { useAppMode } from '@/context/AppModeContext';

export function LandingPage() {
  const { setAppMode } = useAppMode();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-12 px-6"
      style={{ backgroundColor: '#fffbf5' }}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#4A1D96' }}>
          Data Review Tool
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Choose a workflow to get started
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {/* Review Evaluations */}
        <button
          onClick={() => setAppMode('evaluation')}
          className="flex-1 text-left bg-white border border-gray-200 rounded-2xl p-8 shadow-sm
                     transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200
                     focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        >
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
            style={{ backgroundColor: '#EDE9FE' }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: '#4A1D96' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Review Evaluations
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Review AI evaluation datasets with pass/fail labeling, traces, and analytics.
          </p>

          {/* Call-to-action indicator */}
          <div className="mt-6 flex items-center gap-1.5 text-sm font-medium" style={{ color: '#7C3AED' }}>
            Get started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Curate Examples */}
        <button
          onClick={() => setAppMode('curate')}
          className="flex-1 text-left bg-white border border-gray-200 rounded-2xl p-8 shadow-sm
                     transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200
                     focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        >
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
            style={{ backgroundColor: '#EDE9FE' }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: '#4A1D96' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 6h16M4 10h16M4 14h10M4 18h6"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Curate Examples
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Review and edit curated prompt examples from SQLite databases.
          </p>

          {/* Call-to-action indicator */}
          <div className="mt-6 flex items-center gap-1.5 text-sm font-medium" style={{ color: '#7C3AED' }}>
            Get started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
