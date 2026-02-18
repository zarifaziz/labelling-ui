'use client';

import { CurateHeader } from '@/components/CurateHeader';
import { CurateSidebar } from '@/components/CurateSidebar';
import { CurateInputPanel } from '@/components/CurateInputPanel';
import { CurateOutputPanel } from '@/components/CurateOutputPanel';
import { CurateStatusBar } from '@/components/CurateStatusBar';
import { ResizableLayout } from '@/components/ResizableLayout';

export function CurateApp() {
  const panels = [
    {
      id: 'sidebar',
      minWidth: 180,
      defaultWidth: 280,
      maxWidth: 450,
      content: <CurateSidebar />,
    },
    {
      id: 'input',
      minWidth: 200,
      defaultWidth: 320,
      maxWidth: 500,
      content: <CurateInputPanel />,
    },
    {
      id: 'output',
      minWidth: 300,
      defaultWidth: 0, // Flex to fill
      content: <CurateOutputPanel />,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#fffbf5]">
      <CurateHeader />
      <div className="flex-1 overflow-hidden">
        <ResizableLayout panels={panels} />
      </div>
      <CurateStatusBar />
    </div>
  );
}
