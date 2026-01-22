'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { InputPanel } from '@/components/InputPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { LabelPanel } from '@/components/LabelPanel';
import { StatusBar } from '@/components/StatusBar';
import { ResizableLayout } from '@/components/ResizableLayout';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-[#fffbf5]">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ResizableLayout
          panels={[
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
          ]}
        />
      </div>
      <StatusBar />
    </div>
  );
}
