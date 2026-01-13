import Papa from 'papaparse';
import { EvalItem, RawEvalItem } from '@/types';

export function parseCSV(file: File): Promise<EvalItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawEvalItem>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const items = results.data.map((row) => ({
            id: row.id,
            input: safeParseJSON(row.input, {}),
            output: safeParseJSON(row.output, {}),
            model_critique: row.model_critique || '',
            model_outcome: (row.model_outcome || '') as 'PASS' | 'FAIL' | '',
            human_critique: row.human_critique || '',
            human_outcome: (row.human_outcome || '') as 'PASS' | 'FAIL' | '',
            human_revised_response: row.human_revised_response || '',
            agreement: row.agreement || '',
          }));
          resolve(items);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
}

export function exportCSV(items: EvalItem[]): string {
  const rows = items.map((item) => ({
    id: item.id,
    input: JSON.stringify(item.input),
    output: JSON.stringify(item.output),
    model_critique: item.model_critique,
    model_outcome: item.model_outcome,
    human_critique: item.human_critique,
    human_outcome: item.human_outcome,
    human_revised_response: item.human_revised_response,
    agreement: item.agreement,
  }));

  return Papa.unparse(rows);
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function safeParseJSON<T>(str: string, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
