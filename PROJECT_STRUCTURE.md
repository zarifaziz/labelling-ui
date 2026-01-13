# Project Structure

Clean and organized structure for the Eval Labeller application.

## Root Directory

```
labelling-ui/
├── docs/                    # 📚 All documentation
├── public/                  # 🌐 Static assets (served at /)
├── src/                     # 💻 Application source code
├── node_modules/            # 📦 Dependencies (gitignored)
├── .next/                   # ⚡ Next.js build output (gitignored)
├── .vercel/                 # 🚀 Vercel deployment config (gitignored)
├── .git/                    # 🔧 Git repository (hidden)
├── .gitignore              # 🚫 Git ignore rules
├── .vercelignore           # 🚫 Vercel ignore rules
├── package.json            # 📦 Dependencies and scripts
├── package-lock.json       # 🔒 Locked dependency versions
├── tsconfig.json           # ⚙️ TypeScript configuration
├── next.config.ts          # ⚙️ Next.js configuration
├── eslint.config.mjs       # 🔍 ESLint rules
├── postcss.config.mjs      # 🎨 PostCSS configuration
├── vercel.json             # 🚀 Vercel build settings
├── next-env.d.ts           # 📘 Next.js TypeScript definitions
└── README.md               # 📖 Main documentation
```

## Documentation (`/docs`)

All project documentation organized in one place:

```
docs/
├── ARCHITECTURE.md         # System design and components
├── DEPLOYMENT.md          # Vercel deployment guide
├── AUTO_DEPLOY.md         # GitHub auto-deployment setup
├── GOOGLE_SHEETS_SETUP.md # Google Sheets integration
└── QUICK_LINKS.md         # Project URLs and commands
```

## Source Code (`/src`)

Application code following Next.js conventions:

```
src/
├── app/                   # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles
│   └── favicon.ico       # Site icon
│
├── components/            # React components
│   ├── Header.tsx        # Top navigation bar
│   ├── Sidebar.tsx       # Left panel with example list
│   ├── InputPanel.tsx    # Input display (left main)
│   ├── OutputPanel.tsx   # Output display (center main)
│   └── LabelPanel.tsx    # Labeling controls (right panel)
│
├── context/               # React Context (state management)
│   └── EvalContext.tsx   # Global evaluation state
│
├── lib/                   # Utility libraries
│   ├── csv.ts            # CSV parsing and export
│   ├── latex.ts          # LaTeX/KaTeX rendering
│   └── sheets.ts         # Google Sheets integration
│
└── types/                 # TypeScript type definitions
    └── index.ts          # Shared types
```

## Public Assets (`/public`)

Static files served directly at root URL:

```
public/
├── README.md              # Asset documentation
├── sample.csv             # Sample evaluation data
├── activity-sample.csv    # Activity sample data
├── misconception-sample.csv # Misconception sample data
├── file.svg              # File icon
├── globe.svg             # Globe icon
├── next.svg              # Next.js logo
├── vercel.svg            # Vercel logo
└── window.svg            # Window icon
```

## Configuration Files

### Build & Runtime
- **`package.json`** - NPM dependencies, scripts, project metadata
- **`next.config.ts`** - Next.js configuration (currently minimal)
- **`tsconfig.json`** - TypeScript compiler settings
- **`vercel.json`** - Vercel build and deployment settings

### Code Quality
- **`eslint.config.mjs`** - Linting rules for code quality
- **`postcss.config.mjs`** - PostCSS with Tailwind CSS

### Deployment
- **`.vercel/`** - Vercel project configuration (auto-generated)
- **`.vercelignore`** - Files excluded from Vercel deployment
- **`.gitignore`** - Files excluded from Git

## Generated/Ignored Files

These are not committed to Git:

```
.next/                 # Next.js build output
node_modules/          # NPM dependencies
.vercel/               # Vercel project config
*.log                  # Log files
.DS_Store              # macOS metadata
*.tsbuildinfo          # TypeScript build info
next-env.d.ts          # Next.js type definitions (auto-generated)
```

## Key Scripts

Defined in `package.json`:

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Deployment Structure

```
.vercel/
├── project.json       # Vercel project IDs
└── README.txt         # Vercel CLI info

vercel.json            # Build configuration
.vercelignore          # Deployment exclusions
```

## Data Flow

```
Input Sources:
  ├── CSV File Upload → PapaParse → EvalContext
  └── Google Sheets URL → Fetch CSV → PapaParse → EvalContext

Storage:
  └── Browser localStorage → Persist state

Output:
  └── Export CSV → PapaParse → Download file
```

## Component Hierarchy

```
page.tsx
└── EvalContext.Provider
    ├── Header
    │   ├── Import CSV Button
    │   ├── Import Sheets Button
    │   └── Export CSV Button
    │
    ├── Sidebar
    │   └── Example List (scrollable)
    │
    ├── InputPanel
    │   └── JSON/Text Display
    │
    ├── OutputPanel
    │   └── LaTeX Rendered Content
    │
    └── LabelPanel
        ├── PASS/FAIL Buttons
        ├── Critique Textarea
        └── Navigation Controls
```

## State Management

All state lives in `EvalContext.tsx`:

- `examples[]` - All imported examples
- `currentIndex` - Currently selected example
- `setOutcome()` - Mark PASS/FAIL
- `setCritique()` - Save human critique
- `importCSV()` - Load CSV data
- `exportCSV()` - Download labeled data

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **`globals.css`** - Global styles and Tailwind imports
- **Inline styles** - Component-specific styling with Tailwind classes

## Best Practices

### File Organization
✅ Keep documentation in `/docs`  
✅ Keep source code in `/src`  
✅ Keep static assets in `/public`  
✅ Use TypeScript for all new code  
✅ Follow Next.js conventions  

### Code Structure
✅ One component per file  
✅ Shared types in `/src/types`  
✅ Utilities in `/src/lib`  
✅ Context for global state  

### Documentation
✅ Keep README.md focused and concise  
✅ Detailed guides go in `/docs`  
✅ Add comments for complex logic  
✅ Update docs when structure changes  

---

**Last Updated:** January 13, 2026
