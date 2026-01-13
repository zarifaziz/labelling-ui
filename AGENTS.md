# Agent Guidelines — Eval Labeller

## Commands
- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- No test framework configured

## Architecture
Next.js 16 App Router with React 19 + TypeScript. State managed via React Context (`src/context/EvalContext.tsx`).
- `src/app/` — Next.js pages and layouts
- `src/components/` — React components (Header, Sidebar, InputPanel, OutputPanel, LabelPanel)
- `src/lib/` — Utilities (csv.ts, latex.ts, sheets.ts)
- `src/types/` — Shared TypeScript types
- `public/` — Static assets and sample CSV files

## Code Style
- TypeScript for all code; types in `src/types/index.ts`
- One component per file, PascalCase filenames
- Tailwind CSS v4 for styling (via PostCSS)
- Use React Context for global state, avoid prop drilling
- KaTeX for LaTeX rendering, PapaParse for CSV parsing

## Data Flow
CSV/Google Sheets → PapaParse → EvalContext → localStorage persistence → Export CSV
