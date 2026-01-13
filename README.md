# Eval Labeller

A custom annotation tool for AI evaluation data. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📥 **Import CSV files** - Load your evaluation data
- 📊 **Google Sheets Integration** - Import directly from published Google Sheets
- 🎨 **Clean UI** - Easy-to-use interface with LaTeX rendering
- ⌨️ **Keyboard Shortcuts** - Fast labeling with keyboard navigation
- 💾 **Auto-save** - Data persists to localStorage
- 📤 **Export CSV** - Download labeled data

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Import Data

#### Option 1: CSV File
1. Click **Import CSV**
2. Select your CSV file
3. Start labeling!

#### Option 2: Google Sheets
1. Click **Import Sheets**
2. Paste your Google Sheets URL
3. **Important**: The sheet must be published to the web:
   - In Google Sheets: File → Share → Publish to web
   - Publish the entire document or specific sheet
4. Click **Import**

### CSV Format

Your CSV should have these columns:

```csv
id,input,output,model_critique,model_outcome,human_critique,human_outcome,human_revised_response,agreement
```

- `input` and `output` should be JSON strings
- The app will parse and display them nicely

### Labeling

1. **Select an example** from the sidebar
2. **Review the output** in the center panel (with LaTeX rendering)
3. **Label it**:
   - Click **PASS** or **FAIL** (or press `P` or `F`)
   - Write your critique in the text area
4. **Navigate** using:
   - Next/Previous buttons
   - Arrow keys (↑/↓) or J/K

### Export

Click **Export CSV** to download your labeled data with all human critiques and outcomes.

## Google Sheets Setup

To import from Google Sheets, you need to make your sheet publicly accessible:

### Method 1: Publish to Web (Recommended)
1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Choose the specific sheet or entire document
4. Click **Publish**
5. Copy the sheet URL (e.g., `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?gid=YOUR_GID`)
6. Use this URL in the app

### Method 2: Share Link
1. Open your Google Sheet
2. Click the **Share** button
3. Under "General access", select **Anyone with the link**
4. Set permission to **Viewer**
5. Copy the link

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `P` | Mark as PASS |
| `F` | Mark as FAIL |
| `↓` or `J` | Next example |
| `↑` or `K` | Previous example |

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **KaTeX** - LaTeX rendering
- **PapaParse** - CSV parsing

## Development

The project structure:

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── InputPanel.tsx
│   ├── OutputPanel.tsx
│   └── LabelPanel.tsx
├── context/          # React context (state management)
├── lib/              # Utilities
│   ├── csv.ts        # CSV parsing/export
│   ├── latex.ts      # LaTeX rendering
│   └── sheets.ts     # Google Sheets integration
└── types/            # TypeScript types
```

## Notes

- Data is stored in browser localStorage
- Export regularly to avoid data loss
- For collaboration, use Google Sheets + CSV workflow
- LaTeX is rendered using KaTeX (supports most math notation)

## Example Data

See `public/sample.csv` for an example of the expected format.
