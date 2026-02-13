'use client';

import { OutcomeDistribution } from '@/lib/statsUtils';

interface OutcomeDonutProps {
  distribution: OutcomeDistribution;
}

const COLORS = {
  pass: '#10B981',
  fail: '#EF4444',
  unlabeled: '#D1D5DB',
};

export function OutcomeDonut({ distribution }: OutcomeDonutProps) {
  const total = distribution.pass + distribution.fail + distribution.unlabeled;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Outcome Distribution</h3>
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          No data
        </div>
      </div>
    );
  }

  // SVG donut using stroke-dasharray
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const center = 80;
  const strokeWidth = 20;

  const segments = [
    { key: 'pass', count: distribution.pass, color: COLORS.pass, label: 'Pass' },
    { key: 'fail', count: distribution.fail, color: COLORS.fail, label: 'Fail' },
    { key: 'unlabeled', count: distribution.unlabeled, color: COLORS.unlabeled, label: 'Unlabeled' },
  ].filter((s) => s.count > 0);

  // If all unlabeled, show single gray ring
  if (segments.length === 1 && segments[0].key === 'unlabeled') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Outcome Distribution</h3>
        <div className="flex flex-col items-center">
          <svg width={center * 2} height={center * 2} viewBox={`0 0 ${center * 2} ${center * 2}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={COLORS.unlabeled}
              strokeWidth={strokeWidth}
            />
            <text x={center} y={center} textAnchor="middle" dominantBaseline="central" className="text-2xl font-bold" fill="#374151">
              {total}
            </text>
          </svg>
          <Legend segments={segments} total={total} />
        </div>
      </div>
    );
  }

  let offset = 0;
  const circles = segments.map((seg) => {
    const dashLength = (seg.count / total) * circumference;
    const dashGap = circumference - dashLength;
    const circle = (
      <circle
        key={seg.key}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLength} ${dashGap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${center} ${center})`}
        className="transition-all duration-500"
      />
    );
    offset += dashLength;
    return circle;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Outcome Distribution</h3>
      <div className="flex flex-col items-center">
        <svg width={center * 2} height={center * 2} viewBox={`0 0 ${center * 2} ${center * 2}`}>
          {circles}
          <text x={center} y={center} textAnchor="middle" dominantBaseline="central" className="text-2xl font-bold" fill="#374151">
            {total}
          </text>
        </svg>
        <Legend segments={segments} total={total} />
      </div>
    </div>
  );
}

function Legend({ segments, total }: { segments: { key: string; count: number; color: string; label: string }[]; total: number }) {
  return (
    <div className="flex gap-4 mt-3">
      {segments.map((seg) => (
        <div key={seg.key} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
          {seg.label}: {seg.count} ({((seg.count / total) * 100).toFixed(0)}%)
        </div>
      ))}
    </div>
  );
}
