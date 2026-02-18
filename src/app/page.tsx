'use client';

import { useAppMode } from '@/context/AppModeContext';
import { LandingPage } from '@/components/LandingPage';
import { EvalApp } from '@/components/EvalApp';
import { CurateApp } from '@/components/CurateApp';

export default function Home() {
  const { appMode } = useAppMode();

  if (appMode === 'evaluation') return <EvalApp />;
  if (appMode === 'curate') return <CurateApp />;
  return <LandingPage />;
}
