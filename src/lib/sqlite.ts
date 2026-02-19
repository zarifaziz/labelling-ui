// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error sql.js lacks type declarations
import initSqlJs from 'sql.js/dist/sql-wasm-browser';
import { CurateItem, CURATE_COLUMNS } from '@/types/curate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SQL: any = null;

async function getSQL() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => `/wasm/${file}`,
    });
  }
  return SQL;
}

function safeParseJSON(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    const parsed = safeParseJSON(value);
    if (Array.isArray(parsed)) return parsed.map(String);
    return value ? [value] : [];
  }
  return [];
}

function rowToCurateItem(columns: string[], row: unknown[]): CurateItem {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, i) => {
    obj[col] = row[i];
  });

  return {
    example_id: String(obj.example_id ?? ''),
    example_output_json:
      typeof obj.example_output_json === 'string'
        ? (safeParseJSON(obj.example_output_json) as Record<string, unknown>) ?? {}
        : (obj.example_output_json as Record<string, unknown>) ?? {},
    skills: toStringArray(obj.skills),
    skill_ids: toStringArray(obj.skill_ids),
    subtopics: toStringArray(obj.subtopics),
    subtopic_ids: toStringArray(obj.subtopic_ids),
    topic: String(obj.topic ?? ''),
    topic_id: String(obj.topic_id ?? ''),
    context: String(obj.context ?? ''),
    class_year: String(obj.class_year ?? ''),
    country: String(obj.country ?? ''),
    period_number: String(obj.period_number ?? ''),
    node_type: String(obj.node_type ?? ''),
    difficulty: String(obj.difficulty ?? ''),
    _deleted: false,
    _modified: false,
  };
}

function curateItemToRow(item: CurateItem): unknown[] {
  return CURATE_COLUMNS.map((col) => {
    switch (col) {
      case 'example_output_json':
        return JSON.stringify(item.example_output_json);
      case 'skills':
        return JSON.stringify(item.skills);
      case 'skill_ids':
        return JSON.stringify(item.skill_ids);
      case 'subtopics':
        return JSON.stringify(item.subtopics);
      case 'subtopic_ids':
        return JSON.stringify(item.subtopic_ids);
      default:
        return item[col as keyof CurateItem] ?? '';
    }
  });
}

export interface ImportResult {
  items: CurateItem[];
  schema: string;
}

/**
 * Discover the first real (non-internal) table name in the database.
 * Skips sqlite_* internal tables.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function discoverTableName(db: any): string {
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' LIMIT 1"
  );
  const name = result[0]?.values[0]?.[0] as string | undefined;
  if (!name) throw new Error('No tables found in SQLite file');
  return name;
}

/** Quote a table name to handle hyphens and other special characters */
function q(tableName: string): string {
  return `"${tableName.replace(/"/g, '""')}"`;
}

export async function importSqlite(file: File): Promise<ImportResult> {
  const SqlJs = await getSQL();
  const buffer = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = new SqlJs.Database(new Uint8Array(buffer));

  const tableName = discoverTableName(db);

  // Capture the original CREATE TABLE DDL for faithful export
  const schemaResult = db.exec(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName.replace(/'/g, "''")}'`
  );
  const schema = schemaResult[0]?.values[0]?.[0] as string ?? '';

  // Also capture any views
  const viewResult = db.exec(
    "SELECT sql FROM sqlite_master WHERE type='view'"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewSchemas = viewResult[0]?.values.map((row: any[]) => row[0] as string) ?? [];

  // Use prepare/step API to avoid minified property names from exec()
  // (Turbopack may mangle `columns` to `lc` in the exec() result objects)
  const stmt = db.prepare(`SELECT * FROM ${q(tableName)}`);
  const columns: string[] = stmt.getColumnNames();
  const rows: unknown[][] = [];
  while (stmt.step()) {
    rows.push(stmt.get());
  }
  stmt.free();

  if (rows.length === 0) {
    db.close();
    return { items: [], schema };
  }

  const items = rows.map((row) => rowToCurateItem(columns, row));

  db.close();

  // Combine table + view schemas for export
  const fullSchema = [schema, ...viewSchemas].filter(Boolean).join(';\n') + ';';

  return { items, schema: fullSchema };
}

export async function exportSqlite(
  items: CurateItem[],
  schema: string
): Promise<Uint8Array> {
  const SqlJs = await getSQL();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = new SqlJs.Database();

  // Split schema into individual statements and execute each
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      db.run(stmt);
    } catch {
      // View creation may fail if it references the table before data exists; ignore
    }
  }

  // Extract table name from CREATE TABLE schema DDL
  const tableNameMatch = schema.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([^"`(\s]+)["`]?/i);
  const exportTableName = tableNameMatch?.[1] ?? 'prompt_examples';

  const placeholders = CURATE_COLUMNS.map(() => '?').join(', ');
  const insertSQL = `INSERT INTO ${q(exportTableName)} (${CURATE_COLUMNS.join(', ')}) VALUES (${placeholders})`;

  for (const item of items) {
    if (item._deleted) continue;
    db.run(insertSQL, curateItemToRow(item) as (string | number | null)[]);
  }

  const bytes: Uint8Array = db.export();
  db.close();
  return bytes;
}

export function downloadSqlite(bytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
