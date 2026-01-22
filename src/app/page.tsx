'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { InputPanel } from '@/components/InputPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { LabelPanel } from '@/components/LabelPanel';
import { TracePanel } from '@/components/TracePanel';
import { StatusBar } from '@/components/StatusBar';
import { ResizableLayout } from '@/components/ResizableLayout';
import { useEval } from '@/context/EvalContext';

export default function Home() {
  const { viewMode } = useEval();

  const labellingPanels = [
    {
      id: 'sidebar',
      minWidth: 120,
      defaultWidth: 224,
      maxWidth: 400,
      content: <Sidebar />,
    },
    {
      id: 'input',
      minWidth: 200,
      defaultWidth: 288,
      maxWidth: 500,
      content: <InputPanel />,
    },
    {
      id: 'output',
      minWidth: 300,
      defaultWidth: 0, // Will flex to fill
      content: <OutputPanel />,
    },
    {
      id: 'label',
      minWidth: 280,
      defaultWidth: 384,
      maxWidth: 500,
      content: <LabelPanel />,
    },
  ];

  const tracePanels = [
    {
      id: 'sidebar',
      minWidth: 120,
      defaultWidth: 224,
      maxWidth: 400,
      content: <Sidebar />,
    },
    {
      id: 'trace',
      minWidth: 400,
      defaultWidth: 0, // Will flex to fill
      content: <TracePanel />,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#fffbf5]">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ResizableLayout
          key={viewMode} // Force re-render when switching modes
          panels={viewMode === 'trace' ? tracePanels : labellingPanels}
        />
      </div>
      <StatusBar />
    </div>
  );
}
