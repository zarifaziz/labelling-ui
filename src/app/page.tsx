'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { InputPanel } from '@/components/InputPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { LabelPanel } from '@/components/LabelPanel';
import { StatusBar } from '@/components/StatusBar';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-[#fffbf5]">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <InputPanel />
        <OutputPanel />
        <LabelPanel />
      </div>
      <StatusBar />
    </div>
  );
}
